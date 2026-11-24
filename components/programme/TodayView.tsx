"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { addDays, buildCalendar, cn, key, parse, WEEKDAY_ZH } from "@/lib/programme/calendar";
import { commentAction, reportAction, type Result } from "@/app/programme/today/actions";
import DayCard, { type CardData } from "./DayCard";

export type TodayData = {
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
      <p className="text-sm text-ink/60">{cn(d)} 星期{WEEKDAY_ZH[d.getDay()]}{data.demo ? "（示范日期）" : ""}</p>
      {data.demo && (
        <div className="flex items-center gap-2 my-2">
          <Link aria-label="前一天" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-white text-base hover:bg-ink/5" href={`/programme/today?lang=${data.lang}&date=${key(addDays(d, -1))}`}>←</Link>
          <Link aria-label="后一天" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-white text-base hover:bg-ink/5" href={`/programme/today?lang=${data.lang}&date=${key(addDays(d, 1))}`}>→</Link>
        </div>
      )}
      <h1 className="text-2xl font-medium mb-1">今天</h1>

      <div role="tablist" className="flex gap-2 mb-4">
        {(["BM", "BI"] as const).map((l) => (
          <Link key={l} role="tab" aria-selected={data.lang === l} href={`/programme/today?lang=${l}${data.demo ? `&date=${data.day}` : ""}`}
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
