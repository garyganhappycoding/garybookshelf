"use client";

// DESIGN PREVIEW ONLY: no AI, no database. Replies are scripted so Gary can review the chat feel.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Step = "problem" | "level" | "story" | "effort" | "hours" | "want" | "done";
type Msg = { id: number; role: "gary" | "user"; text?: string; reel?: boolean; notFound?: boolean };
type Chip = { label: string; value: string };

const STARTERS = [
  "How should I study for SPM?",
  "I don't know where to start",
  "Trial papers or topical questions first?",
  "I'm anxious about my exams",
];
const LEVELS = ["Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "SPM", "UEC", "IGCSE", "Other"];
const EFFORTS: Chip[] = [
  { label: "I haven't started yet", value: "none" },
  { label: "I've studied a little", value: "some" },
  { label: "I've studied a lot", value: "lots" },
  { label: "I practised but it's not working", value: "notworking" },
];
const WANTS = ["Advice", "A clear direction", "Some encouragement", "Just want to vent"];

const detectLevel = (t: string) => {
  const m = t.match(/form\s*([1-5])/i);
  if (m) return `Form ${m[1]}`;
  if (/\bspm\b/i.test(t)) return "SPM";
  if (/\buec\b/i.test(t)) return "UEC";
  if (/igcse/i.test(t)) return "IGCSE";
  return null;
};

export default function AskGaryPreview() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState<Step>("problem");
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [demoNotFound, setDemoNotFound] = useState(false);
  const [vote, setVote] = useState<"" | "up" | "down">("");
  const data = useRef<{ problem: string; story: string; level: string; effort: string; want: string[] }>({ problem: "", story: "", level: "", effort: "", want: [] });
  const idRef = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const add = (m: Omit<Msg, "id">) => setMsgs((x) => [...x, { ...m, id: ++idRef.current }]);
  const garySays = (m: Omit<Msg, "id" | "role">, delay = 700) =>
    new Promise<void>((res) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        add({ role: "gary", ...m });
        res();
      }, delay);
    });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      await garySays({ text: "Hey, I'm Gary 👋 I've been through SPM too, so I know how stressful it can feel." }, 400);
      await garySays({ text: "Tell me what's on your mind. The more you tell me (what happened, what you've tried), the better I can help." }, 900);
    })();
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing, step]);

  // ---- conversation flow ----
  async function ask(next: Step) {
    setStep(next);
    if (next === "level") await garySays({ text: "Got it, thanks for sharing. Which level are you in right now?" });
    if (next === "story")
      await garySays({ text: "Can you tell me the story behind it? When did it start, what's stressing you, and what have you tried so far? Write as much as you like, it really helps me give a proper answer." }, 900);
    if (next === "effort") await garySays({ text: "And how much have you done so far? It's okay if you haven't started, I won't judge 🙂" });
    if (next === "hours") await garySays({ text: "About how many hours a week, and for how long? A rough number is fine." });
    if (next === "want") await garySays({ text: "Last one: what would help you most from me? You can pick more than one." });
  }

  // a long first message already contains the story, so skip asking for it again
  const afterLevel = () => ask(data.current.story.length >= 80 ? "effort" : "story");

  async function answer() {
    setStep("done");
    await garySays({ text: "Thanks! Let me find what I've shared about this…" }, 500);
    await garySays(
      demoNotFound
        ? { notFound: true, text: "Gary hasn't answered this one before, so I won't guess. 🙏 Send it to Gary and he'll answer it himself." }
        : {
            reel: true,
            text: `First of all, feeling lost this close to exams is really normal, don't stress. (example reply) Start with topical questions to fix your weak chapters, then move to full trial papers once you're comfortable. Trial papers are for testing your timing, not for learning new things.`,
          },
      1400
    );
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || typing) return;
    setInput("");
    add({ role: "user", text });

    if (step === "done") {
      // a new question starts a new conversation flow
      data.current = { problem: text, story: text.length >= 80 ? text : "", level: detectLevel(text) ?? "", effort: "", want: [] };
      setVote("");
      return text.length < 15 ? garySays({ text: "Can you tell me a bit more? What happened, and what have you tried so far?" }).then(() => setStep("problem")) : data.current.level ? afterLevel() : ask("level");
    }
    if (step === "problem") {
      if (text.length < 15) {
        data.current.problem += " " + text;
        return garySays({ text: "I want to help properly. Can you tell me a bit more? For example: what happened, and what have you tried so far?" });
      }
      data.current.problem = text;
      data.current.story = text.length >= 80 ? text : "";
      data.current.level = detectLevel(text) ?? "";
      return data.current.level ? afterLevel() : ask("level");
    }
    if (step === "level") {
      const lv = detectLevel(text) ?? text;
      data.current.level = lv;
      return afterLevel();
    }
    if (step === "story") {
      data.current.story = text;
      return ask("effort");
    }
    if (step === "effort") {
      data.current.effort = text;
      return ask("want");
    }
    if (step === "hours") return ask("want");
    if (step === "want") {
      data.current.want = [text];
      return answer();
    }
  }

  async function pickChip(c: Chip) {
    if (typing) return;
    if (step === "want") {
      setPicked((p) => (p.includes(c.value) ? p.filter((x) => x !== c.value) : [...p, c.value]));
      return;
    }
    if (step === "effort") {
      add({ role: "user", text: c.label });
      data.current.effort = c.value;
      return ask(c.value === "lots" || c.value === "notworking" ? "hours" : "want");
    }
    if (step === "level") {
      add({ role: "user", text: c.label });
      data.current.level = c.value;
      return afterLevel();
    }
    if (step === "story") {
      add({ role: "user", text: c.label });
      return ask("effort");
    }
    return send(c.label);
  }

  async function sendWants() {
    if (!picked.length) return;
    add({ role: "user", text: picked.join(", ") });
    data.current.want = picked;
    setPicked([]);
    await answer();
  }

  const chips: Chip[] =
    step === "problem" && msgs.filter((m) => m.role === "user").length === 0
      ? STARTERS.map((s) => ({ label: s, value: s }))
      : step === "level"
      ? LEVELS.map((l) => ({ label: l, value: l }))
      : step === "story"
      ? [{ label: "Skip, nothing more to add", value: "skip" }]
      : step === "effort"
      ? EFFORTS
      : step === "want"
      ? WANTS.map((w) => ({ label: w, value: w }))
      : step === "done"
      ? [{ label: "Ask something else", value: "" }]
      : [];

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] min-h-[520px] max-w-2xl mx-auto">
      {/* slim, context-aware product banner */}
      <Link
        href="/shop"
        className="flex items-center justify-between gap-3 text-xs sm:text-sm bg-sage-400/15 border border-sage-400/30 rounded-full px-4 py-2 mb-3 hover:bg-sage-400/25"
      >
        <span className="truncate">📘 想提升英文成绩？先从累积优质 vocab 开始</span>
        <span className="text-clay-700 font-medium whitespace-nowrap">View →</span>
      </Link>

      <div className="flex items-center justify-between mb-1 text-[11px] text-ink/50">
        <span>🛠 Design preview: replies are fake</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={demoNotFound} onChange={(e) => setDemoNotFound(e.target.checked)} />
          Preview &ldquo;Gary hasn&rsquo;t answered this&rdquo;
        </label>
      </div>

      {/* conversation */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 py-4">
        {msgs.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <p className="bg-clay-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-[15px] max-w-[80%] whitespace-pre-wrap">{m.text}</p>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/dolphin-icon.png" alt="" className="w-8 h-8 rounded-full shrink-0 mt-0.5" />
              <div className="max-w-[85%]">
                <p className="text-[15px] leading-7 whitespace-pre-wrap">{m.text}</p>
                {m.reel && (
                  <>
                    <a href="#" onClick={(e) => e.preventDefault()} className="mt-3 flex items-center gap-3 bg-white border border-ink/10 rounded-2xl p-3 hover:bg-cream-100 w-fit">
                      <span className="w-10 h-10 rounded-xl bg-clay-400/20 grid place-items-center text-lg">▶</span>
                      <span className="text-sm">
                        <b>Watch the reel I made about this</b>
                        <br />
                        <span className="text-ink/60 text-xs">Topical vs trial papers: which first? · Instagram</span>
                      </span>
                    </a>
                    <div className="flex items-center gap-2 mt-3 text-sm text-ink/50">
                      Helpful?
                      <button onClick={() => setVote("up")} className={vote === "up" ? "" : "opacity-40 hover:opacity-100"}>👍</button>
                      <button onClick={() => setVote("down")} className={vote === "down" ? "" : "opacity-40 hover:opacity-100"}>👎</button>
                    </div>
                  </>
                )}
                {m.notFound && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button className="btn-primary !py-2">Send my question to Gary</button>
                    <button className="btn-secondary !py-2">Copy &amp; open Instagram DM</button>
                  </div>
                )}
              </div>
            </div>
          )
        )}
        {typing && (
          <div className="flex gap-3 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dolphin-icon.png" alt="" className="w-8 h-8 rounded-full" />
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-ink/30 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          </div>
        )}
        <div ref={bottom} />
      </div>

      {/* quick replies + composer */}
      <div className="pt-2">
        {!typing && chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {chips.map((c) => {
              const on = step === "want" && picked.includes(c.value);
              return (
                <button
                  key={c.label}
                  onClick={() => (step === "done" ? (setInput(""), document.getElementById("gary-input")?.focus()) : pickChip(c))}
                  className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${on ? "bg-clay-600 text-white border-clay-600" : "bg-white border-ink/15 hover:border-clay-400"}`}
                >
                  {c.label}
                </button>
              );
            })}
            {step === "want" && picked.length > 0 && (
              <button onClick={sendWants} className="text-sm px-4 py-1.5 rounded-full bg-sage-500 text-white">Send ↑</button>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-end gap-2 bg-white border border-ink/15 rounded-3xl pl-4 pr-2 py-2 shadow-sm focus-within:border-clay-400"
        >
          <textarea
            id="gary-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={step === "hours" ? "e.g. 10 hours a week for 2 months" : step === "story" ? "Tell Gary the story…" : "Tell Gary what's going on…"}
            className="flex-1 resize-none outline-none bg-transparent text-[15px] py-1.5 max-h-32"
          />
          <button type="submit" disabled={!input.trim() || typing} className="w-9 h-9 rounded-full bg-clay-600 text-white disabled:opacity-30 grid place-items-center" aria-label="Send">
            ↑
          </button>
        </form>
        <p className="text-[11px] text-ink/40 text-center mt-2">
          Gary only answers from what he has shared. Questions are saved to improve answers; your name and email are not saved with them.
        </p>
      </div>
    </div>
  );
}
