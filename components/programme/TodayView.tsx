"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { buildCalendar, cn, levelOf, parse, themeOf, WEEKDAY_ZH } from "@/lib/programme/calendar";
import { taskFor } from "@/lib/programme/content";
import { answerAction, commentAction, reportAction, type Result } from "@/app/programme/today/actions";
import { useProgramme } from "./useProgramme";

export type TodayData = {
  day: string; lang: "BM" | "BI"; state: string; submitted: boolean; submissionId: string | null;
  feedback: string | null; aiStatus: string | null;
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
  const { stateId } = useProgramme();
  const state = data.state || stateId;
  const cal = buildCalendar(state);
  const d = parse(data.day), wk = cal.weekOf(d);
  const task = taskFor(cal, data.day, data.lang);
  const [ans, answerForm, answering] = useActionState(answerAction, init);
  const [com, commentForm, commenting] = useActionState(commentAction, init);
  const [text, setText] = useState("");
  const submitted = data.submitted || ans.ok;

  return (
    <div>
      <p className="text-sm text-ink/60">{cn(d)} 星期{WEEKDAY_ZH[d.getDay()]}（示范日期）</p>
      <h1 className="text-2xl font-medium mb-1">今天</h1>
      {wk > 0 && <p className="text-sm text-ink/60 mb-4">第 {wk} 周 · {themeOf(wk)} · {levelOf(wk)}</p>}

      <div role="tablist" className="flex gap-2 mb-4">
        {(["BM", "BI"] as const).map((l) => (
          <Link key={l} role="tab" aria-selected={data.lang === l} href={`/programme/today?lang=${l}&state=${state}`}
            className={data.lang === l ? "btn-primary text-sm" : "btn-secondary text-sm"}>{l}</Link>
        ))}
      </div>

      {!task ? (
        <div className="card">学校放假，这一天不安排新任务。</div>
      ) : (
        <>
          <div className="card mb-4">
            <p className="text-xs text-ink/60 mb-1">{data.lang} · 预计 {task.minutes} 分钟</p>
            <p>{task.title}：{task.instructions}</p>
            <p className="text-sm text-ink/60 mt-2">（问题、答案和解释的内容还在和 Gary 一起写，这里先用占位。）</p>
          </div>

          <div className="card mb-4">
            <p className="font-medium mb-2">我的答案</p>
            {submitted ? (
              <div className="space-y-3">
                {data.feedback ? (
                  <div className="rounded-lg bg-sage-400/20 p-3 text-sm"><p className="font-medium mb-1">AI 反馈</p><p>{data.feedback}</p></div>
                ) : data.aiStatus === "waiting_gary" || ans.status === "waiting_gary" ? (
                  <p className="rounded-lg bg-yellow-100 p-3 text-sm">AI 对这份答案没有把握，Gary 会亲自来看，请稍等。</p>
                ) : data.aiStatus === "failed" || ans.status === "failed" ? (
                  <p className="rounded-lg bg-ink/5 p-3 text-sm">AI 现在忙，没能给反馈。你的答案已经保存，也算完成了今天。</p>
                ) : (
                  <p className="text-sm text-ink/60">答案已交。重新整理页面就能看到反馈。</p>
                )}
                {data.submissionId && <ReportBox kind="ai_feedback" target={data.submissionId} label="觉得 AI 的反馈不好？告诉 Gary" />}
              </div>
            ) : (
              <form action={answerForm} className="space-y-3">
                <input type="hidden" name="day" value={data.day} /><input type="hidden" name="lang" value={data.lang} /><input type="hidden" name="state" value={state} />
                <textarea name="answer" rows={5} required aria-label="我的答案" placeholder="写在这里，交上去之后才看得到同学的"
                  className="w-full rounded-lg border border-ink/20 bg-white p-3 text-sm" />
                <button disabled={answering} className="btn-primary text-sm disabled:opacity-50">{answering ? "交上去中，AI 在看…" : "交上去，然后看同学的"}</button>
                {ans.error && <p role="alert" className="text-sm text-red-700">{ans.error}</p>}
              </form>
            )}
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
                  <input type="hidden" name="day" value={data.day} /><input type="hidden" name="lang" value={data.lang} /><input type="hidden" name="state" value={state} />
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
