"use client";

import { useState } from "react";
import Link from "next/link";
import { BAND_MAX, CRITERIA, CRITERION_LABEL, GENRE_LABEL, PART_INFO, type Genre, type WritingPart, type WritingResult } from "@/lib/writing/mark";

export type ReportData = {
  total: number;
  tier: "free" | "paid";
  part: WritingPart;
  genre: Genre;
  question: string;
  essay: string;
  wordCount: number;
  result: WritingResult;
};

// Free = the marks and why each mark was given. Paid = also how to reach the next mark, the marked essay, the biggest gain.
// (The locked parts are not even stored for free reports, so this page only hides nothing that exists.)
export default function WritingReport({ data, packHref = "/shop" }: { data: ReportData; packHref?: string }) {
  const { result, tier, essay } = data;
  const paid = tier === "paid";
  const max = BAND_MAX * 4;
  const [why, setWhy] = useState<string | null>(null);

  // cut the essay into plain and highlighted pieces
  const pieces: { text: string; h?: NonNullable<WritingResult["highlights"]>[number] }[] = [];
  let at = 0;
  for (const h of result.highlights ?? []) {
    if (h.start < at) continue;
    if (h.start > at) pieces.push({ text: essay.slice(at, h.start) });
    pieces.push({ text: essay.slice(h.start, h.end), h });
    at = h.end;
  }
  if (at < essay.length) pieces.push({ text: essay.slice(at) });
  const earned = (result.highlights ?? []).filter((h) => h.kind === "earned").length;
  const lost = (result.highlights ?? []).filter((h) => h.kind === "lost").length;

  return (
    <div className="space-y-4">
      <div className="card !bg-cream-50">
        <p className="text-xs text-ink/60">
          {PART_INFO[data.part].label} · {GENRE_LABEL[data.genre]} · {data.wordCount} words (asked: {PART_INFO[data.part].words})
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="font-hand text-5xl text-clay-700">{data.total}</p>
          <p className="text-ink/60">/ {max}</p>
          <span className="ml-2 text-xs rounded-full bg-sage-400/25 px-2 py-0.5 text-sage-600 font-medium">estimated mark</span>
        </div>
        <p className="text-sm text-ink/70 mt-2">{result.summary}</p>
        <p className="text-sm text-ink/70 mt-1">
          <span className="font-medium">Keep doing:</span> {result.strength}
        </p>
        <p className="text-xs text-ink/50 mt-3">
          This is an estimate from the examiners&apos; answer-quality standards, not an official mark. We are still tuning it with real essays.
        </p>
      </div>

      <section className="grid sm:grid-cols-2 gap-3">
        {CRITERIA.map((c) => {
          const x = result.criteria[c];
          return (
            <div key={c} className="card">
              <div className="flex justify-between items-baseline">
                <p className="font-medium">{CRITERION_LABEL[c]}</p>
                <p className="font-medium text-clay-700">
                  {x.band} / {BAND_MAX}
                </p>
              </div>
              <div className="h-2 bg-ink/10 rounded-full my-2">
                <div className="h-2 bg-clay-500 rounded-full" style={{ width: `${(x.band / BAND_MAX) * 100}%` }} />
              </div>
              <p className="text-sm text-ink/80">
                <span className="font-medium">Why {x.band}: </span>
                {x.why}
              </p>
              <p className="text-sm text-ink/70 mt-1.5">
                {x.band >= BAND_MAX && <span className="font-medium">Top mark: </span>}
                {x.why_not_next}
              </p>
              {paid && x.next_band ? (
                <p className="text-sm text-clay-700 mt-1.5">⬆ {x.next_band}</p>
              ) : !paid ? (
                <p className="text-xs text-ink/40 mt-2">🔒 How to reach {Math.min(BAND_MAX, x.band + 1)}: essay pack</p>
              ) : null}
            </div>
          );
        })}
      </section>

      <section className="card">
        <p className="font-medium mb-0.5">Did you answer every point?</p>
        <p className="text-xs text-ink/50 mb-2">✓ answered as asked · ◐ answered, but not quite as asked · ✗ not answered</p>
        <ul className="space-y-1.5">
          {result.points.map((p, i) => {
            // status comes from the requirement check; older essays only have covered true/false
            const mark = p.status ? (p.status === "full" ? "✓" : p.status === "minor" || p.status === "wrong_kind" ? "◐" : "✗") : p.covered ? "✓" : "✗";
            const good = p.status ? p.status === "full" : p.covered;
            return (
              <li key={i} className="text-sm flex gap-2">
                <span className={good ? "text-sage-600" : "text-clay-600"}>{mark}</span>
                <span>
                  <span className="font-medium">{p.point}.</span> <span className="text-ink/70">{p.note}</span>
                  {p.student_sentence && p.status && p.status !== "full" && <span className="block text-xs text-ink/50 mt-0.5">You wrote: &ldquo;{p.student_sentence}&rdquo;</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {paid ? (
        <section className="card">
          <div className="flex flex-wrap justify-between gap-2 mb-3">
            <p className="font-medium">Your essay, marked</p>
            <p className="text-xs">
              <span className="rounded bg-sage-400/30 px-1.5 py-0.5">{earned} earned marks</span> <span className="rounded bg-clay-400/40 px-1.5 py-0.5">{lost} lost marks</span>
            </p>
          </div>
          <p className="whitespace-pre-wrap leading-8 text-[15px]">
            {pieces.map((p, i) =>
              p.h ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => setWhy(`${p.h!.kind === "earned" ? "Earned marks" : "Lost marks"} · ${CRITERION_LABEL[p.h!.criterion]}: ${p.h!.reason}`)}
                  className={`rounded px-0.5 text-left ${p.h.kind === "earned" ? "bg-sage-400/30" : "bg-clay-400/40 underline decoration-clay-600 decoration-wavy underline-offset-4"}`}
                >
                  {p.text}
                </button>
              ) : (
                <span key={i}>{p.text}</span>
              )
            )}
          </p>
          <p className="text-sm text-ink/70 mt-3 min-h-[1.5rem]">{why ?? "Tap a highlighted word to see why it earned or lost marks."}</p>
          {result.biggest_gain && (
            <p className="text-sm mt-2 rounded-xl bg-cream-100 p-3">
              <span className="font-medium">Biggest gain: </span>
              {result.biggest_gain}
            </p>
          )}
        </section>
      ) : (
        <section className="card">
          <p className="font-medium mb-2">Your essay</p>
          <p className="whitespace-pre-wrap leading-7 text-[15px] text-ink/80">{essay}</p>
        </section>
      )}

      {!paid && (
        <section className="card text-center">
          <p className="font-medium mb-1">🔒 Want to know exactly how to get the next mark?</p>
          <p className="text-sm text-ink/70 mb-3">An essay pack unlocks, for every essay: how to reach the next mark for each criterion, your essay with the words that earned and lost marks highlighted, and the single biggest gain. Essay credits last 30 days.</p>
          <Link prefetch={false} href={packHref} className="btn-primary">
            See the packs
          </Link>
        </section>
      )}
      {paid && <p className="text-xs text-ink/50 text-center">Coming next: chat with the marker about your essay, and a progress chart for speaking and writing.</p>}
    </div>
  );
}
