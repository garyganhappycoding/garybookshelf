"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cards, themes, getTheme, type Card, type Theme } from "@/lib/speaking/cards";
import { BAND_MAX, criteriaInfo, type AnalysisResponse, type CriterionKey } from "@/lib/speaking/analyze";

const PREP_SECONDS = 30;
const SPEAK_SECONDS = 120;

type Stage = "themes" | "card" | "prep" | "recording" | "analyzing" | "result";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");

function bandLabel(total: number) {
  const pct = total / (4 * BAND_MAX);
  if (pct >= 0.85) return "Excellent (around C1)";
  if (pct >= 0.7) return "Good (around B2)";
  if (pct >= 0.5) return "Satisfactory (around B1)";
  if (pct >= 0.3) return "Developing (around A2)";
  return "Needs more practice (around A1)";
}

export default function SpeakingPractice({ initialAttemptsLeft }: { initialAttemptsLeft: number }) {
  const [ack, setAck] = useState(false);
  const [stage, setStage] = useState<Stage>("themes");
  const [theme, setTheme] = useState<Theme | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [showIdeas, setShowIdeas] = useState(true);
  const [attemptsLeft, setAttemptsLeft] = useState(initialAttemptsLeft);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const cardRef = useRef<Card | null>(null);
  cardRef.current = card;

  // countdown for prep + recording
  useEffect(() => {
    if (stage !== "prep" && stage !== "recording") return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (seconds > 0) return;
    if (stage === "prep") void startRecording();
    if (stage === "recording") stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, stage]);

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  function pickTheme(t: Theme) {
    setTheme(t);
    setCard(null);
    setStage("card");
    setError(null);
  }
  function chooseCard(c: Card) {
    setCard(c);
    setError(null);
    setStage("card");
  }
  function randomCard() {
    if (!theme) return;
    const list = cards.filter((c) => c.theme === theme.id && c.id !== card?.id);
    chooseCard(list[Math.floor(Math.random() * list.length)]);
  }

  async function beginPrep() {
    setError(null);
    // ask for the microphone now so the student isn't surprised mid-recording
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("We couldn't access your microphone. Please allow microphone permission and try again.");
      return;
    }
    setSeconds(PREP_SECONDS);
    setStage("prep");
  }

  async function startRecording() {
    if (!stream.current) return;
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(stream.current, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 32000 });
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => void submit(rec.mimeType || mime || "audio/webm");
    recorder.current = rec;
    rec.start();
    setSeconds(SPEAK_SECONDS);
    setStage("recording");
  }

  function stopRecording() {
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
  }

  async function submit(mimeType: string) {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setStage("analyzing");
    const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
    const form = new FormData();
    form.append("cardId", cardRef.current!.id);
    form.append("audio", new Blob(chunks.current, { type: mimeType }), `speech.${ext}`);
    try {
      const res = await fetch("/api/speaking/analyze", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        if (typeof json.attemptsLeft === "number") setAttemptsLeft(json.attemptsLeft);
        setError(json.error ?? "Something went wrong.");
        setStage("card");
        return;
      }
      setData(json);
      setAttemptsLeft(json.attemptsLeft);
      setStage("result");
    } catch {
      setError("Network problem. Please check your connection and try again.");
      setStage("card");
    }
  }

  function reset() {
    setData(null);
    setStage("themes");
    setTheme(null);
    setCard(null);
  }

  // ---------- screens ----------
  if (!ack) {
    return (
      <div className="card max-w-xl mx-auto text-center">
        <p className="text-4xl mb-3">🎤</p>
        <h2 className="text-xl font-medium mb-3">Before you start</h2>
        <ul className="text-sm text-left text-ink/80 space-y-2 mb-5 list-disc pl-5">
          <li>
            <b>Scores are approximate.</b> This is an AI practice tool, not an official KSSM / SPM grade. Use it to find what to improve.
          </li>
          <li>
            The AI marks your <b>words, grammar, vocabulary, pace and ideas</b>. It cannot hear your <b>pronunciation or accent</b>, so
            pronunciation is judged only from how smoothly you speak (pauses, fillers). Ask your teacher for pronunciation feedback.
          </li>
          <li>This practises <b>Part 2</b> (individual long turn). For Part 3, answer the discussion questions yourself out loud.</li>
          <li>You get <b>2 attempts per day</b>. Your recording is not stored, only the transcript and feedback.</li>
        </ul>
        <button className="btn-primary" onClick={() => setAck(true)}>
          I understand, let's practise
        </button>
      </div>
    );
  }

  const header = (
    <div className="flex items-center justify-between mb-6 text-sm">
      <span className="text-ink/60">Attempts left today: <b className="text-ink">{attemptsLeft} / 2</b></span>
      {stage !== "themes" && stage !== "prep" && stage !== "recording" && stage !== "analyzing" && (
        <button onClick={reset} className="text-clay-600 hover:underline">← All themes</button>
      )}
    </div>
  );

  if (stage === "themes")
    return (
      <>
        {header}
        <h2 className="text-lg font-medium mb-1">Choose a theme</h2>
        <p className="text-sm text-ink/60 mb-4">Pick a theme, then a question (or get a random one).</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button key={t.id} onClick={() => pickTheme(t)} className="card text-left hover:border-clay-400 transition-colors">
              <span className="text-2xl">{t.emoji}</span>
              <p className="font-medium mt-1">{t.name}</p>
              <p className="text-xs text-ink/50">{cards.filter((c) => c.theme === t.id).length} questions</p>
            </button>
          ))}
        </div>
      </>
    );

  if (stage === "card" && theme && !card)
    return (
      <>
        {header}
        <h2 className="text-lg font-medium mb-3">
          {theme.emoji} {theme.name}
        </h2>
        <button className="btn-primary mb-4" onClick={randomCard}>🎲 Random question</button>
        <div className="space-y-2">
          {cards.filter((c) => c.theme === theme.id).map((c) => (
            <button key={c.id} onClick={() => chooseCard(c)} className="card w-full text-left hover:border-clay-400 transition-colors !py-3">
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-ink/60">{c.prompt}</p>
            </button>
          ))}
        </div>
      </>
    );

  if ((stage === "card" || stage === "prep") && card) {
    const t = getTheme(card.theme);
    return (
      <>
        {header}
        <CueCard card={card} />
        {stage === "card" && (
          <>
            <button onClick={() => setShowIdeas((v) => !v)} className="text-sm text-clay-600 hover:underline mt-4">
              {showIdeas ? "Hide" : "Show"} ideas bank for “{t.name}”
            </button>
            {showIdeas && <IdeasBank theme={t} />}
            {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary" disabled={attemptsLeft <= 0} onClick={beginPrep}>
                ▶ Start ({PREP_SECONDS}s prep, then {SPEAK_SECONDS / 60} min speaking)
              </button>
              <button className="btn-secondary" onClick={() => setCard(null)}>Change question</button>
            </div>
            {attemptsLeft <= 0 && <p className="mt-3 text-sm text-ink/60">You've used today's 2 attempts. Come back tomorrow!</p>}
          </>
        )}
        {stage === "prep" && (
          <div className="mt-6 card text-center">
            <p className="text-sm text-ink/60">Preparation time. Plan your points (you may take notes on paper).</p>
            <p className="text-5xl font-medium my-3 tabular-nums">{fmt(Math.max(seconds, 0))}</p>
            <button className="btn-secondary" onClick={() => setSeconds(0)}>Skip, start speaking now</button>
          </div>
        )}
      </>
    );
  }

  if (stage === "recording" && card)
    return (
      <>
        {header}
        <CueCard card={card} />
        <div className="mt-6 card text-center">
          <p className="inline-flex items-center gap-2 text-red-600 font-medium">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" /> Recording
          </p>
          <p className="text-5xl font-medium my-3 tabular-nums">{fmt(Math.max(seconds, 0))}</p>
          <p className="text-sm text-ink/60 mb-4">Keep talking until the timer ends. Cover every bullet point.</p>
          <button className="btn-primary" onClick={stopRecording}>■ Finish & get feedback</button>
        </div>
      </>
    );

  if (stage === "analyzing")
    return (
      <div className="card text-center max-w-md mx-auto">
        <p className="text-4xl mb-3 animate-pulse">🧠</p>
        <p className="font-medium">Listening to your speech and marking it…</p>
        <p className="text-sm text-ink/60 mt-1">This takes about 20 to 40 seconds.</p>
      </div>
    );

  if (stage === "result" && data && card) return (
    <>
      {header}
      <Result data={data} card={card} onAgain={() => { setData(null); setStage("card"); }} onThemes={reset} canRetry={attemptsLeft > 0} />
    </>
  );

  return null;
}

// ---------- pieces ----------
function CueCard({ card }: { card: Card }) {
  return (
    <div className="bg-white border-2 border-ink/20 rounded-lg p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Part 2 · Candidate booklet</p>
      <h2 className="text-xl font-bold mb-2">{card.title}</h2>
      <p className="font-semibold mb-3">{card.prompt}</p>
      <p className="font-semibold mb-1">You should say:</p>
      <ul className="list-disc pl-6 space-y-1">
        {card.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function IdeasBank({ theme }: { theme: Theme }) {
  return (
    <div className="mt-3 grid sm:grid-cols-2 gap-3">
      <div className="card !bg-cream-50">
        <p className="font-medium mb-2">💡 Points to say</p>
        <ul className="list-disc pl-5 text-sm space-y-1">{theme.ideas.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
      <div className="card !bg-cream-50">
        <p className="font-medium mb-2">📚 Useful vocabulary</p>
        <div className="flex flex-wrap gap-2">
          {theme.vocab.map((v) => <span key={v} className="text-xs bg-sage-400/20 text-sage-600 px-2.5 py-1 rounded-full">{v}</span>)}
        </div>
      </div>
    </div>
  );
}

function HighlightedTranscript({ data }: { data: AnalysisResponse }) {
  const parts = useMemo(() => {
    const repeated = new Set(data.stats.repeatedWords.map((w) => w.word));
    const fillerWords = new Set(data.stats.fillers.filter((f) => !f.word.includes(" ")).map((f) => f.word));
    const fillerPhrases = data.stats.fillers.filter((f) => f.word.includes(" ")).map((f) => f.word.split(" "));
    const toks = data.transcript.split(/\s+/);
    const cl = toks.map(clean);
    const kind: ("rep" | "fill" | null)[] = toks.map(() => null);
    cl.forEach((w, i) => {
      if (fillerWords.has(w)) kind[i] = "fill";
      else if (repeated.has(w)) kind[i] = "rep";
    });
    for (const ph of fillerPhrases)
      for (let i = 0; i + ph.length <= cl.length; i++)
        if (ph.every((p, k) => cl[i + k] === p)) for (let k = 0; k < ph.length; k++) kind[i + k] = "fill";
    return toks.map((t, i) => ({ t, k: kind[i] }));
  }, [data]);

  return (
    <p className="leading-8 text-sm">
      {parts.map((p, i) => (
        <span
          key={i}
          className={p.k === "fill" ? "bg-red-100 text-red-700 rounded px-0.5" : p.k === "rep" ? "bg-amber-100 text-amber-800 rounded px-0.5" : ""}
        >
          {p.t}{" "}
        </span>
      ))}
    </p>
  );
}

export function Result({ data, card, onAgain, onThemes, canRetry }: { data: AnalysisResponse; card: Card; onAgain?: () => void; onThemes?: () => void; canRetry?: boolean }) {
  const { result, stats, total } = data;
  const keys = Object.keys(criteriaInfo) as CriterionKey[];
  return (
    <div className="space-y-6">
      <p className="text-xs text-ink/50 bg-amber-50 border border-amber-200 rounded-xl p-3">
        ⚠️ Estimated score from an AI practice tool. It is not an official grade, and it cannot hear pronunciation or accent.
      </p>

      <div className="card text-center">
        <p className="text-sm text-ink/60">{card.title}</p>
        <p className="text-5xl font-medium my-2">{total}<span className="text-xl text-ink/50"> / {4 * BAND_MAX}</span></p>
        <p className="font-medium text-clay-700">{bandLabel(total)}</p>
        <p className="text-sm text-ink/70 mt-3">{result.overall_comment}</p>
      </div>

      <section className="grid sm:grid-cols-2 gap-3">
        {keys.map((k) => (
          <div key={k} className="card">
            <div className="flex justify-between items-baseline">
              <p className="font-medium">{criteriaInfo[k].label}</p>
              <p className="font-medium text-clay-700">{result.criteria[k].band} / {BAND_MAX}</p>
            </div>
            <div className="h-2 bg-ink/10 rounded-full my-2"><div className="h-2 bg-clay-500 rounded-full" style={{ width: `${(result.criteria[k].band / BAND_MAX) * 100}%` }} /></div>
            <p className="text-sm text-ink/70">{result.criteria[k].comment}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <h3 className="font-medium mb-2">Did you cover every point?</h3>
        <ul className="space-y-1 text-sm">
          {result.covered_points.map((c, i) => (
            <li key={i}><span>{c.covered ? "✅" : "❌"}</span> <b>{c.point}</b> <span className="text-ink/60">: {c.note}</span></li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3 className="font-medium mb-1">Your transcript</h3>
        <p className="text-xs text-ink/60 mb-3">
          <span className="bg-red-100 text-red-700 rounded px-1">fillers</span>{" "}
          <span className="bg-amber-100 text-amber-800 rounded px-1">repeated words</span>
        </p>
        <HighlightedTranscript data={data} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-xs">
          <Stat label="Words per min" value={String(stats.wordsPerMinute)} hint="aim: 110-150" />
          <Stat label="Words" value={String(stats.wordCount)} />
          <Stat label="Long pauses (1.5s+)" value={String(stats.longPauses)} />
          <Stat label="Fillers" value={String(stats.fillerCount)} />
        </div>
      </section>

      <section className="card">
        <h3 className="font-medium mb-3">Your problems and how to fix them</h3>
        <div className="space-y-3">
          {result.problems.map((p, i) => (
            <div key={i} className="text-sm border-l-4 border-clay-400 pl-3">
              <p className="font-medium">{p.issue}</p>
              <p className="text-ink/60 italic">“{p.example}”</p>
              <p className="mt-1">👉 {p.fix}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3 className="font-medium mb-3">Replace these phrases to score higher</h3>
        <div className="space-y-2 text-sm">
          {result.phrase_upgrades.map((p, i) => (
            <div key={i}>
              <b className="text-red-700">{p.original}</b> → {p.better.map((b) => <span key={b} className="inline-block bg-sage-400/20 text-sage-600 rounded-full px-2.5 py-0.5 mr-1.5 mb-1">{b}</span>)}
              <p className="text-ink/60 text-xs">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3 className="font-medium mb-3">Band upgrade: rewrite your own sentences</h3>
        <div className="space-y-4 text-sm">
          {result.band_upgrade_rewrite.map((r, i) => (
            <div key={i}>
              <p className="text-ink/60">Before: <i>“{r.original}”</i></p>
              <p className="font-medium text-sage-600">After: “{r.upgraded}”</p>
              <p className="text-xs text-ink/60">{r.why}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3 className="font-medium mb-3">Band upgrade: vocabulary</h3>
        <div className="space-y-3 text-sm">
          {result.vocab_upgrades.map((v, i) => (
            <div key={i}>
              <b>{v.basic}</b> → {v.better.join(", ")}
              <p className="text-xs text-ink/60 italic">e.g. {v.example}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="card !bg-cream-50 text-sm">
        <b>Part 3 practice:</b> now explain your opinion about the last bullet point out loud, with a reason and an example, for another minute.
      </div>

      {onAgain && onThemes && (
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" disabled={!canRetry} onClick={onAgain}>Try this question again</button>
          <button className="btn-secondary" onClick={onThemes}>Choose another theme</button>
          <Link href="/speaking/history" className="btn-secondary">My history</Link>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-cream-50 rounded-xl p-2">
      <p className="text-lg font-medium">{value}</p>
      <p className="text-ink/60">{label}</p>
      {hint && <p className="text-ink/40">{hint}</p>}
    </div>
  );
}
