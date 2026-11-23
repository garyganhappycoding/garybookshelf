import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { confirmGroup, rejectMember } from "@/lib/programme/groups";

export const dynamic = "force-dynamic";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") notFound();
}

async function confirmAction(form: FormData) {
  "use server";
  await assertAdmin();
  await confirmGroup(String(form.get("group_id")));
  revalidatePath("/admin/programme-groups");
}
async function rejectAction(form: FormData) {
  "use server";
  await assertAdmin();
  await rejectMember(String(form.get("member_id")));
  revalidatePath("/admin/programme-groups");
}
async function resumeAction(form: FormData) {
  "use server";
  await assertAdmin();
  await createAdminClient().from("programme_members").update({ paused: false, first_ip: null, link_used_at: null }).eq("id", String(form.get("member_id")));
  revalidatePath("/admin/programme-groups");
}

const MEMBER: Record<string, string> = { awaiting_receipt: "还没交收据", receipt_uploaded: "收据已交", confirmed: "已确认", rejected: "收据被退回" };
const LABEL: Record<string, string> = { waiting: "等人交收据", ready: "收齐了，等你确认", active: "已开通", cancelled: "已取消" };
const TONE: Record<string, string> = { waiting: "bg-yellow-100 text-yellow-900", ready: "bg-clay-400/25 text-clay-700", active: "bg-sage-400/30", cancelled: "bg-ink/10" };

export default async function ProgrammeGroupsPage() {
  await assertAdmin();
  const admin = createAdminClient();
  const { data: groups } = await admin.from("programme_groups").select("*").order("created_at", { ascending: false });
  const { data: members } = await admin.from("programme_members").select("*").order("created_at");

  const rows = await Promise.all((groups ?? []).map(async (g) => {
    const ms = await Promise.all((members ?? []).filter((m) => m.group_id === g.id).map(async (m) => {
      let url: string | null = null;
      if (m.receipt_path) url = (await admin.storage.from("receipts").createSignedUrl(m.receipt_path, 600)).data?.signedUrl ?? null;
      return { ...m, url };
    }));
    return { g, ms };
  }));
  const order = { ready: 0, waiting: 1, active: 2, cancelled: 3 } as Record<string, number>;
  rows.sort((a, b) => order[a.g.status] - order[b.g.status]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-1">陪你读书 · 朋友组</h1>
      <p className="text-sm text-ink/60 mb-6">每个组一张卡。全部收据交齐，你才会收到 Telegram 通知；确认一次，全组同时开通。</p>
      {rows.length === 0 && <p className="text-ink/60">还没有人报名。</p>}
      <div className="space-y-4">
        {rows.map(({ g, ms }) => (
          <div key={g.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="font-medium">朋友组 {g.group_no} · {g.size} 人 · 每人 RM{g.price_each}</p>
              <span className={`text-xs rounded-full px-2 py-1 ${TONE[g.status]}`}>{LABEL[g.status]}（{ms.filter((m) => m.receipt_path || m.status === "confirmed").length}/{g.size} 收据）</span>
            </div>
            <ul className="space-y-3">
              {ms.map((m) => (
                <li key={m.id} className="text-sm border-t border-ink/10 pt-3">
                  <p>{m.role === "leader" ? "组长" : "朋友"} · {m.email} · <span className="text-ink/60">{MEMBER[m.status] ?? m.status}</span></p>
                  {m.url ? (
                    <a href={m.url} target="_blank" rel="noreferrer" className="inline-block mt-2"><img src={m.url} alt="收据" className="max-h-48 rounded-lg border border-ink/10" /></a>
                  ) : <p className="text-ink/50 mt-1">还没有收据</p>}
                  <div className="flex gap-2 mt-2">
                    {g.status !== "active" && m.receipt_path && (
                      <form action={rejectAction}><input type="hidden" name="member_id" value={m.id} /><button className="btn-secondary text-xs">这张收据不对</button></form>
                    )}
                    {m.paused && (
                      <form action={resumeAction}><input type="hidden" name="member_id" value={m.id} /><button className="btn-secondary text-xs">链接换了网络已暂停，恢复</button></form>
                    )}
                  </div>
                </li>
              ))}
              {ms.length < g.size && <li className="text-sm text-ink/50 border-t border-ink/10 pt-3">还差 {g.size - ms.length} 位朋友加入</li>}
            </ul>
            {g.status === "ready" && (
              <form action={confirmAction} className="mt-4"><input type="hidden" name="group_id" value={g.id} /><button className="btn-primary text-sm">✅ 确认全部，开通这一组</button></form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
