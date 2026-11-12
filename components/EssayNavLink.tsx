"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// The top-menu link to essay marking (its own page, separate from Speaking). Once essay marking is open to everyone (`open`) it is
// always shown. While it is closed, only admins and beta testers see it: the answer comes from /api/writing/access, asked only
// when someone is logged in, and remembered for this browser tab so it is not asked on every page.
export default function EssayNavLink({ open }: { open: boolean }) {
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) return;
    let alive = true;
    (async () => {
      try {
        const cached = sessionStorage.getItem("essay-nav");
        if (cached) {
          if (alive) setShow(cached === "yes");
          return;
        }
      } catch {
        /* storage blocked: just ask */
      }
      const {
        data: { session },
      } = await createClient().auth.getSession(); // read locally, no network call
      if (!session) return;
      try {
        const res = await fetch("/api/writing/access");
        const { allowed } = (await res.json()) as { allowed?: boolean };
        try {
          sessionStorage.setItem("essay-nav", allowed ? "yes" : "no");
        } catch {
          /* ignore */
        }
        if (alive) setShow(!!allowed);
      } catch {
        /* the link simply stays hidden */
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  if (!show) return null;
  return (
    <Link prefetch={false} href="/writing" className="hover:text-clay-600 font-medium text-clay-700">
      Essay marking
    </Link>
  );
}
