import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");
}

async function setStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["answered", "ignored", "open"].includes(status)) return;
  await createAdminClient().from("ask_gary_unanswered").update({ status }).eq("id", id);
  revalidatePath("/admin/ask-gary");
}

const myDay = (d: string | Date) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });

export default async function AdminAskGaryPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ data: events }, { data: unanswered }, { data: knowledge }] = await Promise.all([
    admin.from("ask_gary_events").select("id,status,found,entry_ids,language,level,question,vote,safety,draft_mode,created_at").order("created_at", { ascending: false }).limit(1000),
    admin.from("ask_gary_unanswered").select("id,question,context,status,created_at").eq("status", "open").order("created_at", { ascending: false }).limit(100),
    admin.from("gary_knowledge").select("id,topic,review"),
  ]);

  const ev = events ?? [];
  const done = ev.filter((e) => e.status === "done" && !e.draft_mode); // real students only, admin tests excluded
  const today = myDay(new Date());
  const week = Date.now() - 7 * 86400_000;
  const answered = done.filter((e) => e.found === true).length;
  const missed = done.filter((e) => e.found === false).length;
  const up = done.filter((e) => e.vote === 1).length;
  const down = done.filter((e) => e.vote === -1).length;
  const safety = done.filter((e) => e.safety).length;

  const topic = new Map((knowledge ?? []).map((k) => [k.id, k.topic.split(" / ")[0]]));
  const hits = new Map<string, number>();
  for (const e of done) for (const id of e.entry_ids ?? []) hits.set(id, (hits.get(id) ?? 0) + 1);
  const topHits = [...hits].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const approved = (knowledge ?? []).filter((k) => k.review === "Approved").length;
  const levels = new Map<string, number>();
  for (const e of done) if (e.level) levels.set(e.level, (levels.get(e.level) ?? 0) + 1);

  return (
    <div className="max-w-4xl mx-auto px-5 py-14 space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Ask Gary</h1>
        <p className="text-sm text-ink/60">Real students only (your own test questions are not counted). No names or emails are shown here.</p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Questions today" value={done.filter((e) => myDay(e.created_at) === today).length} />
        <Stat label="Last 7 days" value={done.filter((e) => +new Date(e.created_at) >= week).length} />
        <Stat label="Answered from Gary" value={`${answered}`} sub={`${done.length ? Math.round((answered / done.length) * 100) : 0}% of all`} />
        <Stat label="Not answered yet" value={missed} sub={`${up} 👍 · ${down} 👎`} />
      </section>

      <p className="text-xs text-ink/50">
        Knowledge in the bot: {knowledge?.length ?? 0} entries, <b>{approved} approved</b> (only these are used for students).
        {safety > 0 && <> · {safety} message(s) triggered the safety reply.</>}
      </p>

      <section className="card">
        <h2 className="font-medium mb-1">Questions Gary has not answered yet</h2>
        <p className="text-sm text-ink/60 mb-3">Answer one by adding it to the gary ai database in Notion (and a reel link), then mark it answered here.</p>
        {(unanswered ?? []).length === 0 ? (
          <p className="text-sm text-ink/50">Nothing waiting. 🎉</p>
        ) : (
          <div className="space-y-3">
            {unanswered!.map((u: any) => (
              <div key={u.id} className="border border-ink/10 rounded-xl p-3">
                <p className="text-xs text-ink/50 mb-1">
                  {new Date(u.created_at).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "medium", timeStyle: "short" })}
                  {u.context?.level ? ` · ${u.context.level}` : ""}
                  {u.context?.effort ? ` · ${u.context.effort}` : ""}
                </p>
                <p className="text-sm whitespace-pre-wrap">{u.question}</p>
                <div className="flex gap-2 mt-2">
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="status" value="answered" />
                    <button className="btn-secondary !py-1 !text-xs">Mark answered</button>
                  </form>
                  <form action={setStatus}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="status" value="ignored" />
                    <button className="text-xs text-ink/50 hover:text-red-600 px-2">Ignore</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <div className="card">
          <h2 className="font-medium mb-2">Most used entries</h2>
          {topHits.map(([id, n]) => (
            <p key={id} className="text-sm flex justify-between gap-3">
              <span className="truncate">{topic.get(id) ?? id}</span>
              <b>{n}</b>
            </p>
          ))}
          {topHits.length === 0 && <p className="text-sm text-ink/50">No data yet.</p>}
        </div>
        <div className="card">
          <h2 className="font-medium mb-2">Who is asking (level)</h2>
          {[...levels].sort((a, b) => b[1] - a[1]).map(([k, n]) => (
            <p key={k} className="text-sm flex justify-between">
              <span>{k}</span>
              <b>{n}</b>
            </p>
          ))}
          {levels.size === 0 && <p className="text-sm text-ink/50">No data yet.</p>}
        </div>
      </section>

      <section className="card">
        <h2 className="font-medium mb-3">Recent questions</h2>
        <div className="space-y-2">
          {done.slice(0, 30).map((e) => (
            <div key={e.id} className="text-sm border-t border-ink/10 pt-2">
              <p className="text-xs text-ink/50">
                {new Date(e.created_at).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "short", timeStyle: "short" })}
                {e.level ? ` · ${e.level}` : ""} ·{" "}
                {e.safety ? "safety reply" : e.found ? "answered" : "not answered"}
                {e.vote === 1 ? " · 👍" : e.vote === -1 ? " · 👎" : ""}
              </p>
              <p>{e.question}</p>
            </div>
          ))}
          {done.length === 0 && <p className="text-sm text-ink/50">No student questions yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <p className="text-xs text-ink/60">{label}</p>
      <p className="text-2xl font-medium">{value}</p>
      {sub && <p className="text-xs text-ink/50">{sub}</p>}
    </div>
  );
}
