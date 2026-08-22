import Link from "next/link";
import { getResourcesByCategory } from "@/actions/resources";

export default async function ContentHubCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  const resources = await getResourcesByCategory("content_hub", category);

  return (
    <main className="max-w-4xl mx-auto px-5 py-14">
      <Link href="/content-hub" className="text-sm text-clay-600 hover:underline">
        ← All categories
      </Link>
      <h1 className="font-hand text-4xl text-clay-700 mt-2 mb-8">{category}</h1>

      {resources.length === 0 ? (
        <p className="text-ink/50">Nothing in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-ink/10 bg-white overflow-hidden hover:border-clay-400 transition-colors"
            >
              {r.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.thumbnail_url} alt={r.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h2 className="font-medium">{r.title}</h2>
                {r.description && <p className="text-sm text-ink/60 mt-1">{r.description}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}