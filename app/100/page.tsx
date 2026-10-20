import Link from "next/link";
import { GOAL, GOAL_DEADLINE } from "@/lib/community";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "The Bookshelf 100 · Gary's Bookshelf" };
export const dynamic = "force-dynamic";

export default async function HundredPage() {
  const admin = createAdminClient();
  const [{ count }, { data: stories }, { data: updates }] = await Promise.all([
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("kind", "feedback").eq("counts_for_goal", true),
    // only approved results the student agreed to share, and never with a name or contact
    admin
      .from("submissions")
      .select("id,payload,body,created_at")
      .eq("kind", "feedback")
      .eq("counts_for_goal", true)
      .in("consent_story", ["tag", "no_tag"])
      .order("created_at", { ascending: false })
      .limit(12),
    admin.from("project_updates").select("id,title,body,created_at").eq("is_published", true).order("created_at", { ascending: false }).limit(10),
  ]);

  const done = count ?? 0;
  const pct = Math.min(100, Math.round((done / GOAL) * 100));
  const daysLeft = Math.max(0, Math.ceil((new Date(`${GOAL_DEADLINE}T23:59:59+08:00`).getTime() - Date.now()) / 86400_000));

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
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

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-2">How do you get on the list?</h2>
        <p className="text-ink/80 mb-3">You count if one of these is true for you:</p>
        <ul className="space-y-2 text-ink/80">
          <li className="card !p-4">📈 <b>Your grades improved</b>, about 10% or more in the same type of exam, after watching my videos. Adding your result paper helps me check it.</li>
          <li className="card !p-4">📚 <b>You started to study on your own</b> because of my videos, and you actually did what I taught.</li>
        </ul>
        <Link href="/feedback" className="btn-primary mt-4 inline-block">Add my result</Link>
        <p className="text-xs text-ink/50 mt-3">You choose whether I can share yours on Instagram, and whether I tag you. Under 18? A parent or guardian needs to agree.</p>
      </section>

      {(updates ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-3">Progress updates</h2>
          <div className="space-y-3">
            {updates!.map((u) => (
              <div key={u.id} className="card !p-4">
                <p className="text-xs text-ink/50 mb-0.5">{new Date(u.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="font-medium">{u.title}</p>
                <p className="text-sm text-ink/70 whitespace-pre-line">{u.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(stories ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-medium mb-3">Results from students</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {stories!.map((s) => {
              const p = s.payload as any;
              return (
                <div key={s.id} className="card !p-4">
                  <p className="text-xs text-ink/50 mb-1">{p.age_form}</p>
                  {p.criterion === "grade" ? (
                    <p className="font-medium">{p.subject}: {p.before} → {p.after}</p>
                  ) : (
                    <p className="font-medium">Started studying on their own</p>
                  )}
                  {s.body && <p className="text-sm text-ink/70 mt-1 line-clamp-4">{s.body}</p>}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-ink/50 mt-2">Names are never shown here.</p>
        </section>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/question" className="btn-secondary">Ask a question</Link>
        <Link href="/vote" className="btn-secondary">Vote for the next video</Link>
      </div>
    </div>
  );
}
