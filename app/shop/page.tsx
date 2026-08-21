import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-1">Shop</h1>
      <p className="text-ink/60 mb-8">Notes and resources, delivered straight to your inbox.</p>

      {products && products.length > 0 ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-ink/50">Nothing here yet — check back soon.</p>
      )}
    </div>
  );
}
