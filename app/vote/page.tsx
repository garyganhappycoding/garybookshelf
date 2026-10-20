import { cookies } from "next/headers";
import Link from "next/link";
import VoteForm from "@/components/VoteForm";
import { visitorHash } from "@/lib/community";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Vote for the next video · Gary's Bookshelf" };
export const dynamic = "force-dynamic";

export default async function VotePage() {
  const admin = createAdminClient();
  const { data: poll } = await admin.from("polls").select("id,title,is_open").order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (!poll)
    return (
      <div className="max-w-xl mx-auto px-5 py-12 text-center">
        <h1 className="font-hand text-4xl text-clay-700 mb-2">Vote for my next video</h1>
        <p className="text-ink/70 mb-4">There's no vote open right now. Check my Instagram story, or send me an idea.</p>
        <Link href="/question" className="btn-primary">Send an idea</Link>
      </div>
    );

  const [{ data: options }, { data: votes }] = await Promise.all([
    admin.from("poll_options").select("id,label,position").eq("poll_id", poll.id).order("position"),
    admin.from("poll_votes").select("option_id").eq("poll_id", poll.id),
  ]);
  const counts = new Map<string, number>();
  for (const v of votes ?? []) counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1);

  // has this visitor already voted? (same cookie and connection as when they voted)
  const voter = (await cookies()).get("bk_voter")?.value;
  let voted = false;
  if (voter) {
    const { data } = await admin.from("poll_votes").select("id").eq("poll_id", poll.id).eq("voter_hash", await visitorHash(voter)).maybeSingle();
    voted = !!data;
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">Vote for my next video</h1>
      <p className="text-lg font-medium mb-1">{poll.title}</p>
      <p className="text-sm text-ink/60 mb-5">{poll.is_open ? "Tap one to vote. No account needed." : "This vote is closed. Here are the results."}</p>
      <VoteForm
        pollId={poll.id}
        options={(options ?? []).map((o) => ({ id: o.id, label: o.label, votes: counts.get(o.id) ?? 0 }))}
        voted={voted}
        closed={!poll.is_open}
      />
    </div>
  );
}
