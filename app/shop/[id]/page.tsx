import { createPublicClient } from "@/lib/supabase/public";
import { notFound } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { getProductsBySales } from "@/lib/best-sellers";

export async function generateStaticParams() {
  return [];
}

export const revalidate = 300;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createPublicClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) return notFound();

  // other products, best sellers first. A bundle that includes THIS product's notes (same link) is offered as an upgrade.
  const others = (await getProductsBySales()).filter((p) => p.id !== product.id);
  const upgrade =
    !product.speaking_pack_attempts && product.external_link
      ? others.find((p) => p.speaking_pack_attempts && p.external_link === product.external_link)
      : undefined;
  const alsoBought = others.filter((p) => p.id !== upgrade?.id).slice(0, 3);

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
        />
      </div>

      {upgrade && (
        <Link href={`/shop/${upgrade.id}`} className="card sm:col-span-2 !border-clay-400 hover:bg-cream-50">
          <p className="text-xs uppercase tracking-wide text-clay-700 mb-1">Better value</p>
          <p className="font-medium">
            Get these notes plus {upgrade.speaking_pack_attempts} Speaking AI attempts for RM {Number(upgrade.price_myr).toFixed(2)}
          </p>
          <p className="text-sm text-ink/65">Practise your speaking and see your report with phrases from the same notes. Tap to see the bundle.</p>
        </Link>
      )}

      {alsoBought.length > 0 && (
        <div className="sm:col-span-2 mt-4">
          <h2 className="text-lg font-medium mb-3">Students also bought</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {alsoBought.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}