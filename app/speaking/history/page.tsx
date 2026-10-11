import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCard, getTheme } from "@/lib/speaking/cards";
import { BAND_MAX } from "@/lib/speaking/analyze";

export const metadata = { title: "My speaking history · Gary's Bookshelf" };
export const dynamic = "force-dynamic";

export default async function SpeakingHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("speaking_attempts")
    .select("id,card_id,total_score,created_at")
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = data ?? [];
  const max = 4 * BAND_MAX;

  const scores = rows.map((r) => Number(r.total_score ?? 0));
  const best = scores.length ? Math.max(...scores) : 0;
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const trend = [...rows].reverse().slice(-12); // oldest to newest, last 12

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-hand text-4xl text-clay-700">My speaking history</h1>
          <p className="text-sm text-ink/60">Your past attempts. Tap one to see the full feedback again.</p>
        </div>
        <Link href="/speaking" className="btn-primary !py-1.5 shrink-0">Practise</Link>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center text-ink/60">
          <p className="text-3xl mb-2">🎤</p>
          <p>No attempts yet. Do your first practice and it will show up here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div className="card !p-3"><p className="text-xs text-ink/60">Attempts</p><p className="text-2xl font-medium">{rows.length}</p></div>
            <div className="card !p-3"><p className="text-xs text-ink/60">Best score</p><p className="text-2xl font-medium">{best}<span className="text-sm text-ink/50"> / {max}</span></p></div>
            <div className="card !p-3"><p className="text-xs text-ink/60">Average</p><p className="text-2xl font-medium">{avg.toFixed(1)}<span className="text-sm text-ink/50"> / {max}</span></p></div>
          </div>

          {trend.length > 1 && (
            <div className="card mb-4">
              <p className="text-sm font-medium mb-3">Your progress (latest {trend.length})</p>
              <div className="flex items-end gap-1.5 h-24">
                {trend.map((r) => (
                  <div key={r.id} className="flex-1 text-center">
                    <div className="bg-clay-400 rounded-t" style={{ height: `${(Number(r.total_score ?? 0) / max) * 72}px` }} title={`${r.total_score}/${max}`} />
                    <p className="text-[10px] text-ink/50 mt-0.5">{r.total_score}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {rows.map((r) => {
              const card = getCard(r.card_id);
              return (
                <Link key={r.id} href={`/speaking/history/${r.id}`} className="card !py-3 flex items-center justify-between gap-3 hover:border-clay-400">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{card?.title ?? "Question"}</p>
                    <p className="text-xs text-ink/50">
                      {card ? `${getTheme(card.theme).name} · ` : ""}
                      {new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <p className="font-medium text-clay-700 whitespace-nowrap">{r.total_score}<span className="text-xs text-ink/50"> / {max}</span></p>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
