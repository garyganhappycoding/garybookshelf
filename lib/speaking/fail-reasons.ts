// Why a speaking attempt can fail. `side` tells you whose "fault" it is, so the
// admin page can answer "is it the AI or the student?".
export type FailReason =
  | "stopped_early"
  | "too_little_speech"
  | "too_long"
  | "stt_error"
  | "ai_busy"
  | "ai_error"
  | "server_error";

export const FAIL_REASONS: Record<FailReason, { label: string; side: "student" | "ai" | "server"; hint: string }> = {
  stopped_early: { label: "Stopped early", side: "student", hint: "Recording under 20 seconds with almost no speech. The student pressed Finish early or the mic was silent." },
  too_little_speech: { label: "Too little speech", side: "student", hint: "Recorded 20s+ but under 25 words. Quiet mic, wrong input device, or long silences." },
  too_long: { label: "Over 2 minutes", side: "student", hint: "Recording longer than the allowed 2:30." },
  stt_error: { label: "Transcription failed", side: "ai", hint: "Groq speech-to-text returned an error (limit, bad audio format, outage)." },
  ai_busy: { label: "AI busy (rate limit)", side: "ai", hint: "Groq said too many requests, even after retry and fallback model. Many students marking at once." },
  ai_error: { label: "AI error", side: "ai", hint: "Marking model errored or returned unreadable JSON." },
  server_error: { label: "Server error", side: "server", hint: "Unexpected error in our own code or a network timeout." },
};
