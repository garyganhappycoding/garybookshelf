"use client";
import { useState } from "react";

// Flash cards: the Chinese meaning is on the front, tap the card to see the word, then say whether you remembered it.
// The result is sent with the form as "qk" (one 1 or 0 per card).
export default function FlashQuiz({ rows, lang, name }: { rows: { zh: string; answer: string }[]; lang: "en" | "zh"; name: string }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [res, setRes] = useState<(0 | 1)[]>([]);
  const T = (zh: string, en: string) => (lang === "zh" ? zh : en);
  const done = res.length >= rows.length;
  const known = res.filter((x) => x === 1).length;
  const answer = (v: 0 | 1) => { setRes((r) => [...r, v]); setFlipped(false); setI((n) => n + 1); };
  const restart = () => { setRes([]); setI(0); setFlipped(false); };

  return (
    <div>
      <input type="hidden" name={name} value={res.join("")} />
      {done ? (
        <div className="rounded-2xl border border-ink/10 bg-cream/60 p-8 text-center">
          <p className="text-3xl font-semibold tabular-nums">{known} / {rows.length}</p>
          <p className="text-sm text-ink/70 mt-1">{T("记得的词", "words you remembered")}</p>
          <button type="button" onClick={restart} className="btn-secondary text-sm mt-4">{T("再来一次", "Go again")}</button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-ink/60 mb-2">{i + 1} / {rows.length}</p>
          <button type="button" onClick={() => setFlipped((f) => !f)} aria-label={T("翻面", "Flip the card")}
            className={`w-full min-h-[11rem] rounded-2xl border p-6 text-center transition ${flipped ? "bg-sage-400/15 border-sage-400/40" : "bg-white border-ink/15 hover:shadow-md"}`}>
            <span className="block text-xs text-ink/50 mb-2">{flipped ? T("英文", "The word") : T("中文，点一下翻面", "Chinese: tap to flip")}</span>
            <span className={`block ${flipped ? "text-xl font-medium" : "text-2xl"}`}>{flipped ? rows[i].answer : rows[i].zh}</span>
          </button>
          <div className="flex gap-2 mt-3">
            <button type="button" disabled={!flipped} onClick={() => answer(0)} className="btn-secondary text-sm flex-1 disabled:opacity-40">{T("还没记住", "Not yet")}</button>
            <button type="button" disabled={!flipped} onClick={() => answer(1)} className="btn-primary text-sm flex-1 disabled:opacity-40">{T("记得", "I knew it")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
