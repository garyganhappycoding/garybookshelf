"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

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
  }
) {
  const supabase = await requireAdmin();

  const updates: Record<string, any> = {
    title: data.title,
    description: data.description,
    price_myr: data.price,
    category: data.category,
  };

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
  const supabase = await requireAdmin();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, product_id, profiles(email), products(title, external_link)")
    .eq("id", orderId)
    .single();

  if (error || !order) return { error: "Order not found." };

  await supabase.from("orders").update({ status: "completed", reviewed_at: new Date().toISOString() }).eq("id", orderId);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const productTitle = (order as any).products?.title;
    const externalLink = (order as any).products?.external_link;
    const customerEmail = (order as any).profiles?.email;

    if (customerEmail) {
      const downloadSection = externalLink
        ? `<a href="${externalLink}"
             style="display: inline-block; background: #B85C38; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 500; margin: 16px 0;">
             Get my download
           </a>`
        : `<a href="${siteUrl}/dashboard"
             style="display: inline-block; background: #B85C38; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 500; margin: 16px 0;">
             Go to my dashboard
           </a>`;

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
              Your download is ready and waiting for you.
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
  return { success: true };
}

export async function rejectOrder(orderId: string, reason: string) {
  const supabase = await requireAdmin();
  await supabase
    .from("orders")
    .update({ status: "rejected", reject_reason: reason, reviewed_at: new Date().toISOString() })
    .eq("id", orderId);

  revalidatePath("/admin/orders");
  revalidatePath("/dashboard");
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