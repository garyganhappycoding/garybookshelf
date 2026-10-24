"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not authorized.");
}

// Gives a student extra Speaking attempts by hand. "bonus" = extra attempts with the free report (like the feedback reward),
// "purchased" = full paid report (use it when fixing a paid order). Valid for `days` days.
export async function addAttempts(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const count = Math.floor(Number(formData.get("count")));
  const days = Math.floor(Number(formData.get("days") || 30));
  const kind = formData.get("kind") === "purchased" ? "purchased" : "bonus";
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !(count >= 1 && count <= 200) || !(days >= 1 && days <= 365)) return;

  await createAdminClient()
    .from("speaking_packs")
    .insert({ user_id: userId, attempts_total: count, expires_at: new Date(Date.now() + days * 86400_000).toISOString(), kind });
  revalidatePath("/admin/students");
}
