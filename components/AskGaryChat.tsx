"use client";

// Ask Gary chat with saved history (ChatGPT-style sidebar). Replies come from /api/ask-gary,
// which answers ONLY from Gary's approved knowledge.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Step = "problem" | "level" | "story" | "effort" | "hours" | "want" | "done";
type CardInfo = { title: string; url: string; format: string; keyword: string | null };
type Msg = {
  id: number;
  role: "gary" | "user";
  text?: string;
  cards?: CardInfo[];
  product?: string | null;
  notFound?: boolean;
  question?: string;
  eventId?: string;
  safety?: boolean;
};
type Chip = { label: string; value: string };
type Conv = { id: string; title: string; updated_at: string };

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

const IG_DM = "https://ig.me/m/garybookshelf";
const PRODUCT_NAME: Record<string, { zh: string; en: string }> = {
  "English essay pack": { zh: "我的英文作文资料包", en: "My English essay pack" },
  "BM essay pack": { zh: "我的 BM 作文资料包", en: "My BM essay pack" },
};
const isZh = (t?: string) => /[\u4e00-\u9fff]/.test(t ?? "");

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400_000);
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 8) return "Previous 7 days";
  return "Older";
};

export default function AskGaryChat({ userId, initialLeft, limit, isAdmin }: { userId: string; initialLeft: number; limit: number; isAdmin: boolean }) {
  const supabase = useRef(createClient()).current;

  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState<Step>("problem");
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [drafts, setDrafts] = useState(true); // admin testing only: include unapproved entries
  const [left, setLeft] = useState(initialLeft);
  const [votes, setVotes] = useState<Record<string, 1 | -1>>({});
  const data = useRef({ problem: "", story: "", level: "", effort: "", hours: "", want: [] as string[] });
  const idRef = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);
  const greetToken = useRef(0);

  // ---------- history (database) ----------
  const loadConvs = useCallback(async () => {
    const { data: rows } = await supabase
      .from("ask_gary_conversations")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    setConvs((rows as Conv[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    void loadConvs();
  }, [loadConvs]);

  async function ensureConv(firstText: string): Promise<string | null> {
    if (activeRef.current) return activeRef.current;
    const title = firstText.length > 48 ? firstText.slice(0, 48) + "…" : firstText;
    const { data: row, error } = await supabase
      .from("ask_gary_conversations")
      .insert({ user_id: userId, title })
      .select("id,title,updated_at")
      .single();
    if (error || !row) return null; // chat still works, it just isn't saved
    activeRef.current = row.id;
    setActiveId(row.id);
    setConvs((c) => [row as Conv, ...c]);
    return row.id;
  }

  async function persist(role: "user" | "gary", text: string, meta?: Record<string, unknown>) {
    const id = activeRef.current;
    if (!id) return;
    await supabase.from("ask_gary_messages").insert({ conversation_id: id, user_id: userId, role, content: text, meta: meta ?? null });
    const now = new Date().toISOString();
    await supabase.from("ask_gary_conversations").update({ updated_at: now }).eq("id", id);
    setConvs((c) => [...c.filter((x) => x.id === id).map((x) => ({ ...x, updated_at: now })), ...c.filter((x) => x.id !== id)]);
  }

  async function openConv(id: string) {
    if (typing) return;
    greetToken.current++;
    const { data: rows } = await supabase
      .from("ask_gary_messages")
      .select("role,content,meta,seq")
      .eq("conversation_id", id)
      .order("seq", { ascending: true });
    activeRef.current = id;
    setActiveId(id);
    idRef.current = 0;
    setMsgs(
      (rows ?? []).map((r: any) => ({
        id: ++idRef.current,
        role: r.role,
        text: r.content,
        cards: r.meta?.cards,
        product: r.meta?.product,
        notFound: r.meta?.notFound,
        question: r.meta?.question,
        eventId: r.meta?.eventId,
        safety: r.meta?.safety,
      }))
    );
    setStep("done");
    setPicked([]);
    setSidebarOpen(false);
  }

  async function deleteConv(id: string) {
    if (!confirm("Delete this conversation?")) return;
    await supabase.from("ask_gary_conversations").delete().eq("id", id);
    setConvs((c) => c.filter((x) => x.id !== id));
    if (activeRef.current === id) newChat();
  }

  // ---------- chat helpers ----------
  const metaOf = (m: Omit<Msg, "id" | "role" | "text">) => ({ cards: m.cards, product: m.product, notFound: m.notFound, question: m.question, eventId: m.eventId, safety: m.safety });
  const add = (m: Omit<Msg, "id">) => setMsgs((x) => [...x, { ...m, id: ++idRef.current }]);

  const garySays = (m: Omit<Msg, "id" | "role">, delay = 700, token?: number) =>
    new Promise<void>((res) => {
      setTyping(true);
      setTimeout(() => {
        if (token !== undefined && token !== greetToken.current) {
          setTyping(false);
          return res();
        }
        setTyping(false);
        add({ role: "gary", ...m });
        void persist("gary", m.text ?? "", metaOf(m));
        res();
      }, delay);
    });

  // UI-only greeting for an empty chat (not saved)
  const greet = useCallback(() => {
    const token = ++greetToken.current;
    const show = (text: string, delay: number) =>
      new Promise<void>((res) => {
        setTyping(true);
        setTimeout(() => {
          if (token !== greetToken.current) {
            setTyping(false);
            return res();
          }
          setTyping(false);
          setMsgs((x) => [...x, { id: ++idRef.current, role: "gary", text }]);
          res();
        }, delay);
      });
    void (async () => {
      await show("Hey, I'm Gary 👋 I've been through SPM too, so I know how stressful it can feel.", 400);
      await show(`Tell me what's on your mind. The more you tell me (what happened, what you've tried), the better I can help. (Each student can ask ${limit} questions a day.)`, 900);
    })();
  }, [limit]);

  function newChat() {
    activeRef.current = null;
    setActiveId(null);
    setMsgs([]);
    idRef.current = 0;
    setStep("problem");
    setPicked([]);
    setInput("");
    setTyping(false);
    data.current = { problem: "", story: "", level: "", effort: "", hours: "", want: [] };
    setSidebarOpen(false);
    greet();
  }

  useEffect(() => {
    greet();
    return () => {
      greetToken.current++;
    };
  }, [greet]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, typing, step]);

  async function addUser(text: string) {
    await ensureConv(text);
    add({ role: "user", text });
    await persist("user", text);
  }

  // ---------- scripted conversation flow (replaced by the real bot later) ----------
  async function ask(next: Step) {
    setStep(next);
    if (next === "level") await garySays({ text: "Got it, thanks for sharing. Which level are you in right now?" });
    if (next === "story")
      await garySays({ text: "Can you tell me the story behind it? When did it start, what's stressing you, and what have you tried so far? Write as much as you like, it really helps me give a proper answer." }, 900);
    if (next === "effort") await garySays({ text: "And how much have you done so far? It's okay if you haven't started, I won't judge 🙂" });
    if (next === "hours") await garySays({ text: "About how many hours a week, and for how long? A rough number is fine." });
    if (next === "want") await garySays({ text: "Last one: what would help you most from me? You can pick more than one." });
  }

  const afterLevel = () => ask(data.current.story.length >= 80 ? "effort" : "story");

  // add a Gary message immediately (used for the real answer)
  function sayNow(m: Omit<Msg, "id" | "role">) {
    add({ role: "gary", ...m });
    void persist("gary", m.text ?? "", metaOf(m));
  }

  async function answer() {
    setStep("done");
    const id = activeRef.current;
    if (id) await supabase.from("ask_gary_conversations").update({ context: data.current }).eq("id", id);
    setTyping(true);
    let json: any = null;
    let ok = false;
    try {
      const res = await fetch("/api/ask-gary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data.current, conversationId: activeRef.current, drafts: isAdmin && drafts }),
      });
      json = await res.json();
      ok = res.ok;
    } catch {
      /* network error handled below */
    }
    setTyping(false);
    if (typeof json?.questionsLeft === "number") setLeft(json.questionsLeft);
    if (!ok) return sayNow({ text: json?.error ?? "Sorry, something went wrong. You were not charged a question. Please try again." });

    const zh = json.language === "zh";
    const question = [data.current.problem, data.current.story].filter(Boolean).join("\n\n");
    if (json.kind === "safety") return sayNow({ text: json.reply, safety: true, eventId: json.eventId });
    if (json.kind === "not_found")
      return sayNow({
        notFound: true,
        question,
        eventId: json.eventId,
        text: zh
          ? "这个问题 Gary 还没有讲过，所以我不乱猜。🙏 我已经帮你把问题存下来给 Gary 了，他看到之后会自己回答。你也可以直接把问题私信给他。"
          : "Gary hasn't answered this one before, so I won't guess. 🙏 I've saved your question for Gary, and he will answer it himself. You can also send it to him directly on Instagram.",
      });
    sayNow({ text: json.reply, cards: json.cards, product: json.product, eventId: json.eventId });
  }

  async function vote(eventId: string, v: 1 | -1) {
    setVotes((x) => ({ ...x, [eventId]: v }));
    await fetch("/api/ask-gary/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId, vote: v }) });
  }

  function dmGary(question: string) {
    void navigator.clipboard?.writeText(question).catch(() => {});
    window.open(IG_DM, "_blank", "noopener");
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || typing) return;
    setInput("");
    await addUser(text);

    if (step === "done") {
      data.current = { problem: text, story: text.length >= 80 ? text : "", level: detectLevel(text) ?? "", effort: "", hours: "", want: [] };
        if (text.length < 15) {
        await garySays({ text: "Can you tell me a bit more? What happened, and what have you tried so far?" });
        return setStep("problem");
      }
      return data.current.level ? afterLevel() : ask("level");
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
      data.current.level = detectLevel(text) ?? text;
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
    if (step === "hours") {
      data.current.hours = text;
      return ask("want");
    }
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
      await addUser(c.label);
      data.current.effort = c.value;
      return ask(c.value === "lots" || c.value === "notworking" ? "hours" : "want");
    }
    if (step === "level") {
      await addUser(c.label);
      data.current.level = c.value;
      return afterLevel();
    }
    if (step === "story") {
      await addUser(c.label);
      return ask("effort");
    }
    return send(c.label);
  }

  async function sendWants() {
    if (!picked.length) return;
    const text = picked.join(", ");
    await addUser(text);
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
      : step === "done" && msgs.length > 0
      ? [{ label: "Ask something else", value: "" }]
      : [];

  // group conversations by day
  const groups: { label: string; items: Conv[] }[] = [];
  for (const c of convs) {
    const label = dayLabel(c.updated_at);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(c);
    else groups.push({ label, items: [c] });
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] min-h-[560px] border-t border-ink/10">
      {/* ---------- sidebar ---------- */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 bg-ink/30 z-20" onClick={() => setSidebarOpen(false)} />}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform fixed md:static z-30 top-0 bottom-0 left-0 w-72 md:w-64 shrink-0 bg-cream-100 border-r border-ink/10 flex flex-col`}
      >
        <div className="p-3">
          <button onClick={newChat} className="w-full flex items-center gap-2 bg-white border border-ink/15 hover:border-clay-400 rounded-xl px-3 py-2.5 text-sm font-medium">
            <span className="text-lg leading-none">＋</span> New chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {convs.length === 0 && <p className="text-xs text-ink/50 px-3 py-2">Your past conversations will show up here.</p>}
          {groups.map((g) => (
            <div key={g.label} className="mb-3">
              <p className="text-[11px] uppercase tracking-wide text-ink/40 px-3 py-1">{g.label}</p>
              {g.items.map((c) => (
                <div
                  key={c.id}
                  className={`group flex items-center rounded-lg ${activeId === c.id ? "bg-white shadow-sm" : "hover:bg-white/60"}`}
                >
                  <button onClick={() => openConv(c.id)} className="flex-1 min-w-0 text-left px-3 py-2 text-sm truncate">
                    {c.title}
                  </button>
                  <button
                    onClick={() => deleteConv(c.id)}
                    aria-label="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 px-2 text-ink/40 hover:text-red-600 text-sm"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="text-[11px] text-ink/50 px-4 py-3 border-t border-ink/10">
          <p>Questions left today: <b className="text-ink/70">{isAdmin ? "unlimited (admin)" : `${left} / ${limit}`}</b></p>
          <p className="mt-1 text-ink/40">Only you can see your conversations.</p>
        </div>
      </aside>

      {/* ---------- chat ---------- */}
      <div className="flex-1 min-w-0 flex flex-col px-4 sm:px-6">
        <div className="flex items-center gap-2 py-2">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-xl px-2 -ml-2" aria-label="Open history">
            ☰
          </button>
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-between gap-3 text-xs sm:text-sm bg-sage-400/15 border border-sage-400/30 rounded-full px-4 py-1.5 hover:bg-sage-400/25"
          >
            <span className="truncate">📘 想提升英文成绩？先从累积优质 vocab 开始</span>
            <span className="text-clay-700 font-medium whitespace-nowrap">View →</span>
          </Link>
        </div>
        {isAdmin && (
          <div className="flex items-center justify-between mb-1 text-[11px] text-ink/50 max-w-2xl w-full mx-auto">
            <span>🛠 Admin preview</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={drafts} onChange={(e) => setDrafts(e.target.checked)} />
              Testing: include entries not approved yet
            </label>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-5 py-4 max-w-2xl w-full mx-auto">
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
                  {m.cards?.map((c) => (
                    <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-3 bg-white border border-ink/10 rounded-2xl p-3 hover:bg-cream-100 w-fit max-w-full">
                      <span className="w-10 h-10 rounded-xl bg-clay-400/20 grid place-items-center text-lg shrink-0">▶</span>
                      <span className="text-sm min-w-0">
                        <b>{isZh(m.text) ? (c.format === "Carousel" ? "看我关于这个的帖子" : "看我关于这个的 reel") : c.format === "Carousel" ? "See my post about this" : "Watch my reel about this"}</b>
                        <br />
                        <span className="text-ink/60 text-xs block truncate">{c.title} · Instagram</span>
                        {c.keyword && (
                          <span className="text-sage-600 text-xs block">
                            {isZh(m.text) ? `在 reel 下留言「${c.keyword}」可以拿到我的免费资料` : `Comment “${c.keyword}” on it to get my free resource`}
                          </span>
                        )}
                      </span>
                    </a>
                  ))}
                  {m.product && (
                    <Link href="/shop" className="mt-3 flex items-center justify-between gap-3 bg-sage-400/15 border border-sage-400/30 rounded-2xl px-4 py-2.5 text-sm hover:bg-sage-400/25 w-fit max-w-full">
                      <span>📘 {PRODUCT_NAME[m.product]?.[isZh(m.text) ? "zh" : "en"] ?? m.product}</span>
                      <span className="text-clay-700 font-medium whitespace-nowrap">{isZh(m.text) ? "去看看 →" : "View →"}</span>
                    </Link>
                  )}
                  {m.eventId && !m.notFound && !m.safety && (
                    <div className="flex items-center gap-2 mt-3 text-sm text-ink/50">
                      {isZh(m.text) ? "有帮助吗？" : "Helpful?"}
                      <button onClick={() => vote(m.eventId!, 1)} className={votes[m.eventId] === 1 ? "" : "opacity-40 hover:opacity-100"}>👍</button>
                      <button onClick={() => vote(m.eventId!, -1)} className={votes[m.eventId] === -1 ? "" : "opacity-40 hover:opacity-100"}>👎</button>
                    </div>
                  )}
                  {m.notFound && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button onClick={() => dmGary(m.question ?? "")} className="btn-secondary !py-2">
                        {isZh(m.text) ? "复制问题并打开 Instagram 私信" : "Copy my question & open Instagram DM"}
                      </button>
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

        <div className="pt-2 pb-3 max-w-2xl w-full mx-auto">
          {!typing && chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {chips.map((c) => {
                const on = step === "want" && picked.includes(c.value);
                return (
                  <button
                    key={c.label}
                    onClick={() => (step === "done" ? document.getElementById("gary-input")?.focus() : pickChip(c))}
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
              void send(input);
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
                  void send(input);
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
            You can ask {limit} questions a day. Gary only answers from what he has shared. Your questions are saved so Gary can improve his answers (he sees them without your name) and to show your history.
          </p>
        </div>
      </div>
    </div>
  );
}
