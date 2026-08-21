"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CheckoutState = {
  error?: string;
  success?: boolean;
};

export async function submitOrder(
  productId: string,
  amountPaid: number,
  formData: FormData
): Promise<CheckoutState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be logged in to check out." };
  }

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

  const { error: insertError } = await supabase.from("orders").insert({
    user_id: user.id,
    product_id: productId,
    amount_paid: amountPaid,
    receipt_path: filePath,
    status: "pending_verification",
  });

  if (insertError) {
    return { error: `Could not create order: ${insertError.message}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
