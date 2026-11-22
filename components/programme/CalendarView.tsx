"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  STATES, WEEKDAY_ZH, DEMO_TODAY, addDays, buildCalendar, cn, examsOn, facts, holidayName, key, levelOf, mondayOf, parse, themeOf, type Calendar,
} from "@/lib/programme/calendar";
import { useProgramme } from "./useProgramme";

const EXAM_COLORS = ["bg-clay-500", "bg-sage-500", "bg-sky-500", "bg-purple-500"];

function cellTone(cal: Calendar, d: Date) {
  const k = key(d);
  if (cal.hol[k]) return "bg-clay-400/25 text-clay-700";
  if (cal.breakOf(k)) return "bg-ink/5 text-ink/50";
  if (cal.isSchool(d) || (cal.inTerm(k) && !cal.dayOff.includes(d.getDay()))) return "bg-sage-400/25";
  return "bg-ink/5 text-ink/40";
}

export default function CalendarView() {
  const { stateId, exams, saveState } = useProgramme();
  const [selected, setSelected] = useState(DEMO_TODAY);
  const cal = useMemo(() => buildCalendar(stateId), [stateId]);
  const f = facts(cal, DEMO_TODAY, 0);

  const d = parse(selected), wd = d.getDay(), hol = cal.hol[selected], locked = selected > DEMO_TODAY, wk = cal.weekOf(d);
  const task = cal.tasks[wd];

  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">陪你读书 2027</h1>
      <p className="text-sm text-ink/60 mb-4">示范日期：{cn(parse(DEMO_TODAY))}（真实网站用当天日期）</p>

      <div className="card mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="text-2xl font-semibold tabular-nums">{f.week ? `第 ${f.week}/${f.weeks} 周` : "学校假期"}</p></div>
          <div><p className="text-2xl font-semibold tabular-nums">还剩 {f.left}/{f.total} 天上课</p></div>
          <div><p className="text-2xl font-semibold tabular-nums text-clay-600">已赚回 RM{f.earned}/200</p></div>
          <div><p className="text-2xl font-semibold tabular-nums">连续 {f.streak} 天</p></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-sm text-ink/70" htmlFor="state">我的州属</label>
        <select id="state" value={stateId} onChange={(e) => saveState(e.target.value)} className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm">
          {STATES.map((s) => <option key={s.id} value={s.id}>{s.zh}（{s.group} 组）</option>)}
        </select>
        <p className="text-xs text-ink/60 basis-full">
          {cal.group === "A" ? "A 组学校星期日到四上课，星期五和六休息。每周任务也提早一天。" : "B 组学校星期一到五上课，星期六和日休息。"}
        </p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70 mb-4">
        <span><i className="inline-block w-3 h-3 rounded bg-sage-400/40 align-middle mr-1" />上课日</span>
        <span><i className="inline-block w-3 h-3 rounded bg-clay-400/40 align-middle mr-1" />公共假期（含补假）</span>
        <span><i className="inline-block w-3 h-3 rounded bg-ink/10 align-middle mr-1" />学校假期 / 周末</span>
        <span><i className="inline-block w-3 h-3 rounded border border-dashed border-ink/40 align-middle mr-1" />还没开放</span>
        <span><i className="inline-block w-3 h-3 rounded ring-2 ring-clay-600 align-middle mr-1" />今天</span>
      </div>

      <div className="card mb-5" aria-live="polite">
        <p className="font-medium mb-2">{cn(d)} 星期{WEEKDAY_ZH[wd]}</p>
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          {hol && <span className="rounded-full bg-clay-400/25 text-clay-700 px-2 py-1">公共假期：{holidayName(hol)}</span>}
          {cal.breakOf(selected) && <span className="rounded-full bg-ink/10 px-2 py-1">{cal.breakOf(selected)}</span>}
          {cal.isSchool(d) && <span className="rounded-full bg-sage-400/30 px-2 py-1">上课日</span>}
          {examsOn(exams, selected).map((x) => <span key={x.e.id} className="rounded-full bg-ink/10 px-2 py-1">{x.e.name}</span>)}
          {locked && <span className="rounded-full border border-dashed border-ink/40 px-2 py-1">还没开放</span>}
        </div>
        {locked ? (
          <p className="text-sm text-ink/70">这天的词汇和任务要到 {cn(d)} 凌晨 12 点（马来西亚时间）才会出现。过去的日子永远可以打开补做。</p>
        ) : !wk ? (
          <p className="text-sm text-ink/70">学校放假，这周不安排新任务。想复习的话，回头看之前的主题。</p>
        ) : (
          <>
            <p className="text-xs text-ink/60">第 {wk} 周 · {themeOf(wk)} · {levelOf(wk)}</p>
            <p className="mt-1">{task[0]}：{task[1]}</p>
            <Link href="/programme/today" className="btn-primary inline-block mt-3 text-sm">打开这一天</Link>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 12 }, (_, m) => {
          const first = new Date(2027, m, 1), last = new Date(2027, m + 1, 0);
          const weeks: Date[] = [];
          for (let mon = mondayOf(first); mon <= last; mon = addDays(mon, 7)) weeks.push(mon);
          const heads = ["一", "二", "三", "四", "五", "六", "日"];
          return (
            <div key={m} className="card">
              <p className="font-medium mb-2">{m + 1} 月</p>
              <div className="grid grid-cols-[1.6rem_repeat(7,1fr)] gap-1 text-center text-xs">
                <span />
                {heads.map((h) => <span key={h} className="text-ink/50">{h}</span>)}
                {weeks.map((mon) => {
                  const wn = cal.weekNo[key(mon)];
                  return [
                    <span key={`w${key(mon)}`} className="text-ink/40 self-center">{wn ? `W${wn}` : ""}</span>,
                    ...Array.from({ length: 7 }, (_, i) => {
                      const day = addDays(mon, i), k = key(day);
                      if (day.getMonth() !== m) return <span key={k} />;
                      const ex = examsOn(exams, k), lock = k > DEMO_TODAY;
                      return (
                        <button key={k} type="button" onClick={() => setSelected(k)} aria-label={cn(day) + (lock ? "，还没开放" : "")}
                          className={`relative rounded py-1.5 ${cellTone(cal, day)} ${lock ? "border border-dashed border-ink/30" : ""} ${k === DEMO_TODAY ? "ring-2 ring-clay-600" : ""} ${k === selected ? "outline outline-2 outline-ink" : ""}`}>
                          {day.getDate()}
                          {ex.length > 0 && (
                            <span className="absolute inset-x-0.5 bottom-0 flex h-1 gap-px">
                              {ex.map((x) => <span key={x.e.id} className={`flex-1 ${EXAM_COLORS[x.i % 4]}`} />)}
                            </span>
                          )}
                        </button>
                      );
                    }),
                  ];
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
