// Stops students from hammering the AI. Failed attempts are free (they never use up the daily limit), so without
// this a student can press "try again" over and over while the AI is busy, which makes the busy period worse.
// The same ideas big services use: a short wait after repeated failures (cooldown), a daily cap on failures,
// one request at a time, and a "circuit breaker" that pauses everyone for a moment when the AI is overloaded.
import type { SupabaseClient } from "@supabase/supabase-js";

const MIN = 60 * 1000;
const FAIL_WINDOW = 10 * MIN; // look at the last 10 minutes of failures
const FAILS_ALLOWED_FREE = 4; // 4 failures in 10 minutes, then wait (the page's own automatic retries use up to 3 of them)
const FAILS_ALLOWED_PAID = 8; // paying students get more room
const FAILS_PER_DAY_FREE = 12; // free students: failures per Malaysia day
const IN_FLIGHT_MS = 90 * 1000; // an attempt still "pending" after this long is treated as stuck
const BUSY_WINDOW = 3 * MIN;
const BUSY_TRIP = 10; // this many "AI busy" failures from anyone in 3 minutes pauses free students
const BUSY_PAUSE_SEC = 120;

export type TryLimit = { message: string; retryAfter?: number };

const mmss = (s: number) => (s >= 90 ? `${Math.ceil(s / 60)} minutes` : `${s} seconds`);

export async function checkTryLimits(admin: SupabaseClient, userId: string, priority: boolean): Promise<TryLimit | null> {
  const now = Date.now();

  // 1. one at a time, and a wait after repeated failures
  const { data: recent } = await admin
    .from("speaking_attempts")
    .select("status,created_at")
    .eq("user_id", userId)
    .in("status", ["failed", "pending"])
    .gte("created_at", new Date(now - FAIL_WINDOW).toISOString())
    .order("created_at", { ascending: false });
  const rows = recent ?? [];

  const inFlight = rows.find((r) => r.status === "pending" && now - new Date(r.created_at).getTime() < IN_FLIGHT_MS);
  if (inFlight) {
    const wait = Math.max(5, Math.ceil((IN_FLIGHT_MS - (now - new Date(inFlight.created_at).getTime())) / 1000));
    return { message: "Your last recording is still being marked. Please wait for it to finish.", retryAfter: wait };
  }

  const fails = rows.filter((r) => r.status === "failed");
  const allowed = priority ? FAILS_ALLOWED_PAID : FAILS_ALLOWED_FREE;
  if (fails.length >= allowed) {
    // free again once the failure that put them at the limit is more than 10 minutes old
    const blocker = new Date(fails[allowed - 1].created_at).getTime();
    const wait = Math.max(30, Math.ceil((FAIL_WINDOW - (now - blocker)) / 1000));
    return {
      message: `Several tries in a row didn't work, so we're pausing for ${mmss(wait)}. This keeps the AI available for everyone. Please try again after the wait.`,
      retryAfter: wait,
    };
  }

  if (priority) return null; // paying students skip the checks below

  // 2. free students: a cap on failed tries per day (Malaysia time)
  const kl = new Date(now + 8 * 60 * MIN);
  kl.setUTCHours(0, 0, 0, 0);
  const dayStart = kl.getTime() - 8 * 60 * MIN;
  const { count: dayFails } = await admin
    .from("speaking_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "failed")
    .gte("created_at", new Date(dayStart).toISOString());
  if ((dayFails ?? 0) >= FAILS_PER_DAY_FREE) {
    return { message: "Too many tries didn't work today, so practice is paused until tomorrow. A Speaking pack gets you priority on the AI." };
  }

  // 3. circuit breaker: the AI is overloaded for everyone right now
  const { count: busyNow } = await admin
    .from("speaking_attempts")
    .select("id", { count: "exact", head: true })
    .eq("fail_reason", "ai_busy")
    .gte("created_at", new Date(now - BUSY_WINDOW).toISOString());
  if ((busyNow ?? 0) >= BUSY_TRIP) {
    return {
      message: "The AI is very busy right now. Please wait a couple of minutes and try again. Your daily attempts are safe.",
      retryAfter: BUSY_PAUSE_SEC,
    };
  }

  return null;
}
