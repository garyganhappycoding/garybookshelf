// SERVER-ONLY. Tells Gary on Telegram when a PAYING student's marking fails, at most once every 10 minutes
// (so a busy hour does not send dozens of messages). The student keeps their attempt and can retry; this is so Gary can react.
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyGary } from "@/lib/community";

// A paying student's AI answer came back nearly empty (every list empty, comment "..."). Sends Gary the transcript so he can see
// what the AI was given. One message per attempt.
export async function alertThinReport(attemptId: string, models: string[], finalModel: string, stillThin: boolean, email: string | null | undefined, transcript: string) {
  try {
    const { error } = await createAdminClient().from("site_alerts").insert({ key: `thin-${attemptId}` });
    if (error) return;
    const outcome = stillThin ? "The student got the thin report (no other model did better)." : `The student got a full report from ${finalModel}.`;
    await notifyGary(
      "🪫 Thin Speaking report",
      `${email ?? "a paid student"}\nThin answer from: ${models.join(", ")}\n${outcome}\n\nTranscript:\n${transcript.slice(0, 3000)}`,
      "/admin/speaking"
    );
  } catch (e) {
    console.error("thin report alert failed", e);
  }
}

// Free students used up today's share of the OpenRouter backup, so they wait for Groq again. Told to Gary once a day.
export async function alertFreeBackupCap(why: string) {
  try {
    const day = new Date().toISOString().slice(0, 10);
    const { error } = await createAdminClient().from("site_alerts").insert({ key: `free-backup-cap-${day}` });
    if (error) return;
    await notifyGary("ℹ️ Free students used today's backup AI share", `${why} Free students now wait for Groq again and what is left is kept for paying students. Raise FREE_BACKUP_DAILY (attempts a day) or lower FREE_BACKUP_RESERVE_USD in Vercel to change this.`, "/admin/speaking");
  } catch (e) {
    console.error("free backup cap alert failed", e);
  }
}

export async function alertPaidFailure(reason: string, detail: string | undefined, email: string | null | undefined) {
  try {
    const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
    const { error } = await createAdminClient().from("site_alerts").insert({ key: `paid-fail-${bucket}` });
    if (error) return; // already told Gary in the last 10 minutes
    await notifyGary("⚠️ A paying student's Speaking marking failed", `${email ?? "a paid student"}\nReason: ${reason}\n${(detail ?? "").slice(0, 200)}\nTheir attempt is refunded and saved, they can retry.`, "/admin/speaking");
  } catch (e) {
    console.error("paid failure alert failed", e);
  }
}
