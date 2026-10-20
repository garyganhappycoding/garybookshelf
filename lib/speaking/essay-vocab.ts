import type { Card } from "./cards";
import { ESSAY_VOCAB } from "./essay-vocab-data";

// Phrases from Gary's English essay notes (Table 1 of each essay). Used only in the paid report.
export type EssayPhrase = {
  phrase: string;
  zh: string; // Chinese meaning
  type: "general" | "specific";
  themes: string[]; // speaking themes a specific phrase fits; empty for general phrases
  source: string; // which essay it came from
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

// Small stable number from a string, so the same card always gets the same general phrases.
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const GENERAL_PICK = 6;
const SPECIFIC_PICK = 12;

// A short list of phrases for the AI to work in: some from this card's theme, plus a rotating set of general ones.
export function pickEssayPhrases(card: Card, all: EssayPhrase[] = ESSAY_VOCAB): EssayPhrase[] {
  const specific = all.filter((p) => p.type === "specific" && p.themes.includes(card.theme));
  const general = all.filter((p) => p.type === "general");
  const start = general.length ? hash(card.id) % general.length : 0;
  const rotated = [...general.slice(start), ...general.slice(0, start)];
  return [...specific.slice(0, SPECIFIC_PICK), ...rotated.slice(0, GENERAL_PICK)];
}

// Keep only phrases the AI says it used that are really in the bank AND really appear in the rewritten sentence.
// Returns the bank's own spelling and Chinese meaning, so the page can highlight them.
export function verifyUsedPhrases(used: unknown, upgraded: string, offered: EssayPhrase[]): { phrase: string; zh: string }[] {
  if (!Array.isArray(used)) return [];
  const text = norm(upgraded);
  const out: { phrase: string; zh: string }[] = [];
  for (const u of used) {
    const hit = offered.find((p) => norm(p.phrase) === norm(String(u)));
    if (hit && text.includes(norm(hit.phrase)) && !out.some((o) => o.phrase === hit.phrase)) out.push({ phrase: hit.phrase, zh: hit.zh });
  }
  return out;
}
