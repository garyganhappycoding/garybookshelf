"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { sendTelegramText } from "@/lib/telegram";

export async function submitFeedback(message: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." };
  if (!message || !message.trim()) return { error: "Please write something first." };

  const { error } = await supabase.from("feedback").insert({ user_id: user.id, message: message.trim() });
  if (error) return { error: error.message };

  // Forward it to Gary's Telegram after the response is sent, so the student isn't kept waiting.
  const text = message.trim();
  after(() =>
    sendTelegramText(`💬 New feedback from ${user.email ?? "a student"}\n\n${text.length > 1500 ? text.slice(0, 1500) + "…" : text}`)
  );

  revalidatePath("/admin/feedback");
  return { success: true };
}
