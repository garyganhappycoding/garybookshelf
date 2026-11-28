import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import Link from "@/components/Link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Beta testers · 陪你读书", robots: { index: false, follow: false } };

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (p?.role !== "admin") notFound();
}

async function addAction(form: FormData) {
  "use server";
  await assertAdmin();
  const date = String(form.get("demo_today") ?? "").trim();
  const emails = [...new Set(String(form.get("emails") ?? "").split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)))].slice(0, 100);
  if (!emails.length) return;
  await createAdminClient().from("programme_beta_testers").upsert(
    emails.map((email) => ({ email, demo_today: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null })), { onConflict: "email" });
  revalidatePath("/admin/programme-beta");
}
async function removeAction(form: FormData) {
  "use server";
  await assertAdmin();
  await createAdminClient().from("programme_beta_testers").delete().eq("email", String(form.get("email")));
  revalidatePath("/admin/programme-beta");
}

// You may replace the feedback the student sees with your own words (the AI's version is then gone from the student's page).
async function replyAction(form: FormData) {
  "use server";
  await assertAdmin();
  const text = String(form.get("feedback") ?? "").trim().slice(0, 1500);
  if (!text) return;
  await createAdminClient().from("programme_submissions").update({ ai_feedback: text, ai_status: "done" }).eq("id", String(form.get("id")));
  revalidatePath("/admin/programme-beta");
}

const TIME_ZH: Record<string, string> = { lt10: "under 10 min", "10to20": "10-20 min", "20to30": "20-30 min", gt30: "over 30 min" };
const HELPFUL_ZH: Record<string, string> = { yes: "helpful", ok: "so-so", no: "not helpful" };
const AI_ZH: Record<string, string> = { pending: "等 AI", done: "AI 已回", waiting_gary: "等你回", failed: "AI 失败" };
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function BetaPage() {
  await assertAdmin();
  const admin = createAdminClient();
  const { data: testers } = await admin.from("programme_beta_testers").select("email, demo_today, added_at").order("added_at");
  const emails = (testers ?? []).map((t) => t.email);
  // who has already made an account (so you know who still needs to sign up)
  const { data: profiles } = emails.length ? await admin.from("profiles").select("email").in("email", emails) : { data: [] as { email: string }[] };
  const signedUp = new Set((profiles ?? []).map((p) => p.email.toLowerCase()));

  // what the testers have handed in lately: the answer next to the AI's feedback, so you can check both
  const { data: ids } = emails.length ? await admin.from("profiles").select("id, email").in("email", emails) : { data: [] as { id: string; email: string }[] };
  const who = new Map((ids ?? []).map((i) => [i.id, i.email]));
  const userIds = [...who.keys()];
  const { data: feedback } = userIds.length
    ? await admin.from("programme_beta_feedback").select("user_id, day, time_spent, ai_helpful, ai_why, stuck, change, badges_note, updated_at").in("user_id", userIds).order("updated_at", { ascending: false }).limit(60)
    : { data: [] as any[] };
  const [{ data: subs }, { data: essays }] = userIds.length
    ? await Promise.all([
        admin.from("programme_submissions").select("id, user_id, day, lang, answer, ai_feedback, ai_status, created_at").in("user_id", userIds).order("created_at", { ascending: false }).limit(40),
        admin.from("programme_essay_tests").select("user_id, lang, kind, period, question, essay, score, label, created_at").in("user_id", userIds).order("created_at", { ascending: false }).limit(20),
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }];
  return (
    <div className="max-w-2xl mx-auto px-5 py-10 space-y-6">
      <Link href="/admin" className="text-sm text-clay-600">&larr; Admin</Link>
      <h1 className="text-2xl font-medium">陪你读书 · Beta testers</h1>
      <p className="text-sm text-ink/70">
        The people on this list can open 陪你读书 while it is still closed to everyone else. They need no payment and no friend group. They log in with the same Gmail
        (log in with Google, or sign up with that email). Their programme date starts on 4 Jan 2027 (week 1) unless you set another start date below, and moves forward one day for every real day since you added them
        (so a two-week beta is weeks 1 and 2, and streak badges can build up). They can open earlier days to catch up, never later ones. AI feedback is on; you check their answers in <Link href="/admin/programme-inbox" className="underline">the inbox</Link> and the{" "}
        <Link href="/admin/programme-performance" className="underline">performance page</Link>.
      </p>

      <form action={addAction} className="card space-y-3">
        <label className="block text-sm">Gmail addresses (one per line, or separated by commas)
          <textarea name="emails" rows={5} required className="mt-1 w-full rounded-lg border border-ink/20 p-2 text-sm" placeholder="name@gmail.com" />
        </label>
        <label className="block text-sm">Their start date (YYYY-MM-DD). It is filled in as 4 Jan 2027 (week 1); every tester added gets this date unless you change it
          <input name="demo_today" defaultValue="2027-01-04" className="mt-1 w-full rounded-lg border border-ink/20 p-2 text-sm" placeholder="2027-01-04" />
        </label>
        <button type="submit" className="btn-primary">Add to beta list</button>
      </form>

      <div className="card">
        <p className="font-medium mb-2">{emails.length} beta tester{emails.length === 1 ? "" : "s"}</p>
        {emails.length === 0 ? <p className="text-sm text-ink/60">No one yet.</p> : (
          <ul className="divide-y divide-ink/10 text-sm">
            {(testers ?? []).map((t) => (
              <li key={t.email} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0 break-all">{t.email}
                  <span className="ml-2 text-xs text-ink/50">{signedUp.has(t.email.toLowerCase()) ? "has an account" : "no account yet"}{t.demo_today ? ` · date ${t.demo_today}` : ""}</span>
                </span>
                <form action={removeAction}><input type="hidden" name="email" value={t.email} /><button type="submit" className="text-xs text-ink/50 underline">Remove</button></form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">Daily feedback from testers ({(feedback ?? []).length})</h2>
        {(feedback ?? []).map((f: any, i: number) => (
          <div key={i} className="card text-sm space-y-1">
            <p className="text-xs text-ink/60">{who.get(f.user_id)} · day {f.day} · {TIME_ZH[f.time_spent] ?? "—"} · AI: {HELPFUL_ZH[f.ai_helpful] ?? "—"}</p>
            {f.ai_why && <p><span className="text-ink/50">AI feedback: </span>{f.ai_why}</p>}
            {f.stuck && <p><span className="text-ink/50">Stuck on: </span>{f.stuck}</p>}
            {f.change && <p><span className="text-ink/50">Change one thing: </span>{f.change}</p>}
            {f.badges_note && <p><span className="text-ink/50">Badges / wall / sharing: </span>{f.badges_note}</p>}
          </div>
        ))}
        {!(feedback ?? []).length && <p className="text-sm text-ink/60">No daily feedback yet.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Latest answers from testers ({(subs ?? []).length})</h2>
        {(subs ?? []).map((s: any) => (
          <div key={s.id} className="card text-sm">
            <p className="text-xs text-ink/60">{who.get(s.user_id)} · {s.day} · {s.lang} · handed in {when(s.created_at)}</p>
            <p className="mt-2 whitespace-pre-wrap">{s.answer}</p>
            <p className="mt-2 rounded-lg bg-ink/5 p-2 text-ink/80"><span className="mr-1 rounded bg-white px-1.5 py-0.5 text-xs">{AI_ZH[s.ai_status ?? "pending"] ?? s.ai_status}</span>{s.ai_feedback || "（还没有反馈）"}</p>
            <form action={replyAction} className="mt-2 space-y-2">
              <input type="hidden" name="id" value={s.id} />
              <textarea name="feedback" rows={2} placeholder="Replace the feedback the student sees with your own (optional)" className="w-full rounded-lg border border-ink/20 bg-white p-2" />
              <button className="btn-secondary text-xs">Send my feedback</button>
            </form>
          </div>
        ))}
        {!(subs ?? []).length && <p className="text-sm text-ink/60">Nothing handed in yet.</p>}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Latest essays and the AI score ({(essays ?? []).length})</h2>
        {(essays ?? []).map((e: any, i: number) => (
          <div key={i} className="card text-sm">
            <p className="text-xs text-ink/60">{who.get(e.user_id)} · {e.lang} · {e.kind} {e.period} · {when(e.created_at)}</p>
            <p className="mt-1 font-medium">AI score: {e.score != null ? `${Math.round(Number(e.score))}%` : "—"} {e.label ? `· ${e.label}` : ""}</p>
            <p className="mt-1 text-ink/60">{e.question}</p>
            <p className="mt-2 whitespace-pre-wrap">{e.essay}</p>
          </div>
        ))}
        {!(essays ?? []).length && <p className="text-sm text-ink/60">No essays yet.</p>}
      </section>
    </div>
  );
}
