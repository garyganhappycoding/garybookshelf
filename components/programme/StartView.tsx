"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { STATES } from "@/lib/programme/calendar";
import { startAction, type SaveResult } from "@/app/programme/settings/actions";

export default function StartView({ state, form }: { state: string; form: number }) {
  const router = useRouter();
  const [st, setSt] = useState(state);
  const [fm, setFm] = useState(form);
  const [res, action, pending] = useActionState(async (p: SaveResult, f: FormData) => {
    const r = await startAction(p, f);
    if (r.ok) router.push("/programme");
    return r;
  }, {} as SaveResult);
  return (
    <form action={action} className="card space-y-4">
      <h1 className="text-2xl font-medium">欢迎来到陪你读书</h1>
      <p className="text-sm text-ink/70">先告诉我两件事，我才能排出你的日历和班级。</p>
      <div>
        <label htmlFor="state" className="font-medium block mb-1">我在哪个州属上学</label>
        <select id="state" name="state" value={st} onChange={(e) => setSt(e.target.value)} className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm">
          {STATES.map((s) => <option key={s.id} value={s.id}>{s.zh}（{s.group} 组）</option>)}
        </select>
      </div>
      <div>
        <p className="font-medium mb-1">我读</p>
        <input type="hidden" name="form" value={fm} />
        <div className="flex gap-2">{[4, 5].map((n) => <button key={n} type="button" onClick={() => setFm(n)} className={fm === n ? "btn-primary text-sm" : "btn-secondary text-sm"}>Form {n}</button>)}</div>
      </div>
      <p className="text-xs text-ink/60">你会和同一个州属、同一个年级的同学分在同一班。以后可以在设置里改。</p>
      <button disabled={pending} className="btn-primary text-sm disabled:opacity-50">开始</button>
      {res.error && <p role="alert" className="text-sm text-red-700">{res.error}</p>}
    </form>
  );
}
