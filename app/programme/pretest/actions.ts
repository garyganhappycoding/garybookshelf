"use server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireProgramme } from "@/lib/programme/gate";
import { savePretest, scorePending } from "@/lib/programme/pretest";

export type PretestState = { error?: string; ok?: boolean };

export async function savePretestAction(_: PretestState, form: FormData): Promise<PretestState> {
  const a = await requireProgramme({ allowNoPretest: true });
  const r = await savePretest(a.userId, form);
  if (r.error) return r;
  after(() => scorePending(a.userId)); // the marking runs after the student has their answer
  revalidatePath("/programme");
  return { ok: true };
}
