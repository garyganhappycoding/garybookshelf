"use server";
import { revalidatePath } from "next/cache";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";
import { mySets, saveResults } from "@/lib/programme/results";
import { awardForImprovement } from "@/lib/programme/badges";

export type ResultsState = { error?: string; ok?: boolean };

/** Saves the baseline (before the plan) or the results of one exam period. */
export async function saveResultsAction(_: ResultsState, form: FormData): Promise<ResultsState> {
  const a = await requireProgramme({ allowNoBaseline: true });
  const kind = form.get("kind") === "exam" ? "exam" : "baseline";
  let examId: string | null = null, label = "开始之前的成绩";
  if (kind === "exam") {
    const p = await getProfile(a.userId);
    const exam = p.exams.find((e) => e.id === String(form.get("exam")));
    if (!exam) return { error: "找不到这次考试。" };
    examId = exam.id; label = exam.name.replace(/（.*?）/g, "");
  }
  const r = await saveResults(a.userId, kind, examId, label, form);
  if (r.error) return r;
  if (kind === "exam" && !a.isAdmin) {
    const sets = await mySets(a.userId);
    const base = sets.find((s) => s.kind === "baseline"), latest = sets.find((s) => s.examId === examId);
    if (base && latest) await awardForImprovement(a.userId, base.marks, latest.marks);
  }
  revalidatePath("/programme");
  revalidatePath("/programme/results");
  revalidatePath("/programme/badges");
  return { ok: true };
}
