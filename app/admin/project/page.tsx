import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addWin, closePoll, createPoll, hideWin } from "@/actions/inbox";

export const dynamic = "force-dynamic";

const box = "w-full border border-ink/15 rounded-xl px-3 py-2 bg-white text-sm";

export default async function AdminProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const admin = createAdminClient();
  const [{ data: polls }, { data: wins }, { data: votes }] = await Promise.all([
    admin.from("polls").select("id,title,is_open,created_at,poll_options(id,label,position)").order("created_at", { ascending: false }).limit(5),
    admin
      .from("submissions")
      .select("id,body,display_name,created_at,payload")
      .eq("kind", "feedback")
      .eq("status", "approved")
      .in("consent_story", ["tag", "no_tag"])
      .or("payload->>hidden.is.null,payload->>hidden.neq.true")
      .order("created_at", { ascending: false })
      .limit(30),
    admin.from("poll_votes").select("option_id"),
  ]);
  const counts = new Map<string, number>();
  for (const v of votes ?? []) counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1);

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 space-y-10">
      <div>
        <h1 className="text-2xl font-medium">The Bookshelf 100: Wall of Wins and votes</h1>
        <p className="text-sm text-ink/60">
          Results you approve in the <Link href="/admin/inbox" className="underline">inbox</Link> appear on the wall at{" "}
          <Link href="/100" className="underline">/100</Link> by themselves. Votes show on <Link href="/vote" className="underline">/vote</Link>.
        </p>
      </div>

      <section className="card space-y-3">
        <h2 className="font-medium">Add a win yourself</h2>
        <p className="text-xs text-ink/60">For a result a student told you on Instagram, for example. It appears on the wall right away. Ask them first, and leave the name empty to keep them anonymous.</p>
        <form action={addWin} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <select name="criterion" className={box} defaultValue="grade">
              <option value="grade">📈 Grades improved</option>
              <option value="study">📚 Started studying on their own</option>
            </select>
            <input name="name" className={box} placeholder="First name or nickname (optional)" maxLength={60} />
            <input name="age_form" className={box} placeholder="Form or exam, e.g. Form 5 (no age)" maxLength={120} />
            <input name="subject" className={box} placeholder="Subject, e.g. Add Maths" maxLength={80} />
            <input name="exam" className={box} placeholder="Exam type, e.g. mid-year to trial" maxLength={80} />
            <input name="technique" className={box} placeholder="Technique (for studying wins)" maxLength={400} />
            <input name="before" className={box} placeholder="Before, e.g. 52" maxLength={30} />
            <input name="after" className={box} placeholder="Now, e.g. 68" maxLength={30} />
          </div>
          <textarea name="story" className={box} rows={3} placeholder="What they said, in their own words" maxLength={2000} />
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" name="counts" defaultChecked className="accent-clay-600" /> Count this toward The Bookshelf 100
          </label>
          <button className="btn-primary !py-1.5 text-sm">Add to the wall</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="font-medium">On the wall now</h2>
        {(wins ?? []).length === 0 && <p className="text-sm text-ink/50">Nothing yet. Approve a result in the inbox, or add one above.</p>}
        {(wins ?? []).map((w: any) => {
          const p = w.payload ?? {};
          return (
            <div key={w.id} className="flex justify-between gap-3 text-sm border-t border-ink/10 pt-2">
              <span>
                {p.criterion === "grade" ? `📈 ${p.subject ?? ""}: ${p.before} → ${p.after}` : "📚 Started studying on their own"}
                <span className="text-ink/50"> · {w.display_name && p.show_name ? w.display_name : "no name shown"}{p.added_by_gary ? " · added by you" : ""}</span>
              </span>
              <form action={hideWin}>
                <input type="hidden" name="id" value={w.id} />
                <button className="text-red-600 text-xs shrink-0">Remove from wall</button>
              </form>
            </div>
          );
        })}
      </section>

      <section className="card space-y-3">
        <h2 className="font-medium">Start a vote: what should the next video be?</h2>
        <p className="text-xs text-ink/60">Starting a new vote closes the current one.</p>
        <form action={createPoll} className="space-y-3">
          <input name="title" className={box} placeholder="Which video should I make next?" maxLength={200} required />
          <textarea name="options" className={box} rows={5} placeholder={"One choice per line, at least 2\nHow to stop procrastinating\nHow to memorise faster"} required />
          <button className="btn-primary !py-1.5 text-sm">Start the vote</button>
        </form>
        <div className="space-y-4 pt-2">
          {(polls ?? []).map((p: any) => (
            <div key={p.id} className="border-t border-ink/10 pt-3">
              <div className="flex justify-between gap-3 text-sm mb-1">
                <b>{p.title}</b>
                <span className={p.is_open ? "text-sage-600" : "text-ink/50"}>{p.is_open ? "Open" : "Closed"}</span>
              </div>
              {[...p.poll_options].sort((a: any, b: any) => a.position - b.position).map((o: any) => (
                <p key={o.id} className="text-sm flex justify-between"><span>{o.label}</span><b>{counts.get(o.id) ?? 0}</b></p>
              ))}
              {p.is_open && (
                <form action={closePoll} className="mt-2">
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-xs text-clay-700 underline">Close this vote</button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
