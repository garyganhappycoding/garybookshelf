// SERVER-ONLY. Finds today's day card for a student, hides what must stay hidden until they hand in, and grades what they hand in.
import { parse, type Calendar } from "./calendar";
import { dayKeyFor, forStudent, getWeek } from "./content/index";
import type { Block, Day, Week } from "./week-content";
import { clean } from "@/lib/community";

export type Ilang = "en" | "zh";

export function resolveDay(cal: Calendar, day: string, lang: "BI" | "BM"): { week: Week; day: Day } | null {
  const d = parse(day);
  const n = cal.weekOf(d);
  if (!n) return null;
  const week = getWeek(lang, n);
  if (!week) return null;
  const key = dayKeyFor(cal.group, d.getDay());
  const card = week.days.find((x) => x.key === key);
  return card ? { week, day: card } : null;
}

function scrub<T>(v: T): T {
  if (typeof v === "string") return forStudent(v) as unknown as T;
  if (Array.isArray(v)) return v.map(scrub) as unknown as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, scrub(x)])) as T;
  return v;
}

/** The blocks a student may see. Before they hand in: no reveal blocks and no quiz answers (the answer key never leaves the server). */
export function studentBlocks(day: Day, submitted: boolean): Block[] {
  return day.blocks
    .filter((b) => submitted || !b.reveal)
    .map((b) => (b.type === "quiz" && !submitted ? { ...b, rows: b.rows.map((r) => ({ zh: r.zh, answer: "" })) } : b))
    .map(scrub);
}

const core = (w: string) => w.replace(/…/g, "").replace(/\s+/g, " ").trim();
const norm = (s: string) => core(s).toLowerCase().replace(/[^\p{L}\p{N}\s'’-]/gu, "").replace(/\s+/g, " ").trim();
const tok = (s: string) => s.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

export type Built =
  | { error: string }
  | { answer: string; details: Record<string, unknown>; quizCorrect?: number; quizTotal?: number; directFeedback?: string; appendFeedback?: string; aiTask: string };

const T = (i: Ilang, zh: string, en: string) => (i === "zh" ? zh : en);

export function aiTask(week: Week, day: Day) {
  const steps = day.blocks.find((b) => b.type === "steps");
  const checks = day.blocks.find((b) => b.type === "checks");
  const en = (l: { en: string }) => l.en;
  const vocab = week.days.flatMap((d) => d.blocks).find((b) => b.type === "vocab");
  const words = vocab && vocab.type === "vocab" ? vocab.rows.map((r) => r.word.replace(/…/g, "").trim()).join("; ") : "";
  return `This week's 10 words are: ${words}. ${day.label.en} of the week on "${week.essay}". Task: ${steps && steps.type === "steps" ? steps.items.map(en).join(" ") : ""} ` +
    `The AI should check: ${checks && checks.type === "checks" ? checks.items.map(en).join(" ") : "that the answer fits the task"} Do not check or mention word counts.`;
}

export function build(week: Week, day: Day, form: FormData, ilang: Ilang): Built {
  const r = day.response;
  if (!r || r.kind === "none") return { error: T(ilang, "今天没有要交的东西。", "There is nothing to hand in today.") };

  if (r.kind === "text") {
    const text = clean(String(form.get("answer") ?? ""), 3000);
    if (text.length < 2) return { error: T(ilang, "请先写下你的答案。", "Please write your answer first.") };
    return { answer: text, details: {}, aiTask: aiTask(week, day) };
  }

  if (r.kind === "sentences") {
    const sentences = r.words.map((_, i) => clean(String(form.get(`s${i}`) ?? ""), 400));
    if (sentences.some((s) => s.length < 2)) return { error: T(ilang, "请把 10 个句子都写完。", "Please write all 10 sentences.") };
    const quiz = day.blocks.find((b) => b.type === "quiz");
    const rows = quiz && quiz.type === "quiz" ? quiz.rows : [];
    const items = rows.map((row, i) => {
      const given = clean(String(form.get(`q${i}`) ?? ""), 200);
      return { zh: row.zh, given, answer: row.answer, ok: !!given && norm(given) === norm(row.answer) };
    });
    const correct = items.filter((x) => x.ok).length;
    const line = rows.length ? T(ilang, `词汇测验：${correct}/${rows.length}`, `Vocabulary quiz: ${correct}/${rows.length}`) : "";
    return {
      answer: sentences.map((s, i) => `${i + 1}. ${r.words[i].word} — ${s}`).join("\n"),
      details: { sentences, quiz: items }, quizCorrect: rows.length ? correct : undefined, quizTotal: rows.length || undefined,
      appendFeedback: line, aiTask: aiTask(week, day),
    };
  }

  // highlight
  let marks: { w: string; c: 1 | 2 }[] = [];
  try { marks = JSON.parse(String(form.get("hl") ?? "[]")); } catch { /* ignore */ }
  marks = marks.filter((m) => m && typeof m.w === "string" && (m.c === 1 || m.c === 2)).slice(0, 400);
  if (!marks.length) return { error: T(ilang, "请先标出一些词。", "Please highlight some words first.") };
  const blueSet = new Set(marks.filter((m) => m.c === 1).map((m) => tok(m.w)));
  const red = marks.filter((m) => m.c === 2).map((m) => tok(m.w));
  const key = day.blocks.find((b) => b.id === "answer");
  const keyBlue = key && key.type === "text" ? (key.highlight ?? []).filter((h) => h.color === 1).map((h) => h.phrase) : [];
  const found = keyBlue.filter((p) => p.split(/\s+/).map(tok).every((t) => blueSet.has(t)));
  const feedback = keyBlue.length
    ? T(ilang, `你用蓝色标出了本周词表里的 ${found.length}/${keyBlue.length} 个词，另外用红色选了 ${red.length} 个你觉得好的词。对照下面的答案看看。`,
        `You found ${found.length} of the ${keyBlue.length} words from this week's list (blue) and picked ${red.length} words you like (red). Compare with the answer below.`)
    : T(ilang, `这篇范文里没有本周词表的词。你用红色选了 ${red.length} 个你觉得好的词。`, `None of this week's words are in this essay. You picked ${red.length} words you like (red).`);
  return {
    answer: `Blue: ${[...blueSet].join(", ")}\nRed: ${red.join(", ")}`,
    details: { marks, found, keyBlue }, directFeedback: feedback, aiTask: "",
  };
}
