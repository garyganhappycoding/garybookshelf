import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addUpdate, closePoll, createPoll, deleteUpdate } from "@/actions/inbox";

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
  const [{ data: polls }, { data: updates }, { data: votes }] = await Promise.all([
    admin.from("polls").select("id,title,is_open,created_at,poll_options(id,label,position)").order("created_at", { ascending: false }).limit(5),
    admin.from("project_updates").select("id,title,body,created_at").order("created_at", { ascending: false }).limit(20),
    admin.from("poll_votes").select("option_id"),
  ]);
  const counts = new Map<string, number>();
  for (const v of votes ?? []) counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1);

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 space-y-10">
      <div>
        <h1 className="text-2xl font-medium">The Bookshelf 100: updates and votes</h1>
        <p className="text-sm text-ink/60">
          Posts you add here show on <Link href="/100" className="underline">/100</Link>. Votes show on <Link href="/vote" className="underline">/vote</Link>. Results from students are in the{" "}
          <Link href="/admin/inbox" className="underline">inbox</Link>.
        </p>
      </div>

      <section className="card space-y-3">
        <h2 className="font-medium">Add a progress update</h2>
        <form action={addUpdate} className="space-y-3">
          <input name="title" className={box} placeholder="e.g. 25 people on the list!" maxLength={160} required />
          <textarea name="body" className={box} rows={4} placeholder="What happened this week?" maxLength={3000} required />
          <button className="btn-primary !py-1.5 text-sm">Publish</button>
        </form>
        <div className="space-y-2 pt-2">
          {(updates ?? []).map((u) => (
            <div key={u.id} className="flex justify-between gap-3 text-sm border-t border-ink/10 pt-2">
              <span>
                <b>{u.title}</b> <span className="text-ink/50">· {new Date(u.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur" })}</span>
              </span>
              <form action={deleteUpdate}>
                <input type="hidden" name="id" value={u.id} />
                <button className="text-red-600 text-xs">Delete</button>
              </form>
            </div>
          ))}
        </div>
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
