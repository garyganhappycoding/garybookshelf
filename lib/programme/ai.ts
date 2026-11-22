// SERVER-ONLY. The two AI jobs in 陪你读书: feedback on a student's answer, and screening of classmates' comments.
// Both say when they are NOT sure; an unsure result is never shown or sent on its own, it waits for Gary.
const URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.PROGRAMME_AI_MODEL || "openai/gpt-oss-120b";

async function ask<T>(system: string, user: string, schema: object, name: string): Promise<T | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        reasoning_effort: "low",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        response_format: { type: "json_schema", json_schema: { name, schema, strict: true } },
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    return JSON.parse((await res.json()).choices[0].message.content) as T;
  } catch {
    return null;
  }
}

export type Feedback = { feedback: string; sure: boolean };
export async function feedbackOn(task: string, lang: "BM" | "BI", answer: string): Promise<Feedback | null> {
  return ask<Feedback>(
    `You give short, kind feedback to a Malaysian secondary-school student (Form 4 or 5) on one daily ${lang === "BM" ? "Bahasa Melayu" : "English"} task. ` +
      "Write the feedback in simple Chinese with the example words in the task language. Say what is clear, then give ONE next step, in under 80 words. " +
      "Only comment on what the student actually wrote. Do not invent marks, scores or exam rules. " +
      "Set sure=false if the answer is off-topic, unreadable, or you are not confident the feedback is correct.",
    `Task: ${task}\n\nStudent answer:\n${answer.slice(0, 3000)}`,
    { type: "object", properties: { feedback: { type: "string" }, sure: { type: "boolean" } }, required: ["feedback", "sure"], additionalProperties: false },
    "programme_feedback",
  );
}

export type Screen = { ok: boolean; sure: boolean; why: string };
export async function screenComment(body: string): Promise<Screen | null> {
  return ask<Screen>(
    "You screen a classmate comment on a school study site for teenagers. ok=true when it is a normal study comment or question. " +
      "ok=false for bullying, insults, sexual content, contact details, advertising, or anything unsafe. Set sure=false if you are unsure. why = one short sentence.",
    body.slice(0, 1000),
    { type: "object", properties: { ok: { type: "boolean" }, sure: { type: "boolean" }, why: { type: "string" } }, required: ["ok", "sure", "why"], additionalProperties: false },
    "programme_screen",
  );
}
