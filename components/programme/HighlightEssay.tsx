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
      {!readOnly && <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center gap-1.5 bg-white/95 px-1 py-1.5 backdrop-blur">
        <button type="button" onClick={() => setColour(1)} className={`rounded-full px-3 py-1.5 text-xs min-h-9 border whitespace-nowrap ${colour === 1 ? "bg-blue-200 border-blue-500 font-medium" : "border-ink/20"}`}>
          {lang === "en" ? "Blue: this week's words" : "蓝：本周词表"}
        </button>
        <button type="button" onClick={() => setColour(2)} className={`rounded-full px-3 py-1.5 text-xs min-h-9 border whitespace-nowrap ${colour === 2 ? "bg-red-200 border-red-500 font-medium" : "border-ink/20"}`}>
          {lang === "en" ? "Red: good words" : "红：好词"}
        </button>
        <button type="button" onClick={() => setMarks({})} className="ml-auto shrink-0 px-1 text-xs text-ink/50 underline">{lang === "en" ? "Clear" : "清除"}</button>
      </div>}
      <div className="space-y-3 leading-7 select-none">
        {paragraphs.map((p, i) => (
          <p key={i}>
            {p.split(" ").map((w, j) => {
              const k = `${i}-${j}`;
              return <span key={k}><span onClick={() => tap(k)} className={`${readOnly ? "" : "cursor-pointer"} rounded px-px ${marks[k] ? cls[marks[k]] : "hover:bg-ink/5"}`}>{w}</span>{" "}</span>;
            })}
          </p>
        ))}
      </div>
    </div>
  );
}
