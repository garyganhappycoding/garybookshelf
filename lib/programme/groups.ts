// SERVER-ONLY. 陪你读书 friend groups: sign-up, receipts, all-pay-first confirmation and per-friend links.
// Rules (Gary, 2026-11-23): max 3 people; 1 = RM200, 2 = RM190 each, 3 = RM180 each; every member pays their own receipt;
// nobody gets access until EVERY member of the group is confirmed; Gary gets one Telegram message when the group is complete.
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramButtons, sendTelegramText } from "@/lib/telegram";
import { siteUrl } from "@/lib/site";
import { GROUP_PRICE } from "./calendar";

export type Group = {
  id: string; group_no: number; leader_id: string; size: 1 | 2 | 3; price_each: number;
  status: "waiting" | "ready" | "active" | "cancelled"; created_at: string;
};
export type Member = {
  id: string; group_id: string; user_id: string | null; email: string; role: "leader" | "friend";
  receipt_path: string | null; status: "awaiting_receipt" | "receipt_uploaded" | "confirmed" | "rejected";
  link_used_at: string | null; first_ip: string | null; paused: boolean;
};

const MAX_RECEIPT = 5 * 1024 * 1024;

// A friend's link is HMAC(memberId) so it can be shown to the leader again later without storing the secret part.
const secret = () => process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-only-secret";
export const linkSig = (memberId: string) => createHmac("sha256", secret()).update("programme-link:" + memberId).digest("hex").slice(0, 32);
export const linkOk = (memberId: string, sig: string) => {
  const a = Buffer.from(linkSig(memberId)), b = Buffer.from(sig);
  return a.length === b.length && timingSafeEqual(a, b);
};
export const friendLink = (memberId: string) => `${siteUrl()}/programme/link/${memberId}/${linkSig(memberId)}`;

export async function createGroup(userId: string, email: string, size: number): Promise<{ error?: string; group?: Group }> {
  if (![1, 2, 3].includes(size)) return { error: "最多 3 个人。" };
  const admin = createAdminClient();
  const { data: existing } = await admin.from("programme_groups").select("id").eq("leader_id", userId).in("status", ["waiting", "ready", "active"]).limit(1);
  if (existing?.length) return { error: "你已经有一个朋友组了。" };
  const { data: g, error } = await admin.from("programme_groups")
    .insert({ leader_id: userId, size, price_each: GROUP_PRICE[size as 1 | 2 | 3] }).select("*").single();
  if (error || !g) return { error: "建立朋友组失败，请再试一次。" };
  const { error: mErr } = await admin.from("programme_members").insert({ group_id: g.id, user_id: userId, email: email.toLowerCase(), role: "leader" });
  if (mErr) return { error: "建立朋友组失败，请再试一次。" };
  return { group: g as Group };
}

/** Receipt upload for the leader (own group) or a friend (by group number). */
export async function submitReceipt(userId: string, email: string, groupNo: number, file: File | null): Promise<{ error?: string }> {
  if (!file || file.size === 0) return { error: "请选一张收据图片。" };
  if (!file.type.startsWith("image/")) return { error: "收据要是图片（截图或照片）。" };
  if (file.size > MAX_RECEIPT) return { error: "图片太大，请小于 5MB。" };
  const admin = createAdminClient();
  const mail = email.toLowerCase();

  const { data: g } = await admin.from("programme_groups").select("*").eq("group_no", groupNo).maybeSingle();
  if (!g || g.status === "cancelled") return { error: "找不到这个朋友组号码，请向组长确认。" };
  if (g.status === "active") return { error: "这个朋友组已经开通了。" };

  const { data: members } = await admin.from("programme_members").select("*").eq("group_id", g.id);
  let me = (members ?? []).find((m) => m.email === mail);
  if (!me) {
    if ((members ?? []).length >= g.size) return { error: "这个朋友组的名额已经满了。" };
    const { data: created, error } = await admin.from("programme_members")
      .insert({ group_id: g.id, user_id: userId, email: mail, role: "friend" }).select("*").single();
    if (error || !created) return { error: "加入失败，请再试一次。" };
    me = created;
  }
  if (me.status === "confirmed") return { error: "你的付款已经确认了。" };

  const ext = (file.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
  const path = `programme/${g.group_no}/${me.id}-${Date.now()}.${ext}`;
  const { error: upErr } = await admin.storage.from("receipts").upload(path, file, { contentType: file.type });
  if (upErr) return { error: "上传失败，请再试一次。" };
  await admin.from("programme_members").update({ receipt_path: path, receipt_at: new Date().toISOString(), status: "receipt_uploaded", user_id: userId }).eq("id", me.id);

  await maybeAlertGroupComplete(g.id);
  return {};
}

/** One Telegram message, only when every member's receipt is in. Sent once per group (re-sent after a rejection is fixed). */
export async function maybeAlertGroupComplete(groupId: string) {
  const admin = createAdminClient();
  const { data: g } = await admin.from("programme_groups").select("*").eq("id", groupId).single();
  if (!g || g.status !== "waiting") return;
  const { data: members } = await admin.from("programme_members").select("*").eq("group_id", groupId);
  const ms = members ?? [];
  if (ms.length < g.size || !ms.every((m) => m.status === "receipt_uploaded" || m.status === "confirmed")) return;
  await admin.from("programme_groups").update({ status: "ready", alert_sent_at: new Date().toISOString() }).eq("id", groupId);
  const lines = ms.map((m) => `• ${m.role === "leader" ? "组长" : "朋友"} ${m.email}`).join("\n");
  await sendTelegramButtons(
    `📚 陪你读书 · 朋友组 ${g.group_no}（${g.size} 人，每人 RM${g.price_each}）\n全部收据都交齐了：\n${lines}\n\n到后台看收据：${siteUrl()}/admin/programme-groups\n收据都没问题就按确认，三个人同时开通。`,
    [{ text: "✅ 确认全部", callback_data: `g:${g.id}` }],
  );
}

/** Gary confirms the whole group at once. Nothing opens for anyone until this runs. */
export async function confirmGroup(groupId: string): Promise<{ error?: string; groupNo?: number }> {
  const admin = createAdminClient();
  const { data: g } = await admin.from("programme_groups").select("*").eq("id", groupId).single();
  if (!g) return { error: "找不到这个朋友组。" };
  if (g.status === "active") return { groupNo: g.group_no };
  const { data: members } = await admin.from("programme_members").select("*").eq("group_id", groupId);
  const ms = members ?? [];
  if (ms.length < g.size || !ms.every((m) => m.receipt_path)) return { error: "还有人没交收据，不能确认。" };
  await admin.from("programme_members").update({ status: "confirmed" }).eq("group_id", groupId);
  await admin.from("programme_groups").update({ status: "active", activated_at: new Date().toISOString() }).eq("id", groupId);
  return { groupNo: g.group_no };
}

/** Reject one member's receipt: the group goes back to waiting and the alert will fire again once it is re-uploaded. */
export async function rejectMember(memberId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { data: m } = await admin.from("programme_members").select("group_id, receipt_path").eq("id", memberId).single();
  if (!m) return { error: "找不到这位成员。" };
  if (m.receipt_path) await admin.storage.from("receipts").remove([m.receipt_path]);
  await admin.from("programme_members").update({ status: "rejected", receipt_path: null }).eq("id", memberId);
  await admin.from("programme_groups").update({ status: "waiting" }).eq("id", m.group_id).neq("status", "active");
  return {};
}

/** A friend opens their link: must be signed in with the email they paid with. First IP is recorded; a different IP later pauses and alerts Gary. */
export async function redeemLink(memberId: string, sig: string, userEmail: string | null, ip: string): Promise<{ ok: boolean; message: string }> {
  if (!linkOk(memberId, sig)) return { ok: false, message: "这条链接不对，请向组长拿新的链接。" };
  const admin = createAdminClient();
  const { data: m } = await admin.from("programme_members").select("*, programme_groups(status, group_no)").eq("id", memberId).single();
  if (!m || (m as any).programme_groups?.status !== "active") return { ok: false, message: "朋友组还没开通，要等全部人付款并被确认。" };
  if (!userEmail || userEmail.toLowerCase() !== m.email) return { ok: false, message: `这条链接是给另一位同学的。请用付款时写的邮箱登录。` };
  if (m.paused) return { ok: false, message: "这条链接暂时停用了，Gary 会联系你。" };
  if (!m.link_used_at) {
    await admin.from("programme_members").update({ link_used_at: new Date().toISOString(), first_ip: ip }).eq("id", memberId);
    return { ok: true, message: "欢迎！你的陪你读书已经开通。" };
  }
  if (m.first_ip && m.first_ip !== ip) {
    // Different network from the first time: not blocked automatically (people switch Wi-Fi and mobile data), just paused and Gary is told.
    await admin.from("programme_members").update({ paused: true }).eq("id", memberId);
    await sendTelegramText(`⚠️ 陪你读书 · 朋友组 ${(m as any).programme_groups.group_no}：${m.email} 的链接换了网络再次打开，已暂停。到后台决定要不要恢复。\n${siteUrl()}/admin/programme-groups`);
    return { ok: false, message: "为了安全，这条链接暂停了，Gary 会联系你。" };
  }
  return { ok: true, message: "欢迎回来。" };
}

export async function myGroup(userId: string) {
  const admin = createAdminClient();
  const { data: mine } = await admin.from("programme_members").select("group_id").eq("user_id", userId).limit(1);
  const gid = mine?.[0]?.group_id;
  if (!gid) return null;
  const { data: g } = await admin.from("programme_groups").select("*").eq("id", gid).single();
  const { data: members } = await admin.from("programme_members").select("*").eq("group_id", gid).order("created_at");
  return g ? { group: g as Group, members: (members ?? []) as Member[] } : null;
}
