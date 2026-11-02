// SERVER-ONLY. Re-download requests: letting a student download their locked PDFs once more. Used by the admin pages and by the
// Allow / Decline buttons in Gary's Telegram, so both do exactly the same thing. Callers must already have checked it is Gary.
import { createAdminClient } from "@/lib/supabase/admin";

// Resets the "downloaded once" mark on every file of the order (the bandwidth log keeps the old rows) and closes any waiting request.
// Safe to run again at any time, even when nothing was downloaded yet or the request was already closed.
export async function releaseOrderDownloads(orderId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.from("file_downloads").update({ released: true }).eq("order_id", orderId).eq("released", false);
  await admin.from("redownload_requests").update({ status: "done", handled_at: new Date().toISOString() }).eq("order_id", orderId).eq("status", "pending");
  return error ? { error: error.message } : {};
}

export type RequestInfo = { id: string; orderId: string; status: string; email: string; product: string };

export async function getRequestInfo(requestId: string): Promise<RequestInfo | null> {
  const { data } = await createAdminClient()
    .from("redownload_requests")
    .select("id, order_id, status, orders(profiles(email), products(title))")
    .eq("id", requestId)
    .maybeSingle();
  if (!data) return null;
  const o: any = (data as any).orders;
  return { id: data.id, orderId: data.order_id, status: data.status, email: o?.profiles?.email ?? "student", product: o?.products?.title ?? "order" };
}

// "Decline": the request is closed without resetting anything. The student can ask again later.
export async function declineRequest(requestId: string): Promise<void> {
  await createAdminClient().from("redownload_requests").update({ status: "declined", handled_at: new Date().toISOString() }).eq("id", requestId).eq("status", "pending");
}
