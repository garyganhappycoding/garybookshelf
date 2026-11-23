"use server";
import { revalidatePath } from "next/cache";
import { requireProgramme, requireProgrammeSignedIn } from "@/lib/programme/gate";
import { saveProfile } from "@/lib/programme/profile";

export type SaveResult = { error?: string; ok?: boolean };

/** First-time setup (state + Form 4/5). A paid student has to finish this before the calendar opens. */
export async function startAction(_: SaveResult, form: FormData): Promise<SaveResult> {
  const a = await requireProgrammeSignedIn();
  const r = await saveProfile(a.userId, { state: String(form.get("state")), form: Number(form.get("form")), setupDone: true });
  if (r.error) return r;
  revalidatePath("/programme");
  return { ok: true };
}

export async function saveSettingsAction(state: string, formYear: number): Promise<SaveResult> {
  const a = await requireProgramme();
  const r = await saveProfile(a.userId, { state, form: formYear });
  revalidatePath("/programme");
  return r.error ? r : { ok: true };
}

export async function saveExamsAction(exams: unknown): Promise<SaveResult> {
  const a = await requireProgramme();
  const r = await saveProfile(a.userId, { exams });
  revalidatePath("/programme");
  return r.error ? r : { ok: true };
}
