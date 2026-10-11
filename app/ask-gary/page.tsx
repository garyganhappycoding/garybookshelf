import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AskGaryChat from "@/components/AskGaryChat";
import { ASK_GARY_OPEN, DAILY_LIMIT } from "@/lib/ask-gary/config";

export const metadata = { title: "Ask Gary · Gary's Bookshelf" };

function ComingSoon() {
  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/dolphin-icon.png" alt="" className="w-16 h-16 rounded-full mx-auto mb-4" />
      <p className="inline-block text-xs bg-sage-400/20 text-sage-600 px-3 py-1 rounded-full mb-3">Coming soon</p>
      <h1 className="font-hand text-4xl text-clay-700 mb-3">Ask Gary</h1>
      <p className="text-ink/70 leading-7 mb-2">
        Gary's AI study buddy is on the way. Tell it your situation, and it will point you to what Gary has already shared about it,
        like his reels and notes.
      </p>
      <p className="text-ink/70 leading-7 mb-2">We're still putting everything together. Check back soon!</p>
      <p className="text-sm text-ink/60 mb-8">When it opens, each member can ask {DAILY_LIMIT} questions per day.</p>
      <div className="flex justify-center gap-3">
        <Link href="/#resources" className="btn-primary">Free resources</Link>
        <Link href="/speaking" className="btn-secondary">Try Speaking practice</Link>
      </div>
    </div>
  );
}

// The bot is paused for members until ASK_GARY_OPEN=true. Admins can always use it for testing.
export default async function AskGaryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <ComingSoon />;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";
  if (!ASK_GARY_OPEN && !isAdmin) return <ComingSoon />;

  const { data: left } = await supabase.rpc("ask_gary_questions_left", { p_limit: DAILY_LIMIT });
  return <AskGaryChat userId={user.id} initialLeft={typeof left === "number" ? left : DAILY_LIMIT} limit={DAILY_LIMIT} isAdmin={isAdmin} />;
}
