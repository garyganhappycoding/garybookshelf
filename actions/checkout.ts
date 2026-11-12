"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendReceiptForReview } from "@/lib/telegram";
import { getPriceForUser, type MyPrice } from "@/lib/pricing";
import { productFiles } from "@/lib/product-files";

export type CheckoutState = {
  error?: string;
  success?: boolean;
};

/** The price this buyer pays (member discount worked out on the server). */
export async function getMyPrice(productId: string, selected?: number[]): Promise<MyPrice | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return getPriceForUser(supabase, productId, user?.id ?? null, selected);
}

export async function submitOrder(
  productId: string,
  formData: FormData
): Promise<CheckoutState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be logged in to check out." };
  }

  // never trust a price from the browser: work it out here
  // files the buyer ticked (only for products sold file by file)
  const picked = formData.getAll("files").map((v) => Number(v)).filter((n) => Number.isInteger(n) && n >= 0);
  const priced = await getPriceForUser(supabase, productId, user.id, picked);
  if (!priced) return { error: "This product is no longer available." };
  const { data: sold } = await supabase.from("products").select("price_per_file_myr, free_file_indexes, product_files, file_path, title").eq("id", productId).maybeSingle();
  const perFile = sold?.price_per_file_myr != null;
  const allFiles = perFile ? productFiles(sold as any) : [];
  const freeFiles: number[] = (sold as any)?.free_file_indexes ?? [];
  const paidPicked = Array.from(new Set(picked)).filter((i) => i < allFiles.length && !freeFiles.includes(i));
  if (perFile && !paidPicked.length) return { error: "Please tick at least one file you want to buy." };
  // free bonus files are always included in the order
  const fileIndexes = perFile ? Array.from(new Set([...paidPicked, ...freeFiles.filter((i) => i < allFiles.length)])).sort((a, b) => a - b) : null;
  const amountPaid = priced.price;

  const receiptFile = formData.get("receipt") as File | null;
  if (!receiptFile || receiptFile.size === 0) {
    return { error: "Please upload your Touch 'n Go payment receipt screenshot." };
  }

  // basic guardrails: images only, under 5MB
  if (!receiptFile.type.startsWith("image/")) {
    return { error: "Receipt must be an image file (screenshot)." };
  }
  if (receiptFile.size > 5 * 1024 * 1024) {
    return { error: "Receipt image is too large (max 5MB)." };
  }

  const fileExt = receiptFile.name.split(".").pop();
  const filePath = `${user.id}/${productId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(filePath, receiptFile);

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const { data: newOrder, error: insertError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      product_id: productId,
      amount_paid: amountPaid,
      discount_applied: priced.discounted,
      file_indexes: fileIndexes,
      receipt_path: filePath,
      status: "pending_verification",
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: `Could not create order: ${insertError.message}` };
  }

  // Send the receipt to Gary's Telegram with Approve / Reject buttons. after() runs once the response
  // is sent, so the student isn't kept waiting. The photo is deleted from Telegram once he decides.
  const { data: product } = await supabase.from("products").select("title").eq("id", productId).maybeSingle();
  const caption = `🧾 New order to review\n${product?.title ?? "A product"}\nRM ${amountPaid.toFixed(2)}${priced.discounted ? " (member price)" : ""}${fileIndexes ? `\nFiles: ${fileIndexes.map((i) => allFiles[i].name.replace(/\.pdf$/i, "")).join(", ")}` : ""} from ${user.email ?? "a student"}`;
  const photo = new Blob([await receiptFile.arrayBuffer()], { type: receiptFile.type });
  after(() => sendReceiptForReview(photo, `receipt.${fileExt || "jpg"}`, caption, newOrder.id));

  revalidatePath("/dashboard");
  return { success: true };
}
