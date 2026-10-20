import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Your message · Gary's Bookshelf", robots: { index: false } };
export const dynamic = "force-dynamic";

const STEPS = ["Received", "Read by Gary", "Answered"];

// A private page for one submission, reached only through its secret link. No account needed.
export default async function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{32}$/.test(token)) notFound();
  const { data: s } = await createAdminClient()
    .from("submissions")
    .select("kind,status,created_at,reply,reply_url,replied_at,body,payload,counts_for_goal")
    .eq("public_token", token)
    .in("kind", ["question", "feedback"])
    .maybeSingle();
  if (!s) notFound();

  const isQuestion = s.kind === "question";
  const step = s.status === "answered" || s.status === "approved" ? 2 : s.status === "read" || s.status === "rejected" ? 1 : 0;
  const finalLabel = isQuestion ? "Answered" : "Picked up";
  const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">{isQuestion ? "Your question" : "Your result"}</h1>
      <p className="text-sm text-ink/60 mb-6">Sent on {when(s.created_at)}. Keep this link private.</p>

      <div className="card mb-5">
        <ol className="flex items-center gap-2 text-sm">
          {[STEPS[0], STEPS[1], finalLabel].map((t, i) => (
            <li key={t} className="flex-1">
              <div className={`h-2 rounded-full mb-1 ${i <= step ? "bg-clay-500" : "bg-ink/10"}`} />
              <span className={i <= step ? "font-medium" : "text-ink/40"}>{t}</span>
            </li>
          ))}
        </ol>
        {s.status === "rejected" && !isQuestion && (
          <p className="text-sm text-ink/70 mt-4">Thank you for sharing. I wasn't able to use this one for the project, but I really appreciate it.</p>
        )}
        {s.status === "approved" && !isQuestion && s.counts_for_goal && (
          <p className="text-sm text-sage-600 mt-4">✅ Your result counts toward The Bookshelf 100. Thank you for being one of the 100!</p>
        )}
      </div>

      {s.reply && (
        <div className="card mb-5 !bg-sage-400/10">
          <p className="text-xs text-ink/60 mb-1">Gary replied{s.replied_at ? ` on ${when(s.replied_at)}` : ""}</p>
          <p className="whitespace-pre-line">{s.reply}</p>
          {s.reply_url && (
            <a href={s.reply_url} target="_blank" rel="noreferrer" className="btn-primary mt-3 inline-block !py-1.5 text-sm">
              Watch or read the answer
            </a>
          )}
        </div>
      )}

      {s.body && (
        <details className="text-sm text-ink/70 mb-6">
          <summary className="cursor-pointer">What you sent</summary>
          <p className="mt-2 whitespace-pre-line">{s.body}</p>
        </details>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/100" className="btn-secondary">The Bookshelf 100</Link>
        <Link href="/hi" className="btn-secondary">Back to start</Link>
      </div>
    </div>
  );
}
