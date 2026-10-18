import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
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
  fail_detail: string | null;
  duration_sec: number | null;
  word_count: number | null;
  pack_id: string | null;
  created_at: string;
};

const myDay = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" }); // YYYY-MM-DD in Malaysia time

const sideColor = { student: "bg-amber-100 text-amber-800", ai: "bg-red-100 text-red-700", server: "bg-ink/10 text-ink/70" };

export default async function AdminSpeakingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const admin = createAdminClient();
  const { data } = await admin
    .from("speaking_attempts")
    .select("id,user_id,card_id,status,total_score,fail_reason,fail_detail,duration_sec,word_count,pack_id,created_at")
    .order("created_at", { ascending: false })
    .limit(2000);
  const rows = (data ?? []) as Row[];

  const { data: profiles } = await admin.from("profiles").select("id,email");
  const email = new Map((profiles ?? []).map((p: any) => [p.id, p.email as string]));

  // Paid = the student has bought a Speaking pack. "active" = a pack that has not expired yet.
  const { data: packs } = await admin.from("speaking_packs").select("user_id,expires_at");
  const plan = new Map<string, "active" | "expired">();
  for (const p of packs ?? []) {
    const active = new Date(p.expires_at).getTime() > Date.now();
    if (active || !plan.has(p.user_id)) plan.set(p.user_id, active ? "active" : "expired");
  }

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
    <div className="max-w-4xl mx-auto px-5 py-14 space-y-8">
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

      <section className="card overflow-x-auto">
        <h2 className="font-medium mb-3">Recent attempts</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-ink/50">
            <tr>
              <th className="pb-2">When</th>
              <th>Student</th>
              <th>Plan</th>
              <th>Question</th>
              <th>Result</th>
              <th>Speech</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 40).map((r) => (
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
                  {r.fail_detail && <p className="text-xs text-ink/50 max-w-xs break-words">{r.fail_detail}</p>}
                </td>
                <td className="text-ink/60 whitespace-nowrap">{r.duration_sec != null ? `${Math.round(r.duration_sec)}s · ${r.word_count} words` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
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
