import Link from "next/link";

type Product = {
  id: string;
  title: string;
  description: string | null;
  price_myr: number;
  image_url: string | null;
  category: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.id}`} className="card block hover:border-clay-400 transition-colors">
      <div className="aspect-[4/3] rounded-xl bg-cream-100 mb-3 overflow-hidden">
        {product.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        )}
      </div>
      <p className="text-xs text-clay-600 uppercase tracking-wide mb-1">{product.category}</p>
      <p className="font-medium mb-1">{product.title}</p>
      <p className="text-sm text-ink/60 mb-2 line-clamp-2">{product.description}</p>
      <p className="font-medium text-clay-700">RM {product.price_myr.toFixed(2)}</p>
    </Link>
  );
}
