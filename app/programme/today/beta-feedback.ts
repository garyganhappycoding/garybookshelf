"use server";
import { requireProgramme } from "@/lib/programme/gate";
import { createAdminClient } from "@/lib/supabase/admin";

export type BetaResult = { error?: string; ok?: boolean };

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIMES = ["lt10", "10to20", "20to30", "gt30"];
const HELPFUL = ["yes", "ok", "no"];
const clean = (v: FormDataEntryValue | null, n: number) => String(v ?? "").trim().slice(0, n);

// The daily feedback from a beta tester (one row per tester per day; sending again on the same day updates it).
export async function betaFeedbackAction(_: BetaResult, form: FormData): Promise<BetaResult> {
  const a = await requireProgramme();
  if (!a.beta && !a.isAdmin) return { error: "这个只给内测同学。" };
  const day = String(form.get("day"));
  if (!DAY.test(day) || day > a.today) return { error: "资料不对。" };
  const time = clean(form.get("time_spent"), 10), helpful = clean(form.get("ai_helpful"), 10);
  const badgesNote = clean(form.get("badges_note"), 800), aiWhy = clean(form.get("ai_why"), 800), stuck = clean(form.get("stuck"), 800), change = clean(form.get("change"), 800);
  if (!TIMES.includes(time) || !HELPFUL.includes(helpful)) return { error: "请先选「用了多久」和「AI 的反馈有没有帮到你」。" };
  if (stuck.length + change.length < 15) return { error: "请至少写一句具体的：哪里卡住了，或者你想我改什么。写得越具体，我越能改。" };
  const { error } = await createAdminClient().from("programme_beta_feedback").upsert(
    { user_id: a.userId, day, time_spent: time, ai_helpful: helpful, ai_why: aiWhy, badges_note: badgesNote, stuck, change, updated_at: new Date().toISOString() }, { onConflict: "user_id,day" });
  if (error) return { error: "没存成功，请再试一次。" };
  return { ok: true };
}
