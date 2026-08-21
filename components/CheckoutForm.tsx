"use client";

import { useState, useTransition } from "react";
import { submitOrder } from "@/actions/checkout";
import Link from "next/link";

export default function CheckoutForm({
  productId,
  amount,
  isLoggedIn,
}: {
  productId: string;
  amount: number;
  isLoggedIn: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="card">
        <p className="mb-3 text-ink/70">Log in to purchase this item.</p>
        <Link href="/login" className="btn-primary">Log in</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card">
        <p className="font-medium mb-1">Order submitted</p>
        <p className="text-sm text-ink/60">
          I'll check your receipt and email your download link once it's approved.
          You can track the status on{" "}
          <Link href="/dashboard" className="text-clay-600 font-medium">
            your dashboard
          </Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="font-medium mb-3">Pay with Touch 'n Go</p>

      <div className="bg-cream-100 rounded-xl p-4 mb-4 text-center">
        {/* Replace /tng-qr.png with your real QR code image in /public */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={process.env.NEXT_PUBLIC_TNG_QR_IMAGE || "/tng-qr.png"}
          alt="Touch 'n Go QR code"
          className="w-40 h-40 object-contain mx-auto mb-2"
        />
        <p className="text-sm text-ink/60">
          {process.env.NEXT_PUBLIC_TNG_NAME || "Gary Tan"} &middot; RM {amount.toFixed(2)}
        </p>
      </div>

      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await submitOrder(productId, amount, formData);
            if (result.error) setError(result.error);
            if (result.success) setSuccess(true);
          });
        }}
      >
        <label className="block text-sm font-medium mb-2">
          Upload your payment receipt screenshot
        </label>
        <label className="flex items-center justify-center border-2 border-dashed border-ink/20 rounded-xl p-6 mb-3 cursor-pointer hover:border-clay-400 transition-colors text-sm text-ink/60">
          {fileName || "Choose image..."}
          <input
            type="file"
            name="receipt"
            accept="image/*"
            required
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
          />
        </label>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-60">
          {isPending ? "Submitting..." : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}
