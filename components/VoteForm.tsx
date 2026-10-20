"use client";

import { useState, useTransition } from "react";
import { castVote } from "@/actions/community";

type Option = { id: string; label: string; votes: number };

export default function VoteForm({ pollId, options, voted, closed }: { pollId: string; options: Option[]; voted: boolean; closed: boolean }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(voted);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState(options);

  const showResults = done || closed;
  const total = local.reduce((n, o) => n + o.votes, 0);

  function vote(id: string) {
    setError(null);
    setPicked(id);
    startTransition(async () => {
      const r = await castVote(pollId, id);
      if (r.ok) {
        setLocal((list) => list.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o)));
        setDone(true);
      } else {
        setError(r.error ?? "Something went wrong.");
        if (r.error?.includes("already")) setDone(true);
      }
    });
  }

  return (
    <div className="space-y-3">
      {local.map((o) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        return showResults ? (
          <div key={o.id} className={`card !p-4 ${picked === o.id ? "border-clay-600" : ""}`}>
            <div className="flex justify-between gap-3 text-sm mb-1.5">
              <span className="font-medium">{o.label}</span>
              <span className="text-ink/60">{o.votes} · {pct}%</span>
            </div>
            <div className="h-2 bg-ink/10 rounded-full"><div className="h-2 bg-clay-500 rounded-full" style={{ width: `${pct}%` }} /></div>
          </div>
        ) : (
          <button key={o.id} type="button" disabled={pending} onClick={() => vote(o.id)} className="card w-full text-left !p-4 hover:border-clay-400 disabled:opacity-60 font-medium">
            {o.label}
          </button>
        );
      })}
      {done && !closed && <p className="text-sm text-sage-600">Thanks for voting! The most voted idea may become the next video.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
