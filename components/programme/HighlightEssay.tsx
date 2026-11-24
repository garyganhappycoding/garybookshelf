"use client";
import { useState } from "react";

// The student picks a colour, then taps the words to highlight. Tapping a highlighted word again with the same colour clears it.
// Blue = a word from this week's list. Red = a word or phrase the student thinks is good.
export default function HighlightEssay({ paragraphs, lang, name, initial, readOnly }: { paragraphs: string[]; lang: "en" | "zh"; name?: string; initial?: { k: string; c: 1 | 2 }[]; readOnly?: boolean }) {
  const [colour, setColour] = useState<1 | 2>(1);
  const [marks, setMarks] = useState<Record<string, 1 | 2>>(() => Object.fromEntries((initial ?? []).map((m) => [m.k, m.c])));
  const tap = (k: string) => readOnly ? undefined : setMarks((m) => {
    const n = { ...m };
    if (n[k] === colour) delete n[k]; else n[k] = colour;
    return n;
  });
  const cls = { 1: "bg-blue-200", 2: "bg-red-200" } as const;
  return (
    <div>
      {name && <input type="hidden" name={name} value={JSON.stringify(Object.entries(marks).map(([k, c]) => {
        const [p, j] = k.split("-").map(Number);
        return { k, w: paragraphs[p]?.split(" ")[j] ?? "", c };
      }))} />}
      {!readOnly && <div className="flex flex-wrap gap-2 mb-3">
        <button type="button" onClick={() => setColour(1)} className={`rounded-full px-3 py-1 text-xs border ${colour === 1 ? "bg-blue-200 border-blue-500 font-medium" : "border-ink/20"}`}>
          {lang === "en" ? "Blue: words from this week's list" : "蓝色：本周词表里的词"}
        </button>
        <button type="button" onClick={() => setColour(2)} className={`rounded-full px-3 py-1 text-xs border ${colour === 2 ? "bg-red-200 border-red-500 font-medium" : "border-ink/20"}`}>
          {lang === "en" ? "Red: words you think are good" : "红色：你觉得好的词"}
        </button>
        <button type="button" onClick={() => setMarks({})} className="text-xs text-ink/50 underline">{lang === "en" ? "Clear all" : "全部清除"}</button>
      </div>}
      <div className="space-y-2 leading-relaxed select-none">
        {paragraphs.map((p, i) => (
          <p key={i}>
            {p.split(" ").map((w, j) => {
              const k = `${i}-${j}`;
              return <span key={k}><span onClick={() => tap(k)} className={`${readOnly ? "" : "cursor-pointer"} rounded px-0.5 ${marks[k] ? cls[marks[k]] : "hover:bg-ink/5"}`}>{w}</span>{" "}</span>;
            })}
          </p>
        ))}
      </div>
    </div>
  );
}
