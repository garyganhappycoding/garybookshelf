"use client";
import Link from "next/link";
import { STATES } from "@/lib/programme/calendar";
import { useProgramme } from "./useProgramme";

export default function SettingsView() {
  const { stateId, saveState } = useProgramme();
  return (
    <div>
      <h1 className="text-2xl font-medium mb-4">设置</h1>
      <div className="card mb-4">
        <label htmlFor="st" className="font-medium block mb-2">我的州属</label>
        <select id="st" value={stateId} onChange={(e) => saveState(e.target.value)} className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm">
          {STATES.map((s) => <option key={s.id} value={s.id}>{s.zh}（{s.group} 组）</option>)}
        </select>
        <p className="text-xs text-ink/60 mt-2">换州属，日历的上课日、假期和每周任务会跟着换。</p>
      </div>
      <Link href="/programme/settings/exams" className="card block mb-4 hover:shadow-md transition">
        <p className="font-medium">我的考试日期</p>
        <p className="text-sm text-ink/60">改成你学校真正的考试日期，日历上会出现色条。</p>
      </Link>
      <Link href="/programme/join" className="card block hover:shadow-md transition">
        <p className="font-medium">加入页面（示范）</p>
        <p className="text-sm text-ink/60">一个人 / 和朋友一起，价钱和付款步骤。</p>
      </Link>
    </div>
  );
}
