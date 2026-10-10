"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // redirect to whatever site the visitor is on, so it works on localhost and on the live site
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-20">
      <h1 className="text-2xl font-medium mb-2">Forgot password</h1>
      {sent ? (
        <>
          <p className="text-sm text-ink/70 mb-4">
            If an account exists for <b>{email}</b>, we've sent a link to reset your password. Check your inbox (and spam folder).
          </p>
          <Link href="/login" className="text-clay-600 font-medium text-sm">← Back to log in</Link>
        </>
      ) : (
        <>
          <p className="text-sm text-ink/70 mb-6">Enter your email and we'll send you a link to set a new password.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-ink/15 rounded-lg px-3 py-2"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <p className="text-sm text-ink/60 mt-4">
            <Link href="/login" className="text-clay-600 font-medium">← Back to log in</Link>
          </p>
        </>
      )}
    </div>
  );
}
