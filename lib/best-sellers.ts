import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";

// Published products, best seller first. Only APPROVED orders count: rejected orders (wrong receipt or a
// problem with the payment) and orders still waiting are left out. Server-only (uses the admin client for the counts).
export async function getProductsBySales() {
  const { data: products } = await createPublicClient()
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  const list = products ?? [];
  if (list.length === 0) return [];

  const admin = createAdminClient();
  const counts = await Promise.all(
    list.map(async (p) => {
      const { count } = await admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("product_id", p.id)
        .eq("status", "completed");
      return count ?? 0;
    })
  );
  return list
    .map((p, i) => ({ ...p, sold: counts[i] }))
    .sort((a, b) => b.sold - a.sold);
}
