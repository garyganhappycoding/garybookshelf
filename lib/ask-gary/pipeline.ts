import { askModel } from "./llm";
import { buildMessages, looksUnsafe, type StudentContext } from "./prompt";
import { hasCjk, search, type Entry, type buildIndex } from "./search";

export type BotResult =
  | { kind: "safety"; language: "zh" | "en" }
  | { kind: "not_found"; language: "zh" | "en"; candidates: string[] }
  | { kind: "answer"; language: "zh" | "en"; reply: string; used: Entry[]; model: string }
  | { kind: "error"; status: number };

// Decide how to answer one question. Order: safety check, find candidate entries, let the model answer ONLY from them.
export async function runBot(ctx: StudentContext, index: ReturnType<typeof buildIndex>): Promise<BotResult> {
  const language = hasCjk(ctx.problem + ctx.story) ? "zh" : "en";

  if (looksUnsafe(`${ctx.problem} ${ctx.story}`)) return { kind: "safety", language };

  const query = `${ctx.problem} ${ctx.story.slice(0, 600)}`;
  const candidates = search(index, query, 3);
  if (!candidates.length) return { kind: "not_found", language, candidates: [] };

  const entries = candidates.map((c) => c.entry);
  const { answer, status, model } = await askModel(buildMessages(ctx, entries, language === "zh"));
  if (!answer) return { kind: "error", status };

  if (answer.safety) return { kind: "safety", language };

  // only accept entries that were really offered to the model
  const used = entries.filter((e) => answer.used.includes(e.id));
  if (!answer.found || !used.length || !answer.reply.trim()) {
    return { kind: "not_found", language, candidates: entries.map((e) => e.topic) };
  }
  return { kind: "answer", language, reply: answer.reply.trim(), used: used.slice(0, 2), model };
}
