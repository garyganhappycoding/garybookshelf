"use client";

import { useState, useTransition } from "react";
import { allowRedownload } from "@/actions/students";

export type PendingRequest = { id: string; orderId: string; email: string; product: string; note: string | null; createdAt: string };

// Gary's list of students who asked to download again. One tap resets their downloads and closes the request.
export default function RedownloadRequestsAdmin({ requests }: { requests: PendingRequest[] }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<Record<string, string>>({});

  if (requests.length === 0) return null;
  return (
    <section className="card !border-clay-400 mb-6">
      <p className="font-medium mb-2">🔁 Re-download requests waiting ({requests.length})</p>
      <ul className="space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="text-sm border-b border-ink/5 pb-3 last:border-0 last:pb-0">
            <p className="font-medium break-all">{r.email}</p>
            <p className="text-ink/60">
              {r.product} · {new Date(r.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
            {r.note && <p className="mt-1 bg-ink/5 rounded-lg px-3 py-1.5">“{r.note}”</p>}
            {done[r.id] ? (
              <p className="mt-1 text-sage-600">{done[r.id]}</p>
            ) : (
              <button
                disabled={pending}
                onClick={() => start(async () => { const x = await allowRedownload(r.orderId); setDone((d) => ({ ...d, [r.id]: x.message })); })}
                className="btn-primary !py-1 !px-3 !text-xs mt-2 disabled:opacity-60"
              >
                Allow download again
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
