import Link from "@/components/Link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { studentDetail } from "@/lib/programme/performance";
import { signedUrls } from "@/lib/programme/results";

export const dynamic = "force-dynamic";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") notFound();
}

const AI_ZH: Record<string, string> = { done: "AI 已反馈", waiting_gary: "等你写反馈", failed: "AI 失败", pending: "等 AI" };
const when = (s: string) => new Date(s).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "medium", timeStyle: "short" });

export default async function StudentPerformance({ params }: { params: Promise<{ userId: string }> }) {
  await assertAdmin();
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) notFound();
  const { row, subs, log, comments, results, pretests } = await studentDetail(userId);
  if (!row) notFound();
  const links = await Promise.all(results.map(async (s) => ({ id: s.id, slip: await signedUrls(s.slipPath ? [s.slipPath] : []), papers: await signedUrls(s.paperPaths) })));
  const subjects = [...new Set(results.flatMap((s) => Object.keys(s.marks)))];
  const pretestFiles = await Promise.all(pretests.map(async (p) => ({ lang: p.lang, body: p.body, url: (await signedUrls(p.file_path ? [p.file_path] : []))[0] ?? null })));

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 space-y-6">
      <Link href="/admin/programme-performance" className="text-sm underline text-ink/60">← 全部学生</Link>
      <div>
        <h1 className="text-2xl font-medium">{row.email}</h1>
        <p className="text-sm text-ink/60">班 {row.cls}{row.groupNo ? ` · 朋友组 ${row.groupNo}` : ""}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["完成率", row.schoolDays ? `${row.completion}%` : "还没开始"],
          ["按时 / 补做 / 没交", `${row.done} / ${row.makeup} / ${row.missed}`],
          ["连续天数", row.streak],
          ["词汇测验平均", row.quizAvg === null ? "—" : `${row.quizAvg}%`],
        ].map(([k, v]) => <div key={String(k)} className="card"><p className="text-xs text-ink/60">{k}</p><p className="text-xl font-semibold tabular-nums">{v}</p></div>)}
      </div>

      <section>
        <h2 className="font-medium mb-2">起点作文</h2>
        {pretestFiles.length ? pretestFiles.map((p) => (
          <div key={p.lang} className="card mb-2 text-sm"><p className="font-medium">{p.lang}{p.url && <a href={p.url} target="_blank" rel="noreferrer" className="ml-3 underline font-normal">上传的文件</a>}</p>{p.body && <p className="mt-1 whitespace-pre-wrap text-ink/80">{p.body}</p>}</div>
        )) : <p className="text-sm text-ink/60">还没交起点作文。</p>}
      </section>

      <section>
        <h2 className="font-medium mb-2">成绩</h2>
        {results.length ? (
          <div className="card text-sm overflow-x-auto">
            <table className="w-full"><thead><tr className="text-left text-ink/60"><th className="py-1 pr-3">科目</th>{results.map((s) => <th key={s.id} className="pr-3 whitespace-nowrap">{s.label}</th>)}</tr></thead>
              <tbody>{subjects.map((sub) => <tr key={sub} className="border-t border-ink/10"><td className="py-1.5 pr-3">{sub}</td>{results.map((s) => <td key={s.id} className="pr-3 tabular-nums">{s.marks[sub] ?? "—"}</td>)}</tr>)}</tbody></table>
            {links.map((l, i) => (l.slip.length || l.papers.length) ? (
              <p key={l.id} className="mt-2">{results[i].label}：{l.slip.map((u, j) => <a key={j} href={u} target="_blank" rel="noreferrer" className="underline mr-3">成绩单</a>)}{l.papers.map((u, j) => <a key={j} href={u} target="_blank" rel="noreferrer" className="underline mr-3">试卷 {j + 1}</a>)}</p>
            ) : null)}
          </div>
        ) : <p className="text-sm text-ink/60">还没交过成绩。</p>}
      </section>

      <section>
        <h2 className="font-medium mb-2">所有答案（{subs.length}）</h2>
        {subs.map((s) => {
          const versions = log.filter((l) => l.submission_id === s.id);
          const details = s.details && Object.keys(s.details as object).length ? JSON.stringify(s.details, null, 2) : null;
          return (
            <div key={s.id} className="card mb-3 text-sm">
              <p className="font-medium">
                {String(s.day)} · {s.lang}
                <span className={`ml-2 text-xs ${s.made_up ? "text-clay-700" : "text-sage-600"}`}>{s.made_up ? "补做" : "按时"}</span>
                <span className="ml-2 text-xs text-ink/50">交了 {s.attempts ?? 1} 次 · 最后 {when(String(s.updated_at ?? s.created_at))}</span>
              </p>
              <p className="mt-2 whitespace-pre-wrap">{s.answer}</p>
              {s.quiz_total ? <p className="mt-2 text-ink/70">词汇测验：{s.quiz_correct}/{s.quiz_total}</p> : null}
              {details && <details className="mt-2"><summary className="cursor-pointer text-ink/60">其他部分（标词、小测验等）</summary><pre className="mt-1 text-xs whitespace-pre-wrap">{details}</pre></details>}
              <p className="mt-2 text-ink/70"><span className="text-xs rounded bg-ink/5 px-1.5 py-0.5 mr-1">{AI_ZH[s.ai_status ?? "pending"] ?? s.ai_status}</span>{s.ai_feedback}</p>
              {versions.length > 1 && (
                <details className="mt-2"><summary className="cursor-pointer text-ink/60">以前的版本（{versions.length - 1}）</summary>
                  {versions.slice(0, -1).map((v, i) => <p key={i} className="mt-1 border-l-2 border-ink/10 pl-2 whitespace-pre-wrap"><span className="text-xs text-ink/50">{when(String(v.created_at))}</span><br />{v.answer}</p>)}
                </details>
              )}
            </div>
          );
        })}
        {!subs.length && <p className="text-sm text-ink/60">还没交过答案。</p>}
      </section>

      <section>
        <h2 className="font-medium mb-2">留言（{comments.length}）</h2>
        {comments.map((c, i) => <p key={i} className="card mb-2 text-sm"><span className="text-xs text-ink/50">{String(c.day)} · {c.lang} · {c.status}</span><br />{c.body}</p>)}
        {!comments.length && <p className="text-sm text-ink/60">没有。</p>}
      </section>
    </div>
  );
}
