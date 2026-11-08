"use client";

import { useEffect, useState } from "react";
import { getMyPrice } from "@/actions/checkout";

/**
 * The price block on a product page. The page itself is cached for everyone, so the buyer's own price
 * is fetched here once the browser is on the page. Members see the normal price crossed out and the member price big.
 */
export default function ProductPrice({
  productId,
  normalPrice,
  memberPrice,
  memberProductTitle,
}: {
  productId: string;
  normalPrice: number;
  memberPrice: number | null;
  memberProductTitle: string | null;
}) {
  const [mine, setMine] = useState<{ price: number; discounted: boolean; note: string | null } | null>(null);
  useEffect(() => {
    getMyPrice(productId).then((p) => p && setMine(p));
  }, [productId]);

  if (mine?.discounted) {
    return (
      <div className="mt-1">
        <p className="inline-block bg-clay-700 text-white text-sm font-semibold rounded-full px-3 py-1 mb-2">
          Member price: you already bought {memberProductTitle ?? "our other pack"}
        </p>
        <p className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-clay-700">RM {mine.price.toFixed(2)}</span>
          <span className="text-2xl text-ink/45 line-through">RM {normalPrice.toFixed(2)}</span>
        </p>
        <p className="text-sm text-ink/60 mt-1">Pay only RM {mine.price.toFixed(2)}, not RM {normalPrice.toFixed(2)}.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xl font-medium text-clay-700">RM {normalPrice.toFixed(2)}</p>
      {memberPrice != null && memberPrice < normalPrice && (
        <p className="text-sm text-clay-700 mt-1">
          {mine?.note && mine.note.includes("already been used")
            ? "Your one-time member discount has already been used."
            : `RM ${memberPrice.toFixed(2)} for buyers of ${memberProductTitle ?? "our other pack"}. Log in to see your price.`}
        </p>
      )}
    </div>
  );
}
