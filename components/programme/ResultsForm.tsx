"use client";
import Link from "@/components/Link";
import { useActionState, useState } from "react";
import { saveResultsAction, type ResultsState } from "@/app/programme/results/actions";

const init: ResultsState = {};

export default function ResultsForm({ kind, examId, title, subjects, parts, existing }: {
  kind: "baseline" | "exam"; examId: string; title: string; subjects: string[]; parts: Record<string, string[]>; existing: Record<string, number | null>;
}) {
  const [state, action, pending] = useActionState(saveResultsAction, init);
  const [extra, setExtra] = useState<string[]>([]);
  const [name, setName] = useState("");
  const all = [...subjects, ...Object.keys(existing).filter((s) => !subjects.includes(s)), ...extra];
  if (state.ok) {
    return (
      <div className="card text-center">
        <p className="text-xl font-medium mb-2">已经收到了，谢谢！</p>
        <p className="text-sm text-ink/70 mb-4">{kind === "baseline" ? "下一步：交一篇英文作文和一篇马来文作文，作为你的起点。" : "进步的话，会有惊喜。"}</p>
        <Link href={kind === "baseline" ? "/programme/pretest" : "/programme"} className="btn-primary inline-block text-sm">继续</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="kind" value={kind} /><input type="hidden" name="exam" value={examId} />
      <div className="card">
        <p className="font-medium mb-1">{title}</p>
        <p className="text-sm text-ink/70">每一科写下总分（0 到 100），<b>没有读的科目留空就是跳过</b>。知道分项的分数（例如 BM 的口试、BI 的写作）也可以写，不知道的话，只写总分就可以。</p>
        <div className="mt-3 space-y-3">
          {all.map((s) => (
            <div key={s} className="rounded-xl border border-ink/10 bg-white px-3 py-2">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{s}</span>
                <input name={`m:${s}`} inputMode="decimal" defaultValue={existing[s] ?? ""} placeholder="总分" aria-label={`${s} 总分`} className="w-24 rounded-lg border border-ink/20 px-3 py-2 text-right text-base" />
              </label>
              {parts[s] && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-ink/60">知道分项的分数？（可以不填）</summary>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {parts[s].map((p) => (
                      <label key={p} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-ink/70">{p}</span>
                        <input name={`p:${s}:${p}`} inputMode="decimal" aria-label={`${s} ${p}`} className="w-20 rounded-lg border border-ink/20 px-2 py-1.5 text-right text-base" />
                      </label>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="还有别的科目？例如 Geografi" aria-label="新增科目" className="min-w-0 flex-1 rounded-lg border border-ink/20 px-3 py-2 text-base" />
          <button type="button" className="btn-secondary text-sm" onClick={() => { const n = name.trim().slice(0, 30); if (n && !all.includes(n)) setExtra([...extra, n]); setName(""); }}>加上</button>
        </div>
      </div>

      <div className="card space-y-4">
        <label className="block text-sm">
          <span className="font-medium">成绩单（上传 PDF 最好，图片也可以）</span>
          <input type="file" name="slip" accept="application/pdf,image/*" className="mt-2 block w-full text-sm" />
        </label>
        <div className="rounded-xl bg-clay-400/15 p-3 text-sm">
          <p className="font-medium mb-1">想让 Gary 分析你的弱点？</p>
          <p>把整份试卷上传到这里（PDF 最好），Gary 有机会帮你看看哪些题目最容易错、该先补哪里。Gary 会用转盘抽一部分同学来分析，不是每一份都能分析，但交上来的都有机会。</p>
          <input type="file" name="papers" accept="application/pdf,image/*" multiple className="mt-2 block w-full text-sm" />
          <p className="mt-1 text-xs text-ink/60">最多 8 个文件，每个小于 10MB。</p>
        </div>
      </div>

      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} className="btn-primary min-h-12 text-sm disabled:opacity-50">{pending ? "上传中…" : "交上去"}</button>
        {kind === "baseline" && <button disabled={pending} name="skip" value="1" className="btn-secondary min-h-12 text-sm disabled:opacity-50">我现在没有成绩，先跳过</button>}
      </div>
    </form>
  );
}
