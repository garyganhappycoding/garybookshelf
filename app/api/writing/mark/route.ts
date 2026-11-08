import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { alertPaidFailure } from "@/lib/speaking/alerts";
import { writingAccess } from "@/lib/writing/config";
import { backupTargets, GROQ_URL, openRouterCreditLeft, requestBody, type Target } from "@/lib/speaking/providers";
import {
  BAND_MAX,
  CRITERIA,
  PART_INFO,
  buildMessages,
  buildResultSchema,
  countWords,
  verifyHighlights,
  type Genre,
  type WritingPart,
  type WritingResponse,
  type WritingResult,
} from "@/lib/writing/mark";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";
const FREE_BACKUP_RESERVE = Number(process.env.FREE_BACKUP_RESERVE_USD) || 2.5; // free essays leave the backup alone when its credit is this low
const IN_FLIGHT_MS = 90 * 1000;
const MAX_QUESTION = 1500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const err = (message: string, status: number, extra: Record<string, unknown> = {}) => NextResponse.json({ error: message, ...extra }, { status });

// A usable report has a real explanation for all four marks. Anything thinner is treated like a failed try and the next model is used.
function usable(r: any): r is WritingResult {
  if (!r || typeof r !== "object" || !r.criteria) return false;
  for (const c of CRITERIA) {
    const x = r.criteria[c];
    if (!x || typeof x.band !== "number" || String(x.why ?? "").trim().length < 15) return false;
  }
  return String(r.summary ?? "").trim().length >= 15 && Array.isArray(r.points) && r.points.length > 0;
}

async function callAi(targets: Target[], messages: unknown, paid: boolean): Promise<{ result: WritingResult; model: string } | { status: number; detail: string }> {
  let last: { status: number; detail: string } = { status: 502, detail: "no model tried" };
  let prevUrl = "";
  let waited = false;
  for (const t of targets) {
    if (t.url === prevUrl && !waited) {
      await sleep(2000); // only pause before the SAME service is tried again
      waited = true;
    }
    prevUrl = t.url;
    const model = t.label ?? t.model;
    try {
      const res = await fetch(t.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${t.key}`, "Content-Type": "application/json" },
        body: requestBody(t, messages, buildResultSchema(paid), "essay_marking"),
      });
      if (!res.ok) {
        last = { status: res.status, detail: (await res.text()).slice(0, 400) };
        continue;
      }
      const json = await res.json();
      let parsed: unknown;
      try {
        parsed = JSON.parse(json?.choices?.[0]?.message?.content ?? "");
      } catch {
        last = { status: 502, detail: `unreadable JSON from ${model}` };
        continue;
      }
      if (!usable(parsed)) {
        last = { status: 502, detail: `thin report from ${model}` };
        continue;
      }
      return { result: parsed, model };
    } catch (e) {
      last = { status: 502, detail: e instanceof Error ? e.message : String(e) };
    }
  }
  return last;
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return err("Essay marking is not set up yet.", 503);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Please log in to get your essay marked.", 401);

  // closed for students until WRITING_OPEN=true; admins can always test
  const access = await writingAccess(supabase, user);
  if (!access.allowed) return err("Essay marking is coming soon.", 403);
  const perDay = access.perDay;

  // 1. read and check the form
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Could not read your essay.", 400);
  }
  const part = Number(body.part) as WritingPart;
  const genre = String(body.genre ?? "") as Genre;
  if (![1, 2, 3].includes(part) || !PART_INFO[part].genres.includes(genre)) return err("Please pick the part and the type of writing.", 400);
  const question = String(body.question ?? "").replace(/\u0000/g, "").trim().slice(0, MAX_QUESTION);
  const essay = String(body.essay ?? "").replace(/\u0000/g, "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 6000);
  if (question.length < 15) return err("Please paste the question, so the marker knows what you were asked to write.", 400);
  const words = countWords(essay);
  const limits = PART_INFO[part];
  if (words < limits.minWords) return err(`That looks too short to mark (${words} words). ${limits.label} should be ${limits.words}.`, 400);
  if (words > limits.maxWords) return err(`That is too long (${words} words). ${limits.label} should be ${limits.words}.`, 400);

  const admin = createAdminClient();
  const counts = async () => {
    const [{ data: left }, { data: pack }] = await Promise.all([supabase.rpc("writing_attempts_left", { p_limit: perDay }), supabase.rpc("speaking_pack_status")]);
    const p = Array.isArray(pack) ? pack[0] : pack;
    return { attemptsLeft: (left as number | null) ?? 0, packLeft: (p?.pack_left as number | undefined) ?? 0 };
  };

  // 2. a paying student = an active BOUGHT pack with credits left (bonus packs do not count), same rule as speaking
  const { data: bought } = await admin
    .from("speaking_packs")
    .select("attempts_total,attempts_used")
    .eq("user_id", user.id)
    .eq("kind", "purchased")
    .gt("expires_at", new Date().toISOString());
  // admins test both reports: the full one by default, or the free one when they tick "test as a free student"
  const paid = access.canTest ? body.asFree !== true : (bought ?? []).some((p) => p.attempts_used < p.attempts_total);

  // 3. one at a time, and a short wait after repeated failures, so retries do not pile onto a busy AI
  const { data: recent } = await admin
    .from("writing_attempts")
    .select("status,created_at")
    .eq("user_id", user.id)
    .in("status", ["failed", "pending"])
    .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());
  const rows = recent ?? [];
  if (rows.some((r) => r.status === "pending" && Date.now() - new Date(r.created_at).getTime() < IN_FLIGHT_MS))
    return err("Your last essay is still being marked. Please wait for it to finish.", 429, { retryAfter: 30 });
  if (rows.filter((r) => r.status === "failed").length >= (paid ? 6 : 3))
    return err("A few tries in a row didn't work, so we're pausing for a few minutes to keep the AI available for everyone. Please try again soon.", 429, { retryAfter: 120 });

  // 4. claim today's free essay or a pack credit (atomic, in the database)
  const { data: claimed, error: claimErr } = await supabase.rpc("claim_writing_attempt", {
    p_part: part,
    p_genre: genre,
    p_question: question,
    p_essay: essay,
    p_words: words,
    p_limit: perDay,
  });
  if (claimErr) return err("Could not start the marking. Please try again.", 500);
  if (!claimed) return err("You've used today's free essay. A Speaking pack gives you more (credits work for speaking and writing), or come back tomorrow!", 429, { attemptsLeft: 0, packLeft: 0, needPack: true });
  const attemptId = claimed as string;

  const fail = async (reason: string, message: string, status: number, detail?: string) => {
    if (paid && ["ai_busy", "ai_error"].includes(reason)) after(() => alertPaidFailure(reason, detail, user.email));
    await admin.from("writing_attempts").update({ status: "failed", fail_reason: reason, fail_detail: detail?.slice(0, 500) }).eq("id", attemptId); // refunds the essay
    return err(message, status, await counts());
  };

  try {
    // 5. mark it. Paying students: main model, then the backup, then Groq again. Free: the lighter model, then the backup only while it has spare credit.
    const groq = (model: string): Target => ({ url: GROQ_URL, key: apiKey, model, kind: "groq" });
    let targets: Target[];
    if (paid) {
      targets = [groq(MODEL), ...backupTargets(), groq(MODEL), groq(FALLBACK_MODEL)];
    } else {
      let backup: Target[] = [];
      if (backupTargets().length) {
        const left = await openRouterCreditLeft();
        if (left === null || left > FREE_BACKUP_RESERVE) backup = backupTargets();
      }
      targets = [groq(FALLBACK_MODEL), ...backup];
    }
    const out = await callAi(targets, buildMessages({ part, genre, question, essay, paid }), paid);
    if ("status" in out) {
      console.error("writing marking failed", out.status, out.detail);
      const busy = out.status === 429;
      return fail(busy ? "ai_busy" : "ai_error", busy ? "The AI is busy right now. You were not charged. Please try again in a few minutes." : "The AI had a problem. You were not charged. Please try again.", 502, `${out.status} ${out.detail}`);
    }
    const { result, model } = out;

    // whole marks 0-5, then the total
    let total = 0;
    for (const c of CRITERIA) {
      const x = result.criteria[c];
      x.band = Math.min(BAND_MAX, Math.max(0, Math.round(x.band)));
      // models like to write "Not applicable" or "Not 6" for a top mark: say something true instead
      if (x.band >= BAND_MAX && /not applicable|not a 6|not 6|no higher|highest band|top band/i.test(x.why_not_next)) {
        x.why_not_next = "Nothing is missing against this criterion. Keep doing what you did here.";
      }
      total += x.band;
    }

    // Free and paid reports differ in what is STORED: students can read their own rows, so locked parts are removed before saving.
    const tier: "free" | "paid" = paid ? "paid" : "free";
    if (paid) {
      result.highlights = verifyHighlights(essay, result.highlights as unknown as { quote: string; kind: string; criterion: string; reason: string }[]);
    } else {
      for (const c of CRITERIA) delete result.criteria[c].next_band;
      delete result.biggest_gain;
      delete result.highlights;
    }

    await admin.from("writing_attempts").update({ status: "done", total_score: total, result, tier, priority: paid, model }).eq("id", attemptId);

    const response: WritingResponse = { attemptId, total, tier, part, genre, question, essay, wordCount: words, result, ...(await counts()) };
    return NextResponse.json(response);
  } catch (e) {
    console.error("writing mark error", e);
    return fail("server_error", "Something went wrong. You were not charged.", 500, e instanceof Error ? e.message : String(e));
  }
}
