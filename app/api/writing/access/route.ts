import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WRITING_OPEN, writingAccess } from "@/lib/writing/config";

// Tells the top menu whether to show the "Essay marking" link: closed to students until WRITING_OPEN=true, but admins and beta
// testers always see it. Only the yes/no answer is returned.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allowed = user ? (await writingAccess(supabase, user)).allowed : WRITING_OPEN;
  return NextResponse.json({ allowed }, { headers: { "Cache-Control": "private, no-store" } });
}
