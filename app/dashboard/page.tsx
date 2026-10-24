import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import DownloadButton from "@/components/DownloadButton";

const statusLabel: Record<string, string> = {
  pending_verification: "Pending verification",
  completed: "Approved",
  rejected: "Rejected",
};

const statusColor: Record<string, string> = {
  pending_verification: "text-amber-700 bg-amber-100",
  completed: "text-sage-600 bg-sage-400/15",
  rejected: "text-red-600 bg-red-100",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, amount_paid, created_at, reject_reason, link_opened_at, products(title, external_link, file_path, speaking_pack_attempts)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // attempts left in the student's Speaking pack, so the dashboard can invite them to use it
  const { data: pack } = await supabase.rpc("speaking_pack_status");
  const packRow = Array.isArray(pack) ? pack[0] : pack;
  const packLeft: number = packRow?.pack_left ?? 0;
  const packExpiry: string | null = packRow?.next_expiry ?? null;
  const hasCompleted = (orders ?? []).some((o: any) => o.status === "completed");

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">My orders</h1>

      {packLeft > 0 && (
        <div className="card !border-clay-400 mb-6">
          <p className="font-medium mb-1">🎤 You have {packLeft} speaking attempts ready</p>
          <p className="text-sm text-ink/70 mb-3">
            {packExpiry ? `They are yours until ${new Date(packExpiry).toLocaleDateString("en-MY", { day: "numeric", month: "long" })}. ` : ""}
            Your attempts give the full report: every problem, phrase upgrades, your sentences rewritten with phrases from Gary&apos;s notes, and your pace and fillers.
            Do your first one now, it takes about 3 minutes.
          </p>
          <Link href="/speaking" className="btn-primary">Do my first attempt</Link>
        </div>
      )}

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{order.products?.title}</p>
                <p className="text-sm text-ink/60">RM {Number(order.amount_paid).toFixed(2)}</p>
                {order.status === "rejected" && order.reject_reason && (
                  <p className="text-sm text-red-600 mt-1">Reason: {order.reject_reason}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[order.status]}`}>
                  {statusLabel[order.status]}
                </span>
                {order.status === "completed" && order.products?.speaking_pack_attempts && (
                  <Link href="/speaking" className="btn-secondary !py-1.5">
                    Open Speaking
                  </Link>
                )}
                {/* a plain speaking pack has nothing to download; a notes bundle with attempts shows both buttons */}
                {order.status === "completed" && (!order.products?.speaking_pack_attempts || order.products?.external_link || order.products?.file_path) && (
                  <DownloadButton
                    orderId={order.id}
                    initiallyOpened={Boolean(order.link_opened_at && order.products?.external_link)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ink/60">
          No orders yet. New here? <Link href="/start" className="text-clay-600 underline">Start here</Link>, try the{" "}
          <Link href="/speaking" className="text-clay-600 underline">free Speaking AI</Link>, or head to the{" "}
          <Link href="/shop" className="text-clay-600 underline">shop</Link>.
        </p>
      )}
      {hasCompleted && (
        <p className="text-sm text-ink/60 mt-8">
          Got your notes or attempts? <Link href="/feedback" className="text-clay-600 underline">Tell Gary how it went</Link>. He reads every message.
        </p>
      )}
    </div>
  );
}
