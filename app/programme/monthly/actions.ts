"use server";
import { revalidatePath } from "next/cache";
import { requireProgramme } from "@/lib/programme/gate";
import { pendingMonthly } from "@/lib/programme/monthly";
import { scoreEssay } from "@/lib/programme/essayscore";
import { createAdminClient } from "@/lib/supabase/admin";
import { clean } from "@/lib/community";

export type MonthlyState = { error?: string; ok?: boolean };

export async function saveMonthlyAction(_: MonthlyState, form: FormData): Promise<MonthlyState> {
  const a = await requireProgramme();
  const month = Number(form.get("month"));
  const item = (await pendingMonthly(a.userId, a.today)).find((m) => m.month === month);
  if (!item) return { error: "这个月的测验已经交过了。" };
  const admin = createAdminClient();
  for (const lang of ["BI", "BM"] as const) {
    if (item.done[lang]) continue;
    const essay = clean(String(form.get(`text-${lang}`) ?? ""), 9000);
    if (essay.split(/\s+/).filter(Boolean).length < 30) return { error: lang === "BI" ? "英文作文太短了，至少写 30 个字。" : "马来文作文太短了，至少写 30 个字。" };
    const question = item[lang];
    const s = await scoreEssay(lang, question, essay);
    if (!s) return { error: "批改暂时失败，请稍后再交一次（先把你写的内容复制起来，以免丢失）。" };
    const { error } = await admin.from("programme_essay_tests").upsert({ user_id: a.userId, lang, kind: "monthly", period: month, question, essay, score: s.score, label: s.label, result: s.result, model: s.model, created_at: new Date().toISOString() }, { onConflict: "user_id,lang,kind,period" });
    if (error) return { error: "保存失败，请再试一次。" };
  }
  revalidatePath("/programme", "layout");
  return { ok: true };
}
