"use client";
import { useMemo, useRef, useState } from "react";
import { badgeFaces, type Art } from "@/lib/programme/badge-art";

export type WallItem = {
  key: string; badgeId: string; title: string; how: string; earned: boolean; art: Art; serial: number; earnedAt: string | null; backMessage: string; sub: string;
};

const FONT_FACE = `@font-face{font-family:'Cormorant Garamond';font-weight:700;font-style:normal;font-display:swap;src:url(/fonts/cormorant-garamond-700.woff2) format('woff2')}`;

function Medal({ it, name, big = false, turned = false, onClick }: { it: WallItem; name: string; big?: boolean; turned?: boolean; onClick?: () => void }) {
  const faces = useMemo(() => badgeFaces((big ? "big" : "sm") + it.key.replace(/[^a-z0-9]/gi, ""), it.art, name, it.serial, it.backMessage), [it, name, big]);
  const size = big ? "h-60 w-60" : "h-28 w-28";
  const inner = (
    <span className={`relative block h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${turned ? "[transform:rotateY(180deg)]" : ""}`}>
      <span className={`absolute inset-0 [backface-visibility:hidden] ${it.earned ? "drop-shadow-lg" : "opacity-40 grayscale"}`} dangerouslySetInnerHTML={{ __html: faces.front }} />
      <span className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] drop-shadow-lg" dangerouslySetInnerHTML={{ __html: faces.back }} />
    </span>
  );
  const cls = `${size} block [perspective:900px] shrink-0`;
  return onClick
    ? <button type="button" onClick={onClick} aria-label={it.earned ? `${it.title}，点一下翻面` : `${it.title}，还没拿到`} className={cls}>{inner}</button>
    : <span className={cls} aria-hidden>{inner}</span>;
}

const loadImg = (svg: string) => new Promise<HTMLImageElement>((ok, no) => {
  const img = new Image();
  img.onload = () => ok(img);
  img.onerror = () => no(new Error("image"));
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
});

async function fontCss() {
  try {
    const buf = await (await fetch("/fonts/cormorant-garamond-700.woff2")).arrayBuffer();
    let s = ""; const b = new Uint8Array(buf);
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
    return `@font-face{font-family:'Cormorant Garamond';font-weight:700;src:url(data:font/woff2;base64,${btoa(s)}) format('woff2')}`;
  } catch { return ""; }
}

const W = 1080, H = 1920, SIZE = 760;

function paint(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, scaleX: number, it: WallItem, name: string) {
  const g = ctx.createRadialGradient(W / 2, 760, 120, W / 2, 900, 1300);
  g.addColorStop(0, "#2b2118"); g.addColorStop(1, "#0f0c0a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (img) {
    ctx.save(); ctx.translate(W / 2, 820); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 30;
    ctx.scale(Math.max(Math.abs(scaleX), 0.001), 1); ctx.drawImage(img, -SIZE / 2, -SIZE / 2, SIZE, SIZE); ctx.restore();
  }
  ctx.textAlign = "center"; ctx.fillStyle = "#f3e9dc";
  ctx.font = "700 64px 'Songti SC','Noto Serif SC',Georgia,serif"; ctx.fillText(`${name} · ${it.title}`, W / 2, 1330);
  ctx.fillStyle = "#a39382"; ctx.font = "500 36px Inter,system-ui,sans-serif"; ctx.fillText(it.sub, W / 2, 1400);
  ctx.fillStyle = "#e9c98f"; ctx.font = "500 36px 'Songti SC','Noto Serif SC',serif"; ctx.fillText("@garybookshelf 陪你读书2027", W / 2, 1640);
}

function save(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export default function BadgeWall({ items, name, preview }: { items: WallItem[]; name: string; preview: boolean }) {
  const earned = items.filter((i) => i.earned);
  const [sel, setSel] = useState<string>(earned[0]?.key ?? items[0]?.key ?? "");
  const [turned, setTurned] = useState(false);
  const [pick, setPick] = useState<string>(earned[0]?.key ?? "");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const running = useRef(false);
  const cur = items.find((i) => i.key === sel);

  async function makeImage() {
    const it = items.find((i) => i.key === pick); if (!it || running.current) return;
    running.current = true; setBusy("image"); setMsg("");
    try {
      const f = badgeFaces("x" + it.key.replace(/[^a-z0-9]/gi, ""), it.art, name, it.serial, it.backMessage, await fontCss());
      const img = await loadImg(f.front);
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      paint(c.getContext("2d")!, img, 1, it, name);
      c.toBlob((b) => { if (b) save(b, `${it.title}-${name}.png`); }, "image/png");
      setMsg("图片已经下载好了，可以直接发到 Instagram 限时动态。");
    } catch { setMsg("做图片失败了，请再试一次。"); } finally { running.current = false; setBusy(""); }
  }

  async function makeVideo() {
    const it = items.find((i) => i.key === pick); if (!it || running.current) return;
    if (typeof MediaRecorder === "undefined") { setMsg("这个浏览器还不能做视频，请先下载图片，或换 Chrome / Safari 再试。"); return; }
    running.current = true; setBusy("video"); setMsg("");
    try {
      const f = badgeFaces("y" + it.key.replace(/[^a-z0-9]/gi, ""), it.art, name, it.serial, it.backMessage, await fontCss());
      const [front, back] = await Promise.all([loadImg(f.front), loadImg(f.back)]);
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const ctx = c.getContext("2d")!;
      const type = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const rec = new MediaRecorder(c.captureStream(30), type ? { mimeType: type, videoBitsPerSecond: 6_000_000 } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const done = new Promise<void>((ok) => { rec.onstop = () => ok(); });
      rec.start();
      const start = performance.now(), DUR = 10000;
      await new Promise<void>((ok) => {
        const tick = (now: number) => {
          const t = Math.min(now - start, DUR), a = (t / DUR) * Math.PI * 2, cs = Math.cos(a);
          paint(ctx, cs >= 0 ? front : back, cs, it, name);
          if (t < DUR) requestAnimationFrame(tick); else ok();
        };
        requestAnimationFrame(tick);
      });
      rec.stop(); await done;
      const ext = (rec.mimeType || type).includes("mp4") ? "mp4" : "webm";
      save(new Blob(chunks, { type: rec.mimeType || type || "video/webm" }), `${it.title}-${name}.${ext}`);
      setMsg(ext === "mp4" ? "视频已经下载好了，慢慢转一圈，别人也能看到背面。" : "视频已下载（webm 格式）。Instagram 需要 mp4：请用 Chrome 或 iPhone 的 Safari 再做一次，或先下载图片。");
    } catch { setMsg("做视频失败了，请再试一次，或先下载图片。"); } finally { running.current = false; setBusy(""); }
  }

  return (
    <div className="space-y-4">
      <style>{FONT_FACE}</style>
      {preview && <p className="rounded-xl bg-sage-100 p-3 text-xs text-ink/70">管理员预览：这里把所有徽章都当作已经拿到，名字是示范。学生只会看到自己真正拿到的。</p>}

      {cur && (
        <section className="card flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left" aria-live="polite">
          <Medal it={cur} name={name} big turned={turned} onClick={() => setTurned((v) => !v)} />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xl font-medium">{cur.title}{cur.earned && cur.sub ? <span className="ml-2 text-sm text-ink/60">{cur.sub}</span> : null}</p>
            <p className="text-sm text-ink/70">{cur.how}</p>
            {cur.earned ? (
              <>
                {cur.earnedAt && <p className="text-xs text-ink/60">拿到的日子：{new Date(cur.earnedAt).toLocaleDateString("zh-CN")}</p>}
                <p className="mt-2 text-xs text-ink/60">Gary 的话</p>
                <p className="whitespace-pre-wrap">{cur.backMessage || "Gary 还没有写这一枚的话。"}</p>
                <p className="text-xs text-ink/60">点徽章翻到背面。</p>
              </>
            ) : <p className="text-sm text-ink/60">还没拿到。继续加油，拿到之后背面会写上你的名字和 Gary 的话。</p>}
          </div>
        </section>
      )}

      <section className="card" aria-label="我的徽章">
        <p className="mb-3 font-medium">我的徽章 <span className="text-sm font-normal text-ink/60">{earned.length} 枚</span></p>
        {items.length === 0 && <p className="py-6 text-center text-sm text-ink/50">这面墙还是空的。</p>}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {items.map((it) => (
            <button key={it.key} type="button" onClick={() => { setSel(it.key); setTurned(false); }}
              className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-xs ${sel === it.key ? "bg-clay-400/20 outline outline-2 outline-clay-400" : "hover:bg-ink/5"}`}>
              <span className="pointer-events-none"><Medal it={it} name={name} /></span>
              <span className={it.earned ? "font-medium" : "text-ink/50"}>{it.title}</span>
              {it.earned && it.sub ? <span className="text-ink/60">{it.sub}</span> : null}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <p className="font-medium">分享到 Instagram</p>
        {earned.length ? (
          <>
            <label className="block text-sm">
              <span className="text-ink/70">选一枚想分享的徽章</span>
              <select value={pick} onChange={(e) => setPick(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-ink/20 bg-white px-3 text-base">
                {earned.map((i) => <option key={i.key} value={i.key}>{i.title}{i.sub ? ` · ${i.sub}` : ""}</option>)}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={makeImage} disabled={!!busy} className="btn-primary min-h-11 text-sm disabled:opacity-50">{busy === "image" ? "做图片中…" : "下载图片"}</button>
              <button type="button" onClick={makeVideo} disabled={!!busy} className="btn-secondary min-h-11 text-sm disabled:opacity-50">{busy === "video" ? "做视频中（约 10 秒）…" : "下载视频（徽章慢慢转一圈）"}</button>
            </div>
            {msg && <p role="status" className="text-sm text-ink/70">{msg}</p>}
            <p className="text-xs text-ink/60">图片和视频都是竖版，最下面写着 @garybookshelf 陪你读书2027。分享多少次都可以，分享不会多给奖励，这是你自己的成就。</p>
          </>
        ) : <p className="text-sm text-ink/60">拿到第一枚徽章之后，就可以在这里下载图片或视频分享。</p>}
      </section>
    </div>
  );
}
