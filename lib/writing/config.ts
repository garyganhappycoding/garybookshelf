import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// Master switch. Essay marking is CLOSED for students unless WRITING_OPEN=true is set in Vercel / .env.local (Gary, 8 Nov 2026:
// "do not let the user access it first"). Admins and beta testers can always use it.
export const WRITING_OPEN = process.env.WRITING_OPEN === "true";

export const FREE_TOTAL = 10; // free essays per PERSON, once, never reset (Gary, 13 Nov 2026; was 3 a week). Counted across accounts that share one inbox (Gmail dots and +tags). After that an essay pack credit is used (see supabase/writing.sql)
export const FREE_PER_IP_DAY = Number(process.env.WRITING_FREE_PER_IP_DAY) || 30; // free essays one network (IP) may mark in 24 hours: generous, because a school shares one IP
export const ADMIN_TOTAL = 5000; // admins test without limits
export const BETA_TOTAL = 5000; // beta testers (Gary's friends): no limit for now (Gary, 8 Nov 2026); lower it later if needed

export type WritingAccess = {
  isAdmin: boolean;
  isBeta: boolean;
  canTest: boolean; // admin or beta tester: sees the full report and the "test as a free student" switch
  allowed: boolean;
  freeTotal: number; // how many free essays this person may mark in total
};

export const noAccess: WritingAccess = { isAdmin: false, isBeta: false, canTest: false, allowed: WRITING_OPEN, freeTotal: FREE_TOTAL };

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
  return { isAdmin, isBeta, canTest, allowed: WRITING_OPEN || canTest, freeTotal: isAdmin ? ADMIN_TOTAL : isBeta ? BETA_TOTAL : FREE_TOTAL };
}
