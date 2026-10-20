import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { approveSubmission, markRead, rejectSubmission, replyTo } from "@/actions/inbox";
import { GOAL } from "@/lib/community";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
type Tab = "question" | "feedback" | "reaction";
const box = "w-full border border-ink/15 rounded-xl px-3 py-2 bg-white text-sm";
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "medium", timeStyle: "short" });

const statusStyle: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  read: "bg-ink/10 text-ink/70",
  answered: "bg-sage-400/20 text-sage-600",
  approved: "bg-sage-400/20 text-sage-600",
  rejected: "bg-red-100 text-red-700",
};

export default async function AdminInboxPage({ searchParams }: { searchParams: Promise<{ tab?: string; show?: string; page?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const tab: Tab = sp.tab === "feedback" || sp.tab === "reaction" ? sp.tab : "question";
  const show = sp.show === "all" ? "all" : "todo"; // "todo" = still needs Gary
  const admin = createAdminClient();

  const head = (kind: string, status?: string[]) => {
    let q = admin.from("submissions").select("id", { count: "exact", head: true }).eq("kind", kind);
    if (status) q = q.in("status", status);
    return q;
  };
  const [{ count: newQuestions }, { count: pendingResults }, { count: approved }, { count: up }, { count: down }] = await Promise.all([
    head("question", ["new"]),
    head("feedback", ["new", "read"]),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("kind", "feedback").eq("counts_for_goal", true),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("kind", "reaction").filter("payload->>rating", "eq", "1"),
    admin.from("submissions").select("id", { count: "exact", head: true }).eq("kind", "reaction").filter("payload->>rating", "eq", "-1"),
  ]);

  // the list for the chosen tab
  let q = admin.from("submissions").select("*", { count: "exact" }).eq("kind", tab);
  if (show === "todo" && tab === "question") q = q.in("status", ["new", "read"]);
  if (show === "todo" && tab === "feedback") q = q.in("status", ["new", "read"]);
  const { count: listCount } = await admin.from("submissions").select("id", { count: "exact", head: true }).eq("kind", tab).in("status", show === "todo" && tab !== "reaction" ? ["new", "read"] : ["new", "read", "answered", "approved", "rejected"]);
  const total = listCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const { data } = await q.order("created_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const rows = (data ?? []) as any[];

  // emails for reactions, and private links for result papers (valid 10 minutes)
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  const { data: profs } = userIds.length ? await admin.from("profiles").select("id,email").in("id", userIds) : { data: [] as any[] };
  const emailOf = new Map((profs ?? []).map((p: any) => [p.id, p.email as string]));
  const proofUrl = new Map<string, string>();
  for (const r of rows) {
    if (r.proof_path) {
      const { data: signed } = await admin.storage.from("result-slips").createSignedUrl(r.proof_path, 600);
      if (signed?.signedUrl) proofUrl.set(r.id, signed.signedUrl);
    }
  }

  const href = (t: Tab, s: string, p = 1) => `/admin/inbox?tab=${t}&show=${s}${p > 1 ? `&page=${p}` : ""}`;
  const tabs: [Tab, string, number][] = [
    ["question", "Questions", newQuestions ?? 0],
    ["feedback", "Results", pendingResults ?? 0],
    ["reaction", "Speaking reactions", 0],
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-5 py-14 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium">Inbox</h1>
          <p className="text-sm text-ink/60">Questions and results sent from your Instagram link. Nothing here goes to Telegram.</p>
        </div>
        <Link href="/admin/project" className="btn-secondary !py-1.5 text-sm">Updates and votes</Link>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="New questions" value={newQuestions ?? 0} />
        <Stat label="Results to review" value={pendingResults ?? 0} />
        <Stat label="The Bookshelf 100" value={`${approved ?? 0} / ${GOAL}`} />
        <Stat label="Speaking 👍 / 👎" value={`${up ?? 0} / ${down ?? 0}`} />
      </section>

      <div className="flex flex-wrap gap-2 items-center">
        {tabs.map(([t, label, n]) => (
          <Link key={t} href={href(t, show)} className={`px-4 py-1.5 rounded-full border text-sm ${tab === t ? "border-clay-600 bg-clay-600 text-white font-medium" : "border-ink/15 hover:border-clay-400"}`}>
            {label}{n > 0 ? ` (${n})` : ""}
          </Link>
        ))}
        {tab !== "reaction" && (
          <span className="ml-auto text-sm">
            <Link href={href(tab, "todo")} className={show === "todo" ? "font-medium underline" : "text-ink/60"}>Needs me</Link> ·{" "}
            <Link href={href(tab, "all")} className={show === "all" ? "font-medium underline" : "text-ink/60"}>Everything</Link>
          </span>
        )}
      </div>

      <p className="text-xs text-ink/50">{total === 0 ? "Nothing here." : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`}</p>

      <div className="space-y-4">
        {tab === "reaction" &&
          rows.map((r) => (
            <div key={r.id} className="card !p-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-xl">{r.payload?.rating === 1 ? "👍" : "👎"}</span>
              <span className="text-ink/60">{when(r.created_at)}</span>
              <span>{emailOf.get(r.user_id) ?? "?"}</span>
              {r.payload?.note && <span className="text-ink/80">“{r.payload.note}”</span>}
            </div>
          ))}

        {tab === "question" &&
          rows.map((r) => {
            const p = r.payload ?? {};
            return (
              <article key={r.id} className="card space-y-3">
                <Head r={r} />
                <Row k="Age / form" v={p.age_form} />
                {p.mode === "free" ? (
                  <Row k="Free message" v={r.body} />
                ) : (
                  <>
                    <Row k="Problem" v={r.body} />
                    <Row k="What happens" v={p.scenario} />
                    <Row k="Tried so far" v={p.tried} />
                    <Row k="Hoping for" v={p.wish} />
                  </>
                )}
                <p className="text-xs text-ink/60">
                  {r.display_name ? `Name: ${r.display_name} · ` : "Anonymous · "}
                  {r.contact ? `Reply to: ${r.contact}` : "no contact given"}
                  {p.publish_ok ? " · OK to answer publicly (no name)" : ""}
                </p>
                {r.status !== "answered" && (
                  <form action={replyTo} className="space-y-2">
                    <input type="hidden" name="id" value={r.id} />
                    <textarea name="reply" className={box} rows={3} placeholder="Your reply (shown on their private tracking link)" required />
                    <input name="reply_url" className={box} placeholder="Link to your video or story answer (optional)" />
                    <div className="flex gap-3 items-center">
                      <button className="btn-primary !py-1.5 text-sm">Mark as answered</button>
                    </div>
                  </form>
                )}
                {r.status === "answered" && <p className="text-sm bg-sage-400/10 rounded-lg p-3 whitespace-pre-line">{r.reply}{r.reply_url ? `\n${r.reply_url}` : ""}</p>}
                {r.status === "new" && (
                  <form action={markRead}><input type="hidden" name="id" value={r.id} /><button className="text-xs text-clay-700 underline">Mark as read</button></form>
                )}
              </article>
            );
          })}

        {tab === "feedback" &&
          rows.map((r) => {
            const p = r.payload ?? {};
            return (
              <article key={r.id} className="card space-y-3">
                <Head r={r} />
                <Row k="Type" v={p.criterion === "grade" ? "📈 Grades improved" : "📚 Started studying on their own"} />
                <Row k="Age / form" v={p.age_form} />
                {p.criterion === "grade" && (
                  <>
                    <Row k="Subject" v={`${p.subject ?? ""}${p.exam ? ` (${p.exam})` : ""}`} />
                    <Row k="Result" v={`${p.before} → ${p.after}`} />
                  </>
                )}
                {p.technique && <Row k="Technique" v={p.technique} />}
                <Row k="Their words" v={r.body} />
                {p.video_link && <Row k="Video / series" v={p.video_link} link />}
                {proofUrl.get(r.id) ? (
                  <p className="text-sm"><b>Result paper:</b>{" "}
                    <a className="text-clay-700 underline" href={proofUrl.get(r.id)} target="_blank" rel="noreferrer">open (link works for 10 minutes), then save to your Google Drive</a>
                  </p>
                ) : (
                  <p className="text-sm text-ink/50">No result paper attached.</p>
                )}
                <p className="text-xs text-ink/60">
                  Story: <b>{r.consent_story === "tag" ? `OK, tag me (${r.contact})` : r.consent_story === "no_tag" ? "OK, don't tag" : "do NOT share"}</b>
                  {p.under18 ? ` · under 18, parent ok: ${r.parent_ok ? "yes" : "NO"}` : ""}
                  {r.display_name ? ` · name: ${r.display_name}` : ""}
                  {r.contact && r.consent_story !== "tag" ? ` · IG: ${r.contact}` : ""}
                  {r.account_email ? ` · account email: ${r.account_email}` : " · no account email"}
                </p>
                {r.status === "approved" && <p className="text-sm text-sage-600">✅ Counted in The Bookshelf 100{r.reward_note ? ` · ${r.reward_note}` : ""}</p>}
                {r.status !== "approved" && r.status !== "rejected" && (
                  <div className="flex flex-wrap gap-4 items-center pt-1">
                    <form action={approveSubmission} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="id" value={r.id} />
                      <button className="btn-primary !py-1.5 text-sm">Approve (counts for the 100)</button>
                      <label className="text-xs flex items-center gap-1.5">
                        <input type="checkbox" name="grant" defaultChecked={!!r.account_email} className="accent-clay-600" />
                        also give 1 free Speaking attempt and email them
                      </label>
                    </form>
                    <form action={rejectSubmission}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-sm text-red-600">Reject</button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 text-sm">
          {page > 1 && <Link href={href(tab, show, page - 1)} className="btn-secondary !py-1.5">← Newer</Link>}
          <span className="py-1.5 text-ink/50">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={href(tab, show, page + 1)} className="btn-secondary !py-1.5">Older →</Link>}
        </div>
      )}
    </div>
  );
}

function Head({ r }: { r: any }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-ink/50">{when(r.created_at)}</span>
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusStyle[r.status] ?? ""}`}>{r.status}</span>
    </div>
  );
}

function Row({ k, v, link }: { k: string; v?: string | null; link?: boolean }) {
  if (!v) return null;
  return (
    <p className="text-sm">
      <b className="text-ink/60 font-medium">{k}: </b>
      {link ? <a href={v} target="_blank" rel="noreferrer" className="text-clay-700 underline break-all">{v}</a> : <span className="whitespace-pre-line">{v}</span>}
    </p>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <p className="text-xs text-ink/60">{label}</p>
      <p className="text-2xl font-medium">{value}</p>
    </div>
  );
}
