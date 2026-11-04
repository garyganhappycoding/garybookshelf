"use client";

import { useEffect, useRef, useState } from "react";
import { canvasToBlob, drawCard, loadCardAssets, splitForCards } from "@/lib/ig-card";

// Gary's tool on one question: turns it into a sticky-note picture he can save and post on Instagram.
// Names and emails never appear on the card. He can trim the text first, and a long question is split into several pictures.
export default function QuestionCardMaker({ id, text, ageForm, publishOk }: { id: string; text: string; ageForm: string; publishOk: boolean }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(text);
  const [who, setWho] = useState(() => {
    const form = /\bF\s?([1-6])\b/i.exec(ageForm);
    return form ? `F${form[1]} student · anonymous` : "a student · anonymous";
  });
  const [pieces, setPieces] = useState<string[]>([]);
  const avatar = useRef<HTMLImageElement | null>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    loadCardAssets().then((img) => {
      if (!alive) return;
      avatar.current = img;
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [open]);

  // re-split whenever the text changes (after the fonts are ready, so the measuring is right)
  useEffect(() => {
    if (!open || !ready) return;
    setPieces(splitForCards(body));
  }, [open, ready, body]);

  useEffect(() => {
    if (!ready) return;
    pieces.forEach((t, i) => {
      const c = canvases.current[i];
      if (c) drawCard(c, { text: t, who, index: i + 1, total: pieces.length, avatar: avatar.current });
    });
  }, [pieces, who, ready]);

  async function save(i: number) {
    const c = canvases.current[i];
    if (!c) return;
    const blob = await canvasToBlob(c);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ask-gary-${id.slice(0, 6)}${pieces.length > 1 ? `-${i + 1}` : ""}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary !py-1.5 text-sm">
        📸 Make Instagram card
      </button>
    );

  return (
    <div className="rounded-2xl border border-ink/10 bg-white/60 p-4 space-y-3 basis-full">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-sm">Instagram card</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink/50">Close</button>
      </div>
      {!publishOk && (
        <p className="text-xs text-amber-800 bg-amber-100 rounded-lg px-3 py-2">
          This student did not tick “OK to answer publicly”. The card has no name or email, but check with them before you post it.
        </p>
      )}
      <label className="block text-xs text-ink/60">
        Text on the card (trim it or fix typos first)
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="mt-1 w-full border border-ink/15 rounded-xl px-3 py-2 bg-white text-sm" />
      </label>
      <label className="block text-xs text-ink/60">
        Label under the note
        <input value={who} onChange={(e) => setWho(e.target.value.slice(0, 40))} className="mt-1 w-full border border-ink/15 rounded-xl px-3 py-2 bg-white text-sm" />
      </label>
      {pieces.length > 1 && <p className="text-xs text-ink/60">This is long, so it is split into {pieces.length} cards. Post them as a carousel in order.</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        {pieces.map((_, i) => (
          <div key={i} className="space-y-2">
            <canvas ref={(el) => { canvases.current[i] = el; }} className="w-full rounded-lg border border-ink/10" style={{ aspectRatio: "4 / 5" }} />
            <button type="button" onClick={() => save(i)} className="btn-primary !py-1.5 text-sm">
              Save picture{pieces.length > 1 ? ` ${i + 1}` : ""}
            </button>
          </div>
        ))}
      </div>
      {!ready && <p className="text-xs text-ink/50">Getting the fonts ready…</p>}
    </div>
  );
}
