// The weekly content the programme serves. Data: data.bi.json / data.bm.json, merged from raw/*.json by scripts/build-content.mjs.
// Week 1 BI is the hand-reviewed model Gary approved; every other week is generated from its data by makeWeek().
import { BI_WEEK1, type Block, type Day, type Week } from "../week-content";
import { makeWeek, type WeekData } from "./build";
import { addGuidance } from "./guidance";
import biData from "./data.bi.json";
import bmData from "./data.bm.json";
import questionWeeks from "./questions.json";

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

/** Puts the picture of the real exam question (cropped from Gary's essay doc) on the opening day. Files: public/programme/q/bi-wNN.jpg, listed in questions.json. */
function addQuestionImage(w: Week): Week {
  if (w.lang !== "BI" || !(questionWeeks as number[]).includes(w.n)) return w;
  const src = `/programme/q/bi-w${String(w.n).padStart(2, "0")}.jpg`;
  return {
    ...w,
    days: w.days.map((d) => !["wed", "thu", "fri"].includes(d.key) || d.blocks[0]?.id !== "steps" ? d : {
      ...d,
      blocks: [d.blocks[0], { id: "qimage", type: "image", title: { zh: "这周的真题", en: "This week's real question" }, src, alt: "The exam question" }, ...d.blocks.slice(1)],
    }),
  };
}

/** Thursday: the student picks the point (a plural one) instead of being given one. Cleans the hand-written week 1 to match the generated weeks. */
function normaliseThursday(w: Week): Week {
  return {
    ...w,
    days: w.days.map((d) => {
      if (d.key !== "thu" || d.blocks[0]?.id !== "steps") return d;
      const steps = d.blocks[0];
      if (steps.type !== "steps") return d;
      const pick = w.lang === "BI"
        ? { zh: "从题目的要点里选一个来写。选一个有复数的要点（例如 reasons、ways），才有更多可以讲。", en: "Pick ONE point from the question to write about. Choose a point with a plural (for example reasons or ways), so you have more to say." }
        : { zh: "选一个 isi（主要观点）来写。选一个可以讲出多个例子或后果的观点。", en: "Pick ONE main point (isi). Choose one you can say a lot about." };
      const rest = d.blocks.slice(1).filter((b) => b.id !== "point" && b.id !== "format");
      const q = w.days.find((x) => x.key === "wed")?.blocks.find((b) => b.id === "question");
      return { ...d, blocks: [{ ...steps, items: [pick, ...steps.items.slice(1)] }, ...(q && !rest.some((b) => b.id === "question") ? [q] : []), ...rest] };
    }),
  };
}

export function getWeek(lang: "BI" | "BM", n: number): Week | null {
  const o = OVERRIDE[`${lang}-${n}`];
  if (o) return withResponses(addQuestionImage(addGuidance(normaliseThursday(o))));
  const d = DATA[lang].find((x) => x.n === n);
  return d ? withResponses(addQuestionImage(addGuidance(makeWeek(d)))) : null;
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
