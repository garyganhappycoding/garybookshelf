"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyThreads, type ThreadSummary } from "@/actions/community";
import { getSeen } from "@/lib/my-threads";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Where a student finds Gary's answers: the questions asked from their account, newest first.
export default function RepliesPage() {
  const [state, setState] = useState<{ loggedIn: boolean; threads: ThreadSummary[] } | null>(null);

  useEffect(() => {
    getMyThreads().then(setState);
  }, []);

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">Gary&apos;s replies</h1>
      <p className="text-ink/70 mb-6">Your questions and my answers. Open one to read it and reply.</p>

      {state === null && <p className="text-ink/50">Looking...</p>}

      {state && !state.loggedIn && (
        <div className="card text-center">
          <p className="mb-3">Log in to see your questions and my replies.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login?next=%2Freplies" className="btn-primary">Log in</Link>
            <Link href="/signup?next=%2Freplies" className="btn-secondary">Create a free account</Link>
          </div>
        </div>
      )}

      {state?.loggedIn && state.threads.length === 0 && (
        <div className="card mb-6">
          <p className="mb-3">Nothing here yet. Questions you ask while logged in show up here.</p>
          <Link prefetch={false} href="/question" className="btn-primary">Ask Gary a question</Link>
        </div>
      )}

      <div className="space-y-3">
        {state?.threads.map((t) => {
          const isNew = t.lastSender === "gary" && t.lastAt > getSeen(t.token);
          return (
            <Link key={t.token} href={`/track/${t.token}`} className={`card block hover:border-clay-400 ${isNew ? "border-red-300" : ""}`}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-xs text-ink/50">Asked {when(t.createdAt)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isNew ? "bg-red-600 text-white" : t.lastSender === "gary" ? "bg-sage-400/20 text-sage-600" : "bg-amber-100 text-amber-800"}`}>
                  {isNew ? "New reply" : t.lastSender === "gary" ? "Answered" : "Waiting for Gary"}
                </span>
              </div>
              <p className="font-medium line-clamp-2">{t.question}</p>
              {t.lastSender === "gary" && t.lastBody && <p className="text-sm text-ink/60 mt-1 line-clamp-2">Gary: {t.lastBody}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
