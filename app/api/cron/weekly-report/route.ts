import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramText } from "@/lib/telegram";
import { siteUrl } from "@/lib/site";
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

// Run one optional part of the report; if it fails, return null so the rest of the report still goes out.
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error("weekly report part failed", e);
    return null;
  }
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
        .select("amount_paid, reviewed_at, products(title, speaking_pack_attempts, external_link, file_path)")
        .eq("status", "completed")
        .gte("reviewed_at", prevStart.toISOString()),
      admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_verification"),
      admin.from("feedback").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]);
    const sum = (rows: any[]) => rows.reduce((t, o) => t + Number(o.amount_paid ?? 0), 0);
    const allOrders = orders ?? [];
    const approved = allOrders.filter((o: any) => new Date(o.reviewed_at) >= weekStart);
    const lastWeekOrders = allOrders.filter((o: any) => new Date(o.reviewed_at) < weekStart);

    // sales per product, best seller first, so it is clear which package makes the money
    const kindOf = (pr: any) =>
      pr?.speaking_pack_attempts ? (pr.external_link || pr.file_path ? "notes + attempts" : "speaking pack") : "notes";
    const byProduct = new Map<string, { kind: string; n: number; rm: number; prevN: number }>();
    const rowFor = (o: any) => {
      const title = o.products?.title ?? "Unknown product";
      if (!byProduct.has(title)) byProduct.set(title, { kind: kindOf(o.products), n: 0, rm: 0, prevN: 0 });
      return byProduct.get(title)!;
    };
    for (const o of approved) { const r = rowFor(o); r.n += 1; r.rm += Number(o.amount_paid ?? 0); }
    for (const o of lastWeekOrders) rowFor(o).prevN += 1;
    const total = sum(approved);
    const productLines = [...byProduct.entries()]
      .filter(([, r]) => r.n > 0)
      .sort((a, b) => b[1].rm - a[1].rm)
      .map(([title, r], i) => `${i + 1}. ${title} [${r.kind}]: ${r.n} sold, RM ${r.rm.toFixed(2)} (${pct(r.rm, total)}% of sales, last week ${r.prevN})`);
    const lastTotal = sum(lastWeekOrders);

    const trend = (now_: number, before: number) => (before ? ` (${now_ >= before ? "+" : ""}${pct(now_ - before, before)}% vs last week)` : "");

    // essay marking, sign-ups, API spend and website health. Each part is optional: if one fails the rest still send.
    const essay = await safe(async () => {
      const rows: { user_id: string; status: string; tier: string | null; total_score: number | null; model: string | null; created_at: string }[] = [];
      for (let from = 0; from < 10000; from += 1000) {
        const { data } = await admin.from("writing_attempts").select("user_id,status,tier,total_score,model,created_at").gte("created_at", prevStart.toISOString()).order("created_at").range(from, from + 999);
        rows.push(...(data ?? []));
        if (!data || data.length < 1000) break;
      }
      const cw = rows.filter((r) => new Date(r.created_at) >= weekStart);
      const pw = rows.length - cw.length;
      const done = cw.filter((r) => r.status === "done");
      return { cw, pw, done, students: new Set(cw.map((r) => r.user_id)), failed: cw.filter((r) => r.status === "failed").length, paid: done.filter((r) => r.tier === "paid").length };
    });
    const signups = await safe(async () => {
      const q = (gte: string, lt?: string) => {
        let s = admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", gte);
        if (lt) s = s.lt("created_at", lt);
        return s;
      };
      const [{ count: now_ }, { count: before }, { count: all }] = await Promise.all([q(weekStart.toISOString()), q(prevStart.toISOString(), weekStart.toISOString()), admin.from("profiles").select("id", { count: "exact", head: true })]);
      return { now: now_ ?? 0, before: before ?? 0, all: all ?? 0 };
    });
    // "active" = signed in and did something real: practised speaking or got an essay marked this week
    const active = new Set<string>([...c.rows.map((a) => a.user_id), ...(essay ? [...essay.students] : [])]);
    const activePrev = new Set<string>(prev.map((a) => a.user_id));

    const spend = await safe(async () => {
      const key = process.env.OPENROUTER_API_KEY;
      if (!key) return null;
      const res = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      const d = (await res.json())?.data ?? {};
      return { week: Number(d.usage_weekly ?? NaN), total: Number(d.usage ?? NaN), left: typeof d.limit_remaining === "number" ? d.limit_remaining : null };
    });

    const health = await safe(async () => {
      const t0 = Date.now();
      const res = await fetch(siteUrl(), { cache: "no-store", signal: AbortSignal.timeout(10000) });
      return { ok: res.ok, status: res.status, ms: Date.now() - t0 };
    });
    // Visitors and the Vercel deployment need a Vercel token (VERCEL_TOKEN, VERCEL_PROJECT_ID, optional VERCEL_TEAM_ID).
    const vercel = await safe(async () => {
      const token = process.env.VERCEL_TOKEN;
      const pid = process.env.VERCEL_PROJECT_ID;
      if (!token || !pid) return null;
      const team = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : "";
      const headers = { Authorization: `Bearer ${token}` };
      const [dep, vis] = await Promise.all([
        fetch(`https://api.vercel.com/v6/deployments?projectId=${pid}&target=production&limit=1${team}`, { headers, signal: AbortSignal.timeout(8000) }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch(`https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=${pid}&since=${weekStart.getTime()}&until=${now}${team}`, { headers, signal: AbortSignal.timeout(8000) }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      return { state: dep?.deployments?.[0]?.state as string | undefined, visitors: vis ? (vis.count ?? vis.visitors ?? vis.data?.count ?? null) : null };
    });

    const essayLines = essay
      ? [
          `✍️ Essay marking`,
          `Students: ${essay.students.size} · Essays marked: ${essay.done.length}${trend(essay.done.length, essay.pw)}`,
          `Paid reports: ${essay.paid} · Free reports: ${essay.done.length - essay.paid} · Failed: ${essay.failed}`,
          essay.done.length ? `Average score: ${avg(essay.done.map((r) => Number(r.total_score ?? 0))).toFixed(1)} / 20` : null,
        ]
      : [`✍️ Essay marking: could not be read`];
    const growthLines = [
      `👥 Students`,
      signups ? `New sign-ups: ${signups.now}${trend(signups.now, signups.before)} · Total accounts: ${signups.all}` : `New sign-ups: could not be read`,
      `Active students (practised speaking or marked an essay): ${active.size}${trend(active.size, activePrev.size)}`,
      vercel?.visitors != null ? `Visitors: ${vercel.visitors}` : `Visitors: not connected yet (see setup note)`,
    ];
    const techLines = [
      `🛠 Website and API`,
      health ? `Website: ${health.ok ? "up ✅" : `problem ⚠️ (HTTP ${health.status})`}, home page answered in ${health.ms} ms` : `Website: no answer ⚠️`,
      vercel?.state ? `Latest Vercel deployment: ${vercel.state}` : null,
      spend && !Number.isNaN(spend.week) ? `OpenRouter spent: US$ ${spend.week.toFixed(2)} this week (US$ ${spend.total.toFixed(2)} in total${spend.left != null ? `, US$ ${spend.left.toFixed(2)} left` : ""})` : `OpenRouter spend: could not be read`,
      `Groq: free tier, no charge`,
    ];

    const lines = [
      `📊 Weekly report`,
      `${day(weekStart)} to ${day(new Date(now))}`,
      ``,
      `💰 Sales`,
      `Total: ${approved.length} orders, RM ${total.toFixed(2)}${trend(total, lastTotal)}`,
      ...(productLines.length ? productLines : ["No orders approved this week."]),
      `Orders waiting for you: ${waiting ?? 0}`,
      ``,
      `🎤 Speaking`,
      `Students who practised: ${c.students}${trend(c.students, p.students)}`,
      `Attempts marked: ${c.done.length}${trend(c.done.length, p.done.length)}`,
      `Failed attempts: ${c.failed.length} (${pct(c.failed.length, c.rows.length)}% of all attempts)`,
      topReasons ? `Main reasons: ${topReasons}` : null,
      `Average score: ${avg(c.done.map((a) => Number(a.total_score ?? 0))).toFixed(1)} / ${4 * BAND_MAX}`,
      `Average recording: ${Math.round(avg(c.done.map((a) => Number(a.duration_sec ?? 0))))} s`,
      busiest ? `Busiest day: ${busiest[0]} (${busiest[1]} attempts)` : null,
      modelLine ? `AI models used: ${modelLine}` : null,
      `Pack attempts used: ${packUsed}`,
      ``,
      ...essayLines,
      ``,
      ...growthLines,
      ``,
      ...techLines,
      ``,
      `Feedback messages: ${feedback ?? 0}`,
    ].filter((l) => l !== null) as string[];

    await sendTelegramText(lines.join("\n"));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("weekly report failed", e);
    await sendTelegramText("⚠️ The weekly report could not be built. Check the Vercel logs.");
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
