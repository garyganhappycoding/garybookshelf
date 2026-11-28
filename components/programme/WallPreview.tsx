"use client";
import Link from "@/components/Link";
import { BGS, FRAMES, type Piece } from "@/components/programme/WallEditor";
import type { WallItem } from "@/app/programme/wall/actions";

// A read-only picture of the student's wall (the same wall they arrange on /programme/wall). With nothing on it, it is an empty wall.
export default function WallPreview({ pieces, layout, bg, frame }: { pieces: Piece[]; layout: WallItem[]; bg: string; frame: string }) {
  const byKey = new Map(pieces.map((p) => [p.key, p]));
  const shown = layout.filter((it) => it.kind === "note" || byKey.has(it.key));
  return (
    <section aria-label="我的成就墙">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-medium">我的成就墙</h2>
        <Link href="/programme/wall" className="text-sm text-clay-600 underline">布置我的墙</Link>
      </div>
      <Link href="/programme/wall" aria-label="打开我的成就墙" className="block max-w-2xl">
        <div style={(FRAMES[frame] ?? FRAMES.none).css} className="rounded-md">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[3px]" style={(BGS[bg] ?? BGS.ink).css}>
            {shown.map((it) => {
              const p = it.kind === "badge" ? byKey.get(it.key) : null;
              return (
                <div key={it.id} className="absolute" style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%`, aspectRatio: it.kind === "note" ? "2 / 1" : "1 / 1", zIndex: it.z, transform: `rotate(${it.rot}deg)` }}>
                  {it.kind === "badge"
                    ? <div className="h-full w-full [filter:drop-shadow(0_6px_6px_rgba(0,0,0,.45))] [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible" dangerouslySetInnerHTML={{ __html: p!.svg }} />
                    : <div className="h-full w-full overflow-hidden whitespace-pre-wrap rounded bg-[#fff0b3] p-1.5 text-[9px] leading-tight text-[#2b2622] shadow-md">{it.text}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </Link>
    </section>
  );
}
