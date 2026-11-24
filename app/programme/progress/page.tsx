import Shell from "@/components/programme/Shell";
import { requireProgramme } from "@/lib/programme/gate";
import { createAdminClient } from "@/lib/supabase/admin";
import { mySets } from "@/lib/programme/results";

export const dynamic = "force-dynamic";
export const metadata = { title: "我的进步 · 陪你读书", robots: { index: false, follow: false } };

type Pt = { label: string; score: number; at: string };

function Chart({ pts, color }: { pts: Pt[]; color: string }) {
  const W = 320, H = 140, pad = 24;
  if (pts.length < 2) return <p className="text-sm text-ink/60">再多交一次测验，这里就会画出你的进步线。</p>;
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (pts.length - 1);
  const y = (v: number) => H - pad - (Math.max(0, Math.min(100, v)) / 100) * (H - 2 * pad);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.score).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md" role="img" aria-label="分数变化">
      {[0, 50, 100].map((g) => <g key={g}><line x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke="#eadfd0" /><text x={4} y={y(g) + 4} fontSize="10" fill="#857869">{g}</text></g>)}
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.score)} r={i === 0 ? 5 : 3.5} fill={i === 0 ? "#fff" : color} stroke={color} strokeWidth="2"><title>{`${p.label}: ${p.score}%`}</title></circle>)}
    </svg>
  );
}

export default async function ProgressPage() {
  const a = await requireProgramme();
  const admin = createAdminClient();
  const [{ data: tests }, { data: pre }, sets] = await Promise.all([
    admin.from("programme_essay_tests").select("lang, kind, period, score, label, created_at").eq("user_id", a.userId).order("created_at"),
    admin.from("programme_pretest").select("lang, score, label, created_at").eq("user_id", a.userId),
    mySets(a.userId),
  ]);
  const series = (["BI", "BM"] as const).map((lang) => {
    const start = (pre ?? []).find((p) => p.lang === lang && p.score != null);
    const pts: Pt[] = [
      ...(start ? [{ label: "起点作文", score: Number(start.score), at: start.created_at }] : []),
      ...(tests ?? []).filter((t) => t.lang === lang && t.score != null).map((t) => ({ label: `${t.kind === "monthly" ? "月测" : "第 " + t.period + " 周测验"}`, score: Number(t.score), at: t.created_at })),
    ];
    return { lang, pts, change: pts.length > 1 ? Math.round((pts[pts.length - 1].score - pts[0].score) * 10) / 10 : null };
  });
  const base = sets.find((s) => s.kind === "baseline"), last = sets.length > 1 ? sets[sets.length - 1] : null;

  return (
    <Shell admin={a.isAdmin}>
      <h1 className="mb-1 text-2xl font-medium">我的进步</h1>
      <p className="mb-4 text-sm text-ink/60">作文分数是估计的，用来看趋势，不是正式分数。每周日的测验会加一个点。</p>
      <div className="grid gap-4 md:grid-cols-2">
        {series.map((s) => (
          <section key={s.lang} className="card">
            <div className="mb-2 flex items-baseline justify-between"><p className="font-medium">{s.lang === "BI" ? "英文作文" : "马来文作文"}</p>
              {s.change !== null && <span className={`text-sm font-semibold tabular-nums ${s.change >= 0 ? "text-sage-600" : "text-red-700"}`}>{s.change >= 0 ? "+" : ""}{s.change}%</span>}</div>
            <Chart pts={s.pts} color={s.lang === "BI" ? "#a65d3f" : "#5d7a52"} />
            <ul className="mt-2 space-y-0.5 text-xs text-ink/60">{s.pts.map((p, i) => <li key={i} className="flex justify-between"><span>{p.label}</span><span className="tabular-nums">{p.score}%</span></li>)}</ul>
          </section>
        ))}
      </div>
      {base && last && (
        <section className="card mt-4 text-sm">
          <p className="mb-1 font-medium">考试成绩</p>
          <p className="text-ink/70">{base.label} → {last.label}：{Object.keys(last.marks).filter((s) => base.marks[s] != null && last.marks[s] != null).map((s) => `${s} ${base.marks[s]} → ${last.marks[s]}`).join("；") || "还没有可以比较的科目"}。详细看「我的成绩」。</p>
        </section>
      )}
    </Shell>
  );
}
