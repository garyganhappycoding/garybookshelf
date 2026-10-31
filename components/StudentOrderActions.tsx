"use client";

import { useState, useTransition } from "react";
import { allowRedownload, approveStudentOrder, rejectStudentOrder } from "@/actions/students";

// The buttons on one order of one student: approve / reject a pending payment, or allow a locked PDF to be downloaded again.
export default function StudentOrderActions({
  orderId,
  status,
  lockedPdf,
  downloaded,
  files,
}: {
  orderId: string;
  status: string;
  lockedPdf: boolean;
  downloaded: number; // files already downloaded (not yet reset)
  files: number;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      setMsg({ ok: r.ok, text: r.message });
      setRejecting(false);
    });

  return (
    <div className="mt-1.5 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {status === "pending_verification" && (
          <>
            <button
              disabled={pending}
              onClick={() => confirm("Approve this payment? The student gets their order straight away.") && run(() => approveStudentOrder(orderId))}
              className="btn-primary !py-1 !px-3 !text-xs disabled:opacity-60"
            >
              Approve payment
            </button>
            <button disabled={pending} onClick={() => setRejecting((v) => !v)} className="text-red-600 font-medium">
              Reject
            </button>
          </>
        )}
        {status === "completed" && lockedPdf && (
          <>
            <span className="text-ink/60">
              {downloaded} of {files} files downloaded
            </span>
            <button
              disabled={pending || downloaded === 0}
              onClick={() => run(() => allowRedownload(orderId))}
              className="text-clay-700 font-medium underline disabled:opacity-40 disabled:no-underline"
            >
              Allow download again
            </button>
          </>
        )}
      </div>
      {rejecting && (
        <div className="flex gap-2 mt-1.5">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className="flex-1 border border-ink/15 rounded-lg px-2 py-1" />
          <button disabled={pending} onClick={() => run(() => rejectStudentOrder(orderId, reason))} className="text-red-600 font-medium">
            Confirm reject
          </button>
        </div>
      )}
      {msg && <p className={`mt-1 ${msg.ok ? "text-sage-600" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
