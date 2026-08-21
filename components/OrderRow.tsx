"use client";

import { useState, useTransition } from "react";
import { approveOrder, rejectOrder, getReceiptUrl } from "@/actions/admin";

const statusColor: Record<string, string> = {
  pending_verification: "text-amber-700 bg-amber-100",
  completed: "text-sage-600 bg-sage-400/15",
  rejected: "text-red-600 bg-red-100",
};

export default function OrderRow({ order }: { order: any }) {
  const [isPending, startTransition] = useTransition();
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function handleViewReceipt() {
    const result = await getReceiptUrl(order.receipt_path);
    if (result.url) setReceiptUrl(result.url);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium">{order.products?.title}</p>
          <p className="text-sm text-ink/60">
            {order.profiles?.email} &middot; RM {Number(order.amount_paid).toFixed(2)}
          </p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[order.status]}`}>
          {order.status.replace("_", " ")}
        </span>
      </div>

      {receiptUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={receiptUrl} alt="Payment receipt" className="max-h-64 rounded-lg border border-ink/10 mb-3" />
      ) : (
        <button onClick={handleViewReceipt} className="text-sm text-clay-600 font-medium mb-3">
          View receipt &rarr;
        </button>
      )}

      {order.status === "pending_verification" && (
        <div className="flex gap-2 items-start">
          <button
            disabled={isPending}
            onClick={() => startTransition(() => approveOrder(order.id))}
            className="btn-primary !py-1.5 !px-4 text-sm disabled:opacity-60"
          >
            Approve
          </button>
          {!showReject ? (
            <button onClick={() => setShowReject(true)} className="btn-secondary !py-1.5 !px-4 text-sm">
              Reject
            </button>
          ) : (
            <div className="flex gap-2 flex-1">
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (optional)"
                className="flex-1 border border-ink/15 rounded-lg px-3 py-1.5 text-sm"
              />
              <button
                disabled={isPending}
                onClick={() => startTransition(() => rejectOrder(order.id, reason))}
                className="text-sm text-red-600 font-medium"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      )}

      {order.status === "rejected" && order.reject_reason && (
        <p className="text-sm text-ink/60">Reason: {order.reject_reason}</p>
      )}
    </div>
  );
}
