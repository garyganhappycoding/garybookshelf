// SERVER-ONLY. The English essay marking pipeline of /api/writing/mark (requirement check, then marking, then the Content cap), without the
// credit and limit logic, for the 陪你读书 essay tests (Gary, 25 Nov 2026: "use the English marking essay I built"). It is a copy of that route's
// steps, so the scores match what students get on the Essay marking page. If the route's marking rules change, change this too.
import { backupTargets, GROQ_URL, requestBody, type Target } from "@/lib/speaking/providers";
import { BAND_MAX, CRITERIA, buildMessages, buildResultSchema, type Genre, type WritingPart, type WritingResult } from "@/lib/writing/mark";
import {
  buildCheckMessages, buildRequirementMessages, checkSummaryText, checksSchema, evaluateRequirements, requirementsSchema,
  type PointResult, type Requirement, type RequirementCheckRaw, type RequirementSummary,
} from "@/lib/writing/requirements";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";
type AiFail = { status: number; detail: string; retryAfter?: number };
type CallOpts = { deadline: number; maxWaitS: number };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function retryAfterSeconds(res: Response, text: string): number | undefined {
  const h = Number(res.headers.get("retry-after"));
  if (h > 0) return Math.ceil(h);
  const m = text.match(/try again in (?:(\d+)h)?(?:(\d+)m)?(\d+(?:\.\d+)?)s/i);
  if (m) return Math.ceil(Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3]));
  return undefined;
}

function usable(r: any, needPoints: boolean): r is WritingResult {
  if (!r || typeof r !== "object" || !r.criteria) return false;
  for (const c of CRITERIA) {
    const x = r.criteria[c];
    if (!x || typeof x.band !== "number" || String(x.why ?? "").trim().length < 15) return false;
  }
  return String(r.summary ?? "").trim().length >= 15 && (!needPoints || (Array.isArray(r.points) && r.points.length > 0));
}

async function callJson<T>(targets: Target[], messages: unknown, schema: object, schemaName: string, valid: (r: any) => r is T, opts: CallOpts): Promise<{ result: T; model: string } | AiFail> {
  let last: AiFail = { status: 502, detail: "no model tried" };
  let prevUrl = "", waited = false;
  for (const t of targets) {
    if (t.url === prevUrl && !waited) { await sleep(2000); waited = true; }
    prevUrl = t.url;
    const model = t.label ?? t.model;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(t.url, { method: "POST", headers: { Authorization: `Bearer ${t.key}`, "Content-Type": "application/json" }, body: requestBody(t, messages, schema, schemaName) });
        if (!res.ok) {
          const text = (await res.text()).slice(0, 400);
          last = { status: res.status, detail: text, retryAfter: retryAfterSeconds(res, text) };
          const short = last.retryAfter !== undefined && last.retryAfter <= opts.maxWaitS && Date.now() + last.retryAfter * 1000 + 20_000 < opts.deadline;
          if (res.status === 429 && t.kind === "groq" && attempt === 0 && short) { await sleep((last.retryAfter as number) * 1000 + 500); continue; }
          break;
        }
        const json = await res.json();
        let parsed: unknown;
        try { parsed = JSON.parse(json?.choices?.[0]?.message?.content ?? ""); } catch { last = { status: 502, detail: `unreadable JSON from ${model}` }; break; }
        if (!valid(parsed)) { last = { status: 502, detail: `thin or invalid answer from ${model}` }; break; }
        return { result: parsed, model };
      } catch (e) { last = { status: 502, detail: e instanceof Error ? e.message : String(e) }; break; }
    }
  }
  return last;
}

async function runRequirementCheck(targets: Target[], question: string, essay: string, opts: CallOpts): Promise<{ points: PointResult[]; summary: RequirementSummary } | null> {
  try {
    const a = await callJson<{ requirements: Requirement[] }>(targets, buildRequirementMessages(question), requirementsSchema, "requirements",
      (r): r is { requirements: Requirement[] } => Array.isArray(r?.requirements) && r.requirements.length > 0 && r.requirements.length <= 8, opts);
    if ("status" in a) return null;
    const b = await callJson<{ checks: RequirementCheckRaw[] }>(targets, buildCheckMessages(a.result.requirements, essay), checksSchema, "requirement_check",
      (r): r is { checks: RequirementCheckRaw[] } => Array.isArray(r?.checks) && r.checks.length > 0, opts);
    if ("status" in b) return null;
    return evaluateRequirements(a.result.requirements, b.result.checks);
  } catch (e) { console.error("requirement check failed", e); return null; }
}

/** Marks one English essay the way the Essay marking page does for a paying student. Returns null when the AI could not be reached. */
export async function markEnglishEssay(opts: { question: string; essay: string; part?: WritingPart; genre?: Genre }): Promise<{ total: number; result: WritingResult; model: string } | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const { question, essay, part = 3, genre = "article" } = opts;
  const groq = (model: string): Target => ({ url: GROQ_URL, key, model, kind: "groq" });
  const targets = [groq(MODEL), ...backupTargets(), groq(MODEL), groq(FALLBACK_MODEL)];
  const call: CallOpts = { deadline: Date.now() + 55_000, maxWaitS: 12 };
  const check = await runRequirementCheck(targets, question, essay, call);
  const out = await callJson<WritingResult>(targets,
    buildMessages({ part, genre, question, essay, paid: true, checkSummary: check ? checkSummaryText(check.points, check.summary) : undefined }),
    buildResultSchema(true, !check), "essay_marking", (r): r is WritingResult => usable(r, !check), call);
  if ("status" in out) { console.error("programme essay marking failed", out.status, out.detail); return null; }
  const { result, model } = out;
  let total = 0;
  for (const c of CRITERIA) {
    const x = result.criteria[c];
    x.band = Math.min(BAND_MAX, Math.max(0, Math.round(x.band)));
    total += x.band;
  }
  if (check) {
    result.points = check.points;
    result.requirement_check = check.summary;
    const content = result.criteria.content;
    if (content.band > check.summary.cap) { total -= content.band - check.summary.cap; content.band = check.summary.cap; }
  }
  return { total, result, model };
}
