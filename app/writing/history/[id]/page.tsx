import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WritingReport from "@/components/WritingReport";
import WritingComingSoon from "@/components/WritingComingSoon";
import { writingAccess } from "@/lib/writing/config";
import type { Genre, WritingPart, WritingResult } from "@/lib/writing/mark";

export const metadata = { title: "Essay marking · Gary's Bookshelf" };
export const dynamic = "force-dynamic";

export default async function WritingHistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!(await writingAccess(supabase, user.id)).allowed) return <WritingComingSoon />;

  // row-level security means a student can only ever read their own essays
  const { data: a } = await supabase.from("writing_attempts").select("id,part,genre,question,essay,word_count,status,total_score,result,tier").eq("id", id).single();
  if (!a || a.status !== "done" || !a.result) notFound();

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <Link prefetch={false} href="/writing/history" className="text-sm text-clay-700 hover:underline">
        ← My essays
      </Link>
      <h1 className="font-hand text-4xl text-clay-700 mt-2 mb-4">Essay marking</h1>
      <details className="card mb-4 text-sm">
        <summary className="cursor-pointer font-medium">The question</summary>
        <p className="whitespace-pre-wrap mt-2 text-ink/80">{a.question}</p>
      </details>
      <WritingReport
        data={{
          total: Number(a.total_score ?? 0),
          tier: a.tier === "paid" ? "paid" : "free",
          part: a.part as WritingPart,
          genre: a.genre as Genre,
          question: a.question,
          essay: a.essay,
          wordCount: a.word_count ?? 0,
          result: a.result as WritingResult,
        }}
      />
    </div>
  );
}
