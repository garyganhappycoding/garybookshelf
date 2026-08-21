import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_verification");

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">Admin</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/products" className="card block hover:border-clay-400">
          <p className="font-medium mb-1">Products</p>
          <p className="text-sm text-ink/60">Add and manage what's for sale</p>
        </Link>
        <Link href="/admin/orders" className="card block hover:border-clay-400">
          <p className="font-medium mb-1">Orders</p>
          <p className="text-sm text-ink/60">
            {pendingCount ? `${pendingCount} pending verification` : "Approve or reject payments"}
          </p>
        </Link>
        <Link href="/admin/resources" className="card block hover:border-clay-400">
          <p className="font-medium mb-1">Content & Resources</p>
          <p className="text-sm text-ink/60">Manage content hub and free downloads</p>
        </Link>
      </div>
    </div>
  );
}