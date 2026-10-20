import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCard } from "@/lib/speaking/cards";
import { checkTryLimits } from "@/lib/speaking/limits";
import type { FailReason } from "@/lib/speaking/fail-reasons";
import {
  BAND_MAX,
  buildMessages,
  computeStats,
  buildResultSchema,
  type AnalysisResponse,
  type SpeakingResult,
  type SttWord,
} from "@/lib/speaking/analyze";
import { pickEssayPhrases, pickToolkit, verifyUsedPhrases } from "@/lib/speaking/essay-vocab";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAILY_LIMIT = 2;
const SAVED_TRANSCRIPT_HOURS = 24 * 7; // how long a failed attempt's transcript can be re-marked (7 days)
type SavedTranscript = { transcript: string; stats: ReturnType<typeof computeStats>; duration: number };
const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
const MAX_SECONDS = 150; // 2 minutes + a little slack
const MIN_WORDS = 25;
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b"; // separate rate limits; used when the main model is busy
// Free students use the lighter model first and may only borrow the main model up to this many times a day,
// which keeps the main model's daily allowance free for paying students.
// Free students are not paying, so they only get a small slice of the strong model: FREE_MAIN_SHARE of its
// daily tokens. Real numbers from Groq: 200,000 tokens per model in a rolling 24 hours, about 1,850 tokens per
// marking. 15% is about 16 free uses a day; everything else on the strong model is kept for paying students.
const MODEL_DAILY_TOKENS = 200_000;
const TOKENS_PER_MARKING = 1_850;
const FREE_MAIN_SHARE = 0.15;
const FREE_MAIN_DAILY_CAP = Math.floor((MODEL_DAILY_TOKENS * FREE_MAIN_SHARE) / TOKENS_PER_MARKING);
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";

type Target = { url: string; key: string; model: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Try each target in turn (waiting briefly after a rate limit / server error) and report which model answered.
async function callGrok(targets: Target[], messages: unknown, paid: boolean): Promise<{ res: Response; model: string }> {
  let res: Response | null = null;
  let used = targets[0].model;
  for (const t of targets) {
    if (res) {
      const wait = Math.min(Number(res.headers.get("retry-after")) || 2, 5);
      await sleep(wait * 1000);
    }
    used = t.model;
    res = await fetch(t.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${t.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: t.model,
        messages,
        temperature: 0.2,
        reasoning_effort: "low",
        response_format: { type: "json_schema", json_schema: { name: "speaking_feedback", schema: buildResultSchema(paid), strict: true } },
      }),
    });
    // A model that returns JSON missing required fields answers 400 "failed_generation". That is a one-off
    // bad answer, not a bad request, so try again / try the next model like a busy error.
    const badJson = res.status === 400 && (await res.clone().text()).includes("failed_generation");
    if (res.ok || (res.status !== 429 && res.status < 500 && !badJson)) return { res, model: used };
    console.warn("grok busy or bad json", t.url, t.model, res.status);
  }
  return { res: res!, model: used };
}

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

  // free attempts left today + attempts left in the student's paid pack
  const counts = async () => {
    const [{ data: left }, { data: pack }] = await Promise.all([
      supabase.rpc("speaking_attempts_left", { p_limit: DAILY_LIMIT }),
      supabase.rpc("speaking_pack_status"),
    ]);
    const p = Array.isArray(pack) ? pack[0] : pack;
    return { attemptsLeft: (left as number | null) ?? 0, packLeft: (p?.pack_left as number | undefined) ?? 0 };
  };
  // a student with an active pack is a paying student and gets priority on the AI (checked before this attempt is claimed)
  const priority = (await counts()).packLeft > 0;

  // 2. read the form
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return err("Could not read the recording.", 400);
  }
  const admin = createAdminClient();

  // Slow down students who keep retrying while the AI is struggling (nothing is charged and no AI call is made).
  const blocked = await checkTryLimits(admin, user.id, priority);
  if (blocked) return err(blocked.message, 429, { ...(blocked.retryAfter ? { retryAfter: blocked.retryAfter } : {}), ...(await counts()) });

  // A retry re-uses the transcript saved when the AI marking failed, so no new recording or transcription is needed.
  const retryId = String(form.get("retryAttemptId") ?? "");
  let saved: SavedTranscript | null = null;
  let cardId = String(form.get("cardId") ?? "");
  let prevId: string | null = null;
  if (retryId) {
    const { data: prev } = await admin
      .from("speaking_attempts")
      .select("id,card_id,status,fail_reason,result,created_at")
      .eq("id", retryId)
      .eq("user_id", user.id) // only your own saved recording
      .maybeSingle();
    const s = prev?.result as Partial<SavedTranscript> | null | undefined;
    const fresh = prev && Date.now() - new Date(prev.created_at).getTime() < SAVED_TRANSCRIPT_HOURS * 3600 * 1000;
    if (!prev || prev.status !== "failed" || !s?.transcript || !s.stats || !fresh)
      return err("That saved recording has expired. Please record again.", 410);
    saved = { transcript: s.transcript, stats: s.stats, duration: s.duration ?? 0 };
    cardId = prev.card_id;
    prevId = prev.id;
  }

  const card = getCard(cardId);
  const audio = saved ? null : form.get("audio");
  if (!card) return err("Unknown question.", 400);
  if (!saved) {
    if (!(audio instanceof File) || audio.size === 0) return err("No recording received.", 400);
    if (audio.size > MAX_AUDIO_BYTES) return err("Recording is too large.", 413);
  }
  const audioFile = audio instanceof File ? audio : null;

  // 3. claim one of today's 2 attempts (atomic, enforced in the database)
  const { data: attemptId, error: claimErr } = await supabase.rpc("claim_speaking_attempt", {
    p_card: card.id,
    p_limit: DAILY_LIMIT,
  });
  if (claimErr) return err("Could not start the attempt. Please try again.", 500);
  if (!attemptId)
    return err("You've used today's 2 free attempts. Get a Speaking pack for more, or come back tomorrow!", 429, { attemptsLeft: 0, packLeft: 0, needPack: true });
  // the saved transcript moves to the new attempt, so it can only be used once
  if (prevId) await admin.from("speaking_attempts").update({ result: null }).eq("id", prevId);

  const meta: { duration_sec?: number; word_count?: number } = {};
  // `reason` is stored so the admin page can show WHY it failed (see FAIL_REASONS in lib/speaking/fail-reasons.ts)
  // `keep` saves the transcript on the failed row so the student can retry the marking without recording again.
  const fail = async (reason: FailReason, message: string, status: number, detail?: string, keep?: SavedTranscript, retryAfter?: number) => {
    await admin
      .from("speaking_attempts")
      .update({
        status: "failed", // refunds the attempt
        fail_reason: reason,
        fail_detail: detail?.slice(0, 500),
        audio_bytes: audioFile?.size,
        ...(keep ? { result: keep } : {}),
        ...meta,
      })
      .eq("id", attemptId);
    return err(message, status, {
      ...(await counts()),
      ...(keep ? { retryAttemptId: attemptId, savedWords: keep.transcript.split(/\s+/).filter(Boolean).length } : {}),
      ...(retryAfter ? { retryAfter } : {}),
    });
  };

  try {
    let transcript: string;
    let stats: ReturnType<typeof computeStats>;
    let duration: number;

    if (saved) {
      ({ transcript, stats, duration } = saved);
      meta.duration_sec = Math.round(duration * 10) / 10;
      meta.word_count = transcript.split(/\s+/).filter(Boolean).length;
    } else {
      // 4. speech-to-text
      const stt = new FormData();
      stt.append("model", "whisper-large-v3-turbo");
      stt.append("language", "en");
      stt.append("response_format", "verbose_json");
      stt.append("timestamp_granularities[]", "word");
      stt.append("temperature", "0");
      // a prompt with fillers nudges Whisper to keep "um/uh" instead of silently dropping them
      stt.append("prompt", "Umm, let me think, uh, like, you know, I mean, er, well...");
      stt.append("file", audioFile!, audioFile!.name || "speech.webm");
      const sttRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: stt,
      });
      if (!sttRes.ok) {
        const body = await sttRes.text();
        console.error("stt failed", sttRes.status, body);
        return fail("stt_error", "We couldn't transcribe that recording. You were not charged an attempt.", 502, `${sttRes.status} ${body}`);
      }
      const sttJson = (await sttRes.json()) as { text?: string; duration?: number; words?: { word: string; start: number; end: number }[] };
      transcript = (sttJson.text ?? "").trim();
      const words: SttWord[] = (sttJson.words ?? []).map((w) => ({ text: w.word, start: w.start, end: w.end }));
      duration = sttJson.duration ?? (words.length ? words[words.length - 1].end : 0);

      const wordCount = transcript.split(/\s+/).filter(Boolean).length;
      meta.duration_sec = Math.round(duration * 10) / 10;
      meta.word_count = wordCount;

      if (duration > MAX_SECONDS) return fail("too_long", "Recording is longer than 2 minutes.", 400);
      if (wordCount < MIN_WORDS)
        return fail(
          duration < 20 ? "stopped_early" : "too_little_speech",
          "We couldn't hear enough speech to mark. Check your microphone and try again. You were not charged an attempt.",
          422,
          `${wordCount} words in ${meta.duration_sec}s`
        );

      stats = computeStats(transcript, words, duration);
    }

    // 5. Grok marking against the rubric. If it fails, the transcript is kept for a free retry.
    const keep: SavedTranscript = { transcript, stats, duration };
    // Paying students go first: the main model with extra retries, then the lighter model, then Cerebras if a key is set.
    // Free students start on the lighter model and only borrow the main one while today's shared allowance has room.
    const groq = (model: string): Target => ({ url: GROQ_URL, key: apiKey, model });
    const cerebrasKey = process.env.CEREBRAS_API_KEY;
    let targets: Target[];
    if (priority) {
      targets = [groq(MODEL), groq(MODEL), groq(FALLBACK_MODEL), groq(MODEL)];
      if (cerebrasKey) targets.splice(3, 0, { url: CEREBRAS_URL, key: cerebrasKey, model: "gpt-oss-120b" });
    } else {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { count } = await admin
        .from("speaking_attempts")
        .select("id", { count: "exact", head: true })
        .eq("model", MODEL)
        .eq("priority", false) // only free students' uses count against their small share, paying students' do not
        .gte("created_at", since);
      // one try per model, no repeat tries: a busy AI is not made busier by retries from free students
      targets = [groq(FALLBACK_MODEL)];
      if ((count ?? 0) < FREE_MAIN_DAILY_CAP) targets.push(groq(MODEL));
    }
    const { res: aiRes, model: usedModel } = await callGrok(targets, buildMessages(card, transcript, stats, priority), priority);
    if (!aiRes.ok) {
      const body = await aiRes.text();
      console.error("grok failed", aiRes.status, body);
      // Groq says how long until the limit frees up, e.g. "Please try again in 9m56.16s". Pass that on, so students
      // wait the right amount of time instead of pressing retry every minute.
      let wait: number | undefined;
      const m = body.match(/try again in (?:(\d+)h)?(?:(\d+)m)?(\d+(?:\.\d+)?)s/i);
      if (aiRes.status === 429 && m) wait = Math.min(Math.ceil((Number(m[1] ?? 0) * 3600) + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)), 30 * 60);
      const when = wait && wait >= 60 ? `about ${Math.ceil(wait / 60)} minutes` : "a few minutes";
      return fail(
        aiRes.status === 429 ? "ai_busy" : "ai_error",
        aiRes.status === 429
          ? `The AI has reached its limit for now and frees up again in ${when}. Your recording is safe and you were not charged an attempt. You can close or refresh this page and come back within 7 days to mark it.`
          : "The AI had a problem. Your recording is safe and you were not charged an attempt. You can close or refresh this page and come back within 7 days to mark it.",
        502,
        `${aiRes.status} ${body}`,
        keep,
        wait
      );
    }
    const aiJson = await aiRes.json();
    let result: SpeakingResult;
    try {
      result = JSON.parse(aiJson.choices[0].message.content) as SpeakingResult;
    } catch {
      return fail(
        "ai_error",
        "The AI gave an unreadable answer. Your recording is safe and you were not charged an attempt. You can try again now or come back within 7 days to mark it.",
        502,
        "invalid JSON from model",
        keep
      );
    }

    // clamp bands, round to half bands
    let total = 0;
    for (const c of Object.values(result.criteria)) {
      c.band = Math.min(BAND_MAX, Math.max(0, Math.round(c.band * 2) / 2));
      total += c.band;
    }

    // Free and paid reports differ in what is STORED, not just what is shown: students can read their own attempt rows,
    // so anything locked is removed here before saving. Free reports keep the score, comment, checklist, the top problem,
    // vocabulary upgrades, the transcript and the repeated words. Paid reports keep everything.
    const tier: "free" | "paid" = priority ? "paid" : "free";
    if (!priority) {
      result.problems = (result.problems ?? []).slice(0, 1);
      delete result.phrase_upgrades;
      delete result.essay_rewrite;
      delete result.essay_toolkit;
      delete result.band_upgrade_rewrite;
    } else if (result.essay_rewrite) {
      // only highlight phrases that really came from Gary's essay notes and really appear in the sentence
      const offered = pickEssayPhrases(card);
      result.essay_rewrite = result.essay_rewrite.map((r) => ({ ...r, phrases_used: verifyUsedPhrases(r.phrases_used, r.upgraded, offered) }));
    }
    if (priority) {
      const usedPhrases = (result.essay_rewrite ?? []).flatMap((r) => r.phrases_used.map((p) => p.phrase));
      result.essay_toolkit = pickToolkit(card, usedPhrases);
    }
    const shownStats = priority
      ? stats
      : { ...stats, wordsPerMinute: 0, longPauses: 0, longestPauseSec: 0, fillerCount: 0, fillers: [], repeatedPhrases: [] };

    // 6. save (transcript + feedback only, never the audio)
    await admin
      .from("speaking_attempts")
      .update({ status: "done", total_score: total, result: { transcript, stats: shownStats, result, tier }, audio_bytes: audioFile?.size, model: usedModel, priority, ...meta })
      .eq("id", attemptId);

    const { attemptsLeft, packLeft } = await counts();
    const body: AnalysisResponse = { attemptId, transcript, stats: shownStats, result, total, tier, attemptsLeft, packLeft };
    return NextResponse.json(body);
  } catch (e) {
    console.error("speaking analyze error", e);
    return fail("server_error", "Something went wrong. You were not charged an attempt.", 500, e instanceof Error ? e.message : String(e));
  }
}
