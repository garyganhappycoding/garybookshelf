"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveResultsAction, type ResultsState } from "@/app/programme/results/actions";

const init: ResultsState = {};

export default function ResultsForm({ kind, examId, title, subjects, existing }: { kind: "baseline" | "exam"; examId: string; title: string; subjects: string[]; existing: Record<string, number | null> }) {
  const [state, action, pending] = useActionState(saveResultsAction, init);
  const [extra, setExtra] = useState<string[]>([]);
  const [name, setName] = useState("");
  const all = [...subjects, ...Object.keys(existing).filter((s) => !subjects.includes(s)), ...extra];
  if (state.ok) {
    return (
      <div className="card text-center">
        <p className="text-xl font-medium mb-2">已经收到了，谢谢！</p>
        <p className="text-sm text-ink/70 mb-4">{kind === "baseline" ? "下一步是开始之前的小测，让我们知道你现在的水平。" : "每次考完试交一次成绩，就能看到自己有没有进步。"}</p>
        <Link href="/programme" className="btn-primary inline-block text-sm">继续</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="kind" value={kind} /><input type="hidden" name="exam" value={examId} />
      <div className="card">
        <p className="font-medium mb-1">{title}</p>
        <p className="text-sm text-ink/70">每一科写下你的分数（0 到 100），没有读的科目留空。</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {all.map((s) => (
            <label key={s} className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-3 py-2">
              <span className="text-sm">{s}</span>
              <input name={`m:${s}`} inputMode="decimal" defaultValue={existing[s] ?? ""} placeholder="分数" aria-label={`${s} 分数`} className="w-24 rounded-lg border border-ink/20 px-3 py-2 text-right text-base" />
            </label>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="还有别的科目？例如 Geografi" aria-label="新增科目" className="min-w-0 flex-1 rounded-lg border border-ink/20 px-3 py-2 text-base" />
          <button type="button" className="btn-secondary text-sm" onClick={() => { const n = name.trim().slice(0, 30); if (n && !all.includes(n)) setExtra([...extra, n]); setName(""); }}>加上</button>
        </div>
      </div>

      <div className="card space-y-4">
        <label className="block text-sm">
          <span className="font-medium">成绩单的照片（建议上传，比较准确）</span>
          <input type="file" name="slip" accept="image/*" className="mt-2 block w-full text-sm" />
        </label>
        <div className="rounded-xl bg-clay-400/15 p-3 text-sm">
          <p className="font-medium mb-1">想让 Gary 帮你分析弱点？</p>
          <p>把整份试卷的照片也上传到这里，Gary 有机会帮你看看哪些题目最容易错、该先补哪里。</p>
          <input type="file" name="papers" accept="image/*" multiple className="mt-2 block w-full text-sm" />
          <p className="mt-1 text-xs text-ink/60">最多 8 张，每张小于 5MB。不是每一份都能分析，但交上来的 Gary 都会看。</p>
        </div>
      </div>

      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary min-h-12 text-sm disabled:opacity-50">{pending ? "上传中…" : "交上去"}</button>
    </form>
  );
}
