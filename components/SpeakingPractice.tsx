"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { recordReaction } from "@/actions/community";
import { cards, themes, getCard, getTheme, type Card, type Theme } from "@/lib/speaking/cards";
import { BAND_MAX, criterionLabel, criterionOrder, type AnalysisResponse } from "@/lib/speaking/analyze";
import { PART3_CHECKLIST, PART_INFO, type Part } from "@/lib/speaking/parts";

const PREP_SECONDS = 30;

type Stage = "themes" | "card" | "prep" | "recording" | "analyzing" | "result";

const AUTO_DELAYS = [60, 120, 180, 240]; // seconds before each automatic retry (4 in total)

export type SavedRec = { id: string; cardId: string; createdAt: string; words: number; part?: Part };

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const savedWhen = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} day(s) ago`;
};
const clean = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");

function bandLabel(total: number) {
  const pct = total / (4 * BAND_MAX);
  if (pct >= 0.85) return "Excellent (around C1)";
  if (pct >= 0.7) return "Good (around B2)";
  if (pct >= 0.5) return "Satisfactory (around B1)";
  if (pct >= 0.3) return "Developing (around A2)";
  return "Needs more practice (around A1)";
}

export default function SpeakingPractice({
  initialAttemptsLeft,
  initialPackLeft = 0,
  packExpiry = null,
  packHref = "/shop",
  initialSaved = [],
}: {
  initialAttemptsLeft: number;
  initialPackLeft?: number;
  packExpiry?: string | null;
  packHref?: string;
  initialSaved?: SavedRec[];
}) {
  const [packLeft, setPackLeft] = useState(initialPackLeft);
  // seconds the student must wait before trying again (set after a failed attempt or when the server asks for a pause)
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown > 0]);
  // Recordings that were transcribed but not marked because the AI was busy. They are kept on the server for 7 days.
  const [saved, setSaved] = useState<SavedRec[]>(initialSaved);
  const activeRetry = useRef<string | null>(null); // which saved recording is being marked right now
  // While the page stays open it retries for the student, slowly, so nobody needs to keep pressing the button.
  const [autoOn, setAutoOn] = useState(false);
  const autoDone = useRef(0);
  const [ack, setAck] = useState(false);
  const [stage, setStage] = useState<Stage>("themes");
  const [theme, setTheme] = useState<Theme | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  // Part 2 = cue card, 1 minute. Part 3 = discussion question, 2 minutes.
  const [part, setPart] = useState<Part>(2);
  const [onlyUncommon, setOnlyUncommon] = useState(false); // 冷门题 only
  const partRef = useRef<Part>(2);
  partRef.current = part;
  const [showIdeas, setShowIdeas] = useState(true);
  const [attemptsLeft, setAttemptsLeft] = useState(initialAttemptsLeft);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  // The student's own recording, kept only in this browser tab so they can listen back. It is never uploaded again or stored.
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
  // free the recording from memory when the student leaves the page
  const audioUrlRef = useRef<string | null>(null);
  audioUrlRef.current = audioUrl;
  useEffect(() => () => { if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); }, []);

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
  // a random 冷门题 from any theme
  function randomUncommon() {
    const list = cards.filter((c) => c.uncommon);
    const c = list[Math.floor(Math.random() * list.length)];
    setTheme(getTheme(c.theme));
    chooseCard(c);
  }
  function randomCard() {
    if (!theme) return;
    const list = cards.filter((c) => c.theme === theme.id && c.id !== card?.id && (!onlyUncommon || c.uncommon));
    if (list.length) chooseCard(list[Math.floor(Math.random() * list.length)]);
  }

  async function beginPrep() {
    setError(null);
    setAutoOn(false); // a new recording replaces any automatic retry
    autoDone.current = 0;
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
    setSeconds(PART_INFO[partRef.current].speakSeconds);
    setStage("recording");
  }

  function stopRecording() {
    if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
  }

  async function submit(mimeType: string) {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
    const blob = new Blob(chunks.current, { type: mimeType });
    setAudioUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(blob);
    });
    const form = new FormData();
    form.append("cardId", cardRef.current!.id);
    form.append("part", String(partRef.current));
    form.append("audio", blob, `speech.${ext}`);
    await send(form);
  }

  // Re-mark a saved recording whose AI marking failed (the transcript is kept on the server, no new recording needed).
  async function retryMarking(rec: SavedRec) {
    const c = getCard(rec.cardId);
    if (!c) return;
    setCard(c);
    cardRef.current = c;
    setPart(rec.part ?? 2);
    partRef.current = rec.part ?? 2;
    activeRetry.current = rec.id;
    const form = new FormData();
    form.append("cardId", c.id);
    form.append("part", String(rec.part ?? 2));
    form.append("retryAttemptId", rec.id);
    await send(form);
  }

  // Automatic retry: when the countdown ends and the page is still open, try the newest saved recording again.
  useEffect(() => {
    if (!autoOn || cooldown > 0 || stage !== "card") return;
    const target = saved[0];
    if (!target || autoDone.current >= AUTO_DELAYS.length) {
      setAutoOn(false);
      return;
    }
    autoDone.current += 1;
    void retryMarking(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOn, cooldown, stage]);

  async function send(form: FormData) {
    setStage("analyzing");
    setError(null);
    try {
      const res = await fetch("/api/speaking/analyze", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        if (typeof json.attemptsLeft === "number") setAttemptsLeft(json.attemptsLeft);
        if (typeof json.packLeft === "number") setPackLeft(json.packLeft);
        const serverWait = typeof json.retryAfter === "number" ? Math.ceil(json.retryAfter) : 0;
        const gone = activeRetry.current;
        activeRetry.current = null;
        if (json.retryAttemptId && cardRef.current) {
          // the AI failed but the transcript is saved: keep it in the list (it replaces the one we just tried)
          const rec: SavedRec = { id: json.retryAttemptId, cardId: cardRef.current.id, createdAt: new Date().toISOString(), words: json.savedWords ?? 0 };
          setSaved((list) => [rec, ...list.filter((x) => x.id !== rec.id && x.id !== gone)].slice(0, 5));
          // keep retrying for the student, slowly: 1, 2, 3 then 4 minutes apart
          const more = autoDone.current < AUTO_DELAYS.length;
          setAutoOn(more);
          setCooldown(Math.max(serverWait, 20, more ? AUTO_DELAYS[autoDone.current] : 0));
        } else if (res.status === 410 && gone) {
          setSaved((list) => list.filter((x) => x.id !== gone)); // it expired
          setAutoOn(false);
        } else if (serverWait > 0) {
          setCooldown(serverWait); // the server asked for a pause; automatic retry (if on) carries on afterwards
        } else {
          setAutoOn(false); // some other problem: don't retry automatically
        }
        setError(json.error ?? "Something went wrong.");
        setStage("card");
        return;
      }
      // marked: the saved recording that was used is gone from the list
      if (activeRetry.current) {
        const used = activeRetry.current;
        setSaved((list) => list.filter((x) => x.id !== used));
        activeRetry.current = null;
      }
      setAutoOn(false);
      autoDone.current = 0;
      setData(json);
      setAttemptsLeft(json.attemptsLeft);
      if (typeof json.packLeft === "number") setPackLeft(json.packLeft);
      setStage("result");
    } catch {
      setError("Network problem. Please check your connection and try again.");
      setStage("card");
    }
  }

  const retryBanner = saved.length > 0 && (
    <div className="mb-5 rounded-xl border border-sage-400/40 bg-sage-400/10 p-4 text-sm space-y-3">
      <p>
        <b>🛟 Your recording is safe.</b> The AI was busy, so it hasn't been marked yet. You can close or refresh this page and come back
        within 7 days. Tap "Mark it now" then, without speaking again, and it won't use up another attempt.
      </p>
      {autoOn && (
        <p className="text-ink/70">
          ⏳ We're retrying for you automatically{cooldown > 0 ? ` in ${fmt(cooldown)}` : ""}, as long as this page stays open.{" "}
          <button className="underline text-clay-700" onClick={() => setAutoOn(false)}>Stop</button>
        </p>
      )}
      <ul className="space-y-2">
        {saved.map((rec) => (
          <li key={rec.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/60 px-3 py-2">
            <span>
              <b>{getCard(rec.cardId)?.title ?? "Your recording"}</b>
              <span className="text-ink/60"> · saved {savedWhen(rec.createdAt)}{rec.words ? ` · ${rec.words} words` : ""}</span>
            </span>
            <button className="btn-primary !py-1 !px-4 disabled:opacity-60" disabled={cooldown > 0} onClick={() => { setAutoOn(false); void retryMarking(rec); }}>
              {cooldown > 0 ? `Wait ${fmt(cooldown)}` : "Mark it now"}
            </button>
          </li>
        ))}
      </ul>
      {audioUrl && (
        <div>
          <p className="text-xs text-ink/60 mb-1">Listen to your last recording (this device only):</p>
          <PlaybackPlayer url={audioUrl} />
        </div>
      )}
    </div>
  );

  function reset() {
    setAutoOn(false);
    autoDone.current = 0;
    setAudioUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
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
          <li>
            Two kinds of question: <b>Part 2</b> (cue card, speak for <b>1 minute</b>) and <b>Part 3</b> (discussion question, speak for <b>2 minutes</b>).
            You are marked with the official SPM speaking scales: <b>Grammar, Vocabulary, Communicative Competence and Overall Spoken Performance</b>, each out of 6, so the total is /24.
          </li>
          <li>You get <b>2 free attempts per day</b>. Need more? A Speaking pack adds extra attempts. Your recording is not stored by us, only the transcript and feedback. You can listen back to it on the result page until you leave.</li>
        </ul>
        <button className="btn-primary" onClick={() => setAck(true)}>
          I understand, let's practise
        </button>
      </div>
    );
  }

  const showRetry = stage === "themes" || stage === "card";
  const header = (
    <>
    {showRetry && retryBanner}
    <div className="flex items-center justify-between mb-6 text-sm">
      <span className="text-ink/60">
        Free attempts left today: <b className="text-ink">{attemptsLeft} / 2</b>
        {(packLeft > 0 || packExpiry) && (
          <>
            {" "}· Pack attempts: <b className="text-ink">{packLeft}</b>
            {packExpiry && packLeft > 0 && ` (until ${new Date(packExpiry).toLocaleDateString("en-MY", { day: "numeric", month: "short" })})`}
          </>
        )}
      </span>
      {stage !== "themes" && stage !== "prep" && stage !== "recording" && stage !== "analyzing" && (
        <button onClick={reset} className="text-clay-600 hover:underline">← All themes</button>
      )}
    </div>
    </>
  );

  if (stage === "themes")
    return (
      <>
        {header}
        <h2 className="text-lg font-medium mb-2">What do you want to practise?</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {([2, 3] as Part[]).map((n) => (
            <button
              key={n}
              onClick={() => setPart(n)}
              className={`card text-left transition-colors ${part === n ? "!border-clay-600 bg-clay-400/10" : "hover:border-clay-400"}`}
            >
              <p className="font-medium">{PART_INFO[n].short} · {PART_INFO[n].speakSeconds / 60} min</p>
              <p className="text-xs text-ink/60">{n === 2 ? "Cue card: individual long turn" : "Discussion question: give and explain your opinion"}</p>
            </button>
          ))}
        </div>
        <h2 className="text-lg font-medium mb-1">Choose a theme</h2>
        <p className="text-sm text-ink/60 mb-3">Pick a theme, then a question (or get a random one).</p>
        <button onClick={randomUncommon} className="btn-secondary !py-1.5 text-sm mb-4">🎲 Random 冷门题 (uncommon topic)</button>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((t) => (
            <button key={t.id} onClick={() => pickTheme(t)} className="card text-left hover:border-clay-400 transition-colors">
              <span className="text-2xl">{t.emoji}</span>
              <p className="font-medium mt-1">{t.name}</p>
              <p className="text-xs text-ink/50">{cards.filter((c) => c.theme === t.id).length} questions · {cards.filter((c) => c.theme === t.id && c.uncommon).length} 冷门</p>
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
        <button className="btn-primary mb-3" onClick={randomCard}>🎲 Random question</button>
        <div className="flex gap-2 mb-4 text-sm">
          {([false, true] as const).map((u) => (
            <button
              key={String(u)}
              onClick={() => setOnlyUncommon(u)}
              className={`px-3 py-1 rounded-full border ${onlyUncommon === u ? "border-clay-600 bg-clay-600 text-white" : "border-ink/15"}`}
            >
              {u ? "冷门题 only" : "All questions"}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {cards.filter((c) => c.theme === theme.id && (!onlyUncommon || c.uncommon)).map((c) => (
            <button key={c.id} onClick={() => chooseCard(c)} className="card w-full text-left hover:border-clay-400 transition-colors !py-3">
              <p className="font-medium">
                {c.title}
                {c.uncommon && <span className="ml-2 text-[11px] font-medium bg-clay-600 text-white px-2 py-0.5 rounded-full align-middle">冷门</span>}
              </p>
              <p className="text-sm text-ink/60">{part === 3 ? c.discussion : c.prompt}</p>
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
        <CueCard card={card} part={part} />
        {stage === "card" && (
          <>
            <button onClick={() => setShowIdeas((v) => !v)} className="text-sm text-clay-600 hover:underline mt-4">
              {showIdeas ? "Hide" : "Show"} ideas bank for “{t.name}”
            </button>
            {showIdeas && <IdeasBank theme={t} />}
            {error && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary disabled:opacity-60" disabled={attemptsLeft + packLeft <= 0 || cooldown > 0} onClick={beginPrep}>
                {cooldown > 0 ? `Please wait ${fmt(cooldown)} before trying again` : `▶ Start (${PREP_SECONDS}s prep, then ${PART_INFO[part].speakSeconds / 60} min speaking)`}
              </button>
              <button className="btn-secondary" onClick={() => setCard(null)}>Change question</button>
            </div>
            {attemptsLeft + packLeft <= 0 && (
              <p className="mt-3 text-sm text-ink/60">
                You've used today's 2 free attempts. Come back tomorrow, or{" "}
                <Link href={packHref} className="text-clay-600 underline">get a Speaking pack</Link> for more.
              </p>
            )}
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
        <CueCard card={card} part={part} />
        <div className="mt-6 card text-center">
          <p className="inline-flex items-center gap-2 text-red-600 font-medium">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" /> Recording
          </p>
          <p className="text-5xl font-medium my-3 tabular-nums">{fmt(Math.max(seconds, 0))}</p>
          <p className="text-sm text-ink/60 mb-4">{part === 3 ? "Keep talking until the timer ends. Give your opinion, two reasons and an example." : "Keep talking until the timer ends. Cover every bullet point."}</p>
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
        <p className="text-xs text-ink/50 mt-3">
          Your recording is on its way to us. If you close this page after a few seconds, your result will be in My history, or your
          recording will be saved on the Speaking page if the AI is busy.
        </p>
      </div>
    );

  if (stage === "result" && data && card) return (
    <>
      {header}
      <Result data={{ ...data, part: data.part ?? part }} card={card} audioUrl={audioUrl} onAgain={() => { setData(null); setStage("card"); }} onThemes={reset} canRetry={attemptsLeft + packLeft > 0} onOtherPart={() => { setPart(part === 2 ? 3 : 2); setData(null); setStage("card"); }} />
    </>
  );

  return null;
}

// ---------- pieces ----------
function CueCard({ card, part }: { card: Card; part: Part }) {
  if (part === 3)
    return (
      <div className="bg-white border-2 border-ink/20 rounded-lg p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Part 3 · Discussion · 2 minutes{card.uncommon ? " · 冷门题" : ""}</p>
        <h2 className="text-xl font-bold mb-2">{card.title}</h2>
        <p className="font-semibold text-lg mb-3">{card.discussion}</p>
        <p className="font-semibold mb-1">A good answer:</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          {PART3_CHECKLIST.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="bg-white border-2 border-ink/20 rounded-lg p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Part 2 · Candidate booklet · 1 minute{card.uncommon ? " · 冷门题" : ""}</p>
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

// One tap: was this feedback helpful? A thumb is saved straight away; a short note is optional.
function ReactionBar({ attemptId }: { attemptId: string }) {
  const [rating, setRating] = useState<1 | -1 | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function tap(r: 1 | -1) {
    setRating(r);
    setBusy(true);
    await recordReaction(attemptId, r);
    setBusy(false);
  }
  async function send() {
    if (!rating) return;
    setBusy(true);
    await recordReaction(attemptId, rating, note);
    setBusy(false);
    setSent(true);
  }

  return (
    <div className="card text-center">
      <p className="font-medium mb-3">Was this feedback helpful?</p>
      <div className="flex justify-center gap-3">
        {([1, -1] as const).map((r) => (
          <button
            key={r}
            type="button"
            disabled={busy}
            onClick={() => tap(r)}
            className={`text-3xl rounded-2xl border px-6 py-2 transition-colors ${rating === r ? "border-clay-600 bg-clay-600/10" : "border-ink/15 hover:border-clay-400"}`}
            aria-label={r === 1 ? "Helpful" : "Not helpful"}
          >
            {r === 1 ? "👍" : "👎"}
          </button>
        ))}
      </div>
      {rating && !sent && (
        <div className="mt-4 space-y-2 text-left">
          <p className="text-sm text-ink/70">Thanks! Want to tell me more? (optional)</p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            placeholder={rating === 1 ? "What helped most?" : "What was missing or wrong?"}
            className="w-full border border-ink/15 rounded-xl px-3 py-2.5 text-base bg-white"
          />
          <button type="button" disabled={busy || !note.trim()} onClick={send} className="btn-secondary !py-1.5 text-sm disabled:opacity-50">Send</button>
        </div>
      )}
      {sent && <p className="mt-3 text-sm text-sage-600">Thank you, Gary reads these.</p>}
      <p className="mt-4 text-xs text-ink/55">
        Did practising help your speaking or your grades? <Link prefetch={false}  href="/feedback" className="text-clay-600 underline">Tell Gary your result</Link>
      </p>
    </div>
  );
}

// Plays the student's own recording. Browsers record voice as WebM without a length, which breaks the seek bar,
// so we nudge the player to work out the real duration.
function PlaybackPlayer({ url }: { url: string }) {
  return (
    <audio
      controls
      preload="metadata"
      src={url}
      className="w-full"
      onLoadedMetadata={(e) => {
        const a = e.currentTarget;
        if (a.duration === Infinity) {
          a.currentTime = 1e101;
          a.addEventListener("timeupdate", () => { a.currentTime = 0; }, { once: true });
        }
      }}
    />
  );
}

// Speech-to-text sometimes hears words wrongly. The student can fix them once, and the same attempt is marked again.
function TranscriptFixer({ data, onFixed }: { data: AnalysisResponse; onFixed: (d: AnalysisResponse) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(data.transcript);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("remarkAttemptId", data.attemptId);
      form.append("transcript", text);
      const res = await fetch("/api/speaking/analyze", { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
      } else {
        onFixed(json as AnalysisResponse);
        setOpen(false);
      }
    } catch {
      setError("No connection. Please try again.");
    }
    setBusy(false);
  }

  if (data.edited)
    return <p className="text-xs text-sage-600 mt-3">✅ You corrected this transcript and it was marked again. (You can correct each attempt once.)</p>;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary !py-1.5 text-sm mt-3">
        ✏️ Something heard wrongly? Fix the transcript · 听错了？修改文字
      </button>
    );
  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs text-ink/60">
        Change only the words that were heard wrongly, so the text matches what you really said (keep your own grammar mistakes). Your answer is then marked again.
        You can do this once. It does not use another attempt. · 只改听错的字，保持你原本说的内容，系统会重新评分。每次练习只能修改一次，不会扣次数。
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} maxLength={5000} className="w-full border border-ink/15 rounded-xl px-3 py-2 text-sm bg-white" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="button" disabled={busy || text.trim() === data.transcript.trim()} onClick={submit} className="btn-primary !py-1.5 text-sm disabled:opacity-50">
          {busy ? "Marking again… (about 20 seconds)" : "Save and mark again"}
        </button>
        <button type="button" disabled={busy} onClick={() => { setOpen(false); setText(data.transcript); setError(null); }} className="text-sm text-ink/50">Cancel</button>
      </div>
    </div>
  );
}

export function Result({ data: initial, card, audioUrl, onAgain, onThemes, canRetry, onOtherPart }: { data: AnalysisResponse; card: Card; audioUrl?: string | null; onAgain?: () => void; onThemes?: () => void; canRetry?: boolean; onOtherPart?: () => void }) {
  const [data, setData] = useState(initial); // starts as the report passed in; replaced when the student corrects the transcript
  const { result, stats, total } = data;
  const free = data.tier === "free"; // older reports have no tier and are shown in full
  const keys = criterionOrder(Object.keys(result.criteria));
  const partNow: Part = data.part ?? 2;
  return (
    <div className="space-y-6">
      <p className="text-xs text-ink/50 bg-amber-50 border border-amber-200 rounded-xl p-3">
        ⚠️ Estimated score from an AI practice tool. It is not an official grade, and it cannot hear pronunciation or accent.
      </p>

      <div className="card text-center">
        <p className="text-sm text-ink/60">{card.title} · {PART_INFO[partNow].short}</p>
        <p className="text-5xl font-medium my-2">{total}<span className="text-xl text-ink/50"> / {4 * BAND_MAX}</span></p>
        <p className="font-medium text-clay-700">{bandLabel(total)}</p>
        <p className="text-sm text-ink/70 mt-3">{result.overall_comment}</p>
      </div>

      <section className="grid sm:grid-cols-2 gap-3">
        {keys.map((k) => (
          <div key={k} className="card">
            <div className="flex justify-between items-baseline">
              <p className="font-medium">{criterionLabel(k)}</p>
              <p className="font-medium text-clay-700">{result.criteria[k]?.band ?? 0} / {BAND_MAX}</p>
            </div>
            <div className="h-2 bg-ink/10 rounded-full my-2"><div className="h-2 bg-clay-500 rounded-full" style={{ width: `${((result.criteria[k]?.band ?? 0) / BAND_MAX) * 100}%` }} /></div>
            <p className="text-sm text-ink/70">{result.criteria[k]?.comment}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <h3 className="font-medium mb-2">{partNow === 3 ? "Was your answer complete?" : "Did you cover every point?"}</h3>
        <ul className="space-y-1 text-sm">
          {result.covered_points.map((c, i) => (
            <li key={i}><span>{c.covered ? "✅" : "❌"}</span> <b>{c.point}</b> <span className="text-ink/60">: {c.note}</span></li>
          ))}
        </ul>
      </section>

      {audioUrl && (
        <section className="card">
          <h3 className="font-medium mb-1">🎧 Listen to your recording</h3>
          <p className="text-xs text-ink/60 mb-3">
            It stays on your device only and disappears when you leave this page. Listen along with the transcript below to catch fillers and long pauses.
          </p>
          <PlaybackPlayer url={audioUrl} />
        </section>
      )}

      <section className="card">
        <h3 className="font-medium mb-1">Your transcript</h3>
        <p className="text-xs text-ink/60 mb-3">
          {!free && <span className="bg-red-100 text-red-700 rounded px-1">fillers</span>}{" "}
          <span className="bg-amber-100 text-amber-800 rounded px-1">repeated words</span>
        </p>
        <HighlightedTranscript data={data} />
        <TranscriptFixer data={data} onFixed={(d) => setData({ ...d, part: d.part ?? data.part })} />
        {free ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-xs">
            <Stat label="Words" value={String(stats.wordCount)} />
            <Stat label="Repeated words" value={String(stats.repeatedWords.length)} />
            <Stat label="Words per min" value="🔒" hint="Speaking pack" />
            <Stat label="Pauses and fillers" value="🔒" hint="Speaking pack" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-xs">
            <Stat label="Words per min" value={String(stats.wordsPerMinute)} hint="aim: 110-150" />
            <Stat label="Words" value={String(stats.wordCount)} />
            <Stat label="Long pauses (1.5s+)" value={String(stats.longPauses)} />
            <Stat label="Fillers" value={String(stats.fillerCount)} />
          </div>
        )}
      </section>

      <section className="card">
        <h3 className="font-medium mb-3">{free ? "Your biggest problem and how to fix it" : "Your problems and how to fix them"}</h3>
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

      <section className="card space-y-5">
        <div>
          <h3 className="font-medium">Upgrade your English</h3>
          <p className="text-xs text-ink/60">From one word, to a phrase, to a whole sentence, to phrases to take with you.</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">Step 1 of 4 · Words</p>
          <div className="space-y-3 text-sm">
            {result.vocab_upgrades.map((v, i) => (
              <div key={i}>
                <b>{v.basic}</b> → {v.better.join(", ")}
                <p className="text-xs text-ink/60 italic">e.g. {v.example}</p>
              </div>
            ))}
          </div>
        </div>

        {free ? (
          <div className="border-t border-dashed border-ink/20 pt-4">
            <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">Steps 2 to 4 · in the paid report</p>
            <ul className="text-sm text-ink/70 space-y-1 mb-3">
              <li>🔒 <b>Phrases:</b> better ways to say “I think”, “also”, “because of that”</li>
              <li>🔒 <b>Sentences:</b> your own sentences rewritten one band higher, with phrases from Gary&apos;s English essay notes</li>
              <li>🔒 <b>Essay toolkit:</b> phrases from Gary&apos;s notes to use next time, with Chinese meanings</li>
              <li>🔒 All your other problems, plus pace, pauses and fillers</li>
            </ul>
            <p className="text-xs text-ink/60 mb-3">Buy a Speaking pack, then make a new attempt. New attempts made with an active pack get the full report. Your 2 free attempts a day stay.</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/shop#speaking-free-vs-paid" className="btn-primary !py-1.5 inline-block">Compare free and paid</Link>
              <Link href="/shop" className="text-sm text-clay-600 underline">See Speaking packs</Link>
            </div>
          </div>
        ) : (
          <>
            {result.phrase_upgrades && result.phrase_upgrades.length > 0 && (
              <div className="border-t border-ink/10 pt-4">
                <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">Step 2 of 4 · Phrases</p>
                <div className="space-y-2 text-sm">
                  {result.phrase_upgrades.map((p, i) => (
                    <div key={i}>
                      <b className="text-red-700">{p.original}</b> → {p.better.map((b) => <span key={b} className="inline-block bg-sage-400/20 text-sage-600 rounded-full px-2.5 py-0.5 mr-1.5 mb-1">{b}</span>)}
                      <p className="text-ink/60 text-xs">{p.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.essay_rewrite && result.essay_rewrite.length > 0 && (
              <div className="border-t border-ink/10 pt-4">
                <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Step 3 of 4 · Sentences</p>
                <p className="text-xs text-ink/60 mb-3">
                  <span className="bg-clay-400/25 text-clay-700 rounded px-1">highlighted</span> phrases come from Gary&apos;s English essay notes.
                </p>
                <div className="space-y-4 text-sm">
                  {result.essay_rewrite.map((r, i) => (
                    <div key={i}>
                      <p className="text-ink/60">Before: <i>“{r.original}”</i></p>
                      <p className="font-medium text-sage-600">After: “<HighlightPhrases text={r.upgraded} phrases={r.phrases_used.map((p) => p.phrase)} />”</p>
                      {r.phrases_used.length > 0 && (
                        <p className="text-xs mt-1 flex flex-wrap gap-1.5">
                          {r.phrases_used.map((p) => (
                            <span key={p.phrase} className="bg-clay-400/20 text-clay-700 rounded-full px-2 py-0.5">{p.phrase} · {p.zh}</span>
                          ))}
                        </p>
                      )}
                      <p className="text-xs text-ink/60 mt-1">{r.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* reports made before the essay rewrite existed */}
            {!result.essay_rewrite && result.band_upgrade_rewrite && result.band_upgrade_rewrite.length > 0 && (
              <div className="border-t border-ink/10 pt-4">
                <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">Sentences</p>
                <div className="space-y-4 text-sm">
                  {result.band_upgrade_rewrite.map((r, i) => (
                    <div key={i}>
                      <p className="text-ink/60">Before: <i>“{r.original}”</i></p>
                      <p className="font-medium text-sage-600">After: “{r.upgraded}”</p>
                      <p className="text-xs text-ink/60">{r.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.essay_toolkit && result.essay_toolkit.length > 0 && (
              <div className="border-t border-ink/10 pt-4">
                <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Step 4 of 4 · Your essay toolkit</p>
                <p className="text-xs text-ink/60 mb-3">Phrases from Gary&apos;s English essay notes. Try to use two of them next time you speak or write.</p>
                <p className="flex flex-wrap gap-2 text-sm">
                  {result.essay_toolkit.map((p) => (
                    <span key={p.phrase} className="bg-clay-400/20 text-clay-700 rounded-full px-3 py-1">{p.phrase} · {p.zh}</span>
                  ))}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {onOtherPart ? (
        <div className="card !bg-cream-50 text-sm flex flex-wrap items-center justify-between gap-3">
          <span>
            {partNow === 2 ? (
              <>
                <b>Next: Part 3.</b> Practise the discussion question for this topic (2 minutes): give your opinion, two reasons and an example.
              </>
            ) : (
              <>
                <b>Next: Part 2.</b> Practise the cue card for this topic (1 minute).
              </>
            )}
          </span>
          <button className="btn-secondary !py-1.5" onClick={onOtherPart}>Try {partNow === 2 ? "Part 3" : "Part 2"}</button>
        </div>
      ) : null}

      {onAgain && onThemes && <ReactionBar attemptId={data.attemptId} />}

      {onAgain && onThemes && (
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" disabled={!canRetry} onClick={onAgain}>Try this question again</button>
          <button className="btn-secondary" onClick={onThemes}>Choose another theme</button>
          <Link prefetch={false}  href="/speaking/history" className="btn-secondary">My history</Link>
        </div>
      )}
    </div>
  );
}

// Highlights each phrase wherever it appears in the text (ignoring capital letters).
function HighlightPhrases({ text, phrases }: { text: string; phrases: string[] }) {
  if (!phrases.length) return <>{text}</>;
  const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${phrases.map(esc).join("|")})`, "gi");
  const wanted = new Set(phrases.map((p) => p.toLowerCase()));
  return (
    <>
      {text.split(re).map((part, i) =>
        wanted.has(part.toLowerCase()) ? <mark key={i} className="bg-clay-400/25 text-clay-700 rounded px-0.5">{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
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
