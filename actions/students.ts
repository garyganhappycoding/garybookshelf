"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not authorized.");
}

// Gives a student extra Speaking attempts by hand. "bonus" = extra attempts with the free report (like the feedback reward),
// "purchased" = full paid report (use it when fixing a paid order). Valid for `days` days.
export async function addAttempts(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const count = Math.floor(Number(formData.get("count")));
  const days = Math.floor(Number(formData.get("days") || 30));
  const kind = formData.get("kind") === "purchased" ? "purchased" : "bonus";
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !(count >= 1 && count <= 200) || !(days >= 1 && days <= 365)) return;

  await createAdminClient()
    .from("speaking_packs")
    .insert({ user_id: userId, attempts_total: count, expires_at: new Date(Date.now() + days * 86400_000).toISOString(), kind });
  revalidatePath("/admin/students");
}

// Admin-only check that email really sends: mails the logged-in admin's own address and reports the exact error if it fails.
export async function sendTestEmail(): Promise<{ ok: boolean; to?: string; via?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "Not logged in." };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { ok: false, error: "Not authorized." };

  const { sendEmail } = await import("@/lib/community");
  const via = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? "Gmail" : process.env.RESEND_API_KEY ? "Resend" : "nothing set up";
  const r = await sendEmail(
    user.email,
    "Test email from garybookshelf",
    `<h2 style="color:#3B2F26;margin:0 0 12px;">It works 🎉</h2><p style="color:#3B2F26;line-height:1.6;">Your website can send email to students (sent via ${via}).</p>`
  );
  return { ok: r.ok, to: user.email, via, error: r.error };
}

// ---------- actions on a student's orders (used by the buttons on the Students page) ----------
export type OrderActionResult = { ok: boolean; message: string };

export async function approveStudentOrder(orderId: string): Promise<OrderActionResult> {
  await requireAdmin();
  const { approveOrderCore } = await import("@/lib/orders");
  const r = await approveOrderCore(orderId, { onlyIfPending: true });
  revalidatePath("/admin/students");
  if (r.error) return { ok: false, message: r.error };
  return {
    ok: true,
    message: r.emailError
      ? `Approved. The email did not send (${r.emailError}); the student can still see it in My orders.`
      : "Approved. The student has been emailed.",
  };
}

export async function rejectStudentOrder(orderId: string, reason: string): Promise<OrderActionResult> {
  await requireAdmin();
  const { rejectOrderCore } = await import("@/lib/orders");
  const r = await rejectOrderCore(orderId, reason.slice(0, 300), { onlyIfPending: true });
  revalidatePath("/admin/students");
  return r.error ? { ok: false, message: r.error } : { ok: true, message: "Rejected." };
}

// lets the student download a locked PDF again (the bandwidth log keeps the old rows)
export async function allowRedownload(orderId: string): Promise<OrderActionResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("file_downloads").update({ released: true }).eq("order_id", orderId).eq("released", false);
  revalidatePath("/admin/students");
  revalidatePath("/dashboard");
  return error ? { ok: false, message: error.message } : { ok: true, message: "Done. The student can download each file once more." };
}
