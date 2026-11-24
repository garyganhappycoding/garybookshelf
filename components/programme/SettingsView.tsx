"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { STATES } from "@/lib/programme/calendar";
import { saveInstructionLangAction, saveSettingsAction } from "@/app/programme/settings/actions";

export default function SettingsView({ state, form, instructionLang }: { state: string; form: number; instructionLang: "en" | "zh" }) {
  const [st, setSt] = useState(state);
  const [fm, setFm] = useState(form);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const [ilang, setIlang] = useState(instructionLang);
  const [switching, startSwitch] = useTransition();
  const save = () => start(async () => { const r = await saveSettingsAction(st, fm); setMsg(r.error ?? "已保存。"); });
  return (
    <div>
      <h1 className="text-2xl font-medium mb-4">设置</h1>
      <div className="card mb-4 space-y-3">
        <p className="font-medium">说明的语言 · Instructions in</p>
        <div className="flex gap-2">
          {(["zh", "en"] as const).map((l) => (
            <button key={l} type="button" disabled={switching} onClick={() => startSwitch(async () => { await saveInstructionLangAction(l); setIlang(l); })}
              className={ilang === l ? "btn-primary text-sm" : "btn-secondary text-sm"}>{l === "zh" ? "中文" : "English"}</button>
          ))}
        </div>
      </div>
      <div className="card mb-4 space-y-3">
        <label htmlFor="st" className="font-medium block">我的州属</label>
        <select id="st" value={st} onChange={(e) => setSt(e.target.value)} className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm">
          {STATES.map((s) => <option key={s.id} value={s.id}>{s.zh}（{s.group} 组）</option>)}
        </select>
        <p className="font-medium">我读</p>
        <div className="flex gap-2">
          {[4, 5].map((n) => <button key={n} type="button" onClick={() => setFm(n)} className={fm === n ? "btn-primary text-sm" : "btn-secondary text-sm"}>Form {n}</button>)}
        </div>
        <p className="text-xs text-ink/60">班级按州属和年级分。换了之后，你会进到新的班级，日历的上课日、假期和每周任务也跟着换。</p>
        <button type="button" onClick={save} disabled={pending} className="btn-primary text-sm disabled:opacity-50">保存</button>
        {msg && <p className="text-sm text-ink/70">{msg}</p>}
      </div>
      <Link href="/programme/settings/exams" className="card block hover:shadow-md transition">
        <p className="font-medium">我的考试日期</p>
        <p className="text-sm text-ink/60">改成你学校真正的考试日期，日历上会出现颜色。</p>
      </Link>
    </div>
  );
}
