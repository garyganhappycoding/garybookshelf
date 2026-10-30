"use client";

import { useEffect, useState } from "react";

// A word that types itself out, then deletes and moves to the next one (like the hero on cerdek.com).
export default function TypingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState(words[0] ?? "");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const word = words[i % words.length];
    const done = !deleting && text === word;
    const empty = deleting && text === "";
    const t = setTimeout(
      () => {
        if (done) setDeleting(true);
        else if (empty) {
          setDeleting(false);
          setI((n) => (n + 1) % words.length);
        } else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      },
      done ? 1400 : empty ? 250 : deleting ? 35 : 70
    );
    return () => clearTimeout(t);
  }, [text, deleting, i, words]);

  return (
    <span className={className}>
      {text}
      <span className="inline-block w-[2px] h-[0.9em] bg-clay-600 align-[-0.1em] ml-0.5 animate-pulse" aria-hidden />
    </span>
  );
}
