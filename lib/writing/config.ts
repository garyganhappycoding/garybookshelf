import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// Master switch. Essay marking is CLOSED for students unless WRITING_OPEN=true is set in Vercel / .env.local (Gary, 8 Nov 2026:
// "do not let the user access it first"). Admins and beta testers can always use it.
export const WRITING_OPEN = process.env.WRITING_OPEN === "true";

export const FREE_PER_WEEK = 3; // free essays a WEEK for students (Monday to Sunday, Malaysia time; Gary, 10 Nov 2026); after that a pack credit is used (see supabase/writing.sql)
export const ADMIN_PER_WEEK = 5000; // admins test without limits
export const BETA_PER_WEEK = 5000; // beta testers (Gary's friends): no limit for now (Gary, 8 Nov 2026); lower it later if needed

export type WritingAccess = {
  isAdmin: boolean;
  isBeta: boolean;
  canTest: boolean; // admin or beta tester: sees the full report and the "test as a free student" switch
  allowed: boolean;
  perWeek: number; // how many free essays this person may mark each week
};

export const noAccess: WritingAccess = { isAdmin: false, isBeta: false, canTest: false, allowed: WRITING_OPEN, perWeek: FREE_PER_WEEK };

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
  return { isAdmin, isBeta, canTest, allowed: WRITING_OPEN || canTest, perWeek: isAdmin ? ADMIN_PER_WEEK : isBeta ? BETA_PER_WEEK : FREE_PER_WEEK };
}
