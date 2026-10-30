import Link from "next/link";
import { GOAL } from "@/lib/community";
import { createAdminClient } from "@/lib/supabase/admin";
import ReplyCard from "@/components/ReplyCard";

export const metadata = { title: "Say hi to Gary · Gary's Bookshelf" };
export const revalidate = 60;

// The page behind the link in Gary's Instagram bio: everything a viewer might want to do, on big buttons, no login.
export default async function HiPage() {
  const { count } = await createAdminClient()
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("kind", "feedback")
    .eq("counts_for_goal", true);

  const items = [
    { href: "/question", emoji: "💬", title: "Ask Gary a question", text: "Stuck with studying? Tell me what's going on. No account needed." },
    { href: "/feedback", emoji: "📈", title: "Tell me your result", text: "Did your grades improve, or did you start studying on your own? Share it." },
    { href: "/vote", emoji: "🗳️", title: "Vote for my next video", text: "Help choose what I make next." },
    { href: "/100", emoji: "🎯", title: `The Bookshelf 100 · ${count ?? 0} of ${GOAL}`, text: "Our goal this year: help 100 people learn how to learn." },
  ];

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <div className="text-center mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/dolphin-icon.png" alt="" className="w-20 h-20 rounded-full mx-auto mb-3" />
        <h1 className="font-hand text-4xl text-clay-700">Hi, I'm Gary</h1>
        <p className="text-ink/70 mt-1">Pick what you'd like to do:</p>
      </div>
      <div className="space-y-3">
        <ReplyCard />
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="card !p-5 flex gap-4 items-center hover:border-clay-400">
            <span className="text-3xl">{i.emoji}</span>
            <span>
              <span className="block font-medium">{i.title}</span>
              <span className="block text-sm text-ink/60">{i.text}</span>
            </span>
          </Link>
        ))}
      </div>
      <p className="text-center text-sm text-ink/50 mt-6">
        <Link href="/shop" className="underline">Shop</Link> · <Link href="/speaking" className="underline">Speaking practice</Link> ·{" "}
        <Link href="/" className="underline">Home</Link>
      </p>
    </div>
  );
}
