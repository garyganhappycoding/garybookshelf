"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  WEEKDAY_ZH, addDays, buildCalendar, cn, demoHistory, examsOn, facts, holidayName, contentWeekOf, programmeEnd, key, levelOf, mondayOf, parse, realHistory, themeOf, type Calendar, type Exam, type History,
} from "@/lib/programme/calendar";

const EXAM_COLORS = ["bg-purple-300 text-purple-900", "bg-sky-300 text-sky-900", "bg-pink-300 text-pink-900", "bg-teal-300 text-teal-900"];

const STATUS_TONE = { done: "bg-sage-500 text-white", missed: "bg-red-200 text-red-800", makeup: "bg-yellow-200 text-yellow-900" } as const;

function cellTone(cal: Calendar, d: Date, exam: number, history: History) {
  const k = key(d);
  if (exam >= 0) return EXAM_COLORS[exam % 4];
  const st = history[k];
  if (st) return STATUS_TONE[st];
  if (cal.hol[k]) return "bg-clay-400/25 text-clay-700";
  if (cal.breakOf(k)) return "bg-ink/5 text-ink/50";
  if (cal.isSchool(d) || (cal.inTerm(k) && !cal.dayOff.includes(d.getDay()))) return "bg-sage-400/25";
  return "bg-ink/5 text-ink/40";
}

export type CalendarProps = {
  state: string; form: number; exams: Exam[]; today: string;
  subs: { day: string; made_up: boolean }[]; // real answers handed in
  demo: boolean; // the admin preview: sample history instead of real answers
};

export default function CalendarView({ state: stateId, form, exams, today: TODAY, subs, demo }: CalendarProps) {
  const [selected, setSelected] = useState(TODAY);
  const cal = useMemo(() => buildCalendar(stateId), [stateId]);
  const [broken, setBroken] = useState(false);
  const history = useMemo(() => (demo ? demoHistory(cal, TODAY, broken) : realHistory(cal, TODAY, subs)), [cal, demo, broken, subs, TODAY]);
  const f = facts(cal, TODAY, history);

  const d = parse(selected), wd = d.getDay(), hol = cal.hol[selected], locked = selected > TODAY, wk = cal.weekOf(d);
  const task = cal.tasks[wd];

  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">陪你读书 2027</h1>
      <p className="text-sm text-ink/60 mb-4">
        {demo ? `示范日期：${cn(parse(TODAY))}` : `今天：${cn(parse(TODAY))}`}{!demo && TODAY < "2027-01-04" ? " · 第 1 周从 2027 年 1 月 4 日开始" : ""}
      </p>

      <div className="card mb-5 !py-4">
        <div className="flex items-center justify-between gap-2 whitespace-nowrap text-[13px] sm:text-xl font-semibold tabular-nums">
          <span>{f.week ? `第 ${f.week}/${f.weeks} 周` : "学校假期"}</span>
          <span>{f.left}/{f.total} 天上课</span>
          <span className="text-clay-600">赚回 RM{f.earned}/200</span>
          <span className={f.streak > 0 ? "" : "grayscale opacity-60"}><span aria-hidden>🔥</span> {f.streak}</span>
        </div>
        {demo && (
          <button type="button" onClick={() => setBroken(!broken)} className="mt-2 text-xs text-ink/50 underline">
            示范：{broken ? "恢复连续" : "模拟昨天没做（火变灰）"}
          </button>
        )}
      </div>

      <div className="mb-4 text-sm">
        <span className="text-ink/70">{cal.state.zh} · Form {form} · {cal.group} 组</span>
        <Link href="/programme/settings" className="ml-2 text-xs text-ink/50 underline">改</Link>
        <p className="text-xs text-ink/60 mt-1">
          {cal.group === "A" ? "A 组学校星期日到四上课，星期五和六休息。每周任务也提早一天。" : "B 组学校星期一到五上课，星期六和日休息。"}
        </p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70 mb-4">
        <span><i className="inline-block w-3 h-3 rounded bg-sage-500 align-middle mr-1" />已完成</span>
        <span><i className="inline-block w-3 h-3 rounded bg-red-200 align-middle mr-1" />没完成</span>
        <span><i className="inline-block w-3 h-3 rounded bg-yellow-200 align-middle mr-1" />补做</span>
        <span><i className="inline-block w-3 h-3 rounded bg-sage-400/30 align-middle mr-1" />上课日</span>
        <span><i className="inline-block w-3 h-3 rounded bg-purple-300 align-middle mr-1" />考试</span>
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
            {(() => { const cw = contentWeekOf(cal, exams, d, programmeEnd(exams, form)); return <p className="text-xs text-ink/60">{cw && "ended" in cw ? "年终考开始，这一年的内容到这里结束" : cw && "exam" in cw ? "考试周 · 这一周不安排新内容，任务顺延到考完后的那一周" : cw ? `第 ${cw.n} 周 · ${themeOf(cw.n)} · ${levelOf(cw.n)}` : `第 ${wk} 周`}</p>; })()}
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
                      const ex = examsOn(exams, k), lock = k > TODAY;
                      return (
                        <button key={k} type="button" onClick={() => setSelected(k)} aria-label={cn(day) + (lock ? "，还没开放" : "")}
                          className={`relative rounded py-1.5 ${cellTone(cal, day, ex.length ? ex[0].i : -1, history)} ${lock ? "border border-dashed border-ink/30" : ""} ${k === TODAY ? "ring-2 ring-clay-600" : ""} ${k === selected ? "outline outline-2 outline-ink" : ""}`}>
                          {day.getDate()}
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
