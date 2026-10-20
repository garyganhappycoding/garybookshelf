import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import PagerKeys from "@/components/PagerKeys";
import DatePick from "@/components/DatePick";
import { getCard, getTheme } from "@/lib/speaking/cards";
import { FAIL_REASONS, type FailReason } from "@/lib/speaking/fail-reasons";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  user_id: string;
  card_id: string;
  status: "pending" | "done" | "failed";
  total_score: number | null;
  fail_reason: FailReason | null;
  fail_detail?: string | null;
  duration_sec?: number | null;
  word_count?: number | null;
  pack_id?: string | null;
  model?: string | null;
  created_at: string;
};

const myDay = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }); // YYYY-MM-DD in Malaysia time

const sideColor = { student: "bg-amber-100 text-amber-800", ai: "bg-red-100 text-red-700", server: "bg-ink/10 text-ink/70" };

const PAGE_SIZE = 20;
const AI_REASONS = ["stt_error", "ai_busy", "ai_error"]; // failures caused by the AI service
const OTHER_REASONS = ["stopped_early", "too_little_speech", "too_long", "server_error"]; // student side or our own server

type Peak = "day" | "week" | "month";
type Filters = {
  plan: "all" | "free" | "paid";
  result: "all" | "marked" | "failed";
  reason: "all" | "ai" | "other";
  peak: Peak; // the "Busiest hours" chart: one day, one week or one month
  date: string; // any date inside the period shown (YYYY-MM-DD, Malaysia time); empty means today
};

function queryFor(f: Filters, page = 1) {
  const p = new URLSearchParams();
  if (f.plan !== "all") p.set("plan", f.plan);
  if (f.result !== "all") p.set("result", f.result);
  if (f.reason !== "all") p.set("reason", f.reason);
  if (f.peak !== "week") p.set("peak", f.peak);
  if (f.date) p.set("date", f.date);
  if (page > 1) p.set("page", String(page));
  return p;
}

// builds /admin/speaking?... keeping every filter, for the filter buttons, the chart controls and the pager
function hrefFor(f: Filters, page = 1, hash = "recent") {
  const s = queryFor(f, page).toString();
  return `/admin/speaking${s ? `?${s}` : ""}#${hash}`;
}

// ---- date maths for the Busiest hours chart (all in Malaysia time, UTC+8) ----
const startOfDay = (d: string) => new Date(`${d}T00:00:00+08:00`);
const addDays = (d: string, n: number) => myDay(new Date(startOfDay(d).getTime() + n * 86400_000 + 12 * 3600_000));
const pad2 = (n: number) => String(n).padStart(2, "0");
const showDate = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur", ...opts });

function periodOf(mode: Peak, anchor: string) {
  if (mode === "day") {
    const start = startOfDay(anchor);
    return {
      start,
      end: new Date(start.getTime() + 86400_000),
      prev: addDays(anchor, -1),
      next: addDays(anchor, 1),
      label: showDate(start, { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
    };
  }
  if (mode === "week") {
    const dow = new Date(startOfDay(anchor).getTime() + 8 * 3600_000).getUTCDay(); // 0 = Sunday
    const monday = addDays(anchor, -((dow + 6) % 7));
    const start = startOfDay(monday);
    const end = new Date(start.getTime() + 7 * 86400_000);
    return {
      start,
      end,
      prev: addDays(monday, -7),
      next: addDays(monday, 7),
      label: `${showDate(start, { day: "numeric", month: "short" })} to ${showDate(new Date(end.getTime() - 3600_000), { day: "numeric", month: "short", year: "numeric" })}`,
    };
  }
  const [y, m] = anchor.split("-").map(Number);
  const ym = (yy: number, mm: number) => `${yy}-${pad2(mm)}-01`;
  const start = startOfDay(ym(y, m));
  const nextFirst = m === 12 ? ym(y + 1, 1) : ym(y, m + 1);
  return {
    start,
    end: startOfDay(nextFirst),
    prev: m === 1 ? ym(y - 1, 12) : ym(y, m - 1),
    next: nextFirst,
    label: showDate(start, { month: "long", year: "numeric" }),
  };
}

const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;

export default async function AdminSpeakingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; plan?: string; result?: string; reason?: string; peak?: string; date?: string }>;
}) {
  const sp = await searchParams;
  const pageParam = sp.page;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const admin = createAdminClient();

  // Totals and charts use EVERY attempt. The database returns at most 1000 rows per request, so read in pages.
  const rows: Row[] = [];
  for (let from = 0; from < 100000; from += 1000) {
    const { data } = await admin
      .from("speaking_attempts")
      .select("id,user_id,card_id,status,total_score,fail_reason,created_at")
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000) break;
  }

  // Paid = the student has bought a Speaking pack. "active" = a pack that has not expired yet.
  const { data: packs } = await admin.from("speaking_packs").select("user_id,expires_at").eq("kind", "purchased");
  const plan = new Map<string, "active" | "expired">();
  for (const p of packs ?? []) {
    const active = new Date(p.expires_at).getTime() > Date.now();
    if (active || !plan.has(p.user_id)) plan.set(p.user_id, active ? "active" : "expired");
  }
  const paidIds = [...plan.keys()];

  // Filters for the table, read from the address bar: ?plan=free|paid &result=marked|failed &reason=ai|other
  const filters: Filters = {
    plan: sp.plan === "free" || sp.plan === "paid" ? sp.plan : "all",
    result: sp.result === "marked" || sp.result === "failed" ? sp.result : "all",
    reason: sp.reason === "ai" || sp.reason === "other" ? sp.reason : "all",
    peak: sp.peak === "day" || sp.peak === "month" ? sp.peak : "week",
    date: /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") && !Number.isNaN(startOfDay(sp.date!).getTime()) ? sp.date! : "",
  };
  if (filters.reason !== "all") filters.result = "failed"; // a failure reason only makes sense for failed attempts

  const filtered = (cols: string, opts?: { count: "exact"; head?: boolean }) => {
    let q: any = admin.from("speaking_attempts").select(cols, opts);
    if (filters.plan === "paid") q = q.in("user_id", paidIds.length ? paidIds : ["00000000-0000-0000-0000-000000000000"]);
    if (filters.plan === "free" && paidIds.length) q = q.not("user_id", "in", `(${paidIds.join(",")})`);
    if (filters.reason === "ai") q = q.eq("status", "failed").in("fail_reason", AI_REASONS);
    else if (filters.reason === "other") q = q.eq("status", "failed").or(`fail_reason.is.null,fail_reason.in.(${OTHER_REASONS.join(",")})`);
    else if (filters.result === "marked") q = q.eq("status", "done");
    else if (filters.result === "failed") q = q.eq("status", "failed");
    return q;
  };

  // The attempts table shows PAGE_SIZE attempts per page (only the ones that match the filters), with all the details.
  const { count: filteredCount } = await filtered("id", { count: "exact", head: true });
  const totalAttempts = rows.length;
  const totalFiltered = filteredCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(pageParam ?? "1", 10) || 1), totalPages);
  const { data: pageData } = await filtered(
    "id,user_id,card_id,status,total_score,fail_reason,fail_detail,duration_sec,word_count,pack_id,model,created_at"
  )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const pageRows = (pageData ?? []) as Row[];

  // only look up the emails of the students on this page (a plain select would stop at 1000 profiles)
  const pageUserIds = [...new Set(pageRows.map((r) => r.user_id))];
  const { data: profiles } = await admin.from("profiles").select("id,email").in("id", pageUserIds);
  const email = new Map((profiles ?? []).map((p: any) => [p.id, p.email as string]));

  // Busiest hours of the day (Malaysia time) for one day, one week or one month. Week and month show the AVERAGE
  // number of tries per day in each hour, so a "busy hour" means busy on a typical day, not one unusual day.
  const todayStr = myDay(new Date());
  const anchor = filters.date && filters.date <= todayStr ? filters.date : todayStr;
  const per = periodOf(filters.peak, anchor);
  const hourly = Array.from({ length: 24 }, () => ({ total: 0, busy: 0 }));
  for (const r of rows) {
    const t = +new Date(r.created_at);
    if (t < per.start.getTime() || t >= per.end.getTime()) continue;
    const h = Number(new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", hour12: false })) % 24;
    hourly[h].total++;
    if (r.fail_reason === "ai_busy") hourly[h].busy++;
  }
  // days that have actually happened so far in this period (a week that is half over is averaged over the days so far)
  const daysCounted = filters.peak === "day" ? 1 : Math.max(1, Math.ceil((Math.min(per.end.getTime(), Date.now()) - per.start.getTime()) / 86400_000));
  const periodTotal = hourly.reduce((n, x) => n + x.total, 0);
  const periodBusy = hourly.reduce((n, x) => n + x.busy, 0);
  const bars = hourly.map((x) => ({ total: x.total / daysCounted, busy: x.busy / daysCounted, rawTotal: x.total, rawBusy: x.busy }));
  const maxHour = Math.max(0.0001, ...bars.map((x) => x.total));
  const peakHours = bars
    .map((x, h) => ({ h, ...x }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  const fmtAvg = (n: number) => (filters.peak === "day" ? String(Math.round(n)) : n < 10 ? n.toFixed(1) : String(Math.round(n)));
  const hasNext = per.end.getTime() <= Date.now();
  const peakBase = queryFor({ ...filters, date: "" });
  const pickBase = `/admin/speaking?${peakBase.toString() ? peakBase.toString() + "&" : ""}date=`;

  const today = myDay(new Date());
  const weekAgo = Date.now() - 7 * 86400_000;
  const done = rows.filter((r) => r.status === "done");
  const failed = rows.filter((r) => r.status === "failed");
  const finished = done.length + failed.length;

  const todayRows = rows.filter((r) => myDay(r.created_at) === today);
  const weekRows = rows.filter((r) => +new Date(r.created_at) >= weekAgo);
  const users = (rs: Row[]) => new Set(rs.map((r) => r.user_id)).size;
  const avg = done.length ? done.reduce((s, r) => s + Number(r.total_score ?? 0), 0) / done.length : 0;

  // failures by reason, and whose side it is
  const byReason = new Map<string, number>();
  for (const r of failed) byReason.set(r.fail_reason ?? "unknown", (byReason.get(r.fail_reason ?? "unknown") ?? 0) + 1);
  const sideCount = { student: 0, ai: 0, server: 0, unknown: 0 };
  for (const r of failed) sideCount[r.fail_reason ? FAIL_REASONS[r.fail_reason].side : "unknown"]++;

  // popular themes / questions
  const themeCount = new Map<string, number>();
  const cardCount = new Map<string, number>();
  for (const r of done) {
    const c = getCard(r.card_id);
    if (!c) continue;
    const t = getTheme(c.theme).name;
    themeCount.set(t, (themeCount.get(t) ?? 0) + 1);
    cardCount.set(c.title, (cardCount.get(c.title) ?? 0) + 1);
  }
  const top = (m: Map<string, number>, n = 5) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);

  // attempts per day, last 7 days
  const days = Array.from({ length: 7 }, (_, i) => myDay(new Date(Date.now() - (6 - i) * 86400_000)));
  const perDay = days.map((d) => ({ d, n: rows.filter((r) => myDay(r.created_at) === d && r.status !== "failed").length }));
  const maxDay = Math.max(1, ...perDay.map((x) => x.n));

  return (
    <div className="w-full max-w-none px-4 sm:px-6 py-14 space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Speaking usage</h1>
        <p className="text-sm text-ink/60">Times are Malaysia time. Failed attempts do not use up a student's daily limit.</p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Attempts today" value={todayRows.filter((r) => r.status !== "failed").length} sub={`${users(todayRows)} students`} />
        <Stat label="Last 7 days" value={weekRows.filter((r) => r.status !== "failed").length} sub={`${users(weekRows)} students`} />
        <Stat label="All time" value={done.length} sub={`${users(rows)} students`} />
        <Stat label="Average score" value={avg ? `${avg.toFixed(1)} / 24` : "-"} sub={`success rate ${finished ? Math.round((done.length / finished) * 100) : 0}%`} />
      </section>

      <section className="card">
        <h2 className="font-medium mb-3">Marked attempts, last 7 days</h2>
        <div className="flex items-end gap-2 h-28">
          {perDay.map((x) => (
            <div key={x.d} className="flex-1 text-center text-xs">
              <div className="bg-clay-400 rounded-t" style={{ height: `${(x.n / maxDay) * 80}px` }} />
              <p className="font-medium">{x.n}</p>
              <p className="text-ink/50">{x.d.slice(5)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="peak" className="card scroll-mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="font-medium">Busiest hours of the day</h2>
            <p className="text-sm text-ink/60">
              {filters.peak === "day" ? "Tries in each hour" : "Average tries per day in each hour"} (Malaysia time). Red is the part that hit "AI busy".
            </p>
          </div>
          <div className="flex gap-1.5">
            {(["day", "week", "month"] as Peak[]).map((m) => (
              <Link
                key={m}
                href={hrefFor({ ...filters, peak: m }, 1, "peak")}
                scroll={false}
                className={`px-3 py-1 rounded-full border text-xs ${
                  filters.peak === m ? "border-clay-600 bg-clay-600 text-white font-medium" : "border-ink/15 hover:border-clay-400"
                }`}
              >
                {m === "day" ? "Daily" : m === "week" ? "Weekly" : "Monthly"}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Link href={hrefFor({ ...filters, date: per.prev }, 1, "peak")} scroll={false} className="px-3 py-1 rounded-lg border border-ink/15 hover:border-clay-400 text-sm" aria-label="Previous period">
            ←
          </Link>
          {hasNext ? (
            <Link href={hrefFor({ ...filters, date: per.next === todayStr ? "" : per.next }, 1, "peak")} scroll={false} className="px-3 py-1 rounded-lg border border-ink/15 hover:border-clay-400 text-sm" aria-label="Next period">
              →
            </Link>
          ) : (
            <span className="px-3 py-1 rounded-lg border border-transparent text-ink/30 text-sm">→</span>
          )}
          <span className="font-medium text-sm min-w-44">{per.label}</span>
          <DatePick baseHref={pickBase} date={anchor} max={todayStr} hash="peak" />
          {filters.date && (
            <Link href={hrefFor({ ...filters, date: "" }, 1, "peak")} scroll={false} className="text-xs text-clay-700 underline">
              Back to today
            </Link>
          )}
        </div>

        <p className="text-sm text-ink/60 mb-3">
          {periodTotal.toLocaleString()} tries in this {filters.peak}
          {periodBusy > 0 && <>, of which <b className="text-red-600">{periodBusy}</b> hit "AI busy"</>}.{" "}
          {peakHours.length > 0 ? (
            <>
              Busiest:{" "}
              {peakHours.map((x, i) => (
                <span key={x.h}>
                  {i > 0 && ", "}
                  <b>{hourLabel(x.h)}</b> ({fmtAvg(x.total)}{filters.peak === "day" ? "" : " a day"})
                </span>
              ))}
              .
            </>
          ) : (
            "No tries in this period."
          )}
        </p>
        <div className="flex items-end gap-1 h-36">
          {bars.map((x, h) => (
            <div
              key={h}
              className="flex-1 flex flex-col justify-end items-stretch h-full"
              title={`${hourLabel(h)}: ${x.rawTotal} tries${filters.peak === "day" ? "" : ` (${fmtAvg(x.total)} a day)`}, ${x.rawBusy} AI busy`}
            >
              <div className="flex flex-col justify-end" style={{ height: `${(x.total / maxHour) * 100}%` }}>
                {x.busy > 0 && <div className="bg-red-400 rounded-t" style={{ height: `${(x.busy / x.total) * 100}%`, minHeight: 2 }} />}
                <div className={`bg-clay-400 ${x.busy === 0 ? "rounded-t" : ""}`} style={{ height: `${((x.total - x.busy) / x.total) * 100 || 0}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1 text-[10px] text-ink/50 mt-1">
          {hourly.map((_, h) => (
            <span key={h} className="flex-1 text-center">{h % 3 === 0 ? hourLabel(h) : ""}</span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="font-medium mb-1">Why attempts fail</h2>
        <p className="text-sm text-ink/60 mb-3">
          {failed.length} failed of {finished}. Student side: <b>{sideCount.student}</b> · AI side: <b>{sideCount.ai}</b> · Server: <b>{sideCount.server}</b>
          {sideCount.unknown > 0 && (
            <>
              {" "}· Unknown (before reasons were recorded): <b>{sideCount.unknown}</b>
            </>
          )}
        </p>
        {failed.length === 0 ? (
          <p className="text-sm text-ink/50">No failures yet.</p>
        ) : (
          <div className="space-y-2">
            {[...byReason]
              .sort((a, b) => b[1] - a[1])
              .map(([reason, n]) => {
                const info = FAIL_REASONS[reason as FailReason];
                return (
                  <div key={reason} className="flex items-start gap-3 text-sm">
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${info ? sideColor[info.side] : "bg-ink/10"}`}>{info ? info.side : "unknown"}</span>
                    <div>
                      <p>
                        <b>{info?.label ?? "Unknown (older attempt)"}</b>: {n}
                      </p>
                      {info && <p className="text-xs text-ink/60">{info.hint}</p>}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <div className="card">
          <h2 className="font-medium mb-2">Popular themes</h2>
          {top(themeCount).map(([k, n]) => (
            <p key={k} className="text-sm flex justify-between">
              <span>{k}</span>
              <b>{n}</b>
            </p>
          ))}
          {themeCount.size === 0 && <p className="text-sm text-ink/50">No data yet.</p>}
        </div>
        <div className="card">
          <h2 className="font-medium mb-2">Popular questions</h2>
          {top(cardCount).map(([k, n]) => (
            <p key={k} className="text-sm flex justify-between">
              <span>{k}</span>
              <b>{n}</b>
            </p>
          ))}
          {cardCount.size === 0 && <p className="text-sm text-ink/50">No data yet.</p>}
        </div>
      </section>

      <section id="recent" className="card overflow-x-auto scroll-mt-6">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="font-medium">All attempts, newest first</h2>
          <p className="text-xs text-ink/50">
            {totalFiltered === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, totalFiltered)}`} of {totalFiltered.toLocaleString()}
            {totalFiltered !== totalAttempts && ` (filtered from ${totalAttempts.toLocaleString()})`}
          </p>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <FilterRow
            label="Student"
            current={filters.plan}
            options={[["all", "Everyone"], ["free", "Free"], ["paid", "Paid"]]}
            hrefFor={(v) => hrefFor({ ...filters, plan: v as Filters["plan"] })}
          />
          <FilterRow
            label="Result"
            current={filters.result}
            options={[["all", "All"], ["marked", "Marked"], ["failed", "Failed"]]}
            hrefFor={(v) => hrefFor({ ...filters, result: v as Filters["result"], reason: v === "marked" ? "all" : filters.reason })}
          />
          <FilterRow
            label="Why it failed"
            current={filters.reason}
            options={[["all", "Any reason"], ["ai", "AI service"], ["other", "Other (student or server)"]]}
            hrefFor={(v) => hrefFor({ ...filters, reason: v as Filters["reason"] })}
          />
          <p className="text-xs text-ink/50">
            Tip: press <kbd className="px-1.5 py-0.5 rounded border border-ink/20">←</kbd> <kbd className="px-1.5 py-0.5 rounded border border-ink/20">→</kbd> on your keyboard to change page, <kbd className="px-1.5 py-0.5 rounded border border-ink/20">Home</kbd> / <kbd className="px-1.5 py-0.5 rounded border border-ink/20">End</kbd> for the first and last page. "AI service" means transcription failed, the AI was busy, or the AI returned a bad answer.
          </p>
        </div>

        <PagerKeys
          prev={page > 1 ? hrefFor(filters, page - 1) : null}
          next={page < totalPages ? hrefFor(filters, page + 1) : null}
          first={page > 1 ? hrefFor(filters, 1) : null}
          last={page < totalPages ? hrefFor(filters, totalPages) : null}
        />
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50">
            <tr>
              <th className="pb-2">When</th>
              <th>Student</th>
              <th>Plan</th>
              <th>Question</th>
              <th>Result</th>
              <th>AI model</th>
              <th>Speech</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-t border-ink/10 align-top">
                <td className="py-2 pr-3 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="pr-3">{email.get(r.user_id) ?? "?"}</td>
                <td className="pr-3 whitespace-nowrap">
                  {plan.get(r.user_id) === "active" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sage-400/20 text-sage-600 font-medium">Paid</span>
                  ) : plan.get(r.user_id) === "expired" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Paid (expired)</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-ink/10 text-ink/70">Free</span>
                  )}
                  {r.pack_id && <p className="text-xs text-ink/50 mt-0.5">used a pack attempt</p>}
                </td>
                <td className="pr-3">{getCard(r.card_id)?.title ?? r.card_id}</td>
                <td className="pr-3">
                  {r.status === "done" ? (
                    <b>{r.total_score}/24</b>
                  ) : r.status === "failed" ? (
                    <span className="text-red-600">{r.fail_reason ? FAIL_REASONS[r.fail_reason].label : "Failed (reason not recorded)"}</span>
                  ) : (
                    "…"
                  )}
                  {r.fail_detail && <p className="text-xs text-ink/50 max-w-3xl break-words">{r.fail_detail}</p>}
                </td>
                <td className="pr-3 text-ink/60 whitespace-nowrap">{r.model ? r.model.replace("openai/", "") : "-"}</td>
                <td className="text-ink/60 whitespace-nowrap">{r.duration_sec != null ? `${Math.round(r.duration_sec)}s · ${r.word_count} words` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pageRows.length === 0 && <p className="text-sm text-ink/50 py-6 text-center">No attempts match these filters.</p>}
        <Pager page={page} totalPages={totalPages} filters={filters} />
      </section>
    </div>
  );
}

// Previous / numbered pages / Next. Shows the first page, the last page and a few around the current one.
function FilterRow({
  label,
  current,
  options,
  hrefFor,
}: {
  label: string;
  current: string;
  options: [string, string][];
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-28 shrink-0 text-ink/60">{label}</span>
      {options.map(([value, text]) => (
        <Link
          key={value}
          href={hrefFor(value)}
          className={`px-3 py-1 rounded-full border text-xs ${
            current === value ? "border-clay-600 bg-clay-600 text-white font-medium" : "border-ink/15 hover:border-clay-400"
          }`}
        >
          {text}
        </Link>
      ))}
    </div>
  );
}

function Pager({ page, totalPages, filters }: { page: number; totalPages: number; filters: Filters }) {
  if (totalPages <= 1) return null;
  const nums = new Set([1, totalPages, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= totalPages));
  const list = [...nums].sort((a, b) => a - b);
  const href = (n: number) => hrefFor(filters, n);
  const base = "min-w-9 text-center px-3 py-1.5 rounded-lg border text-sm";
  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 mt-5" aria-label="Pages">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${base} border-ink/15 hover:border-clay-400`}>← Previous</Link>
      ) : (
        <span className={`${base} border-transparent text-ink/30`}>← Previous</span>
      )}
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - list[i - 1] > 1 && <span className="text-ink/40">…</span>}
          {n === page ? (
            <span className={`${base} border-clay-600 bg-clay-600 text-white font-medium`} aria-current="page">{n}</span>
          ) : (
            <Link href={href(n)} className={`${base} border-ink/15 hover:border-clay-400`}>{n}</Link>
          )}
        </span>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${base} border-ink/15 hover:border-clay-400`}>Next →</Link>
      ) : (
        <span className={`${base} border-transparent text-ink/30`}>Next →</span>
      )}
    </nav>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card">
      <p className="text-xs text-ink/60">{label}</p>
      <p className="text-2xl font-medium">{value}</p>
      {sub && <p className="text-xs text-ink/50">{sub}</p>}
    </div>
  );
}
