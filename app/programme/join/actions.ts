"use server";
import { revalidatePath } from "next/cache";
import { requireProgrammeSignedIn } from "@/lib/programme/gate";
import { createGroup, submitReceipt } from "@/lib/programme/groups";

export type ActionResult = { error?: string; ok?: boolean };

async function who() {
  const a = await requireProgrammeSignedIn(); // admin always; students once PROGRAMME_OPEN is on
  return a.email ? { id: a.userId, email: a.email } : null;
}

export async function createGroupAction(_: ActionResult, form: FormData): Promise<ActionResult> {
  const u = await who();
  if (!u) return { error: "请先登录。" };
  const r = await createGroup(u.id, u.email, Number(form.get("size")));
  if (r.error) return { error: r.error };
  revalidatePath("/programme/join");
  return { ok: true };
}

export async function receiptAction(_: ActionResult, form: FormData): Promise<ActionResult> {
  const u = await who();
  if (!u) return { error: "请先登录。" };
  const file = form.get("receipt");
  const r = await submitReceipt(u.id, u.email, Number(form.get("group_no")), file instanceof File ? file : null);
  if (r.error) return { error: r.error };
  revalidatePath("/programme/join");
  return { ok: true };
}
