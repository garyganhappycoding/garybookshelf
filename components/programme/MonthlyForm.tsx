"use client";
import Link from "next/link";
import { useActionState } from "react";
import { saveMonthlyAction, type MonthlyState } from "@/app/programme/monthly/actions";
import type { MonthlyItem } from "@/lib/programme/monthly";

const init: MonthlyState = {};

export default function MonthlyForm({ item }: { item: MonthlyItem }) {
  const [state, action, pending] = useActionState(saveMonthlyAction, init);
  if (state.ok) {
    return (
      <div className="card text-center">
        <p className="mb-2 text-xl font-medium">月测交好了！</p>
        <p className="mb-4 text-sm text-ink/70">分数会出现在「我的进步」里，和你的起点作文比一比。</p>
        <Link href="/programme/progress" className="btn-primary inline-block text-sm">看我的进步</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="month" value={item.month} />
      {(["BI", "BM"] as const).filter((l) => !item.done[l]).map((l) => (
        <section key={l} className="card space-y-3">
          <p className="font-medium">{l === "BI" ? "英文作文（BI）" : "马来文作文（BM）"}</p>
          <p className="whitespace-pre-line rounded-lg bg-paper-100 p-3 text-sm">{item[l]}</p>
          <textarea name={`text-${l}`} rows={10} aria-label={`${l} essay`} placeholder="在这里打字写（至少 30 个字）" className="min-h-[12rem] w-full rounded-lg border border-ink/20 bg-white p-3 text-base" />
        </section>
      ))}
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary min-h-12 text-sm disabled:opacity-50">{pending ? "批改中，请稍等…" : "交上去"}</button>
    </form>
  );
}
