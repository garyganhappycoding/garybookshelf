import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SpeakingPractice from "@/components/SpeakingPractice";

export const metadata = { title: "Speaking practice · Gary's Bookshelf" };

export default async function SpeakingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let attemptsLeft = 2;
  let retry: { id: string; cardId: string } | null = null;
  let packLeft = 0;
  let packExpiry: string | null = null;
  if (user) {
    // the attempts left and the newest re-markable failed recording (saved for 24h) are independent
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const [{ data }, { data: pack }, { data: lastFailed }] = await Promise.all([
      supabase.rpc("speaking_attempts_left", { p_limit: 2 }),
      supabase.rpc("speaking_pack_status"),
      supabase
        .from("speaking_attempts")
        .select("id,card_id,created_at")
        .eq("user_id", user.id)
        .eq("status", "failed")
        .not("result", "is", null)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (typeof data === "number") attemptsLeft = data;
    const p = Array.isArray(pack) ? pack[0] : pack;
    if (p?.pack_left) {
      packLeft = p.pack_left;
      packExpiry = p.next_expiry;
    }
    if (lastFailed) retry = { id: lastFailed.id, cardId: lastFailed.card_id };
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-hand text-4xl text-clay-700 mb-1">Speaking practice</h1>
        {user && <Link href="/speaking/history" className="btn-secondary !py-1.5 shrink-0">My history</Link>}
      </div>
      <p className="text-ink/70 mb-8">
        Pick a theme, get a Part 2 question, speak for 2 minutes and get AI feedback based on the four speaking criteria.
      </p>

      {user ? (
        <SpeakingPractice initialAttemptsLeft={attemptsLeft} initialPackLeft={packLeft} packExpiry={packExpiry} initialRetry={retry} />
      ) : (
        <div className="card text-center max-w-md mx-auto">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-medium mb-1">Members only</p>
          <p className="text-sm text-ink/70 mb-4">Log in or create a free account to practise speaking (2 attempts every day).</p>
          <div className="flex justify-center gap-3">
            <Link href="/login" className="btn-primary">Log in</Link>
            <Link href="/signup" className="btn-secondary">Sign up</Link>
          </div>
        </div>
      )}
    </div>
  );
}
