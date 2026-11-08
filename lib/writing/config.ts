import type { SupabaseClient } from "@supabase/supabase-js";

// Master switch. Essay marking is CLOSED for students unless WRITING_OPEN=true is set in Vercel / .env.local (Gary, 8 Nov 2026:
// "do not let the user access it first"). Admins can always use it, to test.
export const WRITING_OPEN = process.env.WRITING_OPEN === "true";

export const FREE_PER_DAY = 1; // free essays a day for students; after that a speaking pack credit is used (see supabase/writing.sql)
export const ADMIN_PER_DAY = 1000; // admins test without limits

export async function writingAccess(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  const isAdmin = profile?.role === "admin";
  return { isAdmin, allowed: WRITING_OPEN || isAdmin };
}
