import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import ProductGallery from "@/components/ProductGallery";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) return notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const images: string[] = product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [];

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 grid sm:grid-cols-2 gap-8">
      <div>
        <ProductGallery images={images} title={product.title} />
        <p className="text-xs text-clay-600 uppercase tracking-wide mb-1 mt-4">{product.category}</p>
        <h1 className="text-2xl font-medium mb-2">{product.title}</h1>
        <p className="text-ink/70 leading-relaxed mb-4 whitespace-pre-line">{product.description}</p>
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