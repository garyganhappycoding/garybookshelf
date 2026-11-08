import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import PagerKeys from "@/components/PagerKeys";
import WritingReport from "@/components/WritingReport";
import { BAND_MAX, CRITERIA, CRITERION_LABEL, GENRE_LABEL, type Genre, type WritingPart, type WritingResult } from "@/lib/writing/mark";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  user_id: string;
  part: number;
  genre: Genre;
  question: string;
  essay?: string;
  word_count: number | null;
  status: "pending" | "done" | "failed";
  total_score: number | null;
  result?: WritingResult | null;
  tier: "free" | "paid" | null;
  pack_id?: string | null;
  model?: string | null;
  fail_reason: string | null;
  fail_detail?: string | null;
  created_at: string;
};

const MAX = BAND_MAX * 4;
const PAGE_SIZE = 20;
const myDay = (d: Date | string) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
const oneLine = (s: string, n: number) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
};

const REASON: Record<string, { label: string; side: "ai" | "server" }> = {
  ai_busy: { label: "AI busy", side: "ai" },
  ai_error: { label: "AI error / unreadable answer", side: "ai" },
  server_error: { label: "Server error or timed out", side: "server" },
};

type Filters = { who: "all" | "beta" | "students"; result: "all" | "marked" | "failed"; report: "all" | "full" | "free" };

function hrefFor(f: Filters, page = 1) {
  const p = new URLSearchParams();
  if (f.who !== "all") p.set("who", f.who);
  if (f.result !== "all") p.set("result", f.result);
  if (f.report !== "all") p.set("report", f.report);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return `/admin/writing${s ? `?${s}` : ""}#recent`;
}

export default async function AdminWritingPage({ searchParams }: { searchParams: Promise<{ page?: string; who?: string; result?: string; report?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const admin = createAdminClient();

  // totals and charts use EVERY essay (the database returns at most 1000 rows per request, so read in pages)
  const rows: Row[] = [];
  for (let from = 0; from < 100000; from += 1000) {
    const { data } = await admin
      .from("writing_attempts")
      .select("id,user_id,part,genre,question,status,total_score,tier,fail_reason,created_at")
      .order("created_at", { ascending: false })
      .range(from, from + 999);
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000) break;
  }

  // beta testers (their Gmail is listed in writing_beta_testers) and their user ids
  const { data: testers } = await admin.from("writing_beta_testers").select("email,note").order("created_at");
  const betaEmails = (testers ?? []).map((t) => t.email as string);
  const { data: betaProfiles } = betaEmails.length ? await admin.from("profiles").select("id,email").in("email", betaEmails) : { data: [] as { id: string; email: string }[] };
  const betaIds = new Set((betaProfiles ?? []).map((p) => p.id));
  const betaIdList = [...betaIds];
  const NONE = "00000000-0000-0000-0000-000000000000";

  const filters: Filters = {
    who: sp.who === "beta" || sp.who === "students" ? sp.who : "all",
    result: sp.result === "marked" || sp.result === "failed" ? sp.result : "all",
    report: sp.report === "full" || sp.report === "free" ? sp.report : "all",
  };

  const filtered = (cols: string, opts?: { count: "exact"; head?: boolean }) => {
    let q: any = admin.from("writing_attempts").select(cols, opts);
    if (filters.who === "beta") q = q.in("user_id", betaIdList.length ? betaIdList : [NONE]);
    if (filters.who === "students" && betaIdList.length) q = q.not("user_id", "in", `(${betaIdList.join(",")})`);
    if (filters.result === "marked") q = q.eq("status", "done");
    if (filters.result === "failed") q = q.eq("status", "failed");
    if (filters.report === "full") q = q.eq("tier", "paid");
    if (filters.report === "free") q = q.eq("tier", "free");
    return q;
  };

  const { count: filteredCount } = await filtered("id", { count: "exact", head: true });
  const totalFiltered = filteredCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), totalPages);
  const { data: pageData } = await filtered("id,user_id,part,genre,question,essay,word_count,status,total_score,result,tier,pack_id,model,fail_reason,fail_detail,created_at")
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const pageRows = (pageData ?? []) as Row[];

  const pageUserIds = [...new Set(pageRows.map((r) => r.user_id))];
  const { data: profiles } = pageUserIds.length ? await admin.from("profiles").select("id,email").in("id", pageUserIds) : { data: [] as { id: string; email: string }[] };
  const email = new Map((profiles ?? []).map((p: any) => [p.id, p.email as string]));

  // stats
  const today = myDay(new Date());
  const weekAgo = Date.now() - 7 * 86400_000;
  const done = rows.filter((r) => r.status === "done");
  const failed = rows.filter((r) => r.status === "failed");
  const finished = done.length + failed.length;
  const todayRows = rows.filter((r) => myDay(r.created_at) === today && r.status !== "failed");
  const weekRows = rows.filter((r) => +new Date(r.created_at) >= weekAgo && r.status !== "failed");
  const users = (rs: Row[]) => new Set(rs.map((r) => r.user_id)).size;
  const avg = done.length ? done.reduce((s, r) => s + Number(r.total_score ?? 0), 0) / done.length : 0;
  const days = Array.from({ length: 7 }, (_, i) => myDay(new Date(Date.now() - (6 - i) * 86400_000)));
  const perDay = days.map((d) => ({ d, n: rows.filter((r) => myDay(r.created_at) === d && r.status !== "failed").length }));
  const maxDay = Math.max(1, ...perDay.map((x) => x.n));

  // average mark for each criterion, from the 200 newest marked essays (helps tune the marker)
  const { data: recentDone } = await admin.from("writing_attempts").select("result").eq("status", "done").order("created_at", { ascending: false }).limit(200);
  const critSum: Record<string, number> = {};
  let critN = 0;
  for (const r of recentDone ?? []) {
    const c = (r.result as WritingResult | null)?.criteria;
    if (!c) continue;
    critN++;
    for (const k of CRITERIA) critSum[k] = (critSum[k] ?? 0) + (c[k]?.band ?? 0);
  }

  // what students write about: by part and genre, and the questions picked most often
  const kindCount = new Map<string, number>();
  const topicCount = new Map<string, number>();
  for (const r of rows.filter((x) => x.status !== "failed")) {
    const kind = `Part ${r.part} · ${GENRE_LABEL[r.genre] ?? r.genre}`;
    kindCount.set(kind, (kindCount.get(kind) ?? 0) + 1);
    const t = oneLine(r.question, 70);
    topicCount.set(t, (topicCount.get(t) ?? 0) + 1);
  }
  const top = (m: Map<string, number>, n = 6) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);

  const byReason = new Map<string, number>();
  for (const r of failed) byReason.set(r.fail_reason ?? "unknown", (byReason.get(r.fail_reason ?? "unknown") ?? 0) + 1);

  return (
    <div className="w-full max-w-none px-4 sm:px-6 py-14 space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Essay marking usage</h1>
        <p className="text-sm text-ink/60">
          Times are Malaysia time. The marks are estimates. Essay marking is closed to students, so right now this is you and your beta testers (
          {betaEmails.length ? betaEmails.join(", ") : "none yet"}).
        </p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Essays today" value={todayRows.length} sub={`${users(todayRows)} people`} />
        <Stat label="Last 7 days" value={weekRows.length} sub={`${users(weekRows)} people`} />
        <Stat label="All time" value={done.length} sub={`${users(rows)} people`} />
        <Stat label="Average score" value={avg ? `${avg.toFixed(1)} / ${MAX}` : "-"} sub={`success rate ${finished ? Math.round((done.length / finished) * 100) : 0}%`} />
      </section>

      <section className="grid sm:grid-cols-2 gap-3">
        <div className="card">
          <h2 className="font-medium mb-3">Marked essays, last 7 days</h2>
          <div className="flex items-end gap-2 h-28">
            {perDay.map((x) => (
              <div key={x.d} className="flex-1 text-center text-xs">
                <div className="bg-clay-400 rounded-t" style={{ height: `${(x.n / maxDay) * 80}px` }} />
                <p className="font-medium">{x.n}</p>
                <p className="text-ink/50">{x.d.slice(5)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-medium mb-1">Average mark for each criterion</h2>
          <p className="text-xs text-ink/50 mb-3">From the {critN} newest marked essays. Out of {BAND_MAX}.</p>
          {critN === 0 ? (
            <p className="text-sm text-ink/50">No data yet.</p>
          ) : (
            CRITERIA.map((k) => {
              const v = critSum[k] / critN;
              return (
                <div key={k} className="flex items-center gap-3 text-sm mb-1.5">
                  <span className="w-44 shrink-0">{CRITERION_LABEL[k]}</span>
                  <div className="flex-1 h-2 bg-ink/10 rounded-full">
                    <div className="h-2 bg-clay-500 rounded-full" style={{ width: `${(v / BAND_MAX) * 100}%` }} />
                  </div>
                  <b className="w-8 text-right">{v.toFixed(1)}</b>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        <div className="card">
          <h2 className="font-medium mb-2">By part and type</h2>
          {top(kindCount).map(([k, n]) => (
            <p key={k} className="text-sm flex justify-between gap-3">
              <span>{k}</span>
              <b>{n}</b>
            </p>
          ))}
          {kindCount.size === 0 && <p className="text-sm text-ink/50">No data yet.</p>}
        </div>
        <div className="card sm:col-span-2">
          <h2 className="font-medium mb-2">Most chosen questions</h2>
          {top(topicCount).map(([k, n]) => (
            <p key={k} className="text-sm flex justify-between gap-3">
              <span className="min-w-0 break-words">{k}</span>
              <b>{n}</b>
            </p>
          ))}
          {topicCount.size === 0 && <p className="text-sm text-ink/50">No data yet.</p>}
        </div>
      </section>

      <section className="card">
        <h2 className="font-medium mb-1">Why essays fail</h2>
        <p className="text-sm text-ink/60 mb-2">
          {failed.length} failed of {finished}. A failed essay is refunded (the free essay or the pack credit comes back).
        </p>
        {failed.length === 0 ? (
          <p className="text-sm text-ink/50">No failures yet.</p>
        ) : (
          [...byReason]
            .sort((a, b) => b[1] - a[1])
            .map(([reason, n]) => (
              <p key={reason} className="text-sm">
                <b>{REASON[reason]?.label ?? "Reason not recorded"}</b>: {n}
              </p>
            ))
        )}
      </section>

      <section id="recent" className="card overflow-x-auto scroll-mt-6">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="font-medium">All essays, newest first</h2>
          <p className="text-xs text-ink/50">
            {totalFiltered === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, totalFiltered)}`} of {totalFiltered.toLocaleString()}
            {totalFiltered !== rows.length && ` (filtered from ${rows.length.toLocaleString()})`}
          </p>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <FilterRow label="Who" current={filters.who} options={[["all", "Everyone"], ["beta", "Beta testers"], ["students", "Students"]]} hrefFor={(v) => hrefFor({ ...filters, who: v as Filters["who"] })} />
          <FilterRow label="Result" current={filters.result} options={[["all", "All"], ["marked", "Marked"], ["failed", "Failed"]]} hrefFor={(v) => hrefFor({ ...filters, result: v as Filters["result"] })} />
          <FilterRow label="Report" current={filters.report} options={[["all", "All"], ["full", "Full (paid)"], ["free", "Free"]]} hrefFor={(v) => hrefFor({ ...filters, report: v as Filters["report"] })} />
          <p className="text-xs text-ink/50">Tap "Read the essay and report" on any row to see the question, the essay and exactly what the student saw. The arrow keys change page.</p>
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
              <th>Report</th>
              <th>Topic</th>
              <th>Score</th>
              <th>AI model</th>
              <th>Length</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => {
              const crit = r.result?.criteria;
              const ev = r.result?.evidence;
              return (
                <RowBlock key={r.id}>
                  <tr className="border-t border-ink/10 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Asia/Kuala_Lumpur", dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="pr-3">
                      {email.get(r.user_id) ?? "?"}
                      {betaIds.has(r.user_id) && <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-sage-400/20 text-sage-600 font-medium">Beta</span>}
                    </td>
                    <td className="pr-3 whitespace-nowrap">
                      {r.tier === "paid" ? <span className="text-xs px-2 py-0.5 rounded-full bg-sage-400/20 text-sage-600 font-medium">Full</span> : r.tier === "free" ? <span className="text-xs px-2 py-0.5 rounded-full bg-ink/10 text-ink/70">Free</span> : "-"}
                      {r.pack_id && <p className="text-xs text-ink/50 mt-0.5">used a pack credit</p>}
                    </td>
                    <td className="pr-3 max-w-md">
                      <p className="text-xs text-ink/50">
                        Part {r.part} · {GENRE_LABEL[r.genre] ?? r.genre}
                      </p>
                      <p className="break-words">{oneLine(r.question, 110)}</p>
                    </td>
                    <td className="pr-3 whitespace-nowrap">
                      {r.status === "done" ? (
                        <>
                          <b>
                            {r.total_score}/{MAX}
                          </b>
                          {crit && (
                            <p className="text-xs text-ink/60" title="Content / Communicative / Organisation / Language">
                              {CRITERIA.map((k) => crit[k]?.band ?? "?").join(" · ")}
                            </p>
                          )}
                        </>
                      ) : r.status === "failed" ? (
                        <span className="text-red-600">{r.fail_reason ? REASON[r.fail_reason]?.label ?? r.fail_reason : "Failed (reason not recorded)"}</span>
                      ) : (
                        "…"
                      )}
                      {r.fail_detail && <p className="text-xs text-ink/50 max-w-xl break-words whitespace-normal">{r.fail_detail}</p>}
                    </td>
                    <td className="pr-3 text-ink/60 whitespace-nowrap">{r.model ? r.model.replace("openai/", "") : "-"}</td>
                    <td className="text-ink/60 whitespace-nowrap">{r.word_count != null ? `${r.word_count} words` : "-"}</td>
                  </tr>
                  {r.status === "done" && r.result && r.essay && (
                    <tr>
                      <td colSpan={7} className="pb-3">
                        <details className="rounded-xl border border-ink/10 bg-cream-50 p-3">
                          <summary className="cursor-pointer text-sm font-medium text-clay-700">Read the essay and report</summary>
                          <div className="mt-3 space-y-3">
                            <div>
                              <p className="text-xs font-medium text-ink/60 mb-1">Question the student gave</p>
                              <p className="whitespace-pre-wrap text-sm">{r.question}</p>
                            </div>
                            {ev && (
                              <div className="text-xs text-ink/70 rounded-xl bg-white border border-ink/10 p-3">
                                <p className="font-medium mb-1">What the marker counted before scoring</p>
                                <p>Linkers ({ev.linkers_used.length}): {ev.linkers_used.join(", ") || "none"}</p>
                                <p>Less common words ({ev.less_common_words.length}): {ev.less_common_words.join(", ") || "none"}</p>
                                <p>
                                  Complex sentences: {ev.complex_sentence_count} · Introduction: {ev.has_introduction ? "yes" : "no"} · Closing sentence: {ev.has_closing_sentence ? "yes" : "no"}
                                </p>
                                <p>Repeated error patterns: {ev.repeated_error_patterns.join("; ") || "none"}</p>
                              </div>
                            )}
                            <WritingReport
                              data={{
                                total: Number(r.total_score ?? 0),
                                tier: r.tier === "paid" ? "paid" : "free",
                                part: r.part as WritingPart,
                                genre: r.genre,
                                question: r.question,
                                essay: r.essay,
                                wordCount: r.word_count ?? 0,
                                result: r.result,
                              }}
                            />
                          </div>
                        </details>
                      </td>
                    </tr>
                  )}
                </RowBlock>
              );
            })}
          </tbody>
        </table>
        {pageRows.length === 0 && <p className="text-sm text-ink/50 py-6 text-center">No essays match these filters.</p>}
        <Pager page={page} totalPages={totalPages} filters={filters} />
      </section>
    </div>
  );
}

// a fragment with a key, so one essay can use two table rows (the row and its details)
function RowBlock({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function FilterRow({ label, current, options, hrefFor }: { label: string; current: string; options: [string, string][]; hrefFor: (value: string) => string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-28 shrink-0 text-ink/60">{label}</span>
      {options.map(([value, text]) => (
        <Link key={value} href={hrefFor(value)} className={`px-3 py-1 rounded-full border text-xs ${current === value ? "border-clay-600 bg-clay-600 text-white font-medium" : "border-ink/15 hover:border-clay-400"}`}>
          {text}
        </Link>
      ))}
    </div>
  );
}

function Pager({ page, totalPages, filters }: { page: number; totalPages: number; filters: Filters }) {
  if (totalPages <= 1) return null;
  const list = [...new Set([1, totalPages, page - 2, page - 1, page, page + 1, page + 2].filter((n) => n >= 1 && n <= totalPages))].sort((a, b) => a - b);
  const base = "min-w-9 text-center px-3 py-1.5 rounded-lg border text-sm";
  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 mt-5" aria-label="Pages">
      {page > 1 ? (
        <Link href={hrefFor(filters, page - 1)} className={`${base} border-ink/15 hover:border-clay-400`}>
          ← Previous
        </Link>
      ) : (
        <span className={`${base} border-transparent text-ink/30`}>← Previous</span>
      )}
      {list.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - list[i - 1] > 1 && <span className="text-ink/40">…</span>}
          {n === page ? (
            <span className={`${base} border-clay-600 bg-clay-600 text-white font-medium`} aria-current="page">
              {n}
            </span>
          ) : (
            <Link href={hrefFor(filters, n)} className={`${base} border-ink/15 hover:border-clay-400`}>
              {n}
            </Link>
          )}
        </span>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(filters, page + 1)} className={`${base} border-ink/15 hover:border-clay-400`}>
          Next →
        </Link>
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
