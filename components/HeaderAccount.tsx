"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/actions/auth";

// Login state is read in the browser so the header (and every page around it) can be cached.
export default function HeaderAccount() {
  const [state, setState] = useState<"loading" | "out" | "in">("loading");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let alive = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session) {
        setState("out");
        return;
      }
      setState("in");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      if (alive) setIsAdmin(profile?.role === "admin");
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (state === "loading") return <div className="h-8 w-16" aria-hidden />;

  if (state === "out")
    return (
      <Link href="/login" className="btn-primary !py-1.5">
        Log in
      </Link>
    );

  return (
    <>
      {isAdmin && (
        <Link href="/admin" className="hover:text-clay-600">
          Admin
        </Link>
      )}
      <Link href="/dashboard" className="btn-secondary !py-1.5">
        My orders
      </Link>
      <form action={logout}>
        <button type="submit" className="text-ink/60 hover:text-clay-600 text-sm whitespace-nowrap">
          Sign out
        </button>
      </form>
    </>
  );
}
