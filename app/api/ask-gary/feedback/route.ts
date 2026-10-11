import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// thumbs up / down on a reply. RLS only lets a student change their own event.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const { eventId, vote } = await req.json().catch(() => ({}));
  if (typeof eventId !== "string" || ![1, -1].includes(vote)) return NextResponse.json({ error: "Bad request." }, { status: 400 });
  // students have no update policy, so use the service role but restrict to their own row
  const { createAdminClient } = await import("@/lib/supabase/admin");
  await createAdminClient().from("ask_gary_events").update({ vote }).eq("id", eventId).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
