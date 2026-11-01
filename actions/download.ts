"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderFileUrl } from "@/lib/personal-copy";
import { productFiles } from "@/lib/product-files";

export async function getDownloadUrl(orderId: string, fileIndex = 0): Promise<{ url?: string; error?: string; isLink?: boolean; password?: string; oneTime?: boolean }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, user_id, product_id, link_opened_at")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id) return { error: "Order not found." };
  if (order.status !== "completed") return { error: "This order hasn't been approved yet." };

  const { data: product } = await supabase
    .from("products")
    .select("file_path, product_files, external_link, title, personalize_pdf")
    .eq("id", order.product_id)
    .single();

  if (!product) return { error: "Product not found." };

  // if this product just has a link (e.g. Telegram group), hand that straight back --
  // but only once, so it can't be re-opened and reshared from this page
  if (product.external_link) {
    if (order.link_opened_at) {
      return { error: "You've already opened this link. Please make sure you've joined the group!" };
    }

    const admin = createAdminClient();
    await admin.from("orders").update({ link_opened_at: new Date().toISOString() }).eq("id", orderId);

    return { url: product.external_link, isLink: true };
  }

  if (productFiles(product).length === 0) return { error: "No file or link set up for this product." };

  const result = await getOrderFileUrl(orderId, fileIndex);
  return product.personalize_pdf && result.url ? { ...result, oneTime: true } : result;
}

// A student asks Gary to reset the downloads of one of their locked-PDF orders (a file failed, or they need it again).
export async function requestRedownload(orderId: string, note: string): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please log in first." };

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, user_id, products(title, personalize_pdf)")
    .eq("id", orderId)
    .single();
  if (!order || order.user_id !== user.id || order.status !== "completed" || !(order as any).products?.personalize_pdf) {
    return { ok: false, message: "Order not found." };
  }

  const admin = createAdminClient();
  const { data: open } = await admin.from("redownload_requests").select("id").eq("order_id", orderId).eq("status", "pending").limit(1);
  if (open?.length) return { ok: true, message: "You already asked. Gary will review it soon." };

  const clean = note.replace(/\u0000/g, "").trim().slice(0, 300);
  const { error } = await admin.from("redownload_requests").insert({ order_id: orderId, user_id: user.id, note: clean || null });
  if (error) return { ok: false, message: "Sorry, that didn't go through. Please try again." };

  try {
    const { notifyGary } = await import("@/lib/community");
    await notifyGary("🔁 Re-download request", `${user.email}\n${(order as any).products?.title ?? ""}${clean ? `\n“${clean}”` : ""}`, "/admin/students");
  } catch {
    /* the request is saved even if the alert fails */
  }
  return { ok: true, message: "Requested. Gary will review it and reset your downloads." };
}
