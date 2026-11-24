"use server";
import { revalidatePath } from "next/cache";
import { requireProgramme } from "@/lib/programme/gate";
import { classKey, getProfile, saveProfile } from "@/lib/programme/profile";
import { build, resolveDay } from "@/lib/programme/dayflow";
import { buildCalendar } from "@/lib/programme/calendar";
import { opened, type Lang } from "@/lib/programme/content";
import { postComment, report, submitAnswer } from "@/lib/programme/daily";

export type Result = { error?: string; ok?: boolean; status?: string };

const DAY = /^\d{4}-\d{2}-\d{2}$/;

// "Today" is the sample date for the admin preview and the real Malaysia date for students (see gate.ts).
async function who() {
  const a = await requireProgramme();
  const p = await getProfile(a.userId);
  return { id: a.userId, today: a.today, state: p.state, cls: classKey(p), nickname: "同学" + a.userId.replace(/\D/g, "").slice(0, 4).padEnd(4, "0") };
}
const lang = (v: unknown): Lang | null => (v === "BM" || v === "BI" ? v : null);

export async function answerAction(_: Result, form: FormData): Promise<Result> {
  const a = await requireProgramme();
  const p = await getProfile(a.userId);
  const day = String(form.get("day")), l = lang(form.get("lang"));
  if (!DAY.test(day) || !l) return { error: "资料不对。" };
  if (!a.isAdmin && !opened(day, a.today)) return { error: "这一天还没开放。" };
  const found = resolveDay(buildCalendar(p.state), day, l, p.exams);
  if (!found || "exam" in found) return { error: "这一天没有任务。" };
  const built = build(found.week, found.day, form, p.instructionLang);
  if ("error" in built) return { error: built.error };
  const r = await submitAnswer(a.userId, day, l, built.answer, built.aiTask, day < a.today,
    { details: built.details, quizCorrect: built.quizCorrect, quizTotal: built.quizTotal, directFeedback: built.directFeedback, appendFeedback: built.appendFeedback, noFeedback: built.noFeedback });
  if (r.error) return { error: r.error };
  revalidatePath("/programme/today");
  return { ok: true, status: r.status };
}

/** The student picks whether the instructions are shown in English or Chinese. */
export async function setInstructionLangAction(value: "en" | "zh"): Promise<Result> {
  const a = await requireProgramme();
  const r = await saveProfile(a.userId, { instructionLang: value });
  revalidatePath("/programme/today");
  return r.error ? { error: r.error } : { ok: true };
}

export async function commentAction(_: Result, form: FormData): Promise<Result> {
  const u = await who();
  const day = String(form.get("day")), l = lang(form.get("lang"));
  if (!DAY.test(day) || !l || !opened(day, u.today)) return { error: "资料不对。" };
  const r = await postComment(u.id, u.cls, day, l, u.nickname, String(form.get("body") ?? ""));
  if (r.error) return { error: r.error };
  revalidatePath("/programme/today");
  return { ok: true, status: r.status };
}

export async function reportAction(_: Result, form: FormData): Promise<Result> {
  const u = await who();
  const kind = form.get("kind") === "ai_feedback" ? "ai_feedback" : "comment";
  const r = await report(u.id, kind, String(form.get("target")), String(form.get("note") ?? ""));
  if (r.error) return { error: r.error };
  return { ok: true };
}
