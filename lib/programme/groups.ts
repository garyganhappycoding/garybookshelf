// SERVER-ONLY. 陪你读书 friend groups: sign-up, receipts, all-pay-first confirmation and per-friend links.
// Rules (Gary, 2026-11-23): max 3 people; 1 = RM200, 2 = RM190 each, 3 = RM180 each; every member pays their own receipt;
// nobody gets access until EVERY member of the group is confirmed; Gary gets one Telegram message when the group is complete.
import { createAdminClient } from "@/lib/supabase/admin";
import { adminChatId, deleteTelegramMessage, editTelegramText, sendReceiptAlbum, sendTelegramButtons, sendTelegramText } from "@/lib/telegram";
import { sendEmail } from "@/lib/community";
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
  // the receipts themselves go straight into Telegram so Gary does not have to open the website
  const photos: { blob: Blob; filename: string; caption: string }[] = [];
  for (const m of ms) {
    if (!m.receipt_path) continue;
    const { data: file } = await admin.storage.from("receipts").download(m.receipt_path);
    if (file) photos.push({ blob: file, filename: m.receipt_path.split("/").pop() ?? "receipt.jpg", caption: `${m.role === "leader" ? "组长" : "朋友"} · ${m.email} · RM${g.price_each}` });
  }
  const albumIds = await sendReceiptAlbum(photos);
  const buttonId = await sendTelegramButtons(
    `📚 陪你读书 · 朋友组 ${g.group_no}（${g.size} 人，每人 RM${g.price_each}）
全部收据都交齐了，上面是每个人的收据。
金额都对就按确认，全组同时开通。有不对的，到网站按「这张收据不对」。`,
    [{ text: "✅ 确认全部", callback_data: `g:${g.id}` }, { text: "去网站处理", url: `${siteUrl()}/admin/programme-groups` }],
  );
  // remembered so the receipt photos can be removed from Telegram once the group is decided
  await admin.from("programme_groups").update({ telegram_msgs: { album: albumIds, button: buttonId } }).eq("id", groupId);
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
  await clearTelegramReceipts(g.telegram_msgs, `✅ 朋友组 ${g.group_no} 已确认，全组开通。`);
  await emailActivated(ms.map((m) => m.email));
  await admin.from("programme_groups").update({ status: "active", activated_at: new Date().toISOString() }).eq("id", groupId);
  return { groupNo: g.group_no };
}

/** Everyone in the group is told by email that their account is active. Only sent once the programme is open to students. */
async function emailActivated(emails: string[]) {
  if (process.env.PROGRAMME_OPEN !== "true") return;
  const link = `${siteUrl()}/programme`;
  const button = "display:inline-block;background:#B85C38;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:500;margin:16px 0;";
  for (const to of emails) {
    await sendEmail(
      to,
      "你的陪你读书开通了 · Your 陪你读书 is active",
      `<h2 style="color:#3B2F26;margin:0 0 12px;">你的陪你读书开通了 🎉</h2>
       <p style="color:#3B2F26;line-height:1.6;">你的付款已经确认，账号现在就可以用。用这个邮箱登录，选好州属和年级，就能看到你的日历和今天的任务。</p>
       <p style="color:#3B2F26;line-height:1.6;">Your payment is confirmed and your account is active. Sign in with this email, choose your state and form, and your calendar is ready.</p>
       <a href="${link}" style="${button}">开始 · Start</a>
       <p style="color:#3B2F26;line-height:1.6;font-size:13px;">这个账号只给你一个人用，请不要把账号借给别人。 This account is only for you, please do not share it.</p>
       <p style="color:#8a8a8a;font-size:12px;margin-top:24px;">— Gary</p>`,
    );
  }
}

/** After a decision the receipt photos are removed from Telegram; only a short text line stays (same habit as the order receipts). */
async function clearTelegramReceipts(msgs: { album?: number[]; button?: number | null } | null, line: string) {
  const chat = adminChatId();
  if (!chat || !msgs) return;
  for (const id of msgs.album ?? []) await deleteTelegramMessage(chat, id);
  if (msgs.button) await editTelegramText(chat, msgs.button, line);
}

/** Reject one member's receipt: the group goes back to waiting and the alert will fire again once it is re-uploaded. */
export async function rejectMember(memberId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { data: m } = await admin.from("programme_members").select("group_id, receipt_path").eq("id", memberId).single();
  if (m) {
    const { data: gg } = await admin.from("programme_groups").select("telegram_msgs, group_no, status").eq("id", m.group_id).single();
    if (gg && gg.status !== "active") await clearTelegramReceipts(gg.telegram_msgs, `↩️ 朋友组 ${gg.group_no} 有收据被退回，等重新上传。`);
  }
  if (!m) return { error: "找不到这位成员。" };
  if (m.receipt_path) await admin.storage.from("receipts").remove([m.receipt_path]);
  await admin.from("programme_members").update({ status: "rejected", receipt_path: null }).eq("id", memberId);
  await admin.from("programme_groups").update({ status: "waiting" }).eq("id", m.group_id).neq("status", "active");
  return {};
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

/** A paid, confirmed place: everyone in a confirmed group (leader and friends alike), unless Gary paused them. */
export async function hasPlace(userId: string) {
  const { data } = await createAdminClient().from("programme_members")
    .select("status, paused, programme_groups(status)").eq("user_id", userId).eq("status", "confirmed");
  return (data ?? []).some((m: any) => m.programme_groups?.status === "active" && !m.paused && true);
}


/** "ab***@gmail.com": classmates in a friend group can see who has paid, without seeing each other's full email. */
export function maskEmail(e: string) {
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}***@${d ?? ""}`;
}
