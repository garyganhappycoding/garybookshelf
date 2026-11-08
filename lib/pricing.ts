import type { SupabaseClient } from "@supabase/supabase-js";

export type MyPrice = {
  price: number;
  normalPrice: number;
  discounted: boolean;
  // why the price is what it is, for the buyer to read
  note: string | null;
};

/**
 * The price THIS logged-in buyer pays. Always worked out on the server from the orders table, never from the browser.
 * Member price applies when: the product has a member price set, the buyer has an APPROVED (completed) order for the
 * qualifying product, and they have not already used the discount (pending or approved order with discount_applied).
 */
export async function getPriceForUser(supabase: SupabaseClient, productId: string, userId: string | null): Promise<MyPrice | null> {
  const { data: product } = await supabase
    .from("products")
    .select("price_myr, member_discount_product_id, member_price_myr")
    .eq("id", productId)
    .maybeSingle();
  if (!product) return null;

  const normalPrice = Number(product.price_myr);
  const base: MyPrice = { price: normalPrice, normalPrice, discounted: false, note: null };
  const memberPrice = product.member_price_myr == null ? null : Number(product.member_price_myr);
  if (!product.member_discount_product_id || memberPrice == null || memberPrice >= normalPrice) return base;

  const { data: qualifying } = await supabase.from("products").select("title").eq("id", product.member_discount_product_id).maybeSingle();
  const title = qualifying?.title ?? "the qualifying product";
  const hint = `RM ${memberPrice.toFixed(2)} if you already bought ${title}.`;
  if (!userId) return { ...base, note: `Log in to see your price. ${hint}` };

  const { data: bought } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", product.member_discount_product_id)
    .eq("status", "completed")
    .limit(1);
  if (!bought?.length) return { ...base, note: hint };

  const { data: used } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("discount_applied", true)
    .in("status", ["pending_verification", "completed"])
    .limit(1);
  if (used?.length) return { ...base, note: "Your one-time member discount has already been used." };

  return { price: memberPrice, normalPrice, discounted: true, note: `Member price: you already bought ${title}.` };
}
