import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramText } from "@/lib/telegram";
import { BAND_MAX } from "@/lib/speaking/analyze";
import { FAIL_REASONS, type FailReason } from "@/lib/speaking/fail-reasons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY = 24 * 60 * 60 * 1000;

type Attempt = {
  user_id: string;
  status: string;
  total_score: number | null;
  duration_sec: number | null;
  fail_reason: string | null;
  pack_id: string | null;
  model: string | null;
  created_at: string;
};

// PostgREST returns at most 1000 rows per request, so read in pages.
async function fetchAttempts(since: string): Promise<Attempt[]> {
  const admin = createAdminClient();
  const rows: Attempt[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await admin
      .from("speaking_attempts")
      .select("user_id,status,total_score,duration_sec,fail_reason,pack_id,model,created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as Attempt[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const day = (d: Date) => d.toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short" });

// Runs every Monday morning (see vercel.json) and sends Gary a weekly summary on Telegram.
// Only totals are sent, never student names, emails or transcripts.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const weekStart = new Date(now - 7 * DAY);
  const prevStart = new Date(now - 14 * DAY);
  const admin = createAdminClient();

  try {
    const all = await fetchAttempts(prevStart.toISOString());
    const cur = all.filter((a) => new Date(a.created_at) >= weekStart);
    const prev = all.filter((a) => new Date(a.created_at) < weekStart);

    const stat = (rows: Attempt[]) => {
      const done = rows.filter((a) => a.status === "done");
      const failed = rows.filter((a) => a.status === "failed");
      return { rows, done, failed, students: new Set(rows.map((a) => a.user_id)).size };
    };
    const c = stat(cur);
    const p = stat(prev);

    // why attempts failed this week
    const reasons = new Map<string, number>();
    for (const a of c.failed) reasons.set(a.fail_reason ?? "unknown", (reasons.get(a.fail_reason ?? "unknown") ?? 0) + 1);
    const topReasons = [...reasons.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([r, n]) => `${FAIL_REASONS[r as FailReason]?.label ?? r} ${n}`)
      .join(", ");

    const packUsed = cur.filter((a) => a.pack_id && a.status !== "failed").length;
    const models = new Map<string, number>();
    for (const a of c.done) if (a.model) models.set(a.model.replace("openai/", ""), (models.get(a.model.replace("openai/", "")) ?? 0) + 1);
    const modelLine = [...models.entries()].map(([m, n]) => `${m} ${n}`).join(" · ");

    // busiest day (Malaysia time)
    const perDay = new Map<string, number>();
    for (const a of c.rows) {
      const k = day(new Date(a.created_at));
      perDay.set(k, (perDay.get(k) ?? 0) + 1);
    }
    const busiest = [...perDay.entries()].sort((a, b) => b[1] - a[1])[0];

    // orders and feedback
    const since = weekStart.toISOString();
    const [{ data: orders }, { count: waiting }, { count: feedback }] = await Promise.all([
      admin
        .from("orders")
        .select("amount_paid, products(speaking_pack_attempts)")
        .eq("status", "completed")
        .gte("reviewed_at", since),
      admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
      admin.from("feedback").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]);
    const approved = orders ?? [];
    const packOrders = approved.filter((o: any) => o.products?.speaking_pack_attempts);
    const sum = (rows: any[]) => rows.reduce((t, o) => t + Number(o.amount_paid ?? 0), 0);

    const trend = (now_: number, before: number) => (before ? ` (${now_ >= before ? "+" : ""}${pct(now_ - before, before)}% vs last week)` : "");
    const lines = [
      `📊 Speaking weekly report`,
      `${day(weekStart)} to ${day(new Date(now))}`,
      ``,
      `Students who practised: ${c.students}${trend(c.students, p.students)}`,
      `Attempts marked: ${c.done.length}${trend(c.done.length, p.done.length)}`,
      `Failed attempts: ${c.failed.length} (${pct(c.failed.length, c.rows.length)}% of all attempts)`,
      topReasons ? `Main reasons: ${topReasons}` : null,
      `Average score: ${avg(c.done.map((a) => Number(a.total_score ?? 0))).toFixed(1)} / ${4 * BAND_MAX}`,
      `Average recording: ${Math.round(avg(c.done.map((a) => Number(a.duration_sec ?? 0))))} s`,
      busiest ? `Busiest day: ${busiest[0]} (${busiest[1]} attempts)` : null,
      modelLine ? `AI models used: ${modelLine}` : null,
      ``,
      `💰 Packs and orders`,
      `New Speaking packs: ${packOrders.length} (RM ${sum(packOrders).toFixed(2)})`,
      `Pack attempts used: ${packUsed}`,
      `All orders approved: ${approved.length} (RM ${sum(approved).toFixed(2)})`,
      `Orders waiting for you: ${waiting ?? 0}`,
      `Feedback messages: ${feedback ?? 0}`,
    ].filter((l) => l !== null) as string[];

    await sendTelegramText(lines.join("\n"));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("weekly report failed", e);
    await sendTelegramText("⚠️ The weekly Speaking report could not be built. Check the Vercel logs.");
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
