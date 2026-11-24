// SERVER-ONLY. Finds today's day card for a student, hides what must stay hidden until they hand in, and grades what they hand in.
import { addDays, key, parse, type Calendar } from "./calendar";
import { dayKeyFor, forStudent, getWeek } from "./content/index";
import type { Block, Day, Week } from "./week-content";
import { clean } from "@/lib/community";

export type Ilang = "en" | "zh";

/**
 * Which content week a date is. Exam weeks carry NO content (Gary, 24 Nov 2026): the weekly content counts only the school weeks
 * that are not exam weeks, in order, using the student's own exam dates.
 */
export function contentWeekOf(cal: Calendar, exams: { start: string; end: string }[], d: Date): { n: number } | { exam: true } | null {
  const total = cal.weekOf(d);
  if (!total) return null;
  const mondays = Object.entries(cal.weekNo).sort((a, b) => a[1] - b[1]).map(([m]) => m);
  let n = 0;
  for (let w = 1; w <= total; w++) {
    const m = parse(mondays[w - 1]);
    const from = key(addDays(m, -1)), to = key(addDays(m, 6)); // a Group A week starts on the Sunday before its Monday
    const isExam = exams.some((e) => e.start && e.end && e.start <= to && e.end >= from);
    if (w === total) return isExam ? { exam: true } : { n: n + 1 };
    if (!isExam) n += 1;
  }
  return null;
}

export type Resolved = { week: Week; day: Day } | { exam: true } | null;

export function resolveDay(cal: Calendar, day: string, lang: "BI" | "BM", exams: { start: string; end: string }[] = []): Resolved {
  const d = parse(day);
  const cw = contentWeekOf(cal, exams, d);
  if (!cw) return null;
  if ("exam" in cw) return { exam: true };
  const week = getWeek(lang, cw.n);
  if (!week) return null;
  const k = dayKeyFor(cal.group, d.getDay());
  const card = week.days.find((x) => x.key === k);
  return card ? { week, day: card } : null;
}

function scrub<T>(v: T): T {
  if (typeof v === "string") return forStudent(v) as unknown as T;
  if (Array.isArray(v)) return v.map(scrub) as unknown as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, scrub(x)])) as T;
  return v;
}

/** The blocks a student may see. Before they hand in: no reveal blocks (the model answers never leave the server). The flash-card words are not secret. */
export function studentBlocks(day: Day, submitted: boolean): Block[] {
  return day.blocks
    .filter((b) => submitted || !b.reveal)
    .map(scrub);
}

const core = (w: string) => w.replace(/…/g, "").replace(/\s+/g, " ").trim();
const norm = (s: string) => core(s).toLowerCase().replace(/[^\p{L}\p{N}\s'’-]/gu, "").replace(/\s+/g, " ").trim();
const tok = (s: string) => s.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

export type Built =
  | { error: string }
  | { answer: string; details: Record<string, unknown>; quizCorrect?: number; quizTotal?: number; directFeedback?: string; appendFeedback?: string; noFeedback?: boolean; aiTask: string };

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
    // flash cards: the student marks each card "remembered" (1) or "not yet" (0)
    const flags = String(form.get("qk") ?? "");
    const items = rows.map((row, i) => ({ zh: row.zh, answer: row.answer, known: flags[i] === "1" }));
    const correct = items.filter((x) => x.known).length;
    const line = rows.length ? T(ilang, `词汇小测验：记得 ${correct}/${rows.length}`, `Vocabulary cards: remembered ${correct}/${rows.length}`) : "";
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
  const blue = marks.filter((m) => m.c === 1).map((m) => tok(m.w));
  const red = marks.filter((m) => m.c === 2).map((m) => tok(m.w));
  return {
    answer: `Blue: ${[...new Set(blue)].join(", ")}
Red: ${[...new Set(red)].join(", ")}`,
    details: { marks }, noFeedback: true, aiTask: "",
  };
}
