import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// Master switch. Essay marking is CLOSED for students unless WRITING_OPEN=true is set in Vercel / .env.local (Gary, 8 Nov 2026:
// "do not let the user access it first"). Admins and beta testers can always use it.
export const WRITING_OPEN = process.env.WRITING_OPEN === "true";

export const FREE_PER_DAY = 1; // free essays a day for students; after that a speaking pack credit is used (see supabase/writing.sql)
export const ADMIN_PER_DAY = 1000; // admins test without limits
export const BETA_PER_DAY = 1000; // beta testers (Gary's friends): no limit for now (Gary, 8 Nov 2026); lower it later if needed

export type WritingAccess = {
  isAdmin: boolean;
  isBeta: boolean;
  canTest: boolean; // admin or beta tester: sees the full report and the "test as a free student" switch
  allowed: boolean;
  perDay: number;
};

export const noAccess: WritingAccess = { isAdmin: false, isBeta: false, canTest: false, allowed: WRITING_OPEN, perDay: FREE_PER_DAY };

// Beta testers are listed by Gmail in the table public.writing_beta_testers (add or remove a row, no redeploy needed).
// The tester must sign in with that address AND have confirmed it, so nobody can sign up with someone else's address.
export async function writingAccess(supabase: SupabaseClient, user: Pick<User, "id" | "email" | "email_confirmed_at">): Promise<WritingAccess> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";
  let isBeta = false;
  if (!isAdmin && user.email && user.email_confirmed_at) {
    const { data } = await createAdminClient().from("writing_beta_testers").select("email").eq("email", user.email.toLowerCase()).maybeSingle();
    isBeta = !!data;
  }
  const canTest = isAdmin || isBeta;
  return { isAdmin, isBeta, canTest, allowed: WRITING_OPEN || canTest, perDay: isAdmin ? ADMIN_PER_DAY : isBeta ? BETA_PER_DAY : FREE_PER_DAY };
}
