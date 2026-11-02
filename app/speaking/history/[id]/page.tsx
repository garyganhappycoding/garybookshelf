import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCard } from "@/lib/speaking/cards";
import type { AnalysisResponse } from "@/lib/speaking/analyze";
import { Result } from "@/components/SpeakingPractice";

export const metadata = { title: "Speaking feedback · Gary's Bookshelf" };
export const dynamic = "force-dynamic";

export default async function SpeakingHistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // row-level security means a student can only ever read their own attempts
  const { data: attempt } = await supabase
    .from("speaking_attempts")
    .select("id,card_id,part,status,total_score,result,created_at")
    .eq("id", id)
    .single();
  const card = attempt ? getCard(attempt.card_id) : undefined;
  if (!attempt || attempt.status !== "done" || !attempt.result || !card) notFound();

  const stored = attempt.result as { transcript: string; stats: AnalysisResponse["stats"]; result: AnalysisResponse["result"]; tier?: "free" | "paid"; edited?: boolean };
  const data: AnalysisResponse = {
    attemptId: attempt.id,
    transcript: stored.transcript,
    stats: stored.stats,
    result: stored.result,
    tier: stored.tier,
    edited: stored.edited,
    part: (attempt as { part?: number }).part === 3 ? 3 : 2,
    total: Number(attempt.total_score ?? 0),
    attemptsLeft: 0,
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="flex items-center justify-between mb-6 text-sm">
        <Link prefetch={false}  href="/speaking/history" className="text-clay-600 hover:underline">← My history</Link>
        <span className="text-ink/50">
          {new Date(attempt.created_at).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>
      <Result data={data} card={card} />
      <div className="mt-6">
        <Link prefetch={false}  href="/speaking" className="btn-primary">Practise again</Link>
      </div>
    </div>
  );
}
