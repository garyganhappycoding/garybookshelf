"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProgrammeAdmin } from "@/lib/programme/gate";
import { buildCalendar, DEMO_TODAY } from "@/lib/programme/calendar";
import { opened, taskFor, type Lang } from "@/lib/programme/content";
import { postComment, report, submitAnswer } from "@/lib/programme/daily";

export type Result = { error?: string; ok?: boolean; status?: string };

// "Today" is the sample date until launch. At launch it becomes the real Malaysia date (see content.ts todayMY).
const NOW = DEMO_TODAY;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

async function who() {
  await requireProgrammeAdmin(); // pilot is admin-only for now
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { id: user.id, nickname: "同学" + user.id.replace(/\D/g, "").slice(0, 4).padEnd(4, "0") } : null;
}
const lang = (v: unknown): Lang | null => (v === "BM" || v === "BI" ? v : null);

export async function answerAction(_: Result, form: FormData): Promise<Result> {
  const u = await who();
  const day = String(form.get("day")), l = lang(form.get("lang")), state = String(form.get("state"));
  if (!u) return { error: "请先登录。" };
  if (!DAY.test(day) || !l) return { error: "资料不对。" };
  if (!opened(day, NOW)) return { error: "这一天还没开放。" };
  const t = taskFor(buildCalendar(state), day, l);
  if (!t) return { error: "这一天没有任务。" };
  const r = await submitAnswer(u.id, day, l, String(form.get("answer") ?? ""), t.instructions, day < NOW);
  if (r.error) return { error: r.error };
  revalidatePath("/programme/today");
  return { ok: true, status: r.status };
}

export async function commentAction(_: Result, form: FormData): Promise<Result> {
  const u = await who();
  const day = String(form.get("day")), l = lang(form.get("lang"));
  if (!u) return { error: "请先登录。" };
  if (!DAY.test(day) || !l || !opened(day, NOW)) return { error: "资料不对。" };
  const r = await postComment(u.id, String(form.get("state")), day, l, u.nickname, String(form.get("body") ?? ""));
  if (r.error) return { error: r.error };
  revalidatePath("/programme/today");
  return { ok: true, status: r.status };
}

export async function reportAction(_: Result, form: FormData): Promise<Result> {
  const u = await who();
  if (!u) return { error: "请先登录。" };
  const kind = form.get("kind") === "ai_feedback" ? "ai_feedback" : "comment";
  const r = await report(u.id, kind, String(form.get("target")), String(form.get("note") ?? ""));
  if (r.error) return { error: r.error };
  return { ok: true };
}
