import Link from "next/link";
import { getResourceCategorySummaries } from "@/actions/resources";

export default async function ContentHubPage() {
  const categories = await getResourceCategorySummaries("content_hub");

  return (
    <main className="max-w-4xl mx-auto px-5 py-14">
      <h1 className="font-hand text-4xl text-clay-700 mb-2">Content Hub</h1>
      <p className="text-ink/60 mb-8">Browse by category.</p>

      {categories.length === 0 ? (
        <p className="text-ink/50">No content yet — check back soon.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map(({ category, count }) => (
            <Link
              key={category}
              href={`/content-hub/${encodeURIComponent(category)}`}
              className="card hover:border-clay-400 transition-colors"
            >
              <h2 className="text-lg font-medium">{category}</h2>
              <p className="text-sm text-ink/60">
                {count} item{count === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}