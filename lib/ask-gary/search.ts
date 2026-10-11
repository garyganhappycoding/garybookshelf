// Finds which of Gary's entries could answer a student's question.
// With only a few dozen entries we score them in memory (works for Chinese and English, no extra service needed).

export type Entry = {
  id: string;
  topic: string;
  subjects: string[];
  format: string | null;
  review: string;
  questions_en: string | null;
  questions_zh: string | null;
  answer_zh: string | null;
  answer_en: string | null;
  reel_link: string | null;
  free_keyword: string | null;
  product: string | null;
};

const EN_STOP = new Set(
  "the and for are but not you your yours have has had how what why when where which who whom this that these those with from about into over under can could should would will may might must does did doing done been being was were its it's i'm i've i'll don't doesn't didn't can't won't isn't aren't wasn't just also then than too very really more most some any all out get got want need know like make made does".split(
    " "
  )
);

export function tokens(text: string): string[] {
  const t = (text || "").toLowerCase();
  const out: string[] = [];
  for (const w of t.match(/[a-z][a-z0-9']+/g) ?? []) if (w.length > 2 && !EN_STOP.has(w)) out.push(w);
  for (const run of t.match(/[一-鿿]+/g) ?? []) {
    if (run.length < 2) continue;
    for (let i = 0; i < run.length - 1; i++) out.push(run.slice(i, i + 2)); // character pairs
  }
  return out;
}

type Indexed = { entry: Entry; strong: Set<string>; weak: Set<string> };

export function buildIndex(entries: Entry[]) {
  const docs: Indexed[] = entries.map((entry) => ({
    entry,
    strong: new Set(tokens([entry.topic, entry.questions_zh, entry.questions_en, entry.subjects.join(" ")].join(" "))),
    weak: new Set(tokens([entry.answer_zh, entry.answer_en].join(" "))),
  }));
  const df = new Map<string, number>();
  for (const d of docs) for (const tok of new Set([...d.strong, ...d.weak])) df.set(tok, (df.get(tok) ?? 0) + 1);
  const n = Math.max(docs.length, 1);
  const idf = (tok: string) => Math.log(1 + n / (df.get(tok) ?? 1));
  return { docs, idf };
}

export type Scored = { entry: Entry; score: number };

export function search(index: ReturnType<typeof buildIndex>, query: string, limit = 4): Scored[] {
  const q = [...new Set(tokens(query))];
  if (!q.length) return [];
  const norm = Math.sqrt(q.length);
  const scored = index.docs.map((d) => {
    let s = 0;
    for (const tok of q) {
      const w = index.idf(tok);
      if (d.strong.has(tok)) s += 2 * w;
      else if (d.weak.has(tok)) s += w;
    }
    return { entry: d.entry, score: s / norm };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const hasCjk = (t: string) => /[一-鿿]/.test(t);
