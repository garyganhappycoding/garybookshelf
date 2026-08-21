import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) return notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 grid sm:grid-cols-2 gap-8">
      <div>
        <div className="aspect-[4/3] rounded-xl bg-cream-100 mb-4 overflow-hidden">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          )}
        </div>
        <p className="text-xs text-clay-600 uppercase tracking-wide mb-1">{product.category}</p>
        <h1 className="text-2xl font-medium mb-2">{product.title}</h1>
        <p className="text-ink/70 leading-relaxed mb-4">{product.description}</p>
        <p className="text-xl font-medium text-clay-700">RM {Number(product.price_myr).toFixed(2)}</p>
      </div>

      <div>
        <CheckoutForm
          productId={product.id}
          amount={Number(product.price_myr)}
          isLoggedIn={!!user}
        />
      </div>
    </div>
  );
}
