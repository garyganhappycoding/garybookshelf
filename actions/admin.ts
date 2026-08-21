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

export async function createProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const admin = createAdminClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const imageFile = formData.get("image") as File | null;
  const deliveryType = formData.get("deliveryType") as string;
  const assetFile = formData.get("asset") as File | null;
  const link = formData.get("link") as string | null;

  let filePath: string | null = null;
  let externalLink: string | null = null;

  if (deliveryType === "file") {
    if (!assetFile || assetFile.size === 0) {
      return { error: "Please attach the digital file to deliver to buyers." };
    }
    const assetExt = assetFile.name.split(".").pop();
    filePath = `${crypto.randomUUID()}.${assetExt}`;
    const { error: assetError } = await admin.storage.from("digital-assets").upload(filePath, assetFile);
    if (assetError) return { error: `Asset upload failed: ${assetError.message}` };
  } else {
    if (!link || link.trim() === "") {
      return { error: "Please paste the link you want to deliver to buyers." };
    }
    externalLink = link.trim();
  }

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const imgExt = imageFile.name.split(".").pop();
    const imgPath = `${crypto.randomUUID()}.${imgExt}`;
    const { error: imgError } = await admin.storage.from("product-images").upload(imgPath, imageFile);
    if (!imgError) {
      const { data } = admin.storage.from("product-images").getPublicUrl(imgPath);
      imageUrl = data.publicUrl;
    }
  }

  const { error: insertError } = await supabase.from("products").insert({
    title,
    description,
    price_myr: price,
    category,
    image_url: imageUrl,
    file_path: filePath,
    external_link: externalLink,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/shop");
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

  const { error } = await supabase.from("resources").insert({ type, title, description, url });
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