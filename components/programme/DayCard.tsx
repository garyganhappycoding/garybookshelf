"use client";
import { useActionState, useState, useTransition } from "react";
import type { Block, Response } from "@/lib/programme/week-content";
import { answerAction, reportAction, setInstructionLangAction, type Result } from "@/app/programme/today/actions";
import BlockView from "./BlockView";
import HighlightEssay from "./HighlightEssay";

export type CardData = {
  label: { zh: string; en: string }; minutes: number; blocks: Block[]; response: Response;
  week: { n: number; theme: { zh: string; en: string }; essay: string };
};
type Props = {
  day: string; lang: "BM" | "BI"; ilang: "en" | "zh"; card: CardData;
  submitted: boolean; submissionId: string | null; feedback: string | null; aiStatus: string | null; answerText: string | null;
};
const init: Result = {};

function Report({ id, ilang }: { id: string; ilang: "en" | "zh" }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reportAction, init);
  if (state.ok) return <p className="text-xs text-ink/60">{ilang === "en" ? "Gary has been told." : "已经告诉 Gary 了。"}</p>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-xs text-ink/50 underline">{ilang === "en" ? "Feedback not good? Tell Gary" : "觉得 AI 的反馈不好？告诉 Gary"}</button>;
  return (
    <form action={action} className="mt-2 space-y-2">
      <input type="hidden" name="kind" value="ai_feedback" /><input type="hidden" name="target" value={id} />
      <textarea name="note" rows={2} aria-label="note" className="w-full rounded-lg border border-ink/20 bg-white p-2 text-sm" />
      <button disabled={pending} className="btn-secondary text-xs">{ilang === "en" ? "Send to Gary" : "送出给 Gary"}</button>
    </form>
  );
}

export default function DayCard({ day, lang, ilang, card, submitted: wasSubmitted, submissionId, feedback, aiStatus, answerText }: Props) {
  const [res, action, pending] = useActionState(answerAction, init);
  const [switching, startSwitch] = useTransition();
  const submitted = wasSubmitted || !!res.ok;
  const T = (zh: string, en: string) => (ilang === "zh" ? zh : en);
  const r = card.response;
  const sendable = r.kind !== "none" && !submitted;

  const inputs = (b: Block) => {
    if (submitted) return null;
    if (b.type === "quiz") return (
      <ol className="space-y-2">
        {b.rows.map((row, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-6 text-ink/50">{i + 1}</span><span className="w-56 font-medium">{row.zh}</span>
            <input name={`q${i}`} autoComplete="off" aria-label={`quiz ${i + 1}`} className="flex-1 min-w-[10rem] rounded-lg border border-ink/20 bg-white px-3 py-1.5" />
          </li>
        ))}
      </ol>
    );
    if (b.type === "text" && b.interactive) return <HighlightEssay paragraphs={b.paragraphs} lang={ilang} name="hl" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink/60">{T("说明的语言", "Instructions in")}:</span>
        {(["zh", "en"] as const).map((l) => (
          <button key={l} type="button" disabled={switching} onClick={() => startSwitch(async () => { await setInstructionLangAction(l); })}
            className={ilang === l ? "btn-primary text-xs" : "btn-secondary text-xs"}>{l === "zh" ? "中文" : "English"}</button>
        ))}
      </div>

      <p className="text-xs text-ink/60">
        {lang} · {T(`第 ${card.week.n} 周`, `Week ${card.week.n}`)} · {card.week.theme[ilang]} · {card.label[ilang]}{card.minutes ? ` · ${T("预计", "about")} ${card.minutes} ${T("分钟", "min")}` : ""}
      </p>

      {submitted && (
        <div className="card">
          <p className="font-medium mb-2">{T("我的答案", "My answer")}</p>
          {answerText && <p className="whitespace-pre-wrap text-sm mb-3">{answerText}</p>}
          {feedback ? (
            <div className="rounded-lg bg-sage-400/20 p-3 text-sm whitespace-pre-wrap"><p className="font-medium mb-1">{T("反馈", "Feedback")}</p>{feedback}</div>
          ) : aiStatus === "waiting_gary" ? (
            <p className="rounded-lg bg-yellow-100 p-3 text-sm">{T("AI 对这份答案没有把握，Gary 会亲自来看，请稍等。", "The AI is not sure about this answer. Gary will look at it himself.")}</p>
          ) : aiStatus === "failed" ? (
            <p className="rounded-lg bg-ink/5 p-3 text-sm">{T("AI 现在忙，没能给反馈。你的答案已经保存，也算完成了今天。", "The AI is busy and could not give feedback. Your answer is saved and today counts as done.")}</p>
          ) : (
            <p className="text-sm text-ink/60">{T("答案已交。重新整理页面就能看到反馈。", "Handed in. Reload the page to see the feedback.")}</p>
          )}
          {submissionId && <div className="mt-2"><Report id={submissionId} ilang={ilang} /></div>}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="day" value={day} /><input type="hidden" name="lang" value={lang} />
        {card.blocks.map((b) => (
          <section key={b.id} className="card">
            <p className="font-medium mb-2">{b.title[ilang]}</p>
            {b.type === "quiz" && !submitted ? null : b.type === "text" && b.interactive && !submitted ? null : <BlockView b={b} lang={ilang} />}
            {inputs(b)}
            {r.kind === "sentences" && b.type === "vocab" && !submitted && (
              <div className="mt-4 space-y-2">
                <p className="font-medium text-sm">{T("你的句子", "Your sentences")}</p>
                {r.words.map((w, i) => (
                  <label key={i} className="block text-sm">
                    <span className="text-ink/60">{i + 1}. {w.word}</span>
                    <input name={`s${i}`} autoComplete="off" className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-1.5" />
                  </label>
                ))}
              </div>
            )}
          </section>
        ))}

        {r.kind === "text" && !submitted && (
          <section className="card">
            <p className="font-medium mb-2">{r.optional ? T("我的作文（选做）", "My essay (optional)") : T("我的答案", "My answer")}</p>
            <textarea name="answer" rows={r.optional ? 12 : 6} aria-label="answer" className="w-full rounded-lg border border-ink/20 bg-white p-3 text-sm" />
          </section>
        )}

        {sendable && (
          <div>
            <button disabled={pending} className="btn-primary text-sm disabled:opacity-50">{pending ? T("交上去中，AI 在看…", "Submitting, the AI is reading…") : T("交上去", "Hand in")}</button>
            {res.error && <p role="alert" className="text-sm text-red-700 mt-2">{res.error}</p>}
          </div>
        )}
        {r.kind === "none" && <p className="text-sm text-ink/60">{T("今天没有要交的东西。", "Nothing to hand in today.")}</p>}
      </form>
    </div>
  );
}
