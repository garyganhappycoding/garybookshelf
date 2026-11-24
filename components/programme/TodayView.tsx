"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { addDays, buildCalendar, cn, key, parse, WEEKDAY_ZH } from "@/lib/programme/calendar";
import { commentAction, reportAction, type Result } from "@/app/programme/today/actions";
import DayCard, { type CardData } from "./DayCard";

export type TodayStats = { week: number; weeks: number; left: number; total: number; earned: number; streak: number };
export type WeekDay = { k: string; label: string; state: "done" | "missed" | "makeup" | null; future: boolean };
export type TodayData = {
  stats: TodayStats; weekDays: WeekDay[]; todayReal: string;
  day: string; lang: "BM" | "BI"; state: string; submitted: boolean; submissionId: string | null;
  demo: boolean; feedback: string | null; aiStatus: string | null; ilang: "en" | "zh"; form: number; card: CardData | null; examWeek: boolean; ended: boolean; answerText: string | null; marks: { k: string; w: string; c: 1 | 2 }[] | null;
  comments: { id: string; nickname: string; body: string; mine: boolean; waiting: boolean }[];
};
const init: Result = {};

function ReportBox({ kind, target, label }: { kind: "comment" | "ai_feedback"; target: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reportAction, init);
  if (state.ok) return <p className="text-xs text-ink/60">已经告诉 Gary 了。</p>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-xs text-ink/50 underline">{label}</button>;
  return (
    <form action={action} className="mt-2 space-y-2">
      <input type="hidden" name="kind" value={kind} /><input type="hidden" name="target" value={target} />
      <textarea name="note" rows={2} aria-label="告诉 Gary" placeholder="哪里不对？（可以不写）" className="w-full rounded-lg border border-ink/20 bg-white p-2 text-sm" />
      <button disabled={pending} className="btn-secondary text-xs">送出给 Gary</button>
      {state.error && <p role="alert" className="text-xs text-red-700">{state.error}</p>}
    </form>
  );
}

export default function TodayView({ data }: { data: TodayData }) {
  const state = data.state;
  const cal = buildCalendar(state);
  const d = parse(data.day), wk = cal.weekOf(d);
  const [com, commentForm, commenting] = useActionState(commentAction, init);
  const [text, setText] = useState("");
  const submitted = data.submitted;
  const T = (zh: string, en: string) => (data.ilang === "zh" ? zh : en);
  const endedMessage = data.form === 5
    ? T("SPM 开始了，这一年的陪你读书到这里结束。加油！", "SPM has started, so this year's 陪你读书 ends here. Good luck!")
    : T("年终考开始了，这一年的陪你读书到这里结束。加油！", "The year-end exam has started, so this year's 陪你读书 ends here. Good luck!");

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-ink/60">{cn(d)} 星期{WEEKDAY_ZH[d.getDay()]}{data.demo ? "（示范日期）" : ""}</p>
        <div className="flex items-center gap-2">
          <Link aria-label="前一天" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-lg hover:bg-ink/5" href={`/programme/today?lang=${data.lang}&date=${key(addDays(d, -1))}`}>←</Link>
          {data.demo || key(addDays(d, 1)) <= data.todayReal ? (
            <Link aria-label="后一天" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-lg hover:bg-ink/5" href={`/programme/today?lang=${data.lang}&date=${key(addDays(d, 1))}`}>→</Link>
          ) : <span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-lg text-ink/25">→</span>}
        </div>
      </div>
      <h1 className="text-2xl font-medium mb-2">今天</h1>

      <div className="-mx-5 mb-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-5 pb-1 text-xs md:mx-0 md:px-0" aria-label="进度">
        <span className="shrink-0 rounded-xl border border-ink/10 bg-white px-3 py-1.5 text-ink/70"><b className="mr-1 text-sm text-ink">{data.stats.week ? `第 ${data.stats.week}/${data.stats.weeks} 周` : "学校假期"}</b></span>
        <span className="shrink-0 rounded-xl border border-ink/10 bg-white px-3 py-1.5 text-ink/70"><b className="mr-1 text-sm text-ink">{data.stats.left}/{data.stats.total}</b>天上课</span>
        <span className="shrink-0 rounded-xl border border-ink/10 bg-white px-3 py-1.5 text-ink/70"><span className={data.stats.streak > 0 ? "" : "grayscale opacity-60"} aria-hidden>🔥</span> <b className="mr-1 text-sm text-ink">{data.stats.streak}</b>天连续</span>
        <span className="shrink-0 rounded-xl border border-ink/10 bg-white px-3 py-1.5 text-clay-700"><b className="mr-1 text-sm">RM{data.stats.earned}/200</b>已赚回</span>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-1.5" role="navigation" aria-label="这一周">
        {data.weekDays.map((w) => {
          const cls = `flex h-11 items-center justify-center rounded-xl border text-sm ${w.k === data.day ? "border-clay-600 bg-clay-600 text-white" : w.state === "done" ? "border-sage-400/50 bg-sage-400/25 text-sage-600" : w.state === "missed" ? "border-red-200 bg-red-100 text-red-800" : w.state === "makeup" ? "border-yellow-200 bg-yellow-100 text-yellow-900" : "border-ink/10 bg-white text-ink/60"}`;
          return w.future
            ? <span key={w.k} className={`${cls} opacity-40`} aria-disabled>{w.label}</span>
            : <Link key={w.k} href={`/programme/today?lang=${data.lang}&date=${w.k}`} className={cls} aria-label={w.k}>{w.label}</Link>;
        })}
      </div>

      <div role="tablist" className="flex gap-2 mb-4">
        {(["BM", "BI"] as const).map((l) => (
          <Link key={l} role="tab" aria-selected={data.lang === l} href={`/programme/today?lang=${l}&date=${data.day}`}
            className={data.lang === l ? "btn-primary text-sm" : "btn-secondary text-sm"}>{l}</Link>
        ))}
      </div>

      {!data.card ? (
        <div className="card">{data.ended ? endedMessage : data.examWeek ? T("这一周是考试周，不安排新内容，好好考试。", "This is an exam week, so there is no new content. Focus on the exam.") : wk > 0 ? T("这一周这个语言的内容还在准备，今天先休息。", "This week's content in this language is not ready yet, so rest today.") : T("学校放假，这一天不安排新任务。", "School is on holiday, so there is no task today.")}</div>
      ) : (
        <>
          <div className="mb-4">
            <DayCard day={data.day} lang={data.lang} ilang={data.ilang} card={data.card} submitted={data.submitted}
              submissionId={data.submissionId} feedback={data.feedback} aiStatus={data.aiStatus} answerText={data.answerText} marks={data.marks} />
          </div>

          <div className="card">
            <p className="font-medium mb-2">同学讨论</p>
            {!submitted ? (
              <p className="text-sm text-ink/60">先交上你自己的答案，才看得到同学的。</p>
            ) : (
              <>
                <ul className="space-y-2 mb-3">
                  {data.comments.length === 0 && <li className="text-sm text-ink/60">还没有留言，你来当第一个。</li>}
                  {data.comments.map((c) => (
                    <li key={c.id} className={`rounded-lg p-3 text-sm ${c.mine ? "bg-clay-400/15" : "bg-ink/5"}`}>
                      <span className="font-medium">{c.mine ? "我" : c.nickname}</span>：{c.body}
                      {c.waiting && <span className="block text-xs text-ink/60 mt-1">AI 没把握，等 Gary 来看，别的同学暂时看不到。</span>}
                      {!c.mine && <ReportBox kind="comment" target={c.id} label="举报" />}
                    </li>
                  ))}
                </ul>
                <form action={commentForm} onSubmit={() => setTimeout(() => setText(""), 0)} className="space-y-2">
                  <input type="hidden" name="day" value={data.day} /><input type="hidden" name="lang" value={data.lang} />
                  <textarea name="body" value={text} onChange={(e) => setText(e.target.value)} rows={2} aria-label="写留言" placeholder="写下你今天怎么做的，或问同学一个问题"
                    className="w-full rounded-lg border border-ink/20 bg-white p-2 text-sm" />
                  {com.error && <p role="alert" className="text-sm text-red-700">{com.error}</p>}
                  <button disabled={commenting} className="btn-secondary text-sm">留言</button>
                </form>
                <p className="text-xs text-ink/50 mt-2">只用昵称，不留联系方式，不贴链接。AI 没把握的留言，会等 Gary 来看。</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
