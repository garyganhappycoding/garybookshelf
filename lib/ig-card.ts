// BROWSER-ONLY. Draws a student's question as a "sticky note" Instagram card (1080 x 1350, the 4:5 feed size) on a canvas, so
// Gary can save it as a picture and answer it on Instagram. Colours are the shark palette from brand/BRAND.md.
// Long questions shrink to fit, and when even the smallest text does not fit they are split into several cards.

export const CARD_W = 1080;
export const CARD_H = 1350;

const NAVY = "#1C2433";
const PERIWINKLE = "#B4C6E9";
const TINT = "#DCE6F7";
const DEEP = "#5B78B8";
const BUTTER = "#EEE1AC";
const CJK = '"PingFang SC","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC",sans-serif';

const NOTE = { x: 120, y: 270, w: 840, h: 800 }; // the sticky note before it is tilted
const PAD = { x: 64, top: 96, bottom: 120 }; // inside the note
const FONT_MAX = 68;
const FONT_MIN = 36;

// the Caveat family name next.js generated for the site (it is hashed), with fallbacks for Chinese characters
function handFamily(): string {
  const v = typeof document !== "undefined" ? getComputedStyle(document.body).getPropertyValue("--font-hand") : "";
  const first = v.split(",")[0]?.trim();
  return `${first || "Caveat"}, ${CJK}`;
}

export async function loadCardAssets(): Promise<HTMLImageElement | null> {
  try {
    await document.fonts.load(`500 60px ${handFamily()}`);
    await document.fonts.load("500 34px Inter");
  } catch {
    /* the card still draws with fallback fonts */
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/dolphin-icon.png";
  });
}

// Breaks text into lines no wider than maxW. Chinese breaks between any two characters, English at spaces.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.replace(/\r/g, "").split("\n")) {
    if (!para.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    let lastSpace = -1;
    for (const ch of para) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line) {
        if (lastSpace > 0 && ch !== " ") {
          lines.push(line.slice(0, lastSpace).trimEnd());
          line = line.slice(lastSpace + 1) + ch;
        } else {
          lines.push(line.trimEnd());
          line = ch === " " ? "" : ch;
        }
        lastSpace = -1;
      } else {
        line = test;
      }
      if (ch === " ") lastSpace = line.length - 1;
    }
    if (line) lines.push(line);
  }
  return lines;
}

function layout(ctx: CanvasRenderingContext2D, text: string) {
  const maxW = NOTE.w - PAD.x * 2;
  const maxH = NOTE.h - PAD.top - PAD.bottom;
  for (let size = FONT_MAX; size >= FONT_MIN; size -= 2) {
    ctx.font = `500 ${size}px ${handFamily()}`;
    const lines = wrap(ctx, text, maxW);
    const lh = Math.round(size * 1.32);
    if (lines.length * lh <= maxH) return { size, lh, lines, fits: true };
  }
  ctx.font = `500 ${FONT_MIN}px ${handFamily()}`;
  return { size: FONT_MIN, lh: Math.round(FONT_MIN * 1.32), lines: wrap(ctx, text, maxW), fits: false };
}

// Splits a long question into pieces that each fit on one card, cutting at sentence ends where possible.
export function splitForCards(text: string): string[] {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const clean = text.trim();
  if (!clean) return [""];
  if (layout(ctx, clean).fits) return [clean];

  const sentences = clean.split(/(?<=[。！？!?.\n])/).filter((s) => s.trim());
  const chunks: string[] = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) chunks.push(cur.trim());
    cur = "";
  };
  for (const s of sentences) {
    if (layout(ctx, cur + s).fits) {
      cur += s;
      continue;
    }
    push();
    if (layout(ctx, s).fits) {
      cur = s;
    } else {
      // one very long sentence: cut it by characters
      let piece = "";
      for (const ch of s) {
        if (!layout(ctx, piece + ch).fits) {
          chunks.push(piece.trim());
          piece = "";
        }
        piece += ch;
      }
      cur = piece;
    }
  }
  push();
  return chunks.length ? chunks : [clean];
}

export type CardOptions = { text: string; who: string; index: number; total: number; avatar: HTMLImageElement | null };

export function drawCard(canvas: HTMLCanvasElement, o: CardOptions) {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;

  // desk: periwinkle with a dot grid
  ctx.fillStyle = TINT;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.fillStyle = PERIWINKLE;
  for (let y = 24; y < CARD_H; y += 48) for (let x = 24; x < CARD_W; x += 48) ctx.fillRect(x - 3, y - 3, 6, 6);

  // top-left label pill
  ctx.font = `500 34px Inter, ${CJK}`;
  const label = "garybookshelf · ask Gary";
  const pw = ctx.measureText(label).width + 64;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(80, 90, pw, 76, 38);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = NAVY;
  ctx.textBaseline = "middle";
  ctx.fillText(label, 112, 129);

  // mascot, top right
  if (o.avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(CARD_W - 150, 128, 62, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = NAVY;
    ctx.stroke();
    ctx.clip();
    ctx.drawImage(o.avatar, CARD_W - 212, 66, 124, 124);
    ctx.restore();
  }

  // the sticky note, tilted a little
  ctx.save();
  ctx.translate(NOTE.x + NOTE.w / 2, NOTE.y + NOTE.h / 2);
  ctx.rotate((-2 * Math.PI) / 180);
  ctx.translate(-NOTE.w / 2, -NOTE.h / 2);

  ctx.shadowColor = "rgba(28,36,51,0.22)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = BUTTER;
  ctx.fillRect(0, 0, NOTE.w, NOTE.h);
  ctx.shadowColor = "transparent";

  // tape
  ctx.save();
  ctx.translate(NOTE.w / 2, -6);
  ctx.rotate((4 * Math.PI) / 180);
  ctx.fillStyle = "rgba(244,182,194,0.92)";
  ctx.fillRect(-110, -34, 220, 68);
  ctx.restore();

  // the question
  const { size, lh, lines } = layout(ctx, o.text);
  ctx.font = `500 ${size}px ${handFamily()}`;
  ctx.fillStyle = NAVY;
  ctx.textBaseline = "alphabetic";
  const maxLines = Math.floor((NOTE.h - PAD.top - PAD.bottom) / lh);
  lines.slice(0, maxLines).forEach((ln, i) => ctx.fillText(ln, PAD.x, PAD.top + size + i * lh));

  // who asked (never a name or an email)
  ctx.font = `500 32px Inter, ${CJK}`;
  ctx.fillStyle = DEEP;
  ctx.fillText(o.who, PAD.x, NOTE.h - 52);
  ctx.restore();

  // footer
  ctx.font = `500 34px Inter, ${CJK}`;
  ctx.fillStyle = NAVY;
  ctx.textBaseline = "middle";
  ctx.fillText(o.index < o.total ? `Question continues → ${o.index}/${o.total}` : "Gary's answer on the next slide →", 120, 1240);
  if (o.total > 1) {
    ctx.textAlign = "right";
    ctx.fillStyle = DEEP;
    ctx.fillText(`${o.index} / ${o.total}`, CARD_W - 120, 1240);
    ctx.textAlign = "left";
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
