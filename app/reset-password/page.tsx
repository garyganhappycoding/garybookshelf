"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// The reset email link brings the person here. The Supabase browser client reads the
// token/code from the URL and signs them in temporarily, so we can set a new password.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<"checking" | "yes" | "no">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let settled = false;
    const mark = (v: "yes" | "no") => {
      if (!settled) {
        settled = true;
        setReady(v);
      }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) mark("yes");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) mark("yes");
    });
    const t = setTimeout(() => mark("no"), 4000); // no session after 4s: link is invalid or expired
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-20">
      <h1 className="text-2xl font-medium mb-6">Set a new password</h1>

      {ready === "checking" && <p className="text-sm text-ink/60">Checking your link…</p>}

      {ready === "no" && (
        <>
          <p className="text-sm text-red-600 mb-4">This reset link is invalid or has expired. Please request a new one.</p>
          <Link href="/forgot-password" className="btn-primary">Request a new link</Link>
        </>
      )}

      {ready === "yes" && !done && (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm new password</label>
            <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Saving…" : "Save new password"}
          </button>
        </form>
      )}

      {done && <p className="text-sm text-sage-600">✅ Password updated. Taking you to your account…</p>}
    </div>
  );
}
