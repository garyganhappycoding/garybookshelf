"use client";
import { useActionState, useState, useTransition } from "react";
import type { Block, Response } from "@/lib/programme/week-content";
import { answerAction, reportAction, setInstructionLangAction, type Result } from "@/app/programme/today/actions";
import BlockView from "./BlockView";
import FlashQuiz from "./FlashQuiz";
import HighlightEssay from "./HighlightEssay";

export type CardData = {
  label: { zh: string; en: string }; minutes: number; blocks: Block[]; response: Response;
  week: { n: number; theme: { zh: string; en: string }; essay: string };
};
type Props = {
  day: string; lang: "BM" | "BI"; ilang: "en" | "zh"; card: CardData;
  submitted: boolean; submissionId: string | null; feedback: string | null; aiStatus: string | null; answerText: string | null;
  marks: { k: string; w: string; c: 1 | 2 }[] | null;
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
      <textarea name="note" rows={2} aria-label="note" className="w-full rounded-lg border border-ink/20 bg-white p-2 text-base md:text-sm" />
      <button disabled={pending} className="btn-secondary text-xs">{ilang === "en" ? "Send to Gary" : "送出给 Gary"}</button>
    </form>
  );
}

/** A reading block. On a phone it folds into an accordion (closed by default); on a laptop or iPad it is an ordinary card. */
function Panel({ b, ilang, fold = false }: { b: Block; ilang: "en" | "zh"; fold?: boolean }) {
  const card = <section className={`card ${fold ? "hidden md:block" : ""}`}><p className="font-medium mb-2">{b.title[ilang]}</p><BlockView b={b} lang={ilang} /></section>;
  if (!fold) return card;
  return (
    <>
      <details className="md:hidden rounded-2xl border border-ink/10 bg-white">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 py-3 font-medium">{b.title[ilang]}<span aria-hidden className="text-ink/40">＋</span></summary>
        <div className="px-4 pb-4"><BlockView b={b} lang={ilang} /></div>
      </details>
      {card}
    </>
  );
}

export default function DayCard({ day, lang, ilang, card, submitted: wasSubmitted, submissionId, feedback, aiStatus, answerText, marks }: Props) {
  const [res, action, pending] = useActionState(answerAction, init);
  const [switching, startSwitch] = useTransition();
  const [step, setStep] = useState(0);            // phone only: day 1 is three steps
  const [rt, setRt] = useState<"mine" | "fb" | "model">("mine"); // phone only: tabs after hand-in
  const submitted = wasSubmitted || !!res.ok;
  const T = (zh: string, en: string) => (ilang === "zh" ? zh : en);
  const r = card.response;
  const sendable = r.kind !== "none" && !submitted;

  const steps = card.blocks.find((b) => b.id === "steps");
  const vocab = card.blocks.find((b) => b.type === "vocab");
  const quiz = card.blocks.find((b) => b.type === "quiz");
  const essay = card.blocks.find((b) => b.type === "text" && b.interactive);
  const checks = card.blocks.find((b) => b.type === "checks");
  const rest = card.blocks.filter((b) => b !== steps && b !== vocab && b !== quiz && b !== essay && b !== checks);
  const modelBlocks = rest.filter((b) => b.reveal), readBlocks = rest.filter((b) => !b.reveal);
  const show = (on: boolean) => `${on ? "" : "hidden"} md:block`; // visible on phone only when `on`, always on laptop
  const day1 = r.kind === "sentences" && !submitted;
  const taSize = "text-base md:text-sm"; // 16 px on a phone, so the browser does not zoom in
  const answerLabel = r.kind === "text" && r.optional ? T("我的作文（选做）", "My essay (optional)") : T("我的答案", "My answer");

  const mineBox = (
    <section className={`card ${submitted ? show(rt === "mine") : ""}`}>
      <p className="font-medium mb-2">{T("我的答案", "My answer")}</p>
      {answerText && r.kind !== "highlight" && <p className="whitespace-pre-wrap text-sm">{answerText}</p>}
      {r.kind === "highlight" && essay && essay.type === "text" && <HighlightEssay paragraphs={essay.paragraphs} lang={ilang} initial={marks ?? []} readOnly />}
    </section>
  );
  const fbBox = (
    <section className={`card ${show(rt === "fb")}`}>
      {feedback ? (
        <div className="rounded-lg bg-sage-400/20 p-3 text-sm whitespace-pre-wrap"><p className="font-medium mb-1">{T("反馈", "Feedback")}</p>{feedback}</div>
      ) : aiStatus === "waiting_gary" ? (
        <p className="rounded-lg bg-yellow-100 p-3 text-sm">{T("AI 对这份答案没有把握，Gary 会亲自来看，请稍等。", "The AI is not sure about this answer. Gary will look at it himself.")}</p>
      ) : aiStatus === "failed" ? (
        <p className="rounded-lg bg-ink/5 p-3 text-sm">{T("AI 现在忙，没能给反馈。你的答案已经保存，也算完成了今天。", "The AI is busy and could not give feedback. Your answer is saved and today counts as done.")}</p>
      ) : r.kind === "highlight" ? (
        <p className="text-sm text-ink/60">{T("已保存。对照范文看看。", "Saved. Compare with the model.")}</p>
      ) : (
        <p className="text-sm text-ink/60">{T("答案已交。重新整理页面就能看到反馈。", "Handed in. Reload the page to see the feedback.")}</p>
      )}
      {submissionId && feedback && <div className="mt-2"><Report id={submissionId} ilang={ilang} /></div>}
    </section>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="hidden text-ink/60 sm:inline">{T("说明的语言", "Instructions in")}:</span>
        {(["zh", "en"] as const).map((l) => (
          <button key={l} type="button" disabled={switching} onClick={() => startSwitch(async () => { await setInstructionLangAction(l); })}
            className={`${ilang === l ? "btn-primary" : "btn-secondary"} text-xs min-h-10`}>{l === "zh" ? "中文" : "English"}</button>
        ))}
        <span className="text-xs text-ink/60">
          {lang} · {T(`第 ${card.week.n} 周`, `Week ${card.week.n}`)} · {card.week.theme[ilang]} · {card.label[ilang]}{card.minutes ? ` · ${T("预计", "about")} ${card.minutes} ${T("分钟", "min")}` : ""}
        </span>
      </div>

      {res.badge && (
        <a href="/programme/badges" className="block rounded-2xl border border-clay-400 bg-clay-400/15 p-4 text-center">
          <p className="text-2xl" aria-hidden>🏅</p>
          <p className="font-medium">{T("你拿到徽章：", "You won: ")}{(res.badges ?? [res.badge]).map((b) => (b.n ? `${b.title.replace("n", String(b.n))}` : b.title)).join("、")}</p>
          <p className="text-sm text-ink/70">{T("点这里看它背面 Gary 写给你的话", "Tap to read the note Gary wrote on its back")}</p>
        </a>
      )}
      {submitted && (
        <div className="md:hidden grid grid-cols-3 rounded-full border border-ink/10 bg-white p-1 text-sm" role="tablist">
          {([["mine", T("我的答案", "My answer")], ["fb", T("反馈", "Feedback")], ["model", T("范文", "Model")]] as const).map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={rt === k} onClick={() => setRt(k)} className={`min-h-11 rounded-full ${rt === k ? "bg-clay-600 font-semibold text-white" : "text-ink/60"}`}>{l}</button>
          ))}
        </div>
      )}
      {submitted && <>{mineBox}{fbBox}</>}

      <form action={action} className="space-y-4">
        <input type="hidden" name="day" value={day} /><input type="hidden" name="lang" value={lang} />
        {day1 && (
          <div className="md:hidden grid grid-cols-3 rounded-full border border-ink/10 bg-white p-1 text-sm" role="tablist">
            {[T("1 看词", "1 Words"), T("2 翻牌", "2 Cards"), T("3 造句", "3 Sentences")].map((l, i) => (
              <button key={i} type="button" role="tab" aria-selected={step === i} onClick={() => setStep(i)} className={`min-h-11 rounded-full ${step === i ? "bg-clay-600 font-semibold text-white" : "text-ink/60"}`}>{l}</button>
            ))}
          </div>
        )}
        {steps && <div className={submitted ? "hidden md:block" : ""}><Panel b={steps} ilang={ilang} /></div>}

        {vocab && <div className={day1 ? show(step === 0) : submitted ? "hidden md:block" : ""}><Panel b={vocab} ilang={ilang} /></div>}
        {r.kind === "sentences" && (
          <div className="grid gap-4 lg:grid-cols-2 items-start">
            {quiz && quiz.type === "quiz" && (
              <section className={`card ${day1 ? show(step === 1) : submitted ? "hidden md:block" : ""}`}>
                <p className="font-medium mb-3">{quiz.title[ilang]}</p>
                {submitted ? <BlockView b={quiz} lang={ilang} /> : <FlashQuiz rows={quiz.rows} lang={ilang} name="qk" />}
              </section>
            )}
            {!submitted && (
              <section className={`card space-y-2 ${show(step === 2)}`}>
                <p className="font-medium">{T("你的句子（每个词写一句）", "Your sentences (one for each word)")}</p>
                {r.words.map((w, i) => (
                  <label key={i} className="block text-sm">
                    <span className="text-ink/60">{i + 1}. {w.word}</span>
                    <input name={`s${i}`} autoComplete="off" className={`mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-2.5 md:py-1.5 ${taSize}`} />
                  </label>
                ))}
              </section>
            )}
          </div>
        )}

        {essay && essay.type === "text" && !submitted && (
          <section className="card"><p className="font-medium mb-3">{essay.title[ilang]}</p><HighlightEssay paragraphs={essay.paragraphs} lang={ilang} name="hl" /></section>
        )}

        {r.kind === "text" ? (
          <div className={`grid gap-4 items-start ${rest.length ? "lg:grid-cols-5" : ""}`}>
            {rest.length > 0 && (
              <div className="space-y-3 md:space-y-4 lg:col-span-3">
                <div className={submitted ? "hidden md:block space-y-4" : "space-y-3 md:space-y-4"}>{readBlocks.map((b) => <Panel key={b.id} b={b} ilang={ilang} fold />)}</div>
                <div className={`space-y-3 md:space-y-4 ${submitted ? show(rt === "model") : ""}`}>{modelBlocks.map((b) => <Panel key={b.id} b={b} ilang={ilang} />)}</div>
              </div>
            )}
            <div className={`space-y-4 ${rest.length ? "lg:col-span-2 lg:sticky lg:top-4" : ""}`}>
              {!submitted && (
                <section className="card">
                  <p className="font-medium mb-2">{answerLabel}</p>
                  <textarea name="answer" rows={r.kind === "text" && r.optional ? 14 : 9} aria-label="answer" className={`w-full rounded-lg border border-ink/20 bg-white p-3 ${taSize} min-h-[11rem]`} />
                </section>
              )}
              {checks && !submitted && <Panel b={checks} ilang={ilang} fold />}
            </div>
          </div>
        ) : (
          <>
            <div className={submitted ? show(rt === "model") : ""}>
              <div className="space-y-4">{rest.map((b) => <Panel key={b.id} b={b} ilang={ilang} />)}</div>
            </div>
            {checks && r.kind !== "highlight" && !submitted && <Panel b={checks} ilang={ilang} fold />}
          </>
        )}

        {sendable && (
          <>
            {/* The hand-in bar sits above the tab bar on a phone, where a thumb reaches it; on a laptop it is an ordinary button. */}
            <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-30 border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur md:static md:z-auto md:border-0 md:bg-transparent md:p-0">
              {res.error && <p role="alert" className="mb-2 text-sm text-red-700">{res.error}</p>}
              {day1 && step < 2 ? (
                <button type="button" onClick={() => { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-primary w-full min-h-12 md:hidden">
                  {step === 0 ? T("下一步：翻牌", "Next: flash cards") : T("下一步：造句", "Next: sentences")}
                </button>
              ) : null}
              <button disabled={pending} className={`btn-primary w-full min-h-12 disabled:opacity-50 md:w-auto md:min-h-0 ${day1 && step < 2 ? "hidden md:inline-block" : ""}`}>
                {pending ? T("交上去中，AI 在看…", "Submitting, the AI is reading…") : T("交上去", "Hand in")}
              </button>
            </div>
          </>
        )}
        {r.kind === "none" && <p className="text-sm text-ink/60">{T("今天没有要交的东西。", "Nothing to hand in today.")}</p>}
      </form>
    </div>
  );
}
