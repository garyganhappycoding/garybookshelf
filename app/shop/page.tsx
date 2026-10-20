import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import SpeakingFreeVsPaid from "@/components/SpeakingFreeVsPaid";

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
      <p className="text-ink/60 mb-8">
        Notes and resources, delivered straight to your inbox.{" "}
        <a href="#speaking-free-vs-paid" className="text-clay-600 underline">Not sure about the Speaking AI? Compare free and paid.</a>
      </p>

      {products && products.length > 0 ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-ink/50">Nothing here yet — check back soon.</p>
      )}

      <SpeakingFreeVsPaid
        packs={(products ?? [])
          .filter((p) => p.speaking_pack_attempts)
          .map((p) => ({
            id: p.id,
            title: p.title,
            price_myr: p.price_myr,
            speaking_pack_attempts: p.speaking_pack_attempts,
            hasNotes: Boolean(p.external_link || p.file_path),
          }))}
      />
    </div>
  );
}
