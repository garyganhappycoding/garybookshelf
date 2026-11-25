// Draws the 陪你读书 badges as SVG text (no server code, so pages and the share exporter can both use it).
// Gary's approved designs (25 Nov 2026): 努力 n 天, 恒心, SPM FULL A and 自学 are metal medals (style I: ridged edge, bead ring, dark engraved
// band with the ring text once, rarer metal for longer streaks); the skill, habit and growth badges are hard-enamel pins (style II: every
// word sits inside the inner hexagon, one enamel colour per badge). The back of every badge: nickname, serial number, a few words from Gary.
import type { Tier } from "./badges";

export type Side = "front" | "back";
export type Art = { kind: "effort"; tier: Tier; n: number } | { kind: "steady" } | { kind: "fulla" } | { kind: "zixue"; edition: number } | { kind: "hex"; id: string };

type Metal = { l: string; m: string; k: string; ink: string };
export const METAL: Record<Tier, Metal> = {
  bronze: { l: "#f6cfa6", m: "#c47a3d", k: "#7a4519", ink: "#3a200a" },
  silver: { l: "#f6f8fb", m: "#b9c0c9", k: "#6b737d", ink: "#222a32" },
  gold: { l: "#fff3c9", m: "#e2bd62", k: "#9c7421", ink: "#3b2a06" },
  plat: { l: "#f4f9ff", m: "#a9c3df", k: "#5f7fa0", ink: "#15263a" },
};
export const TIER_NAME: Record<Tier, string> = { bronze: "铜", silver: "银", gold: "金", plat: "铂" };
const GOLD = METAL.gold;

type Hex = { en: [string, string]; eyebrow: string; num: string; label: string };
export const HEX: Record<string, Hex> = {
  start: { en: ["#8a5a2b", "#47290f"], eyebrow: "DAY ONE", num: "1", label: "起步宝宝" },
  vocab: { en: ["#1f6b6e", "#0e3335"], eyebrow: "VOCAB", num: "22", label: "词汇专家" },
  sentence: { en: ["#6b2f5c", "#341430"], eyebrow: "SENTENCES", num: "36", label: "造句专家" },
  opening: { en: ["#2c4a7a", "#14233f"], eyebrow: "OPENINGS", num: "4", label: "开头专家" },
  closing: { en: ["#7a1f2b", "#3d0f16"], eyebrow: "CLOSINGS", num: "2", label: "结尾专家" },
  point: { en: ["#2f6b57", "#18392f"], eyebrow: "POINTS", num: "6", label: "论点专家" },
  active: { en: ["#a8452a", "#561f12"], eyebrow: "ESSAYS", num: "3", label: "积极！" },
  review: { en: ["#3d3a7a", "#1b1a3d"], eyebrow: "AGAIN", num: "2", label: "温故知新" },
  recover: { en: ["#31607a", "#142b38"], eyebrow: "COMEBACK", num: "5", label: "重新努力！" },
  improve: { en: ["#5a7a2a", "#2b3a10"], eyebrow: "GROWTH", num: "20", label: "进步拉！！" },
};

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FONT_NUM = "Cormorant Garamond, Georgia, serif";
const FONT_CJK = "'Songti SC', 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', serif";

/** A few words from Gary on the back, cut into short lines that fit inside the badge. */
function lines(msg: string, per: number, max: number): string[] {
  const t = [...msg.replace(/\s+/g, " ").trim()];
  const out: string[] = [];
  for (let i = 0; i < t.length && out.length < max; i += per) out.push(t.slice(i, i + per).join(""));
  if (t.length > per * max && out.length) out[out.length - 1] = out[out.length - 1].slice(0, per - 1) + "…";
  return out;
}

export const serialText = (serial: number) => `№ ${String(serial).padStart(6, "0")}`;

function defs(p: string, t: Metal, en?: [string, string]) {
  return `<defs>
<linearGradient id="${p}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.l}"/><stop offset=".3" stop-color="${t.m}"/><stop offset=".55" stop-color="${t.k}"/><stop offset=".78" stop-color="${t.m}"/><stop offset="1" stop-color="${t.k}"/></linearGradient>
<linearGradient id="${p}b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.l}"/><stop offset=".5" stop-color="${t.m}"/><stop offset="1" stop-color="${t.k}"/></linearGradient>
<radialGradient id="${p}c" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${t.l}"/><stop offset=".6" stop-color="${t.m}"/><stop offset="1" stop-color="${t.k}"/></radialGradient>
<linearGradient id="${p}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${en ? en[0] : "#000"}"/><stop offset="1" stop-color="${en ? en[1] : "#000"}"/></linearGradient>
<linearGradient id="${p}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
}

/** The metal medal: ridged edge, bead ring, dark engraved band holding the ring text (once), domed centre. */
function medal(p: string, t: Metal, ring: string, back: boolean) {
  const reeds = [...Array(96)].map((_, k) => `<line x1="100" y1="3" x2="100" y2="11" stroke="${t.k}" stroke-width="1.5" transform="rotate(${k * 3.75} 100 100)"/>`).join("");
  const beads = [...Array(60)].map((_, k) => `<circle cx="100" cy="21" r="1.5" fill="${t.l}" transform="rotate(${k * 6} 100 100)"/>`).join("");
  return `<circle cx="100" cy="100" r="98" fill="url(#${p}${back ? "b" : "a"})"/>${reeds}
<circle cx="100" cy="100" r="91" fill="url(#${p}${back ? "a" : "b"})" stroke="${t.k}" stroke-width="1.5"/>${beads}
<circle cx="100" cy="100" r="80" fill="none" stroke="${t.l}" stroke-opacity=".9" stroke-width="1.5"/>
<circle cx="100" cy="100" r="78" fill="${t.k}"/><circle cx="100" cy="100" r="56" fill="url(#${p}c)" stroke="${t.l}" stroke-width="1.5"/>
<defs><path id="${p}p" d="M100 100m-67 0a67 67 0 1 1 134 0a67 67 0 1 1 -134 0"/></defs>
<text font-family="${FONT_NUM}, ${FONT_CJK}" font-size="11.5" font-weight="700" fill="${t.l}" dy="4"><textPath href="#${p}p" textLength="415" lengthAdjust="spacing">${esc(ring)}</textPath></text>`;
}

const RING = "陪你读书2027 · GARYBOOKSHELF · ";
const T = (x: number, y: number, size: number, fill: string, txt: string, extra = "", cjk = true) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${cjk ? FONT_CJK : FONT_NUM}" font-weight="700" font-size="${size}" fill="${fill}" ${extra}>${esc(txt)}</text>`;
const NUM = (x: number, y: number, size: number, fill: string, txt: string) =>
  `<text x="${x}" y="${y + size * 0.315}" text-anchor="middle" font-family="${FONT_NUM}" font-weight="700" font-size="${size}" fill="${fill}" style="font-variant-numeric:lining-nums;font-feature-settings:'lnum' 1">${esc(txt)}</text>`;

function sprout(ink: string) {
  return `<g transform="translate(100 100) scale(.6) translate(-100 -108)" fill="none" stroke="${ink}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><path d="M100 150V104"/><path d="M100 108C100 80 76 70 54 74c0 26 20 42 46 34z"/><path d="M100 98C100 74 122 62 146 66c0 26-20 38-46 32z"/></g>`;
}

function metalFront(p: string, t: Metal, a: Art) {
  let center = "";
  if (a.kind === "effort") center = T(100, 68, 9, t.ink, "努力", `letter-spacing="2"`) + NUM(100, 102, a.n >= 100 ? 34 : 44, t.ink, String(a.n)) + T(100, 136, 9, t.ink, "天");
  else if (a.kind === "steady") center = T(100, 68, 9, t.ink, "恒心", `letter-spacing="2"`) + NUM(100, 102, 34, t.ink, "100") + T(100, 136, 9, t.ink, "天");
  else if (a.kind === "fulla") center = T(100, 68, 8, t.ink, "SPM", `letter-spacing="2"`, false) + NUM(100, 102, 34, t.ink, "200") + T(100, 136, 8, t.ink, "FULL A", `letter-spacing="1.5"`, false);
  else center = sprout(t.ink);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${defs(p, t)}${medal(p, t, RING, false)}${center}</svg>`;
}

function metalBack(p: string, t: Metal, a: Art, name: string, serial: number, msg: string) {
  const ring = a.kind === "zixue" ? "自学毕业 · 限量 200 枚 · 2027 · " : a.kind === "fulla" ? "bookshelf祝福你 SPM FULL A · 2027 · " : RING;
  const word = a.kind === "zixue" ? T(100, 80, 22, t.ink, "自学", `letter-spacing="5"`) : "";
  const no = a.kind === "zixue" ? `№ ${String(a.edition).padStart(3, "0")} / 200` : serialText(serial);
  const y0 = a.kind === "zixue" ? 98 : 88;
  const note = lines(msg, 9, 2).map((l, i) => T(100, y0 + 33 + i * 11, 8, t.ink, l, `opacity=".85"`)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${defs(p, t)}${medal(p, t, ring, true)}${word}
${T(100, y0, 12, t.ink, name)}${T(100, y0 + 16, 10.5, t.ink, no, `letter-spacing="1.5"`, false)}${note}</svg>`;
}

function hexFront(p: string, h: Hex) {
  const t = GOLD;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${defs(p, t, h.en)}
<path d="M100 6 180 51v98l-80 45-80-45V51z" fill="url(#${p}a)"/>
<path d="M100 17 170 57v86l-70 40-70-40V57z" fill="url(#${p}e)" stroke="${t.k}" stroke-width="2"/>
<path d="M100 28 160 62v76l-60 34-60-34V62z" fill="none" stroke="url(#${p}b)" stroke-width="3"/>
${T(100, 57, 7, t.m, h.eyebrow, `letter-spacing="1.8"`, false)}${NUM(100, 98, 54, t.l, h.num)}${T(100, 146, 11, t.l, h.label, `letter-spacing="2"`)}
<path d="M100 17 170 57v22C140 66 60 66 30 79V57z" fill="url(#${p}g)"/></svg>`;
}

function hexBack(p: string, h: Hex, name: string, serial: number, msg: string) {
  const t = GOLD;
  const note = lines(msg, 10, 2).map((l, i) => T(100, 126 + i * 12, 8, t.ink, l, `opacity=".85"`)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${defs(p, t, h.en)}
<path d="M100 6 180 51v98l-80 45-80-45V51z" fill="url(#${p}b)"/>
<path d="M100 17 170 57v86l-70 40-70-40V57z" fill="url(#${p}a)" stroke="${t.k}" stroke-width="2"/>
<path d="M100 28 160 62v76l-60 34-60-34V62z" fill="none" stroke="${t.k}" stroke-width="1.4"/>
${T(100, 88, 14, t.ink, name)}${T(100, 106, 10.5, t.ink, serialText(serial), `letter-spacing="1.5"`, false)}${note}</svg>`;
}

/** The two faces of one badge. `uid` keeps gradient ids unique when several badges are on one page. */
export function badgeFaces(uid: string, a: Art, name: string, serial: number, msg: string, fontCss = ""): { front: string; back: string } {
  const style = fontCss ? `<style>${fontCss}</style>` : "";
  const add = (svg: string) => (style ? svg.replace(/(<svg[^>]*>)/, `$1${style}`) : svg);
  if (a.kind === "hex") {
    const h = HEX[a.id];
    return { front: add(hexFront(uid + "f", h)), back: add(hexBack(uid + "b", h, name, serial, msg)) };
  }
  const t = a.kind === "effort" ? METAL[a.tier] : a.kind === "steady" ? METAL.plat : GOLD;
  return { front: add(metalFront(uid + "f", t, a)), back: add(metalBack(uid + "b", t, a, name, serial, msg)) };
}

/** Which drawing a badge uses. */
export function artFor(badgeId: string, e: { n: number | null; tier: Tier | null; edition: number | null }): Art | null {
  if (badgeId === "effort") return { kind: "effort", tier: e.tier ?? "bronze", n: e.n ?? 7 };
  if (badgeId === "steady") return { kind: "steady" };
  if (badgeId === "fulla") return { kind: "fulla" };
  if (badgeId === "zixue") return { kind: "zixue", edition: e.edition ?? 0 };
  return HEX[badgeId] ? { kind: "hex", id: badgeId } : null;
}
