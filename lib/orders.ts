// SERVER-ONLY. The approve/reject logic lives here so the website's admin buttons
// and the Telegram buttons do exactly the same thing. Callers must check that the
// person is allowed to do this BEFORE calling (admin session, or Gary's Telegram id).
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

export type OrderSummary = { title: string; email: string | null; amount: number };
export type OrderResult = { error?: string; summary?: OrderSummary };

const BUTTON =
  "display: inline-block; background: #B85C38; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 500; margin: 16px 0;";

export async function approveOrderCore(orderId: string, opts: { onlyIfPending?: boolean } = {}): Promise<OrderResult> {
  const admin = createAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .select("id, user_id, product_id, status, amount_paid, profiles(email), products(title, external_link, file_path, speaking_pack_attempts)")
    .eq("id", orderId)
    .single();
  if (error || !order) return { error: "Order not found." };
  if (opts.onlyIfPending && order.status !== "pending_verification") return { error: `Already ${order.status.replace("_", " ")}.` };

  const productTitle: string = (order as any).products?.title ?? "your order";
  const customerEmail: string | null = (order as any).profiles?.email ?? null;
  const summary: OrderSummary = { title: productTitle, email: customerEmail, amount: Number(order.amount_paid) };

  await admin.from("orders").update({ status: "completed", reviewed_at: new Date().toISOString() }).eq("id", orderId);

  // A Speaking pack gives the student extra attempts, valid for 30 days from approval.
  // order_id is unique, so approving the same order twice cannot grant it twice (it only refreshes the 30 days,
  // and attempts already used stay used). This also switches a pack back on if a rejected order is approved later.
  const packAttempts: number | null = (order as any).products?.speaking_pack_attempts ?? null;
  if (packAttempts) {
    const { error: packErr } = await admin.from("speaking_packs").upsert(
      {
        user_id: order.user_id,
        order_id: order.id,
        attempts_total: packAttempts,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: "order_id" }
    );
    if (packErr) {
      console.error("speaking pack grant failed", packErr);
      return { error: "Order approved but the pack could not be added. Please add it manually.", summary };
    }
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const externalLink = (order as any).products?.external_link;

    if (customerEmail) {
      const hasDownload = Boolean(externalLink || (order as any).products?.file_path);
      const downloadSection = packAttempts && hasDownload
        ? `<a href="${siteUrl}/dashboard" style="${BUTTON}">Get my notes and start speaking practice</a>`
        : packAttempts
        ? `<a href="${siteUrl}/speaking" style="${BUTTON}">Start speaking practice</a>`
        : externalLink
        ? `<a href="${externalLink}" style="${BUTTON}">Get my download</a>`
        : `<a href="${siteUrl}/dashboard" style="${BUTTON}">Go to my dashboard</a>`;

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: customerEmail,
        subject: `Your order is approved: ${productTitle}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #FBF6EC; padding: 32px 24px; border-radius: 16px;">
            <p style="font-family: cursive; font-size: 22px; color: #8F4327; margin: 0 0 20px;">gary's bookshelf</p>
            <h2 style="color: #3B2F26; margin: 0 0 12px;">Your order is confirmed 🎉</h2>
            <p style="color: #3B2F26; line-height: 1.6;">Hi,</p>
            <p style="color: #3B2F26; line-height: 1.6;">
              Your payment for <strong>${productTitle}</strong> has been verified.
              ${packAttempts ? `Your ${packAttempts} speaking attempts are ready and last 30 days.${hasDownload ? " Your notes are ready on your dashboard too." : ""}` : "Your download is ready and waiting for you."}
            </p>
            ${downloadSection}
            <p style="color: #3B2F26; line-height: 1.6; font-size: 14px;">
              Thanks so much for supporting @gary_bookshelf — happy studying!
            </p>
            <p style="color: #8a8a8a; font-size: 12px; margin-top: 24px;">— Gary</p>
          </div>
        `,
      });
    }
  } catch (e) {
    console.error("Resend email failed", e);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
  return { summary };
}

export async function rejectOrderCore(orderId: string, reason: string, opts: { onlyIfPending?: boolean } = {}): Promise<OrderResult> {
  const admin = createAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .select("id, status, amount_paid, profiles(email), products(title)")
    .eq("id", orderId)
    .single();
  if (error || !order) return { error: "Order not found." };
  if (opts.onlyIfPending && order.status !== "pending_verification") return { error: `Already ${order.status.replace("_", " ")}.` };

  await admin
    .from("orders")
    .update({ status: "rejected", reject_reason: reason, reviewed_at: new Date().toISOString() })
    .eq("id", orderId);

  // A rejected order must never leave attempts behind (the database does this too, as a second safety net).
  await admin.from("speaking_packs").update({ expires_at: new Date().toISOString() }).eq("order_id", orderId);

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
  return {
    summary: { title: (order as any).products?.title ?? "an order", email: (order as any).profiles?.email ?? null, amount: Number(order.amount_paid) },
  };
}
