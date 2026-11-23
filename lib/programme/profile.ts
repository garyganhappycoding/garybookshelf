// SERVER-ONLY. Each student's own choices: state, Form 4 or 5, and their exam dates. Stored per account.
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_EXAMS, STATES, type Exam } from "./calendar";

export type Profile = { state: string; form: 4 | 5; exams: Exam[]; setupDone: boolean; instructionLang: "zh" | "en" };

// Gary's rule: classes are by state first, then by school year. No size limit.
export const classKey = (p: { state: string; form: number }) => `${p.state}-F${p.form}`;

export async function getProfile(userId: string): Promise<Profile> {
  const { data } = await createAdminClient().from("programme_profiles").select("*").eq("user_id", userId).maybeSingle();
  return {
    state: data?.state ?? "KL",
    form: data?.form === 5 ? 5 : 4,
    exams: Array.isArray(data?.exams) ? (data!.exams as Exam[]) : DEFAULT_EXAMS,
    setupDone: !!data?.setup_done,
    instructionLang: data?.instruction_lang === "en" ? "en" : "zh",
  };
}

const DATE = /^(\d{4}-\d{2}-\d{2})?$/;
export function cleanExams(input: unknown): Exam[] | null {
  if (!Array.isArray(input) || input.length > 12) return null;
  const out: Exam[] = [];
  for (const e of input) {
    const name = String(e?.name ?? "").slice(0, 60), start = String(e?.start ?? ""), end = String(e?.end ?? "");
    if (!DATE.test(start) || !DATE.test(end)) return null;
    out.push({ id: String(e?.id ?? "").slice(0, 20) || `e${out.length + 1}`, name, start, end });
  }
  return out;
}

export async function saveProfile(userId: string, patch: { state?: string; form?: number; exams?: unknown; setupDone?: boolean; instructionLang?: string }) {
  const cur = await getProfile(userId);
  const state = patch.state && STATES.some((s) => s.id === patch.state) ? patch.state : cur.state;
  const form = patch.form === 5 ? 5 : patch.form === 4 ? 4 : cur.form;
  const exams = patch.exams !== undefined ? cleanExams(patch.exams) ?? cur.exams : cur.exams;
  const { error } = await createAdminClient().from("programme_profiles").upsert(
    { user_id: userId, state, form, exams, setup_done: patch.setupDone ?? cur.setupDone, instruction_lang: patch.instructionLang === "en" ? "en" : patch.instructionLang === "zh" ? "zh" : cur.instructionLang, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  return error ? { error: "保存失败，请再试一次。" } : {};
}

export async function myHistoryRows(userId: string) {
  const { data } = await createAdminClient().from("programme_submissions").select("day, made_up").eq("user_id", userId);
  return (data ?? []).map((r) => ({ day: String(r.day), made_up: !!r.made_up }));
}
