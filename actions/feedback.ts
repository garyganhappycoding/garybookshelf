"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitFeedback(message: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };
  if (!message || !message.trim()) return { error: "Please write something first." };

  const { error } = await supabase.from("feedback").insert({ user_id: user.id, message: message.trim() });
  if (error) return { error: error.message };

  revalidatePath("/admin/feedback");
  return { success: true };
}
