import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrderRow from "@/components/OrderRow";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, amount_paid, receipt_path, created_at, reject_reason, profiles(email), products(title)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">Orders</h1>
      <div className="space-y-3">
        {orders?.map((order: any) => (
          <OrderRow key={order.id} order={order} />
        ))}
        {(!orders || orders.length === 0) && (
          <p className="text-ink/50">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
