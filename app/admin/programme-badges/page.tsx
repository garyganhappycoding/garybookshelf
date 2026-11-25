import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") notFound();
}

async function saveBadge(form: FormData) {
  "use server";
  await assertAdmin();
  const id = String(form.get("id"));
  await createAdminClient().from("programme_badges").update({
    title: String(form.get("title") ?? "").trim().slice(0, 20) || "徽章",
    how: String(form.get("how") ?? "").trim().slice(0, 120),
    back_message: String(form.get("back") ?? "").trim().slice(0, 600),
  }).eq("id", id);
  revalidatePath("/admin/programme-badges");
}

export default async function BadgesAdmin() {
  await assertAdmin();
  const admin = createAdminClient();
  const [{ data: badges }, { data: counts }] = await Promise.all([
    admin.from("programme_badges").select("*").order("sort"),
    admin.from("programme_student_badges").select("badge_id"),
  ]);
  const n = new Map<string, number>();
  (counts ?? []).forEach((c) => n.set(c.badge_id, (n.get(c.badge_id) ?? 0) + 1));
  return (
    <div className="max-w-3xl mx-auto px-5 py-14 space-y-4">
      <h1 className="text-2xl font-medium">陪你读书 · 徽章</h1>
      <p className="text-sm text-ink/60">每枚徽章的背面有学生自己取的名字和你写的话（背面圆里只放前两行，全部的话在徽章页面里看得到）。「努力 n 天」所有金属级别共用同一句话。「自学」限量 200 枚、编号，做完全部的周才拿得到。徽章的图案和规则已经定好，这里只改你的话；改名字和获得方式只改文字，不改规则。</p>
      {(badges ?? []).map((b) => (
        <form key={b.id} action={saveBadge} className="card space-y-2 text-sm">
          <input type="hidden" name="id" value={b.id} />
          <div className="flex items-center justify-between"><span className="text-xs text-ink/50">{b.family} · {b.rarity} · 已有 {n.get(b.id) ?? 0} 人拿到</span></div>
          <div className="flex gap-2">
            <input name="title" defaultValue={b.title} aria-label="名字" className="w-40 rounded-lg border border-ink/20 px-3 py-2" />
            <input name="how" defaultValue={b.how} aria-label="怎样拿到" className="min-w-0 flex-1 rounded-lg border border-ink/20 px-3 py-2" />
          </div>
          <textarea name="back" defaultValue={b.back_message} rows={2} placeholder="背面：你想对拿到的学生说的话" className="w-full rounded-lg border border-ink/20 p-2" />
          <button className="btn-primary text-xs">保存</button>
        </form>
      ))}
    </div>
  );
}
