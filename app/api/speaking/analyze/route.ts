import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCard } from "@/lib/speaking/cards";
import {
  BAND_MAX,
  buildMessages,
  computeStats,
  resultSchema,
  type AnalysisResponse,
  type SpeakingResult,
  type SttWord,
} from "@/lib/speaking/analyze";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAILY_LIMIT = 2;
const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
const MAX_SECONDS = 150; // 2 minutes + a little slack
const MIN_WORDS = 25;
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const err = (message: string, status: number, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error: message, ...extra }, { status });

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return err("Speaking practice is not set up yet.", 503);

  // 1. members only
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("Please log in to practise speaking.", 401);

  // 2. read the form
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return err("Could not read the recording.", 400);
  }
  const card = getCard(String(form.get("cardId") ?? ""));
  const audio = form.get("audio");
  if (!card) return err("Unknown question.", 400);
  if (!(audio instanceof File) || audio.size === 0) return err("No recording received.", 400);
  if (audio.size > MAX_AUDIO_BYTES) return err("Recording is too large.", 413);

  // 3. claim one of today's 2 attempts (atomic, enforced in the database)
  const { data: attemptId, error: claimErr } = await supabase.rpc("claim_speaking_attempt", {
    p_card: card.id,
    p_limit: DAILY_LIMIT,
  });
  if (claimErr) return err("Could not start the attempt. Please try again.", 500);
  if (!attemptId) return err("You've used your 2 attempts for today. Come back tomorrow!", 429, { attemptsLeft: 0 });

  const admin = createAdminClient();
  const fail = async (message: string, status: number) => {
    await admin.from("speaking_attempts").update({ status: "failed" }).eq("id", attemptId); // refunds the attempt
    const { data: left } = await supabase.rpc("speaking_attempts_left", { p_limit: DAILY_LIMIT });
    return err(message, status, { attemptsLeft: left ?? undefined });
  };

  try {
    // 4. speech-to-text
    const stt = new FormData();
    stt.append("model", "whisper-large-v3-turbo");
    stt.append("language", "en");
    stt.append("response_format", "verbose_json");
    stt.append("timestamp_granularities[]", "word");
    stt.append("temperature", "0");
    // a prompt with fillers nudges Whisper to keep "um/uh" instead of silently dropping them
    stt.append("prompt", "Umm, let me think, uh, like, you know, I mean, er, well...");
    stt.append("file", audio, audio.name || "speech.webm");
    const sttRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: stt,
    });
    if (!sttRes.ok) {
      console.error("stt failed", sttRes.status, await sttRes.text());
      return fail("We couldn't transcribe that recording. You were not charged an attempt.", 502);
    }
    const sttJson = (await sttRes.json()) as { text?: string; duration?: number; words?: { word: string; start: number; end: number }[] };
    const transcript = (sttJson.text ?? "").trim();
    const words: SttWord[] = (sttJson.words ?? []).map((w) => ({ text: w.word, start: w.start, end: w.end }));
    const duration = sttJson.duration ?? (words.length ? words[words.length - 1].end : 0);

    if (duration > MAX_SECONDS) return fail("Recording is longer than 2 minutes.", 400);
    if (transcript.split(/\s+/).filter(Boolean).length < MIN_WORDS)
      return fail("We couldn't hear enough speech to mark. Check your microphone and try again. You were not charged an attempt.", 422);

    // 5. fluency stats + Grok marking against the rubric
    const stats = computeStats(transcript, words, duration);
    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: buildMessages(card, transcript, stats),
        temperature: 0.2,
        response_format: { type: "json_schema", json_schema: { name: "speaking_feedback", schema: resultSchema, strict: true } },
      }),
    });
    if (!aiRes.ok) {
      console.error("grok failed", aiRes.status, await aiRes.text());
      return fail("The marking service is busy. You were not charged an attempt. Please try again.", 502);
    }
    const aiJson = await aiRes.json();
    const result = JSON.parse(aiJson.choices[0].message.content) as SpeakingResult;

    // clamp bands, round to half bands
    let total = 0;
    for (const c of Object.values(result.criteria)) {
      c.band = Math.min(BAND_MAX, Math.max(0, Math.round(c.band * 2) / 2));
      total += c.band;
    }

    // 6. save (transcript + feedback only, never the audio)
    await admin
      .from("speaking_attempts")
      .update({ status: "done", total_score: total, result: { transcript, stats, result } })
      .eq("id", attemptId);

    const { data: left } = await supabase.rpc("speaking_attempts_left", { p_limit: DAILY_LIMIT });
    const body: AnalysisResponse = { attemptId, transcript, stats, result, total, attemptsLeft: left ?? 0 };
    return NextResponse.json(body);
  } catch (e) {
    console.error("speaking analyze error", e);
    return fail("Something went wrong. You were not charged an attempt.", 500);
  }
}
