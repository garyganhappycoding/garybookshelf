"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendFollowUp } from "@/actions/community";

// A student replies to Gary's answer from their private tracking link. No login needed.
export default function FollowUpForm({ token }: { token: string }) {
  const router = useRouter();
  const opened = useRef(Date.now());
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  return (
    <form
      className="card mb-5 space-y-2"
      action={(fd) => {
        setError(null);
        fd.set("token", token);
        fd.set("t", String(opened.current));
        start(async () => {
          const r = await sendFollowUp(fd);
          if (r.error) setError(r.error);
          else {
            setSent(true);
            router.refresh();
          }
        });
      }}
    >
      <p className="text-sm font-medium">Reply to Gary</p>
      <textarea name="message" rows={3} maxLength={2000} required placeholder="Write your follow-up question or say thanks..." className="w-full border border-ink/15 rounded-xl px-3 py-2 bg-white text-sm" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {sent && <p className="text-sm text-sage-600">Sent. Gary will see it. Come back to this link for his answer.</p>}
      <button disabled={pending} className="btn-primary !py-1.5 text-sm disabled:opacity-60">{pending ? "Sending..." : "Send"}</button>
    </form>
  );
}
