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
  const assetFile = formData.get("asset") as File;

  if (!assetFile || assetFile.size === 0) {
    return { error: "Please attach the digital file to deliver to buyers." };
  }

  // upload the digital deliverable to the private bucket
  const assetExt = assetFile.name.split(".").pop();
  const assetPath = `${crypto.randomUUID()}.${assetExt}`;
  const { error: assetError } = await admin.storage
    .from("digital-assets")
    .upload(assetPath, assetFile);
  if (assetError) return { error: `Asset upload failed: ${assetError.message}` };

  // upload the cover image to the public bucket, if provided
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const imgExt = imageFile.name.split(".").pop();
    const imgPath = `${crypto.randomUUID()}.${imgExt}`;
    const { error: imgError } = await admin.storage
      .from("product-images")
      .upload(imgPath, imageFile);
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
    file_path: assetPath,
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
  const admin = createAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, product_id, profiles(email), products(title, file_path)")
    .eq("id", orderId)
    .single();

  if (error || !order) return { error: "Order not found." };

  await supabase.from("orders").update({ status: "completed", reviewed_at: new Date().toISOString() }).eq("id", orderId);

  // send the download email via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const productTitle = (order as any).products?.title;
    const customerEmail = (order as any).profiles?.email;

    if (customerEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "orders@garysbookshelf.com",
        to: customerEmail,
        subject: `Your order is approved: ${productTitle}`,
        html: `<p>Hi,</p>
               <p>Your payment for <strong>${productTitle}</strong> has been verified.</p>
               <p>Log in to your dashboard to download it:</p>
               <p><a href="${siteUrl}/dashboard">${siteUrl}/dashboard</a></p>
               <p>Thanks for supporting gary's bookshelf!</p>`,
      });
    }
  } catch (e) {
    // order is already approved in the DB even if the email fails -- don't block on it
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