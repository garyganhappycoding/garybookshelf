"use client";

import { useState } from "react";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
};

export default function ResourceCategoryAccordion({
  resources,
  variant = "free",
}: {
  resources: Resource[];
  variant?: "free" | "content";
}) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const grouped = new Map<string, Resource[]>();
  for (const r of resources) {
    const key = r.category || "Uncategorized";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }
  const categories = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

  if (categories.length === 0) {
    return <p className="text-ink/50 text-sm">Add resources from /admin/resources.</p>;
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const items = grouped.get(category)!;
        const isOpen = openCategory === category;

        return (
          <div key={category} className="card">
            <button
              type="button"
              onClick={() => setOpenCategory(isOpen ? null : category)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="font-medium">{category}</span>
              <span className="text-sm text-ink/50">
                {items.length} item{items.length === 1 ? "" : "s"} {isOpen ? "▲" : "▼"}
              </span>
            </button>

            {isOpen && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                {items.map((r) =>
                  variant === "content" ? (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-ink/10 p-4 hover:border-clay-400 transition-colors"
                    >
                      <p className="font-medium mb-1">{r.title}</p>
                      {r.description && <p className="text-sm text-ink/60">{r.description}</p>}
                    </a>
                  ) : (
                    <div key={r.id} className="rounded-xl border border-ink/10 p-4">
                      <p className="font-medium mb-1">{r.title}</p>
                      {r.description && <p className="text-sm text-ink/60 mb-3">{r.description}</p>}
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-clay-600 text-sm font-medium"
                      >
                        Download &rarr;
                      </a>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
