"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMyThreads } from "@/actions/community";
import { getSeen, getThreads } from "@/lib/my-threads";

// "Check Gary's reply" entry for the start pages. Shows a red "New reply" tag when Gary has answered and the student has not opened it yet.
export default function ReplyCard({ compact = false }: { compact?: boolean }) {
  const [fresh, setFresh] = useState(0);

  useEffect(() => {
    const tokens = getThreads();
    getMyThreads(tokens).then((threads) => setFresh(threads.filter((t) => t.lastSender === "gary" && t.lastAt > getSeen(t.token)).length));
  }, []);

  if (compact)
    return (
      <Link href="/replies" className="text-sm underline text-clay-700">
        Already asked? Check Gary&apos;s reply{fresh > 0 && <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 no-underline">{fresh} new</span>}
      </Link>
    );

  return (
    <Link href="/replies" className="card !p-5 flex gap-4 items-center hover:border-clay-400">
      <span className="text-3xl">💌</span>
      <span className="flex-1">
        <span className="block font-medium">
          Check Gary&apos;s reply
          {fresh > 0 && <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 align-middle">{fresh} new</span>}
        </span>
        <span className="block text-sm text-ink/60">Asked a question before? See my answer and reply to me here.</span>
      </span>
    </Link>
  );
}
