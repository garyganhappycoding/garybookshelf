// Groq call for the Ask Gary bot. Uses its OWN key (GROQ_API_KEY_GARYBOT) so its usage is separate from Speaking.
// In development only, it falls back to GROQ_API_KEY so you can test before the second key is set.

const MODEL = process.env.GROQ_GARYBOT_MODEL || "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";

export function getKey(): string | null {
  const own = process.env.GROQ_API_KEY_GARYBOT;
  if (own) return own;
  if (process.env.NODE_ENV !== "production") return process.env.GROQ_API_KEY ?? null;
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const answerSchema = {
  type: "object",
  properties: {
    found: { type: "boolean" },
    used: { type: "array", items: { type: "string" } },
    reply: { type: "string" },
    safety: { type: "boolean" },
  },
  required: ["found", "used", "reply", "safety"],
  additionalProperties: false,
} as const;

export type LlmAnswer = { found: boolean; used: string[]; reply: string; safety: boolean };

// retry once on rate limit / server error, then fall back to the smaller model
export async function askModel(messages: unknown): Promise<{ answer: LlmAnswer | null; status: number; model: string }> {
  const key = getKey();
  if (!key) return { answer: null, status: 503, model: "" };
  let last: Response | null = null;
  let usedModel = MODEL;
  for (const model of [MODEL, MODEL, FALLBACK_MODEL]) {
    if (last) await sleep(Math.min(Number(last.headers.get("retry-after")) || 2, 5) * 1000);
    usedModel = model;
    last = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        reasoning_effort: "low",
        response_format: { type: "json_schema", json_schema: { name: "gary_reply", schema: answerSchema, strict: true } },
      }),
    });
    if (last.ok) break;
    if (last.status !== 429 && last.status < 500) break;
    console.warn("ask-gary model busy", model, last.status);
  }
  if (!last || !last.ok) return { answer: null, status: last?.status ?? 500, model: usedModel };
  try {
    const json = await last.json();
    return { answer: JSON.parse(json.choices[0].message.content) as LlmAnswer, status: 200, model: usedModel };
  } catch {
    return { answer: null, status: 502, model: usedModel };
  }
}
