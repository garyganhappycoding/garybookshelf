"use client";

import { useState, useTransition } from "react";
import { sendTestEmail } from "@/actions/students";

export default function TestEmailButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="mt-8 text-sm">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await sendTestEmail();
            setMsg(r.ok ? { ok: true, text: `Sent via ${r.via} to ${r.to}. Check that inbox (and spam).` } : { ok: false, text: `Failed (${r.via ?? "?"}): ${r.error ?? "unknown"}` });
          })
        }
        className="btn-secondary !py-1.5 disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send me a test email"}
      </button>
      {msg && <p className={`mt-2 ${msg.ok ? "text-sage-600" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
