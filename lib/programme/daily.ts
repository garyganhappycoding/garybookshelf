// SERVER-ONLY. Answers, AI feedback, classmate comments, reports. Admin-only pilot for now (see gate.ts).
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyGary, clean } from "@/lib/community";
import { feedbackOn, screenComment } from "./ai";
import type { Lang } from "./content";

// Rules from Gary: no links, phone numbers, emails or @handles in comments.
export const looksUnsafe = (t: string) => /https?:\/\/|www\.|\.(com|my|net|org)\b|@\w|\b\d{8,}\b|\d{3}[- ]?\d{7,}/i.test(t);

export async function submitAnswer(userId: string, day: string, lang: Lang, answer: string, task: string, madeUp: boolean) {
  const text = clean(answer, 3000);
  if (text.length < 2) return { error: "请先写下你的答案。" };
  const admin = createAdminClient();
  const { data: row, error } = await admin.from("programme_submissions")
    .upsert({ user_id: userId, day, lang, answer: text, made_up: madeUp }, { onConflict: "user_id,day,lang" }).select("id").single();
  if (error || !row) return { error: "保存失败，请再试一次。" };

  const fb = await feedbackOn(task, lang, text);
  if (!fb) {
    await admin.from("programme_submissions").update({ ai_status: "failed" }).eq("id", row.id);
    return { id: row.id, feedback: null as string | null, status: "failed" as const };
  }
  if (!fb.sure) {
    await admin.from("programme_submissions").update({ ai_status: "waiting_gary", ai_feedback: null }).eq("id", row.id);
    await notifyGary("🤔 陪你读书：AI 没把握", `${day} ${lang}：这份答案 AI 不确定怎么反馈，等你来看。`, "/admin/programme-inbox");
    return { id: row.id, feedback: null, status: "waiting_gary" as const };
  }
  await admin.from("programme_submissions").update({ ai_status: "done", ai_feedback: fb.feedback }).eq("id", row.id);
  return { id: row.id, feedback: fb.feedback, status: "done" as const };
}

export async function hasSubmitted(userId: string, day: string, lang: Lang) {
  const { data } = await createAdminClient().from("programme_submissions").select("id, ai_feedback, ai_status").eq("user_id", userId).eq("day", day).eq("lang", lang).maybeSingle();
  return data;
}

export async function postComment(userId: string, classKey: string, day: string, lang: Lang, nickname: string, body: string) {
  const text = clean(body, 600);
  if (!text) return { error: "请先写留言。" };
  if (looksUnsafe(text)) return { error: "留言里不能有链接、电话、邮箱或 @账号。" };
  // answer first, then see classmates
  if (!(await hasSubmitted(userId, day, lang))) return { error: "先交上你自己的答案，才能留言。" };
  const admin = createAdminClient();
  const screen = await screenComment(text);
  const status = screen && screen.ok && screen.sure ? "visible" : screen && !screen.ok && screen.sure ? "hidden" : "pending";
  const { data: row, error } = await admin.from("programme_comments")
    .insert({ user_id: userId, class_key: classKey, day, lang, nickname: clean(nickname, 30) || "同学", body: text, status, screen_note: screen?.why ?? "AI 无法检查" }).select("id").single();
  if (error || !row) return { error: "留言失败，请再试一次。" };
  if (status !== "visible") {
    await notifyGary(status === "hidden" ? "🚫 陪你读书：一条留言被挡下" : "🕵️ 陪你读书：一条留言等你决定", `${text.slice(0, 200)}\nAI：${screen?.why ?? "无法检查"}`, "/admin/programme-inbox");
  }
  return { id: row.id, status: status as "visible" | "pending" | "hidden" };
}

/** Visible comments for a class/day/lang. Only call after the student has submitted their own answer. */
export async function listComments(userId: string, classKey: string, day: string, lang: Lang) {
  const admin = createAdminClient();
  const { data } = await admin.from("programme_comments").select("id, user_id, nickname, body, status, created_at")
    .eq("class_key", classKey).eq("day", day).eq("lang", lang).neq("status", "hidden").order("created_at");
  // a student sees visible comments, plus their own that are still waiting for Gary
  return (data ?? []).filter((c) => c.status === "visible" || c.user_id === userId).map((c) => ({ id: c.id, nickname: c.nickname, body: c.body, mine: c.user_id === userId, waiting: c.status === "pending" }));
}

export async function report(userId: string, kind: "comment" | "ai_feedback", targetId: string, note: string) {
  const admin = createAdminClient();
  const row = kind === "comment" ? { comment_id: targetId } : { submission_id: targetId };
  const { error } = await admin.from("programme_reports").insert({ reporter_id: userId, kind, note: clean(note, 500), ...row });
  if (error) return { error: "送出失败，请再试一次。" };
  await notifyGary(kind === "comment" ? "🚩 陪你读书：有人举报留言" : "💬 陪你读书：有人说 AI 反馈不好", clean(note, 200) || "（没写原因）", "/admin/programme-inbox");
  return {};
}
