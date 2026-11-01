"use client";

import { useState, useTransition } from "react";
import { testBackupAi } from "@/actions/students";

export default function TestBackupAiButton() {
  const [pending, start] = useTransition();
  const [lines, setLines] = useState<{ label: string; ok: boolean; note: string }[] | null>(null);

  return (
    <div className="mt-4 text-sm">
      <button disabled={pending} onClick={() => start(async () => setLines((await testBackupAi()).lines))} className="btn-secondary !py-1.5 disabled:opacity-60">
        {pending ? "Testing..." : "Test the backup AI"}
      </button>
      {lines && (
        <ul className="mt-2 space-y-1">
          {lines.map((l) => (
            <li key={l.label} className={l.ok ? "text-sage-600" : "text-red-600"}>
              {l.ok ? "✓" : "✗"} {l.label}: {l.note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
