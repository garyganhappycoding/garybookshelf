import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildIndex, type Entry } from "@/lib/ask-gary/search";
import { runBot } from "@/lib/ask-gary/pipeline";
import { SAFETY_REPLY, type StudentContext } from "@/lib/ask-gary/prompt";
import { getKey } from "@/lib/ask-gary/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

import { DAILY_LIMIT } from "@/lib/ask-gary/config";

const EFFORT_TEXT: Record<string, string> = {
  none: "has not started studying yet",
  some: "has studied a little",
  lots: "has studied a lot",
  notworking: "has practised but it is not working",
};

// the knowledge is small, so keep it in memory for a minute
let cache: { at: number; drafts: boolean; entries: Entry[]; index: ReturnType<typeof buildIndex> } | null = null;
async function loadIndex(drafts: boolean) {
  if (cache && cache.drafts === drafts && Date.now() - cache.at < 60_000) return cache;
  const admin = createAdminClient();
  let q = admin.from("gary_knowledge").select("id,topic,subjects,format,review,questions_en,questions_zh,answer_zh,answer_en,reel_link,free_keyword,product");
  if (!drafts) q = q.eq("review", "Approved"); // STRICT: only entries Gary approved
  const { data } = await q;
  const entries = (data ?? []) as Entry[];
  cache = { at: Date.now(), drafts, entries, index: buildIndex(entries) };
  return cache;
}

const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in to ask Gary." }, { status: 401 });
  if (!getKey()) return NextResponse.json({ error: "Ask Gary is not set up yet." }, { status: 503 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const ctx: StudentContext = {
    level: clip(body.level, 40),
    problem: clip(body.problem, 1000),
    story: clip(body.story, 2000),
    effort: [EFFORT_TEXT[String(body.effort)] ?? clip(body.effort, 80), clip(body.hours, 80)].filter(Boolean).join(", "),
    want: Array.isArray(body.want) ? body.want.slice(0, 4).map((w: unknown) => clip(w, 60)) : [],
  };
  if (ctx.problem.length < 5) return NextResponse.json({ error: "Please tell Gary a bit more." }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isAdmin = profile?.role === "admin";
  const drafts = isAdmin && body.drafts === true; // only the admin can test with unapproved entries

  const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;
  const { data: eventId, error: claimErr } = await supabase.rpc("claim_ask_gary_question", {
    p_limit: isAdmin ? 1000 : DAILY_LIMIT,
    p_conversation: conversationId,
  });
  if (claimErr) return NextResponse.json({ error: "Could not start. Please try again." }, { status: 500 });
  if (!eventId)
    return NextResponse.json({ error: `You have used your ${DAILY_LIMIT} questions for today. Come back tomorrow!`, questionsLeft: 0 }, { status: 429 });

  const admin = createAdminClient();
  const left = async () => {
    const { data } = await supabase.rpc("ask_gary_questions_left", { p_limit: DAILY_LIMIT });
    return isAdmin ? 999 : (data as number) ?? 0;
  };
  const finish = (patch: Record<string, unknown>) =>
    admin.from("ask_gary_events").update({ question: ctx.problem.slice(0, 500), level: ctx.level, context: ctx, draft_mode: drafts, ...patch }).eq("id", eventId);

  try {
    const { index } = await loadIndex(drafts);
    const result = await runBot(ctx, index);

    if (result.kind === "error") {
      await finish({ status: "failed", fail_reason: `model ${result.status}` });
      return NextResponse.json({ error: "Gary is busy right now. You were not charged a question. Please try again.", questionsLeft: await left() }, { status: 502 });
    }

    if (result.kind === "safety") {
      await finish({ status: "done", safety: true, language: result.language });
      return NextResponse.json({ eventId, kind: "safety", reply: SAFETY_REPLY[result.language], language: result.language, questionsLeft: await left() });
    }

    if (result.kind === "not_found") {
      await finish({ status: "done", found: false, language: result.language });
      await admin.from("ask_gary_unanswered").insert({ event_id: eventId, question: [ctx.problem, ctx.story].filter(Boolean).join("\n\n").slice(0, 3000), context: ctx });
      return NextResponse.json({ eventId, kind: "not_found", language: result.language, questionsLeft: await left() });
    }

    await finish({ status: "done", found: true, entry_ids: result.used.map((e) => e.id), language: result.language });
    return NextResponse.json({
      eventId,
      kind: "answer",
      reply: result.reply,
      language: result.language,
      cards: result.used
        .filter((e) => e.reel_link)
        .map((e) => ({ title: e.topic.split(" / ")[0], url: e.reel_link, format: e.format ?? "Reel", keyword: e.free_keyword })),
      product: result.used.find((e) => e.product)?.product ?? null, // only products Gary set on the entry
      questionsLeft: await left(),
    });
  } catch (e) {
    console.error("ask-gary error", e);
    await finish({ status: "failed", fail_reason: e instanceof Error ? e.message.slice(0, 200) : "error" });
    return NextResponse.json({ error: "Something went wrong. You were not charged a question.", questionsLeft: await left() }, { status: 500 });
  }
}
