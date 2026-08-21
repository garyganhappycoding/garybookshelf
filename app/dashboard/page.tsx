import { createClient } from "@/lib/supabase/server";
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
    .select("id, status, amount_paid, created_at, reject_reason, products(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">My orders</h1>

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
                {order.status === "completed" && <DownloadButton orderId={order.id} />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ink/50">No orders yet. Head to the shop to get started.</p>
      )}
    </div>
  );
}
