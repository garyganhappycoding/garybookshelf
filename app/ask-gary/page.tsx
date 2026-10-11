import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AskGaryChat from "@/components/AskGaryChat";
import { DAILY_LIMIT } from "@/lib/ask-gary/config";

export const metadata = { title: "Ask Gary · Gary's Bookshelf" };

// Members only: the bot answers only from what Gary has approved.
export default async function AskGaryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-5 py-20 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/dolphin-icon.png" alt="" className="w-16 h-16 rounded-full mx-auto mb-4" />
        <h1 className="font-hand text-4xl text-clay-700 mb-3">Ask Gary</h1>
        <p className="text-ink/70 leading-7 mb-2">
          Stuck with studying? Tell Gary your situation, and he will point you to what he has already shared about it, like his reels and notes.
        </p>
        <p className="text-sm text-ink/60 mb-6">Free for members. Each member can ask {DAILY_LIMIT} questions per day.</p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className="btn-primary">Log in</Link>
          <Link href="/signup" className="btn-secondary">Sign up</Link>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";
  const { data: left } = await supabase.rpc("ask_gary_questions_left", { p_limit: DAILY_LIMIT });

  return <AskGaryChat userId={user.id} initialLeft={typeof left === "number" ? left : DAILY_LIMIT} limit={DAILY_LIMIT} isAdmin={isAdmin} />;
}
