// The weekly content the programme serves. Data: data.bi.json / data.bm.json, merged from raw/*.json by scripts/build-content.mjs.
// Week 1 BI is the hand-reviewed model Gary approved; every other week is generated from its data by makeWeek().
import { BI_WEEK1, type Block, type Day, type Week } from "../week-content";
import { makeWeek, type WeekData } from "./build";
import { addGuidance } from "./guidance";
import bi4 from "./data.f4.bi.json";
import bm4 from "./data.f4.bm.json";
import bi5 from "./data.f5.bi.json";
import bm5 from "./data.f5.bm.json";
import q4 from "./questions.f4.json";
import q5 from "./questions.f5.json";

// Form 4 and Form 5 have separate content (Gary, 24 Nov 2026). Form 5 started as a copy of Form 4 and is edited on its own.
export type FormKey = "f4" | "f5";
export const formKey = (form: number): FormKey => (form === 5 ? "f5" : "f4");
const DATA = {
  f4: { BI: bi4 as unknown as WeekData[], BM: bm4 as unknown as WeekData[] },
  f5: { BI: bi5 as unknown as WeekData[], BM: bm5 as unknown as WeekData[] },
};
const QUESTIONS: Record<FormKey, number[]> = { f4: q4 as number[], f5: q5 as number[] };
const OVERRIDE: Record<string, Week> = { "f4-BI-1": BI_WEEK1 }; // the hand-reviewed week 1 (Form 4)

const has = (d: Day, id: string) => d.blocks.some((b: Block) => b.id === id);

/** Work out what the student has to hand in on each day from the blocks the day has. */
export function withResponses(w: Week): Week {
  return {
    ...w,
    days: w.days.map((d) => {
      let response: Day["response"] = d.response ?? { kind: "none" };
      if (d.response) return { ...d, response };
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
function addQuestionImage(w: Week, form: FormKey): Week {
  if (w.lang !== "BI" || !QUESTIONS[form].includes(w.n)) return w;
  const src = `/programme/q/${form}/bi-w${String(w.n).padStart(2, "0")}.jpg`;
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

export function getWeek(form: FormKey, lang: "BI" | "BM", n: number): Week | null {
  const o = OVERRIDE[`${form}-${lang}-${n}`];
  if (o) return withResponses(addQuestionImage(addGuidance(normaliseThursday(o)), form));
  const d = DATA[form][lang].find((x) => x.n === n);
  return d ? withResponses(addQuestionImage(addGuidance(makeWeek(d)), form)) : null;
}

export const weeksAvailable = (form: FormKey, lang: "BI" | "BM") => [...new Set([...(form === "f4" && lang === "BI" ? [1] : []), ...DATA[form][lang].map((x) => x.n)])].sort((a, b) => a - b);

/** Which day card a calendar date is. Group B studies Mon to Fri, Group A Sun to Thu; the two rest days map to "sat" and "sun". */
export function dayKeyFor(group: "A" | "B", dow: number): "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun" {
  const B = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const A = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  return (group === "A" ? A : B)[dow];
}

/** Removes the "(… unchecked)" notes Claude left for Gary, so a student never sees them. */
export const forStudent = (s: string) => s.replace(/\s*[（(][^）)]*(unchecked|未确认)[^）)]*[）)]/gi, "").trim();
