"use server";
import { revalidatePath } from "next/cache";
import { requireProgramme } from "@/lib/programme/gate";
import { savePretest } from "@/lib/programme/pretest";

export type PretestState = { error?: string; ok?: boolean };

export async function savePretestAction(_: PretestState, form: FormData): Promise<PretestState> {
  const a = await requireProgramme({ allowNoPretest: true });
  const r = await savePretest(a.userId, form);
  if (r.error) return r;
  revalidatePath("/programme");
  return { ok: true };
}
