"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const inputCls =
  "w-full border border-ink/15 rounded-xl px-3.5 py-3 bg-white text-base focus:outline-none focus:border-clay-500 placeholder:text-ink/35";

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">
        {label} {required ? <span className="text-clay-600">*</span> : <span className="text-ink/40 font-normal">(optional)</span>}
      </span>
      {hint && <span className="block text-xs text-ink/55 mb-1.5">{hint}</span>}
      {children}
    </label>
  );
}

// Two hidden anti-bot fields: an empty "website" box people never see, and the moment the form was opened.
export function BotTraps() {
  const [t, setT] = useState("");
  useEffect(() => setT(String(Date.now())), []);
  return (
    <>
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="t" value={t} />
    </>
  );
}

// After sending: a private tracking link, so a student without an account can see what happened to it.
export function SentCard({ title, children }: { token?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="card text-center">
      <p className="text-4xl mb-2">🎉</p>
      <h2 className="text-xl font-medium mb-2">{title}</h2>
      {children}
      <div className="bg-cream-100 rounded-xl p-4 mt-4 text-left">
        <p className="text-sm font-medium mb-1">Where to find my reply</p>
        <p className="text-xs text-ink/60 mb-3">
          Log in any time and open <b>Gary&apos;s replies</b>. A red “new” tag shows when I have answered. You can also reply to me there.
        </p>
        <Link href="/replies" className="btn-primary !py-1.5 text-sm">Open Gary&apos;s replies</Link>
      </div>
    </div>
  );
}
