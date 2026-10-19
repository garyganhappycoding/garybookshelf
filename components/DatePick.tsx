"use client";

import { useRouter } from "next/navigation";

// A date picker that jumps straight to that date when a day is chosen (no extra button to press).
// `baseHref` is the page address up to and including "date=", so the other filters are kept.
export default function DatePick({ baseHref, date, max, hash }: { baseHref: string; date: string; max: string; hash: string }) {
  const router = useRouter();
  return (
    <input
      type="date"
      value={date}
      max={max}
      aria-label="Pick a date"
      onChange={(e) => {
        if (e.target.value) router.push(`${baseHref}${e.target.value}#${hash}`);
      }}
      className="border border-ink/15 rounded-lg px-2.5 py-1 text-sm bg-white"
    />
  );
}
