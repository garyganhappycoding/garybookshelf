// SERVER-ONLY. Marks a student's essay for the programme's tests: the BI essay with the English writing marker (4 criteria x 5 = /20) and the BM
// essay with the Malay marker (Kertas 1 Bahagian B, /70). The score is turned into a percent so BI and BM can sit on one progress chart.
// Marks are ESTIMATES for practice (Gary is still calibrating both markers). The BM marker is still private; the programme is closed to students.
import { BAND_MAX, CRITERIA, countWords, type Genre, type WritingPart } from "@/lib/writing/mark";
import { markEnglishEssay } from "@/lib/writing/markcore";
import { BM_SCHEMA, buildBmMessages, finish } from "@/lib/writing/mark-bm";

const URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = [process.env.GROQ_MODEL || "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

export type Scored = { score: number; label: string; summary: string; strength: string; model: string; result: unknown };

async function ask(messages: unknown, schema: object, name: string, valid: (r: any) => boolean): Promise<{ r: any; model: string } | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  for (const m of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(URL, {
          method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: m, temperature: 0.2, reasoning_effort: "medium", messages, response_format: { type: "json_schema", json_schema: { name, schema, strict: true } } }),
          signal: AbortSignal.timeout(55000),
        });
        if (res.status === 429 && attempt === 0) { await new Promise((r) => setTimeout(r, 8000)); continue; }
        if (!res.ok) break;
        const r = JSON.parse((await res.json()).choices[0].message.content);
        if (valid(r)) return { r, model: m };
        break;
      } catch { break; }
    }
  }
  return null;
}

export async function scoreEssay(lang: "BI" | "BM", question: string, essay: string, opts: { part?: WritingPart; genre?: Genre } = {}): Promise<Scored | null> {
  if (lang === "BI") {
    // the real Essay marking pipeline (requirement check, marking, Content cap)
    const m = await markEnglishEssay({ question: question.slice(0, 1500), essay: essay.slice(0, 9000), part: opts.part, genre: opts.genre });
    if (!m) return null;
    return { score: Math.round((m.total / (BAND_MAX * CRITERIA.length)) * 1000) / 10, label: `${m.total}/${BAND_MAX * CRITERIA.length}`, summary: m.result.summary, strength: m.result.strength, model: m.model, result: m.result };
  }
  const got = await ask(buildBmMessages("B", question.slice(0, 1500), essay.slice(0, 9000)), BM_SCHEMA, "bm_score",
    (r) => Array.isArray(r?.areas) && r.areas.length >= 4 && String(r.summary ?? "").length > 10 && typeof r.mark === "number");
  if (!got) return null;
  const res = finish("B", essay, got.r);
  return { score: Math.round((res.mark / res.max) * 1000) / 10, label: `${res.mark}/${res.max} · ${res.band}`, summary: res.summary, strength: res.strength, model: got.model, result: res };
}

export { countWords };
