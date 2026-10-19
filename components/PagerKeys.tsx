"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Keyboard shortcuts for the admin attempts table: ← previous page, → next page, Home first page, End last page.
// Ignored while typing in a field and when a modifier key (Ctrl, Alt, Cmd) is held.
export default function PagerKeys({
  prev,
  next,
  first,
  last,
}: {
  prev: string | null;
  next: string | null;
  first: string | null;
  last: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      const go = e.key === "ArrowLeft" ? prev : e.key === "ArrowRight" ? next : e.key === "Home" ? first : e.key === "End" ? last : null;
      if (!go) return;
      e.preventDefault();
      router.push(go);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, first, last, router]);

  return null;
}
