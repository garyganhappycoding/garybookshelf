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
