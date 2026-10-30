"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyThreads, type ThreadSummary } from "@/actions/community";
import { addThread, getSeen, getThreads, tokenFromText } from "@/lib/my-threads";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Where a student finds Gary's answers: the questions asked from this phone or laptop (or from their account), newest first.
export default function RepliesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ThreadSummary[] | null>(null);
  const [paste, setPaste] = useState("");
  const [bad, setBad] = useState(false);

  useEffect(() => {
    getMyThreads(getThreads()).then((t) => {
      t.forEach((x) => addThread(x.token)); // questions found through the account are remembered on this device too
      setThreads(t);
    });
  }, []);

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">Gary&apos;s replies</h1>
      <p className="text-ink/70 mb-6">Your questions and my answers. Open one to read it and reply.</p>

      {threads === null && <p className="text-ink/50">Looking...</p>}

      {threads && threads.length === 0 && (
        <div className="card mb-6">
          <p className="mb-3">Nothing here yet. Questions you ask from this phone or laptop show up here.</p>
          <Link href="/question" className="btn-primary">Ask Gary a question</Link>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {threads?.map((t) => {
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

      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const token = tokenFromText(paste);
          if (!token) return setBad(true);
          router.push(`/track/${token}`);
        }}
      >
        <p className="font-medium mb-1">Saved your link somewhere else?</p>
        <p className="text-sm text-ink/60 mb-2">Paste your private link here to open it on this device.</p>
        <div className="flex gap-2">
          <input value={paste} onChange={(e) => { setPaste(e.target.value); setBad(false); }} placeholder="https://.../track/..." className="flex-1 border border-ink/15 rounded-xl px-3 py-2 bg-white text-sm" />
          <button className="btn-secondary !py-1.5 text-sm">Open</button>
        </div>
        {bad && <p className="text-sm text-red-600 mt-2">That doesn&apos;t look like a tracking link.</p>}
      </form>
    </div>
  );
}
