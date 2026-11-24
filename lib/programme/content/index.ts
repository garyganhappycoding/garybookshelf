// The weekly content the programme serves. Data: data.bi.json / data.bm.json, merged from raw/*.json by scripts/build-content.mjs.
// Week 1 BI is the hand-reviewed model Gary approved; every other week is generated from its data by makeWeek().
import { BI_WEEK1, type Block, type Day, type Week } from "../week-content";
import { makeWeek, type WeekData } from "./build";
import { addGuidance } from "./guidance";
import biData from "./data.bi.json";
import bmData from "./data.bm.json";

const DATA = { BI: biData as unknown as WeekData[], BM: bmData as unknown as WeekData[] };
const OVERRIDE: Record<string, Week> = { "BI-1": BI_WEEK1 };

const has = (d: Day, id: string) => d.blocks.some((b: Block) => b.id === id);

/** Work out what the student has to hand in on each day from the blocks the day has. */
export function withResponses(w: Week): Week {
  return {
    ...w,
    days: w.days.map((d) => {
      let response: Day["response"] = { kind: "none" };
      if (d.key === "mon") {
        const v = d.blocks.find((b) => b.type === "vocab");
        if (v && v.type === "vocab") response = { kind: "sentences", words: v.rows.map((r) => ({ word: r.word, zh: r.zh })) };
      } else if (d.key === "tue") {
        if (has(d, "essay")) response = { kind: "highlight" };
      } else if (d.key === "wed" || d.key === "thu" || d.key === "fri") {
        if (has(d, "model")) response = { kind: "text" };
      } else if (d.key === "sun") {
        if (has(d, "model")) response = { kind: "text", optional: true };
      }
      return { ...d, response };
    }),
  };
}

export function getWeek(lang: "BI" | "BM", n: number): Week | null {
  const o = OVERRIDE[`${lang}-${n}`];
  if (o) return withResponses(addGuidance(o));
  const d = DATA[lang].find((x) => x.n === n);
  return d ? withResponses(addGuidance(makeWeek(d))) : null;
}

export const weeksAvailable = (lang: "BI" | "BM") => [...new Set([...(lang === "BI" ? [1] : []), ...DATA[lang].map((x) => x.n)])].sort((a, b) => a - b);

/** Which day card a calendar date is. Group B studies Mon to Fri, Group A Sun to Thu; the two rest days map to "sat" and "sun". */
export function dayKeyFor(group: "A" | "B", dow: number): "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun" {
  const B = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const A = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  return (group === "A" ? A : B)[dow];
}

/** Removes the "(… unchecked)" notes Claude left for Gary, so a student never sees them. */
export const forStudent = (s: string) => s.replace(/\s*[（(][^）)]*(unchecked|未确认)[^）)]*[）)]/gi, "").trim();
