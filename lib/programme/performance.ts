// SERVER-ONLY. How each student is doing, for Gary's admin pages. Reads the same tables the student pages write to.
import { createAdminClient } from "@/lib/supabase/admin";
import { buildCalendar, facts, parse, realHistory, type History } from "./calendar";
import { classKey } from "./profile";
import { todayMY } from "./content";
import { mySets } from "./results";

export const QUIET_DAYS = 3; // flagged as quiet after this many days with no answer

export type StudentRow = {
  userId: string; email: string; groupNo: number | null; cls: string; state: string; form: number;
  schoolDays: number; done: number; makeup: number; missed: number; completion: number; streak: number;
  bi: number; bm: number; lastActive: string | null; quietDays: number | null;
  needGary: number; comments: number; quizAvg: number | null;
};

const daysBetween = (a: string, b: string) => Math.floor((parse(b).getTime() - parse(a).getTime()) / 86400000);

/** One row per paid, confirmed student. The admin's own test answers are not included. */
export async function studentRows(today = todayMY()): Promise<StudentRow[]> {
  const admin = createAdminClient();
  const { data: members } = await admin.from("programme_members").select("user_id, email, group_id, status, paused").eq("status", "confirmed");
  const ids = (members ?? []).map((m) => m.user_id).filter(Boolean) as string[];
  if (!ids.length) return [];
  const [{ data: groups }, { data: profiles }, { data: subs }, { data: comments }] = await Promise.all([
    admin.from("programme_groups").select("id, group_no, status").in("id", [...new Set((members ?? []).map((m) => m.group_id))]),
    admin.from("programme_profiles").select("user_id, state, form").in("user_id", ids),
    admin.from("programme_submissions").select("user_id, day, lang, made_up, ai_status, quiz_correct, quiz_total, created_at, updated_at").in("user_id", ids),
    admin.from("programme_comments").select("user_id").in("user_id", ids),
  ]);
  const gno = new Map((groups ?? []).filter((g) => g.status === "active").map((g) => [g.id, g.group_no as number]));
  const prof = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return (members ?? []).filter((m) => m.user_id && gno.has(m.group_id)).map((m) => {
    const p = prof.get(m.user_id);
    const state = p?.state ?? "KL", form = p?.form === 5 ? 5 : 4;
    const mine = (subs ?? []).filter((s) => s.user_id === m.user_id);
    const cal = buildCalendar(state);
    const history: History = realHistory(cal, today, mine.map((s) => ({ day: String(s.day), made_up: !!s.made_up })));
    const vals = Object.values(history);
    const done = vals.filter((v) => v === "done").length, makeup = vals.filter((v) => v === "makeup").length, missed = vals.filter((v) => v === "missed").length;
    const last = mine.map((s) => String(s.updated_at ?? s.created_at)).sort().pop() ?? null;
    const quizzes = mine.filter((s) => s.quiz_total);
    const quizAvg = quizzes.length ? Math.round((quizzes.reduce((n, s) => n + (s.quiz_correct ?? 0) / (s.quiz_total as number), 0) / quizzes.length) * 100) : null;
    return {
      userId: m.user_id, email: m.email, groupNo: gno.get(m.group_id) ?? null, cls: classKey({ state, form }), state, form,
      schoolDays: vals.length, done, makeup, missed,
      completion: vals.length ? Math.round(((done + makeup) / vals.length) * 100) : 0,
      streak: facts(cal, today, history).streak,
      bi: mine.filter((s) => s.lang === "BI").length, bm: mine.filter((s) => s.lang === "BM").length,
      lastActive: last, quietDays: last ? daysBetween(last.slice(0, 10), today) : null,
      needGary: mine.filter((s) => s.ai_status === "waiting_gary" || s.ai_status === "failed").length,
      comments: (comments ?? []).filter((c) => c.user_id === m.user_id).length,
      quizAvg,
    };
  });
}

export type ClassRow = { cls: string; students: number; avgCompletion: number; avgStreak: number; quiet: number };
export function byClass(rows: StudentRow[]): ClassRow[] {
  const m = new Map<string, StudentRow[]>();
  rows.forEach((r) => m.set(r.cls, [...(m.get(r.cls) ?? []), r]));
  return [...m.entries()].map(([cls, rs]) => ({
    cls, students: rs.length,
    avgCompletion: Math.round(rs.reduce((n, r) => n + r.completion, 0) / rs.length),
    avgStreak: Math.round((rs.reduce((n, r) => n + r.streak, 0) / rs.length) * 10) / 10,
    quiet: rs.filter((r) => r.quietDays === null || r.quietDays >= QUIET_DAYS).length,
  })).sort((a, b) => a.cls.localeCompare(b.cls));
}

/** Everything about one student: the numbers, every answer (with AI feedback and earlier versions) and their comments. */
export async function studentDetail(userId: string, today = todayMY()) {
  const admin = createAdminClient();
  const row = (await studentRows(today)).find((r) => r.userId === userId) ?? null;
  const [{ data: subs }, { data: log }, { data: comments }] = await Promise.all([
    admin.from("programme_submissions").select("*").eq("user_id", userId).order("day", { ascending: false }),
    admin.from("programme_answer_log").select("submission_id, answer, details, created_at").eq("user_id", userId).order("created_at"),
    admin.from("programme_comments").select("day, lang, body, status, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);
  return { row, subs: subs ?? [], log: log ?? [], comments: comments ?? [], results: await mySets(userId) };
}
