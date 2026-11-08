import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BAND_MAX, GENRE_LABEL, type Genre } from "@/lib/writing/mark";
import { writingAccess } from "@/lib/writing/config";
import WritingComingSoon from "@/components/WritingComingSoon";

export const metadata = { title: "My essays · Gary's Bookshelf" };
export const dynamic = "force-dynamic";

export default async function WritingHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await writingAccess(supabase, user)).allowed) return <WritingComingSoon />;

  // row-level security means a student only ever reads their own essays
  const { data } = await supabase
    .from("writing_attempts")
    .select("id,part,genre,question,total_score,word_count,created_at")
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = data ?? [];
  const max = BAND_MAX * 4;

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-hand text-4xl text-clay-700">My essays</h1>
          <p className="text-sm text-ink/60">Your past essays. Tap one to see the full marking again.</p>
        </div>
        <Link prefetch={false} href="/writing" className="btn-primary !py-1.5 shrink-0">
          Write
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center text-ink/60">
          <p className="text-3xl mb-2">✍️</p>
          <p>No essays yet. Get your first one marked and it will show up here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Link prefetch={false} key={r.id} href={`/writing/history/${r.id}`} className="card !py-3 flex items-center justify-between gap-3 hover:border-clay-400">
              <div className="min-w-0">
                <p className="font-medium truncate">{String(r.question).replace(/\s+/g, " ")}</p>
                <p className="text-xs text-ink/50">
                  Part {r.part} · {GENRE_LABEL[r.genre as Genre] ?? r.genre} · {r.word_count} words ·{" "}
                  {new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <p className="font-medium text-clay-700 whitespace-nowrap">
                {r.total_score}
                <span className="text-xs text-ink/50"> / {max}</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
