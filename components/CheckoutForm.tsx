"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitOrder, getMyPrice } from "@/actions/checkout";
import Link from "next/link";

export default function CheckoutForm({
  productId,
  amount: normalAmount,
  fileOptions,
  pricePerFile,
  freeIndexes = [],
}: {
  productId: string;
  amount: number;
  fileOptions?: string[]; // names of the files, when the product is sold file by file
  pricePerFile?: number | null;
  freeIndexes?: number[]; // free bonus files: always included, never counted in the price
}) {
  const byFile = Boolean(fileOptions?.length && pricePerFile != null);
  const [picked, setPicked] = useState<number[]>([]);
  const paidIdx = (fileOptions ?? []).map((_, i) => i).filter((i) => !freeIndexes.includes(i));
  // the real price for this buyer is worked out on the server (member discount)
  const [amount, setAmount] = useState(byFile ? 0 : normalAmount);
  const [priceNote, setPriceNote] = useState<string | null>(null);
  const [discounted, setDiscounted] = useState(false);
  // login state is read in the browser so the product page itself can be cached
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      if (!byFile) getMyPrice(productId).then((p) => {
        if (p) { setAmount(p.price); setPriceNote(p.note); setDiscounted(p.discounted); }
      });
    });
  }, [productId, byFile]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  if (isLoggedIn === null) return <div className="card min-h-24" aria-hidden />;

  if (!isLoggedIn) {
    return (
      <div className="card">
        <p className="mb-3 text-ink/70">Log in to purchase this item.</p>
        <Link prefetch={false}  href="/login" className="btn-primary">Log in</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card">
        <p className="font-medium mb-1">Order submitted</p>
        <p className="text-sm text-ink/60 mb-3">
          I'll check your receipt, usually within a day. Once it's approved, your order is ready in <strong>My orders</strong>
          (top right of every page), where you download your notes or start your attempts.
        </p>
        <Link prefetch={false} href="/dashboard" className="btn-primary !py-1.5 text-sm">Go to My orders</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="font-medium mb-3">Pay with Touch 'n Go</p>
      <p className="text-xs text-ink/50 -mt-2 mb-3">After you pay and upload your receipt, your order shows in My orders (top right). I approve it by hand, usually within a day. <Link href="/how-to-buy" className="underline text-clay-700">Need help? See the steps · 购买步骤</Link></p>

      {byFile && (
        <div className="mb-4">
          <p className="font-medium text-sm mb-1">1. Choose what you want to buy</p>
          <p className="text-xs text-ink/50 mb-2">RM {Number(pricePerFile).toFixed(2)} for each file. Tick one or more.</p>
          <ul className="space-y-2">
            {fileOptions!.map((name, i) => freeIndexes.includes(i) ? (
              <li key={i} className="flex items-center gap-3 border border-dashed border-clay-700/50 bg-clay-400/10 rounded-lg px-3 py-2">
                <span className="text-clay-700 text-sm font-bold">FREE</span>
                <span className="flex-1 text-sm">{name}</span>
                <span className="text-xs text-ink/60">included, bonus</span>
              </li>
            ) : (
              <li key={i}>
                <label className="flex items-center gap-3 border border-ink/15 rounded-lg px-3 py-2 cursor-pointer has-[:checked]:border-clay-700 has-[:checked]:bg-clay-400/10">
                  <input
                    type="checkbox"
                    checked={picked.includes(i)}
                    onChange={(e) => setPicked((cur) => (e.target.checked ? [...cur, i].sort((a, b) => a - b) : cur.filter((x) => x !== i)))}
                  />
                  <span className="flex-1 text-sm">{name}</span>
                  <span className="text-sm text-ink/60">RM {Number(pricePerFile).toFixed(2)}</span>
                </label>
                {/* a file that covers both Form 4 and Form 5 (e.g. "T4 T5 B2") */}
                {/\bT4\s+T5\b/i.test(name) && (
                  <p className="text-xs text-clay-700 bg-clay-400/15 rounded-lg px-3 py-2 mt-1">
                    This file is a <strong>combination of Form 4 and Form 5</strong>. The chapter is the same and the concept is the same, so one file covers both. Don't buy the same thing twice.
                    <br />
                    这是<strong>第四、第五级合并</strong>的文件。章节和概念一样，一份就够，不用重复购买。
                  </p>
                )}
              </li>
            ))}
          </ul>
          <button type="button" className="text-xs underline text-clay-700 mt-2" onClick={() => setPicked(picked.length === paidIdx.length ? [] : paidIdx)}>
            {picked.length === paidIdx.length ? "Clear all" : "Select all"}
          </button>
        </div>
      )}

      <div className="bg-cream-100 rounded-xl p-4 mb-4 text-center">
        {/* Replace /tng-qr.png with your real QR code image in /public */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={process.env.NEXT_PUBLIC_TNG_QR_IMAGE || "/tng-qr.png"}
          alt="Touch 'n Go QR code"
          className="w-40 h-40 object-contain mx-auto mb-2"
        />
        <p className="text-sm text-ink/60">{process.env.NEXT_PUBLIC_TNG_NAME || "Gary Tan"}</p>
        {byFile ? (
          picked.length === 0 ? (
            <p className="text-sm text-ink/60 mt-2">Tick the files above to see the total to pay.</p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-clay-700 mt-2">{picked.length} file{picked.length > 1 ? "s" : ""} × RM {Number(pricePerFile).toFixed(2)}</p>
              <p className="text-3xl font-bold text-clay-700 whitespace-nowrap">Pay RM {(picked.length * Number(pricePerFile)).toFixed(2)}</p>
            </>
          )
        ) : discounted ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-clay-700 mt-2">Member price</p>
            <p className="flex items-baseline justify-center gap-3 whitespace-nowrap">
              <span className="text-3xl font-bold text-clay-700">Pay RM {amount.toFixed(2)}</span>
              <span className="text-lg text-ink/45 line-through">RM {normalAmount.toFixed(2)}</span>
            </p>
          </>
        ) : (
          <p className="text-2xl font-semibold text-ink mt-1">Pay RM {amount.toFixed(2)}</p>
        )}
        {priceNote && !discounted && <p className="text-xs text-clay-700 mt-1">{priceNote}</p>}
      </div>

      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await submitOrder(productId, formData);
            if (result.error) setError(result.error);
            if (result.success) setSuccess(true);
          });
        }}
      >
        {byFile && picked.map((i) => <input key={i} type="hidden" name="files" value={i} />)}
        <label className="block text-sm font-medium mb-2">
          {byFile ? "2. " : ""}Upload your payment receipt screenshot
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

        <button type="submit" disabled={isPending || (byFile && picked.length === 0)} className="btn-primary w-full disabled:opacity-60">
          {isPending ? "Submitting..." : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}
