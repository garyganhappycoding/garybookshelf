import Link from 'next/link';
import { getResourcesByCategory } from '@/actions/resources';

export default async function FreeResourcesCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  const resources = await getResourcesByCategory('free_resource', category);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/free-resources" className="text-sm text-amber-700 hover:underline">
        ← All categories
      </Link>
      <h1 className="font-caveat text-4xl text-amber-800 mt-2 mb-8">{category}</h1>

      {resources.length === 0 ? (
        <p className="text-stone-500">Nothing in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-stone-200 overflow-hidden hover:border-amber-400 transition-colors"
            >
              {r.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.thumbnail_url} alt={r.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h2 className="font-semibold text-stone-800">{r.title}</h2>
                {r.description && <p className="text-sm text-stone-500 mt-1">{r.description}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}