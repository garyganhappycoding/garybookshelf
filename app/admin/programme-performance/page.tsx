import Link from "@/components/Link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { byClass, QUIET_DAYS, studentRows } from "@/lib/programme/performance";
import { todayMY } from "@/lib/programme/content";

export const dynamic = "force-dynamic";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") notFound();
}

export default async function Performance({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  await assertAdmin();
  const { sort } = await searchParams;
  const today = todayMY();
  const rows = await studentRows(today);
  const classes = byClass(rows);
  const quiet = rows.filter((r) => r.quietDays === null || r.quietDays >= QUIET_DAYS);
  const ordered = [...rows].sort((a, b) =>
    sort === "completion" ? a.completion - b.completion
    : sort === "streak" ? b.streak - a.streak
    : (b.quietDays ?? 9999) - (a.quietDays ?? 9999)); // default: quiet the longest first
  const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.completion, 0) / rows.length) : 0;
  const waiting = rows.reduce((n, r) => n + r.needGary, 0);

  return (
    <div className="max-w-5xl mx-auto px-5 py-14 space-y-8">
      <div>
        <h1 className="text-2xl font-medium">陪你读书 · 学生表现</h1>
        <p className="text-sm text-ink/60 mt-1">今天是 {today}（马来西亚时间）。只算已付款、已确认的学生，你自己的测试不算。</p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["学生", rows.length],
          ["平均完成率", `${avg}%`],
          [`${QUIET_DAYS} 天以上没交`, quiet.length],
          ["等你看的答案", waiting],
        ].map(([k, v]) => (
          <div key={String(k)} className="card"><p className="text-xs text-ink/60">{k}</p><p className="text-2xl font-semibold tabular-nums">{v}</p></div>
        ))}
      </section>

      <section>
        <h2 className="font-medium mb-2">各班</h2>
        {classes.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-left text-ink/60"><th className="py-1 pr-3">班（州属-年级）</th><th className="pr-3">人数</th><th className="pr-3">平均完成率</th><th className="pr-3">平均连续天数</th><th>久没交</th></tr></thead>
            <tbody>{classes.map((c) => (
              <tr key={c.cls} className="border-t border-ink/10"><td className="py-1.5 pr-3 font-medium">{c.cls}</td><td className="pr-3">{c.students}</td><td className="pr-3">{c.avgCompletion}%</td><td className="pr-3">{c.avgStreak}</td><td>{c.quiet}</td></tr>
            ))}</tbody>
          </table></div>
        ) : <p className="text-sm text-ink/60">还没有已确认的学生。</p>}
      </section>

      <section>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h2 className="font-medium">每个学生</h2>
          <span className="text-xs text-ink/60">排序：</span>
          {[["", "最久没交"], ["completion", "完成率低到高"], ["streak", "连续天数"]].map(([k, label]) => (
            <Link key={k} href={k ? `?sort=${k}` : "?"} className={(sort ?? "") === k ? "btn-primary text-xs" : "btn-secondary text-xs"}>{label}</Link>
          ))}
        </div>
        {ordered.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-left text-ink/60">
              <th className="py-1 pr-3">学生</th><th className="pr-3">班</th><th className="pr-3">完成</th><th className="pr-3">按时 / 补做 / 没交</th><th className="pr-3">连续</th><th className="pr-3">BI / BM</th><th className="pr-3">词汇测验</th><th>最后一次</th>
            </tr></thead>
            <tbody>{ordered.map((r) => {
              const isQuiet = r.quietDays === null || r.quietDays >= QUIET_DAYS;
              return (
                <tr key={r.userId} className="border-t border-ink/10 align-top">
                  <td className="py-1.5 pr-3"><Link href={`/admin/programme-performance/${r.userId}`} className="underline">{r.email}</Link>{r.groupNo ? <span className="text-ink/50"> · 组 {r.groupNo}</span> : null}{r.needGary ? <span className="ml-1 rounded bg-clay-400/20 px-1.5 text-xs text-clay-700">{r.needGary} 份等你</span> : null}</td>
                  <td className="pr-3">{r.cls}</td>
                  <td className="pr-3 tabular-nums">{r.schoolDays ? `${r.completion}%` : "还没开始"}</td>
                  <td className="pr-3 tabular-nums">{r.done} / {r.makeup} / <span className={r.missed ? "text-red-700" : ""}>{r.missed}</span></td>
                  <td className="pr-3 tabular-nums">{r.streak}</td>
                  <td className="pr-3 tabular-nums">{r.bi} / {r.bm}</td>
                  <td className="pr-3 tabular-nums">{r.quizAvg === null ? "—" : `${r.quizAvg}%`}</td>
                  <td className={isQuiet ? "text-red-700" : ""}>{r.lastActive ? `${r.quietDays} 天前` : "还没交过"}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        ) : <p className="text-sm text-ink/60">还没有已确认的学生。</p>}
        <p className="text-xs text-ink/50 mt-3">完成 = 上课日里交过答案的比例（补做也算）。连续 = 按时交的天数，一直算到昨天。「久没交」= {QUIET_DAYS} 天以上没交答案，这个天数是我定的，可以改。</p>
      </section>
    </div>
  );
}
