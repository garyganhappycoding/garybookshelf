import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * 陪你读书 is admin-only while it is being built. Call this at the top of EVERY page under /programme
 * (layouts are not re-run on client navigation, so a layout-only check is not enough).
 * Anyone who is not the admin, signed in or not, gets the normal 404, so the page does not even look like it exists.
 */
export async function requireProgrammeAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") notFound();
}
