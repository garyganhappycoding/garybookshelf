import Link from 'next/link';
import { getResourceCategorySummaries } from '@/actions/resources';

export default async function ContentHubPage() {
  const categories = await getResourceCategorySummaries('content_hub');

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-caveat text-4xl text-amber-800 mb-2">Content Hub</h1>
      <p className="text-stone-600 mb-8">Browse by category.</p>

      {categories.length === 0 ? (
        <p className="text-stone-500">No content yet — check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map(({ category, count }) => (
            <Link
              key={category}
              href={`/content-hub/${encodeURIComponent(category)}`}
              className="rounded-xl border border-stone-200 bg-amber-50 p-6 hover:border-amber-400 transition-colors"
            >
              <h2 className="text-lg font-semibold text-stone-800">{category}</h2>
              <p className="text-sm text-stone-500">
                {count} item{count === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}