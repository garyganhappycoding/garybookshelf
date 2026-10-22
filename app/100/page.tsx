import Link from "next/link";
import WinCard from "@/components/WinCard";
import { GOAL, GOAL_DEADLINE } from "@/lib/community";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "The Bookshelf 100 · Gary's Bookshelf" };
export const revalidate = 60;

export default async function HundredPage() {
  const admin = createAdminClient();
  const [{ count }, { data: wins }] = await Promise.all([
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("kind", "feedback").eq("counts_for_goal", true),
    // only results Gary approved and the student agreed to share, and never with a contact or age
    admin
      .from("submissions")
      .select("id,body,display_name,created_at,payload")
      .eq("kind", "feedback")
      .eq("status", "approved")
      .in("consent_story", ["tag", "no_tag"])
      .or("payload->>hidden.is.null,payload->>hidden.neq.true")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const done = count ?? 0;
  const pct = Math.min(100, Math.round((done / GOAL) * 100));
  const daysLeft = Math.max(0, Math.ceil((new Date(`${GOAL_DEADLINE}T23:59:59+08:00`).getTime() - Date.now()) / 86400_000));

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <div className="max-w-3xl">
        <p className="text-sm text-clay-700 font-medium uppercase tracking-wide mb-1">2026 goal</p>
        <h1 className="font-hand text-5xl text-clay-700 mb-2">The Bookshelf 100</h1>
        <p className="text-lg text-ink/80 mb-6">Help <b>100 people learn how to learn</b> by the end of this year, and prove it together.</p>

        <div className="card mb-8">
          <div className="flex items-end justify-between gap-3 mb-2">
            <p className="text-5xl font-medium">{done}<span className="text-xl text-ink/50"> / {GOAL}</span></p>
            <p className="text-sm text-ink/60">{daysLeft} days left</p>
          </div>
          <div className="h-3 bg-ink/10 rounded-full"><div className="h-3 bg-clay-500 rounded-full" style={{ width: `${pct}%` }} /></div>
          <p className="text-xs text-ink/50 mt-2">Only results Gary has checked are counted.</p>
        </div>
      </div>

      {/* WALL OF WINS */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="font-hand text-5xl text-clay-700">🌟 Wall of Wins</h2>
          <p className="text-ink/70 mt-1">Real students. Real results. You could be next.</p>
        </div>

        {(wins ?? []).length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {wins!.map((w) => (
              <WinCard key={w.id} win={w as any} />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center border-2 border-dashed border-clay-400/60 rounded-2xl p-8">
            <p className="text-4xl mb-2">📌</p>
            <p className="font-medium mb-1">The first win goes here</p>
            <p className="text-sm text-ink/60 mb-4">When students share how their grades improved, their results appear on this wall.</p>
            <Link href="/feedback" className="btn-primary">Be the first</Link>
          </div>
        )}

        {(wins ?? []).length > 0 && (
          <div className="text-center mt-4">
            <Link href="/feedback" className="btn-primary">Add my result to the wall</Link>
          </div>
        )}
        <p className="text-xs text-ink/50 text-center mt-3">Ages are never shown. Names appear only if the student agreed.</p>
      </section>

      <section className="max-w-3xl mb-8">
        <h2 className="text-xl font-medium mb-2">How do you get on the list?</h2>
        <p className="text-ink/80 mb-3">You count if one of these is true for you:</p>
        <ul className="space-y-2 text-ink/80">
          <li className="card !p-4">📈 <b>Your grades improved</b>, about 10% or more in the same type of exam, after watching my videos. Adding your result paper helps me check it.</li>
          <li className="card !p-4">📚 <b>You started to study on your own</b> because of my videos, and you actually did what I taught.</li>
        </ul>
        <Link href="/feedback" className="btn-primary mt-4 inline-block">Add my result</Link>
        <p className="text-xs text-ink/50 mt-3">You choose whether I can share yours on Instagram, and whether I tag you. Under 18? A parent or guardian needs to agree.</p>
      </section>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/question" className="btn-secondary">Ask a question</Link>
        <Link href="/vote" className="btn-secondary">Vote for the next video</Link>
      </div>
    </div>
  );
}
