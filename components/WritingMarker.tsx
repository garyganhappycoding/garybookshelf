"use client";

import { useState } from "react";
import WritingReport, { type ReportData } from "@/components/WritingReport";
import { GENRE_LABEL, PART_INFO, countWords, type Genre, type WritingPart, type WritingResponse } from "@/lib/writing/mark";

export default function WritingMarker({ initialAttemptsLeft, initialPackLeft, packHref, isAdmin = false }: { initialAttemptsLeft: number; initialPackLeft: number; packHref: string; isAdmin?: boolean }) {
  const [asFree, setAsFree] = useState(false); // admin only: see the free student's report
  const [part, setPart] = useState<WritingPart>(3);
  const [genre, setGenre] = useState<Genre>("story");
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(initialAttemptsLeft);
  const [packLeft, setPackLeft] = useState(initialPackLeft);

  const info = PART_INFO[part];
  const words = countWords(essay);
  const tooShort = words < info.minWords;
  const tooLong = words > info.maxWords;
  const canSend = !busy && question.trim().length >= 15 && !tooShort && !tooLong && attemptsLeft + packLeft > 0;

  const pickPart = (p: WritingPart) => {
    setPart(p);
    setGenre(PART_INFO[p].genres[0]);
  };

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/writing/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part, genre, question, essay, ...(isAdmin ? { asFree } : {}) }),
      });
      const json = await res.json().catch(() => ({}));
      if (typeof json.attemptsLeft === "number") setAttemptsLeft(json.attemptsLeft);
      if (typeof json.packLeft === "number") setPackLeft(json.packLeft);
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. You were not charged. Please try again.");
        return;
      }
      const r = json as WritingResponse;
      setData(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not reach the server. You were not charged. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (data) {
    return (
      <div>
        <WritingReport data={data} packHref={packHref} />
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <button className="btn-primary" onClick={() => { setData(null); setEssay(""); }}>
            Write another essay
          </button>
        </div>
        <p className="text-xs text-ink/50 text-center mt-3">
          {attemptsLeft > 0 ? `${attemptsLeft} free essay left today. ` : "Today's free essay is used. "}
          {packLeft > 0 ? `${packLeft} pack credit${packLeft > 1 ? "s" : ""} left (shared with speaking).` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-4">
        <div>
          <p className="text-sm font-medium mb-1.5">1. Which part?</p>
          <div className="flex flex-wrap gap-2">
            {([1, 2, 3] as WritingPart[]).map((p) => (
              <button key={p} type="button" onClick={() => pickPart(p)} className={`rounded-full px-4 py-1.5 text-sm border ${part === p ? "bg-clay-600 text-white border-clay-600" : "bg-white border-ink/15 hover:bg-cream-100"}`}>
                {PART_INFO[p].label}
              </button>
            ))}
          </div>
          {info.genres.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {info.genres.map((g) => (
                <button key={g} type="button" onClick={() => setGenre(g)} className={`rounded-full px-4 py-1.5 text-sm border ${genre === g ? "bg-sage-600 text-white border-sage-600" : "bg-white border-ink/15 hover:bg-cream-100"}`}>
                  {GENRE_LABEL[g]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="q" className="text-sm font-medium block mb-1.5">
            2. Paste the question
          </label>
          <textarea
            id="q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            maxLength={1500}
            placeholder="Paste the whole question, including the content points (for example: what Hani felt, how the meeting fixed the conflict)."
            className="w-full rounded-xl border border-ink/15 p-3 text-sm focus:outline-none focus:border-clay-400"
          />
          <p className="text-xs text-ink/50 mt-1">The marker needs this to check you answered every point.</p>
        </div>

        <div>
          <label htmlFor="e" className="text-sm font-medium block mb-1.5">
            3. Type or paste your essay
          </label>
          <textarea
            id="e"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            rows={14}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Write or paste your essay here."
            className="w-full rounded-xl border border-ink/15 p-3 text-[15px] leading-7 focus:outline-none focus:border-clay-400"
          />
          <p className={`text-xs mt-1 ${tooShort || tooLong ? "text-clay-700" : "text-sage-600"}`}>
            {words} words · asked: {info.words}
            {tooShort && words > 0 ? " · a little more to go before it can be marked" : ""}
            {tooLong ? ` · too long for this part (max ${info.maxWords})` : ""}
          </p>
        </div>

        <details className="rounded-xl bg-cream-50 border border-ink/10 p-3 text-sm">
          <summary className="cursor-pointer font-medium">Wrote it on paper? Turn your photo into text for free</summary>
          <div className="mt-2 space-y-1.5 text-ink/80">
            <p>
              <span className="font-medium">iPhone:</span> open the photo in Photos, press and hold on your writing until the words are selected, then tap <em>Copy</em>.
            </p>
            <p>
              <span className="font-medium">Android:</span> open the photo in Google Photos, tap <em>Lens</em>, choose <em>Text</em>, then <em>Copy text</em>.
            </p>
            <p>Paste it above and read it through. Phones sometimes mis-read handwriting, so fix those words to match what you really wrote.</p>
            <p className="text-clay-700">
              Do not let a keyboard or app auto-correct your English. The marker needs your real mistakes to show you how to fix them.
            </p>
          </div>
        </details>

        {isAdmin && (
          <label className="flex items-center gap-2 text-sm rounded-xl bg-cream-100 p-3">
            <input type="checkbox" checked={asFree} onChange={(e) => setAsFree(e.target.checked)} />
            Admin: test as a free student (shows the free report). Students cannot see this page yet.
          </label>
        )}

        {error && <p className="text-sm text-clay-700 rounded-xl bg-clay-400/15 p-3">{error}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary disabled:opacity-50" disabled={!canSend} onClick={submit}>
            {busy ? "Marking… (about 20 seconds)" : "Mark my essay"}
          </button>
          <p className="text-xs text-ink/60">
            {attemptsLeft > 0 ? "1 free essay today" : packLeft > 0 ? `Uses 1 of your ${packLeft} pack credits` : "No free essay left today"}
          </p>
        </div>
        {attemptsLeft + packLeft <= 0 && (
          <p className="text-sm text-ink/70">
            You have used today&apos;s free essay. A <a className="underline" href={packHref}>Speaking pack</a> gives you more (credits work for speaking and writing).
          </p>
        )}
      </div>
    </div>
  );
}
