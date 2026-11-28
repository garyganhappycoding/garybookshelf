"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveWallAction, type WallItem } from "@/app/programme/wall/actions";

export type Piece = { key: string; title: string; svg: string };
type Init = { layout: WallItem[]; bg: string; frame: string };

export const BGS: Record<string, { name: string; css: React.CSSProperties }> = {
  ink: { name: "深色", css: { backgroundColor: "#17130f", backgroundImage: "radial-gradient(#2a2119 1px,transparent 1px)", backgroundSize: "22px 22px" } },
  paper: { name: "纸色", css: { backgroundColor: "#f1e8d8", backgroundImage: "radial-gradient(#ddd0b8 1px,transparent 1px)", backgroundSize: "22px 22px" } },
  sage: { name: "绿色", css: { backgroundColor: "#cfdcc9", backgroundImage: "radial-gradient(#b6c9b0 1px,transparent 1px)", backgroundSize: "22px 22px" } },
  navy: { name: "深蓝", css: { backgroundColor: "#27384f", backgroundImage: "radial-gradient(#33475f 1px,transparent 1px)", backgroundSize: "22px 22px" } },
};
export const FRAMES: Record<string, { name: string; css: React.CSSProperties }> = {
  none: { name: "无", css: { padding: 0 } },
  line: { name: "细框", css: { padding: 6, background: "#e9dfcf" } },
  gold: { name: "金框", css: { padding: 10, background: "linear-gradient(135deg,#fff3c9,#e2bd62 30%,#9c7421 55%,#e2bd62 78%,#9c7421)" } },
  wood: { name: "木框", css: { padding: 14, background: "repeating-linear-gradient(90deg,#6b4a2c 0 9px,#5d3f25 9px 14px,#7a5733 14px 22px)" } },
  dash: { name: "虚线", css: { padding: 6, outline: "3px dashed #c2623a", outlineOffset: -2 } },
};

export default function WallEditor({ pieces, initial }: { pieces: Piece[]; initial: Init }) {
  const [items, setItems] = useState<WallItem[]>(initial.layout);
  const [bg, setBg] = useState(initial.bg in BGS ? initial.bg : "ink");
  const [frame, setFrame] = useState(initial.frame in FRAMES ? initial.frame : "none");
  const [sel, setSel] = useState<string | null>(null);
  const [state, setState] = useState<"" | "saving" | "saved">("");
  const box = useRef<HTMLDivElement>(null);
  const zTop = useRef(Math.max(10, ...initial.layout.map((i) => i.z)));
  const first = useRef(true);
  const byKey = new Map(pieces.map((p) => [p.key, p]));

  // save a moment after every change
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setState("saving");
    const t = setTimeout(() => { saveWallAction(items, bg, frame).then(() => setState("saved")).catch(() => setState("")); }, 800);
    return () => clearTimeout(t);
  }, [items, bg, frame]);

  const patch = useCallback((id: string, p: Partial<WallItem>) => setItems((l) => l.map((i) => (i.id === id ? ({ ...i, ...p } as WallItem) : i))), []);
  const rect = () => box.current!.getBoundingClientRect();
  const uid = () => Math.random().toString(36).slice(2, 9);

  function addBadge(p: Piece) {
    const id = uid(); zTop.current += 1;
    setItems((l) => [...l, { id, kind: "badge", key: p.key, x: 8 + Math.random() * 50, y: 6 + Math.random() * 40, w: 24, rot: 0, z: zTop.current }]); setSel(id);
  }
  function addNote() {
    const id = uid(); zTop.current += 1;
    setItems((l) => [...l, { id, kind: "note", text: "今天我做到了！", x: 10 + Math.random() * 40, y: 10 + Math.random() * 40, w: 36, rot: 0, z: zTop.current }]); setSel(id);
  }

  function startMove(e: React.PointerEvent, it: WallItem) {
    if ((e.target as HTMLElement).dataset.h || (e.target as HTMLElement).isContentEditable) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSel(it.id); zTop.current += 1; patch(it.id, { z: zTop.current });
    const r = rect(), sx = e.clientX, sy = e.clientY, ox = it.x, oy = it.y;
    const el = e.currentTarget as HTMLElement;
    el.onpointermove = (m) => patch(it.id, { x: ox + ((m.clientX - sx) / r.width) * 100, y: oy + ((m.clientY - sy) / r.height) * 100 });
    el.onpointerup = () => { el.onpointermove = null; el.onpointerup = null; };
  }
  function startResize(e: React.PointerEvent, it: WallItem, el: HTMLElement) {
    e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const h = e.currentTarget as HTMLElement, b = el.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, d0 = Math.hypot(e.clientX - cx, e.clientY - cy) || 1, w0 = it.w;
    const r = rect(), ratio = (r.width / r.height) * (it.kind === "note" ? 0.5 : 1), cxp = it.x + w0 / 2, cyp = it.y + (w0 * ratio) / 2;
    h.onpointermove = (m) => {
      const k = Math.max(0.2, Math.min(5, Math.hypot(m.clientX - cx, m.clientY - cy) / d0)), w = Math.max(6, Math.min(90, w0 * k));
      patch(it.id, { w, x: cxp - w / 2, y: cyp - (w * ratio) / 2 });
    };
    h.onpointerup = () => { h.onpointermove = null; h.onpointerup = null; };
  }
  function startRotate(e: React.PointerEvent, it: WallItem, el: HTMLElement) {
    e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const h = e.currentTarget as HTMLElement, b = el.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    h.onpointermove = (m) => patch(it.id, { rot: (Math.atan2(m.clientY - cy, m.clientX - cx) * 180) / Math.PI + 90 });
    h.onpointerup = () => { h.onpointermove = null; h.onpointerup = null; };
  }

  const handle = "absolute h-4 w-4 rounded-[3px] border-2 border-[#c2623a] bg-white";
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_17rem]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-2 py-1"><b className="text-xs font-normal text-ink/60">加</b>
            <button type="button" onClick={addNote} className="min-h-9 rounded-lg border border-ink/15 px-3">＋ 文字便条</button></div>
          <div className="flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-2 py-1"><b className="text-xs font-normal text-ink/60">墙面</b>
            {Object.entries(BGS).map(([k, v]) => <button key={k} type="button" aria-label={v.name} onClick={() => setBg(k)} className={`h-7 w-7 rounded-full border-2 ${bg === k ? "border-ink" : "border-ink/20"}`} style={{ background: v.css.backgroundColor }} />)}</div>
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-2 py-1"><b className="text-xs font-normal text-ink/60">墙的边框</b>
            {Object.entries(FRAMES).map(([k, v]) => <button key={k} type="button" onClick={() => setFrame(k)} className={`min-h-9 rounded-lg border px-3 ${frame === k ? "border-ink bg-ink text-white" : "border-ink/15"}`}>{v.name}</button>)}</div>
        </div>
        <div style={FRAMES[frame].css} className="rounded-md">
          <div ref={box} className="relative aspect-[16/10] w-full touch-none overflow-hidden rounded-[3px]" style={BGS[bg].css} onPointerDown={(e) => { if (e.target === box.current) setSel(null); }}>
            {items.map((it) => {
              const p = it.kind === "badge" ? byKey.get(it.key) : null;
              if (it.kind === "badge" && !p) return null;
              const on = sel === it.id;
              return (
                <div key={it.id} onPointerDown={(e) => startMove(e, it)} className={`absolute cursor-grab select-none touch-none ${on ? "outline outline-[1.5px] outline-[#c2623a]" : ""}`}
                  style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%`, aspectRatio: it.kind === "note" ? "2 / 1" : "1 / 1", zIndex: it.z, transform: `rotate(${it.rot}deg)` }}>
                  {it.kind === "badge"
                    ? <div className="h-full w-full [filter:drop-shadow(0_8px_8px_rgba(0,0,0,.45))] [&_svg]:pointer-events-none [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible" dangerouslySetInnerHTML={{ __html: p!.svg }} />
                    : <div contentEditable suppressContentEditableWarning onBlur={(e) => patch(it.id, { text: e.currentTarget.innerText.slice(0, 200) })} onFocus={() => setSel(it.id)}
                        className="h-full w-full overflow-hidden whitespace-pre-wrap rounded bg-[#fff0b3] p-2 text-[15px] text-[#2b2622] shadow-md outline-none">{it.text}</div>}
                  {on && (
                    <>
                      {(["-left-2 -top-2 cursor-nwse-resize", "-right-2 -top-2 cursor-nesw-resize", "-left-2 -bottom-2 cursor-nesw-resize", "-right-2 -bottom-2 cursor-nwse-resize"]).map((c) => (
                        <span key={c} data-h="1" className={`${handle} ${c}`} onPointerDown={(e) => startResize(e, it, e.currentTarget.parentElement as HTMLElement)} />
                      ))}
                      <span className="absolute left-1/2 -top-[22px] h-[22px] w-[1.5px] -translate-x-1/2 bg-[#c2623a]" />
                      <span data-h="1" className={`${handle} left-1/2 -top-[34px] -ml-2 cursor-grab rounded-full`} onPointerDown={(e) => startRotate(e, it, e.currentTarget.parentElement as HTMLElement)} />
                    </>
                  )}
                </div>
              );
            })}
            {!items.length && <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-white/50">从右边点一枚徽章，放到这面墙上。</p>}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <button type="button" disabled={!sel} onClick={() => { zTop.current += 1; if (sel) patch(sel, { z: zTop.current }); }} className="min-h-9 rounded-lg border border-ink/15 px-3 disabled:opacity-40">放到最前面</button>
          <button type="button" disabled={!sel} onClick={() => { setItems((l) => l.filter((i) => i.id !== sel)); setSel(null); }} className="min-h-9 rounded-lg border border-ink/15 px-3 disabled:opacity-40">拿下来</button>
          <span className="text-xs text-ink/50">{state === "saving" ? "保存中…" : state === "saved" ? "已保存" : ""}</span>
        </div>
        <p className="mt-2 text-xs text-ink/60">拖动换位置；拉四个角的白点放大缩小；拉上面的圆点旋转。便条点进去直接改字。</p>
      </div>
      <aside className="h-fit rounded-2xl border border-ink/15 bg-white p-3">
        <h2 className="mb-2 text-sm font-medium">我的徽章（点一下放到墙上）</h2>
        {pieces.length ? (
          <div className="grid grid-cols-4 gap-2 md:grid-cols-3">
            {pieces.map((p) => <button key={p.key} type="button" title={p.title} aria-label={`放上墙：${p.title}`} onClick={() => addBadge(p)} className="aspect-square p-0.5 [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible" dangerouslySetInnerHTML={{ __html: p.svg }} />)}
          </div>
        ) : <p className="text-sm text-ink/60">还没有徽章。坚持下去，拿到的徽章会出现在这里。</p>}
        <p className="mt-2 text-xs text-ink/60">同一枚可以放好几次。</p>
      </aside>
    </div>
  );
}
