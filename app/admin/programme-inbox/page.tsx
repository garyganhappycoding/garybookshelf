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

async function commentAction(form: FormData) {
  "use server";
  await assertAdmin();
  const id = String(form.get("id"));
  const status = form.get("do") === "show" ? "visible" : "hidden";
  await createAdminClient().from("programme_comments").update({ status }).eq("id", id);
  revalidatePath("/admin/programme-inbox");
}
async function resolveAction(form: FormData) {
  "use server";
  await assertAdmin();
  const admin = createAdminClient();
  const id = String(form.get("id"));
  if (form.get("do") === "hide" && form.get("comment_id")) await admin.from("programme_comments").update({ status: "hidden" }).eq("id", String(form.get("comment_id")));
  await admin.from("programme_reports").update({ status: "resolved" }).eq("id", id);
  revalidatePath("/admin/programme-inbox");
}
async function feedbackAction(form: FormData) {
  "use server";
  await assertAdmin();
  const text = String(form.get("feedback") ?? "").trim().slice(0, 1500);
  if (!text) return;
  await createAdminClient().from("programme_submissions").update({ ai_feedback: text, ai_status: "done" }).eq("id", String(form.get("id")));
  revalidatePath("/admin/programme-inbox");
}

export default async function ProgrammeInbox() {
  await assertAdmin();
  const admin = createAdminClient();
  const [{ data: pending }, { data: reports }, { data: waiting }] = await Promise.all([
    admin.from("programme_comments").select("*").eq("status", "pending").order("created_at"),
    admin.from("programme_reports").select("*, programme_comments(id, body, nickname, status), programme_submissions(id, answer, ai_feedback, lang, day)").eq("status", "open").order("created_at"),
    admin.from("programme_submissions").select("*").eq("ai_status", "waiting_gary").order("created_at"),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 space-y-8">
      <h1 className="text-2xl font-medium">陪你读书 · 收件箱</h1>

      <section>
        <h2 className="font-medium mb-2">留言等你决定（{pending?.length ?? 0}）</h2>
        {(pending ?? []).map((c) => (
          <div key={c.id} className="card mb-3 text-sm">
            <p>{c.nickname}（{c.class_key} · {c.day} · {c.lang}）：{c.body}</p>
            <p className="text-ink/60 mt-1">AI：{c.screen_note}</p>
            <form action={commentAction} className="flex gap-2 mt-2">
              <input type="hidden" name="id" value={c.id} />
              <button name="do" value="show" className="btn-primary text-xs">放出来</button>
              <button name="do" value="hide" className="btn-secondary text-xs">挡掉</button>
            </form>
          </div>
        ))}
        {!pending?.length && <p className="text-sm text-ink/60">没有。</p>}
      </section>

      <section>
        <h2 className="font-medium mb-2">举报和反馈（{reports?.length ?? 0}）</h2>
        {(reports ?? []).map((r: any) => (
          <div key={r.id} className="card mb-3 text-sm">
            <p className="font-medium">{r.kind === "comment" ? "举报一条留言" : "说 AI 反馈不好"}</p>
            <p className="text-ink/70">原因：{r.note || "（没写）"}</p>
            {r.programme_comments && <p className="mt-1">留言：{r.programme_comments.nickname}：{r.programme_comments.body}</p>}
            {r.programme_submissions && (
              <div className="mt-1">
                <p>答案（{r.programme_submissions.day} {r.programme_submissions.lang}）：{r.programme_submissions.answer}</p>
                <p className="text-ink/70">AI 反馈：{r.programme_submissions.ai_feedback}</p>
              </div>
            )}
            <form action={resolveAction} className="flex gap-2 mt-2">
              <input type="hidden" name="id" value={r.id} />
              {r.comment_id && <input type="hidden" name="comment_id" value={r.comment_id} />}
              {r.comment_id && <button name="do" value="hide" className="btn-primary text-xs">挡掉这条留言并结案</button>}
              <button name="do" value="ok" className="btn-secondary text-xs">没问题，结案</button>
            </form>
          </div>
        ))}
        {!reports?.length && <p className="text-sm text-ink/60">没有。</p>}
      </section>

      <section>
        <h2 className="font-medium mb-2">AI 没把握的答案（{waiting?.length ?? 0}）</h2>
        {(waiting ?? []).map((s) => (
          <div key={s.id} className="card mb-3 text-sm">
            <p>{s.day} · {s.lang}：{s.answer}</p>
            <form action={feedbackAction} className="mt-2 space-y-2">
              <input type="hidden" name="id" value={s.id} />
              <textarea name="feedback" rows={3} placeholder="写给学生的反馈" className="w-full rounded-lg border border-ink/20 bg-white p-2" />
              <button className="btn-primary text-xs">送出反馈</button>
            </form>
          </div>
        ))}
        {!waiting?.length && <p className="text-sm text-ink/60">没有。</p>}
      </section>
    </div>
  );
}
