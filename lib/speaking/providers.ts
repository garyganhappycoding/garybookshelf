// The AI services the Speaking marker can call. Groq is the main one. The backup (OpenRouter and/or Cerebras) is tried after Groq
// fails or is busy, for paying students first in line and, since 4 Nov 2026, for free students too (Gary's decision: nobody
// should meet "AI busy"). A paid attempt that is made when the pack is used up counts as a free attempt.
export type Target = {
  url: string;
  key: string;
  model: string;
  kind: "groq" | "cerebras" | "openrouter";
  label?: string; // what is saved as the model name, e.g. "openrouter:openai/gpt-oss-120b"
  onlyIfBadJson?: boolean; // only used when the previous answer was malformed JSON (free students get one more go at that, never a retry on a busy AI)
};

// GROQ_CHAT_URL is only for tests (point it at a fake server to rehearse a Groq outage); in production it is unset.
export const GROQ_URL = process.env.GROQ_CHAT_URL || "https://api.groq.com/openai/v1/chat/completions";
export const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Backups, in the order they are tried. A provider without a key in Vercel is simply skipped.
export function backupTargets(): Target[] {
  const out: Target[] = [];
  const or = process.env.OPENROUTER_API_KEY;
  if (or) {
    const model = process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b";
    out.push({ url: OPENROUTER_URL, key: or, model, kind: "openrouter", label: `openrouter:${model}` });
  }
  const cb = process.env.CEREBRAS_API_KEY;
  if (cb) out.push({ url: CEREBRAS_URL, key: cb, model: "gpt-oss-120b", kind: "cerebras", label: "cerebras:gpt-oss-120b" });
  return out;
}

export function requestBody(t: Target, messages: unknown, schema: object, name = "speaking_feedback"): string {
  const body: Record<string, unknown> = {
    model: t.model,
    messages,
    temperature: 0.2,
    response_format: { type: "json_schema", json_schema: { name, schema, strict: true } },
  };
  if (t.kind === "openrouter") {
    body.reasoning = { effort: "low" };
    body.provider = { require_parameters: true }; // only route to providers that really support the strict JSON schema
  } else {
    body.reasoning_effort = "low";
  }
  return JSON.stringify(body);
}
