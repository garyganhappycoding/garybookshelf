"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { approveOrderCore, rejectOrderCore } from "@/lib/orders";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Not authorized.");
  return supabase;
}

export async function createProductRecord(data: {
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  imageUrls: string[];
  filePath: string | null;
  externalLink: string | null;
  personalizePdf?: boolean;
}) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from("products").insert({
    title: data.title,
    description: data.description,
    price_myr: data.price,
    category: data.category,
    image_url: data.imageUrl,
    image_urls: data.imageUrls,
    file_path: data.filePath,
    external_link: data.externalLink,
    personalize_pdf: Boolean(data.personalizePdf),
  });

  if (error) return { error: error.message };

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProductRecord(
  productId: string,
  data: {
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string | null;
    imageUrls?: string[];
    filePath?: string | null;
    externalLink?: string | null;
    personalizePdf?: boolean;
  }
) {
  const supabase = await requireAdmin();

  const updates: Record<string, any> = {
    title: data.title,
    description: data.description,
    price_myr: data.price,
    category: data.category,
  };

  if (data.personalizePdf !== undefined) updates.personalize_pdf = data.personalizePdf;
  if (data.imageUrl !== undefined) updates.image_url = data.imageUrl;
  if (data.imageUrls !== undefined) updates.image_urls = data.imageUrls;
  if (data.filePath !== undefined) {
    updates.file_path = data.filePath;
    updates.external_link = null;
  }
  if (data.externalLink !== undefined) {
    updates.external_link = data.externalLink;
    updates.file_path = null;
  }

  const { error } = await supabase.from("products").update(updates).eq("id", productId);
  if (error) return { error: error.message };

  revalidatePath("/shop");
  revalidatePath(`/shop/${productId}`);
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = await requireAdmin();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function approveOrder(orderId: string) {
  await requireAdmin();
  const result = await approveOrderCore(orderId);
  if (result.error) return { error: result.error };
  return { success: true };
}

export async function rejectOrder(orderId: string, reason: string) {
  await requireAdmin();
  await rejectOrderCore(orderId, reason);
  return { success: true };
}

export async function getReceiptUrl(receiptPath: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("receipts").createSignedUrl(receiptPath, 60 * 10);
  if (error || !data) return { error: "Could not load receipt." };
  return { url: data.signedUrl };
}

export async function createResource(formData: FormData) {
  const supabase = await requireAdmin();

  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const url = formData.get("url") as string;

  let thumbnailUrl: string | null = null;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "facebookexternalhit/1.1" },
    });
    const html = await res.text();
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (match) thumbnailUrl = match[1];
  } catch (e) {
    // some sites block this -- that's fine, we just show no thumbnail
  }

  const { error } = await supabase.from("resources").insert({ type, title, description, url, thumbnail_url: thumbnailUrl });
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/resources");
  return { success: true };
}

export async function deleteResource(resourceId: string) {
  const supabase = await requireAdmin();
  await supabase.from("resources").delete().eq("id", resourceId);
  revalidatePath("/");
  revalidatePath("/admin/resources");
}