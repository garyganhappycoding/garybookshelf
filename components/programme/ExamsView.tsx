"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { DEFAULT_EXAMS, type Exam } from "@/lib/programme/calendar";
import { saveExamsAction } from "@/app/programme/settings/actions";

export default function ExamsView({ initial }: { initial: Exam[] }) {
  const [exams, setExams] = useState<Exam[]>(initial);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const patch = (id: string, p: Partial<Exam>) => { setMsg(""); setExams(exams.map((e) => (e.id === id ? { ...e, ...p } : e))); };
  const save = () => start(async () => { const r = await saveExamsAction(exams); setMsg(r.error ?? "已保存。"); });
  return (
    <div>
      <Link href="/programme/settings" className="text-sm text-ink/60 underline">← 设置</Link>
      <h1 className="text-2xl font-medium mt-2 mb-1">我的考试日期</h1>
      <p className="text-sm text-ink/60 mb-4">这些是估计日期。请改成学校公布的真正日期；还没公布的可以留空。</p>
      <div className="space-y-3">
        {exams.map((e) => (
          <div key={e.id} className="card grid gap-2 sm:grid-cols-[1fr_auto_auto] items-end">
            <label className="text-sm">名称
              <input value={e.name} onChange={(ev) => patch(e.id, { name: ev.target.value })} className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="text-sm">开始
              <input type="date" value={e.start} onChange={(ev) => patch(e.id, { start: ev.target.value })} className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="text-sm">结束
              <input type="date" value={e.end} onChange={(ev) => patch(e.id, { end: ev.target.value })} className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm" />
            </label>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={save} disabled={pending} className="btn-primary text-sm disabled:opacity-50">保存</button>
        <button type="button" onClick={() => { setExams(DEFAULT_EXAMS); setMsg(""); }} className="btn-secondary text-sm">恢复成估计日期</button>
      </div>
      {msg && <p className="text-sm text-ink/70 mt-2">{msg}</p>}
    </div>
  );
}
