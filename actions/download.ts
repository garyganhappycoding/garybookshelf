"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getDownloadUrl(orderId: string): Promise<{ url?: string; error?: string }> {
  const supabase =await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, user_id, product_id")
    .eq("id", orderId)
    .single();

  if (!order || order.user_id !== user.id) return { error: "Order not found." };
  if (order.status !== "completed") return { error: "This order hasn't been approved yet." };

  const { data: product } = await supabase
    .from("products")
    .select("file_path")
    .eq("id", order.product_id)
    .single();

  if (!product) return { error: "Product not found." };

  // use the admin client so we can read from the private digital-assets bucket
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("digital-assets")
    .createSignedUrl(product.file_path, 60 * 10); // valid for 10 minutes

  if (error || !data) return { error: "Could not generate download link." };

  return { url: data.signedUrl };
}
