"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensurePersonalCopy } from "@/lib/personal-copy";

export async function getDownloadUrl(orderId: string): Promise<{ url?: string; error?: string; isLink?: boolean; password?: string }> {
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
    .select("file_path, external_link, personalize_pdf, title")
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

  if (!product.file_path) return { error: "No file or link set up for this product." };

  const admin = createAdminClient();

  // a locked PDF: hand over this buyer's own copy (made on approval, or now if that step failed)
  if (product.personalize_pdf) {
    try {
      const copy = await ensurePersonalCopy(orderId);
      if (copy) {
        const { data: signed, error: signErr } = await admin.storage
          .from("personal-copies")
          .createSignedUrl(copy.path, 60 * 10, { download: `${product.title}.pdf` });
        if (signErr || !signed) return { error: "Could not generate download link." };
        return { url: signed.signedUrl, password: copy.password };
      }
    } catch (e) {
      console.error("personal copy failed", e);
      return { error: "Your locked PDF is not ready yet. Please try again in a minute or message Gary." };
    }
  }

  const { data, error } = await admin.storage
    .from("digital-assets")
    .createSignedUrl(product.file_path, 60 * 10);

  if (error || !data) return { error: "Could not generate download link." };

  return { url: data.signedUrl };
}