import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPlace } from "./groups";
import { hasBaseline } from "./results";
import { DEMO_TODAY } from "./calendar";
import { todayMY } from "./content";

/**
 * Who may see 陪你读书.
 *  - The admin always can (and sees the sample date, so the preview shows something before 2027).
 *  - Students only when the launch switch PROGRAMME_OPEN=true is set in Vercel. Until Gary sets it, everyone else gets a 404,
 *    so the pages do not even look like they exist.
 *  - With the switch on, a student needs a confirmed place: the leader once the group is confirmed, a friend once they have
 *    opened their own link. A paused link stops access until Gary resumes it.
 * Call one of these at the top of EVERY page and server action under /programme (layouts do not re-run on client navigation).
 */
export type Access = { userId: string; email: string; isAdmin: boolean; today: string };

export const programmeOpen = () => process.env.PROGRAMME_OPEN === "true";

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
  if (!u.isAdmin && !programmeOpen()) notFound();
  return { userId: u.id, email: u.email, isAdmin: u.isAdmin, today: u.isAdmin ? DEMO_TODAY : todayMY() };
}

/** For every page that shows the programme itself: needs a paid, confirmed place (the admin always has one). */
export async function requireProgramme(opts: { allowNoBaseline?: boolean } = {}): Promise<Access> {
  const a = await requireProgrammeSignedIn();
  if (!a.isAdmin && !(await hasPlace(a.userId))) redirect("/programme/join");
  // Before starting the plan every student shares the results they have now (Gary, 25 Nov 2026).
  if (!a.isAdmin && !opts.allowNoBaseline && !(await hasBaseline(a.userId))) redirect("/programme/results?kind=baseline");
  return a;
}

/** Kept for the pages that only the admin may see. */
export async function requireProgrammeAdmin() {
  const a = await requireProgrammeSignedIn();
  if (!a.isAdmin) notFound();
  return a;
}
