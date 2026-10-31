import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addAttempts } from "@/actions/students";
import StudentOrderActions from "@/components/StudentOrderActions";
import { productFiles } from "@/lib/product-files";

export const metadata = { title: "Students · Admin" };
export const dynamic = "force-dynamic";

const myDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur", day: "numeric", month: "short", year: "numeric" });

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/");

  const q = ((await searchParams).q ?? "").trim().replace(/[%,()]/g, "");
  const admin = createAdminClient();

  let query = admin.from("profiles").select("id, email, created_at").order("created_at", { ascending: false }).limit(30);
  if (q) query = query.ilike("email", `%${q}%`);
  const { data: students } = await query;
  const ids = (students ?? []).map((s) => s.id);

  const [{ data: orders }, { data: packs }, { data: attempts }] = ids.length
    ? await Promise.all([
        admin.from("orders").select("id, user_id, status, amount_paid, created_at, receipt_path, reject_reason, products(title, personalize_pdf, product_files, file_path)").in("user_id", ids).order("created_at", { ascending: false }),
        admin.from("speaking_packs").select("user_id, kind, attempts_total, attempts_used, expires_at").in("user_id", ids),
        admin.from("speaking_attempts").select("user_id").in("user_id", ids).limit(20000),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  // locked-PDF downloads still counting (not reset) and, for payments waiting for you, a private link to the receipt
  const orderIds = (orders ?? []).map((o: any) => o.id);
  const { data: dls } = orderIds.length
    ? await admin.from("file_downloads").select("order_id, file_index").in("order_id", orderIds).eq("released", false)
    : { data: [] as { order_id: string; file_index: number }[] };
  const downloadedFiles = new Map<string, number>();
  for (const d of dls ?? []) downloadedFiles.set(d.order_id, (downloadedFiles.get(d.order_id) ?? 0) + 1);
  const receiptUrl = new Map<string, string>();
  for (const o of (orders ?? []) as any[]) {
    if (o.status === "pending_verification" && o.receipt_path) {
      const { data: signed } = await admin.storage.from("receipts").createSignedUrl(o.receipt_path, 600);
      if (signed?.signedUrl) receiptUrl.set(o.id, signed.signedUrl);
    }
  }

  const now = Date.now();
  const attemptCount = new Map<string, number>();
  for (const a of attempts ?? []) attemptCount.set(a.user_id, (attemptCount.get(a.user_id) ?? 0) + 1);

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <Link href="/admin" className="text-sm text-clay-600">&larr; Admin</Link>
      <h1 className="text-2xl font-medium mt-2 mb-1">Students</h1>
      <p className="text-ink/60 text-sm mb-5">Search by email. Shows what they bought and their Speaking attempts, and lets you add attempts by hand.</p>

      <form className="flex gap-2 mb-6">
        <input name="q" defaultValue={q} placeholder="Search email, e.g. gmail.com or ali" className="flex-1 border border-ink/15 rounded-lg px-3 py-2" />
        <button className="btn-primary">Search</button>
      </form>

      {!q && <p className="text-xs text-ink/50 mb-3">Showing the 30 newest sign-ups. Search to find someone else.</p>}
      {students?.length === 0 && <p className="text-ink/50">No student found.</p>}

      <div className="space-y-3">
        {students?.map((s) => {
          const mine = (orders ?? []).filter((o) => o.user_id === s.id);
          const live = (packs ?? []).filter((p) => p.user_id === s.id && new Date(p.expires_at).getTime() > now);
          const left = live.reduce((n, p) => n + Math.max(0, p.attempts_total - p.attempts_used), 0);
          const paidLeft = live.filter((p) => p.kind === "purchased").reduce((n, p) => n + Math.max(0, p.attempts_total - p.attempts_used), 0);
          const soonest = live.filter((p) => p.attempts_total > p.attempts_used).map((p) => p.expires_at).sort()[0];

          return (
            <div key={s.id} className="card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium break-all">{s.email}</p>
                <p className="text-xs text-ink/50">joined {myDate(s.created_at)}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Bought</p>
                  {mine.length === 0 ? (
                    <p className="text-ink/50">Nothing yet</p>
                  ) : (
                    <ul className="space-y-1">
                      {mine.map((o: any) => (
                        <li key={o.id} className="border-b border-ink/5 pb-2 last:border-0">
                          <div className="flex justify-between gap-3">
                            <span>
                              {o.products?.title ?? "Product"}{" "}
                              <span className="text-xs text-ink/50">{myDate(o.created_at)}</span>
                            </span>
                            <span className={o.status === "completed" ? "text-sage-600" : o.status === "rejected" ? "text-red-600" : "text-amber-700"}>
                              RM {Number(o.amount_paid).toFixed(0)} · {o.status === "pending_verification" ? "pending" : o.status}
                            </span>
                          </div>
                          {receiptUrl.get(o.id) && (
                            <a href={receiptUrl.get(o.id)} target="_blank" rel="noreferrer" className="text-xs text-clay-700 underline">View receipt</a>
                          )}
                          {o.status === "rejected" && o.reject_reason && <p className="text-xs text-ink/50">Reason: {o.reject_reason}</p>}
                          <StudentOrderActions
                            orderId={o.id}
                            status={o.status}
                            lockedPdf={Boolean(o.products?.personalize_pdf)}
                            downloaded={downloadedFiles.get(o.id) ?? 0}
                            files={productFiles(o.products ?? {}).length}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Speaking</p>
                  <p>
                    <strong>{left}</strong> pack attempts left{paidLeft ? ` (${paidLeft} paid)` : ""}
                    {soonest && <span className="text-xs text-ink/50"> · next expiry {myDate(soonest)}</span>}
                  </p>
                  <p className="text-ink/60">{attemptCount.get(s.id) ?? 0} attempts made in total</p>
                </div>
              </div>

              <form action={addAttempts} className="flex flex-wrap items-end gap-2 mt-4 pt-3 border-t border-ink/10 text-sm">
                <input type="hidden" name="userId" value={s.id} />
                <label className="block">
                  <span className="block text-xs text-ink/50">Add attempts</span>
                  <input name="count" type="number" min={1} max={200} defaultValue={5} required className="w-20 border border-ink/15 rounded-lg px-2 py-1.5" />
                </label>
                <label className="block">
                  <span className="block text-xs text-ink/50">Valid days</span>
                  <input name="days" type="number" min={1} max={365} defaultValue={30} className="w-20 border border-ink/15 rounded-lg px-2 py-1.5" />
                </label>
                <label className="block">
                  <span className="block text-xs text-ink/50">Type</span>
                  <select name="kind" className="border border-ink/15 rounded-lg px-2 py-1.5">
                    <option value="bonus">Bonus (free report)</option>
                    <option value="purchased">Paid (full report)</option>
                  </select>
                </label>
                <button className="btn-secondary !py-1.5">Add</button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
