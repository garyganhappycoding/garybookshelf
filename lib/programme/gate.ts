import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasPlace } from "./groups";
import { hasBaseline } from "./results";
import { hasPretest } from "./pretest";
import { DEMO_TODAY, addDays, key, parse } from "./calendar";
import { todayMY } from "./content";

/**
 * Who may see 陪你读书.
 *  - The admin always can (and sees the sample date, so the preview shows something before 2027).
 *  - Students only when the launch switch PROGRAMME_OPEN=true is set in Vercel. Until Gary sets it, everyone else gets a 404,
 *    so the pages do not even look like they exist.
 *  - Beta testers (emails on /admin/programme-beta) can open it while it is closed. They need no payment or friend group, and their
 *    programme date starts on 4 Jan 2027 (or the date Gary sets) and moves forward one day per real day, so there is something to do before 2027.
 *  - With the switch on, a student needs a confirmed place: the leader once the group is confirmed, a friend once they have
 *    opened their own link. A paused link stops access until Gary resumes it.
 * Call one of these at the top of EVERY page and server action under /programme (layouts do not re-run on client navigation).
 */
export type Access = { userId: string; email: string; isAdmin: boolean; today: string; beta: boolean };

export const programmeOpen = () => process.env.PROGRAMME_OPEN === "true";

/**
 * A beta tester lives through the programme day by day: their "today" starts at the date Gary set (week 1 Monday, 4 Jan 2027, when he set none)
 * and moves forward one day for every real day since he added them. So a two-week beta is really weeks 1 and 2, streaks can build up and
 * future days stay locked until their day comes.
 */
function betaToday(b: { demo_today: string | null; added_at: string }): string {
  const added = new Date(b.added_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
  const days = Math.max(0, Math.round((Date.parse(todayMY()) - Date.parse(added)) / 86400000));
  return key(addDays(parse(b.demo_today ?? "2027-01-04"), days));
}

/** A beta tester's row (with the optional date Gary set for them), or null when this email is not on the list. */
async function betaRow(email: string): Promise<{ demo_today: string | null; added_at: string } | null> {
  if (!email) return null;
  const { data } = await createAdminClient().from("programme_beta_testers").select("demo_today, added_at").eq("email", email.trim().toLowerCase()).maybeSingle();
  return data ?? null;
}

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { id: user.id, email: user.email ?? "", isAdmin: p?.role === "admin" };
}

/** For the sales/join page: the admin, or any signed-in student once the programme is open. */
export async function requireProgrammeSignedIn(): Promise<Access> {
  const u = await currentUser();
  if (!u) { if (programmeOpen()) redirect("/login"); notFound(); }
  // beta testers only matter while the programme is closed; once it is open everyone is treated the same
  const beta = !u.isAdmin && !programmeOpen() ? await betaRow(u.email) : null;
  if (!u.isAdmin && !programmeOpen() && !beta) notFound();
  return { userId: u.id, email: u.email, isAdmin: u.isAdmin, beta: !!beta, today: u.isAdmin ? DEMO_TODAY : beta ? betaToday(beta) : todayMY() };
}

/** For every page that shows the programme itself: needs a paid, confirmed place (the admin always has one). */
export async function requireProgramme(opts: { allowNoBaseline?: boolean; allowNoPretest?: boolean } = {}): Promise<Access> {
  const a = await requireProgrammeSignedIn();
  if (!a.isAdmin && !a.beta && !(await hasPlace(a.userId))) redirect("/programme/join");
  // Before starting the plan every student shares the results they have now (Gary, 25 Nov 2026).
  if (!a.isAdmin && !opts.allowNoBaseline && !(await hasBaseline(a.userId))) redirect("/programme/results?kind=baseline");
  // ... and one essay in BI and one in BM, the starting point for the essay tests
  if (!a.isAdmin && !opts.allowNoBaseline && !opts.allowNoPretest && !(await hasPretest(a.userId))) redirect("/programme/pretest");
  return a;
}

/** Kept for the pages that only the admin may see. */
export async function requireProgrammeAdmin() {
  const a = await requireProgrammeSignedIn();
  if (!a.isAdmin) notFound();
  return a;
}
