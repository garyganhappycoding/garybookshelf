import Shell from "@/components/programme/Shell";
import ResultsForm from "@/components/programme/ResultsForm";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";
import { SUBJECTS, mySets } from "@/lib/programme/results";

export const dynamic = "force-dynamic";
export const metadata = { title: "成绩 · 陪你读书", robots: { index: false, follow: false } };

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ kind?: string; exam?: string }> }) {
  const a = await requireProgramme({ allowNoBaseline: true });
  const sp = await searchParams;
  const p = await getProfile(a.userId);
  const sets = await mySets(a.userId);
  const exam = p.exams.find((e) => e.id === sp.exam);
  const hasBase = sets.some((s) => s.kind === "baseline");
  const kind: "baseline" | "exam" | null = exam ? "exam" : !hasBase || sp.kind === "baseline" ? "baseline" : null;
  const current = kind === "exam" ? sets.find((s) => s.examId === exam!.id) : sets.find((s) => s.kind === "baseline");
  const base = sets.find((s) => s.kind === "baseline");
  const subjects = [...new Set(sets.flatMap((s) => Object.keys(s.marks)))];

  return (
    <Shell admin={a.isAdmin}>
      <h1 className="text-2xl font-medium mb-1">我的成绩</h1>
      <p className="text-sm text-ink/60 mb-4">{kind === "baseline" ? "开始之前，先告诉我们你现在每一科的成绩。以后每次考完试再交一次，就能看到你进步了多少。" : "每次考完试，把成绩交上来，这里会显示你的进步。"}</p>

      {kind && (
        <ResultsForm kind={kind} examId={exam?.id ?? ""} title={kind === "exam" ? `${exam!.name.replace(/（.*?）/g, "")}的成绩` : "开始之前的成绩"}
          subjects={[...SUBJECTS]} existing={current?.marks ?? {}} />
      )}

      {sets.length > 0 && (
        <section className="card mt-5 overflow-x-auto">
          <p className="font-medium mb-2">进步</p>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink/60"><th className="py-1 pr-3">科目</th>{sets.map((s) => <th key={s.id} className="pr-3 whitespace-nowrap">{s.label}</th>)}<th>变化</th></tr></thead>
            <tbody>
              {subjects.map((sub) => {
                const last = [...sets].reverse().find((s) => s.marks[sub] != null), first = base?.marks[sub];
                const diff = last && first != null && last.id !== base?.id ? (last.marks[sub] as number) - first : null;
                return (
                  <tr key={sub} className="border-t border-ink/10">
                    <td className="py-1.5 pr-3">{sub}</td>
                    {sets.map((s) => <td key={s.id} className="pr-3 tabular-nums">{s.marks[sub] ?? "—"}</td>)}
                    <td className={`tabular-nums ${diff === null ? "text-ink/40" : diff >= 0 ? "text-sage-600" : "text-red-700"}`}>{diff === null ? "—" : `${diff >= 0 ? "+" : ""}${Math.round(diff * 10) / 10}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </Shell>
  );
}
