import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google sends the person back here with a one-time code. We swap it for a login session (stored in cookies), then continue.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const n = searchParams.get("next") ?? "";
  const next = n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : "";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // an account made in the last minute is a new member: show them where everything is
      const created = data.user?.created_at ? Date.parse(data.user.created_at) : 0;
      const isNew = Date.now() - created < 60_000;
      return NextResponse.redirect(`${origin}${next || (isNew ? "/start" : "/dashboard")}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Google sign-in did not finish. Please try again.")}`);
}
