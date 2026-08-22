"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateResource, getResourceCategories, type ResourceType } from "@/actions/resources";

const NEW_CATEGORY_VALUE = "__new__";

type Resource = {
  id: string;
  type: ResourceType;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  category: string;
};

export default function EditResourceForm({ resource }: { resource: Resource }) {
  const router = useRouter();
  const [type, setType] = useState<ResourceType>(resource.type);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(resource.category);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getResourceCategories(type).then((cats) => {
      setCategories(cats);
      if (type === resource.type && cats.includes(resource.category)) {
        setSelectedCategory(resource.category);
      } else if (cats.length > 0) {
        setSelectedCategory(cats[0]);
      } else {
        setSelectedCategory("");
      }
      setIsAddingCategory(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function handleCategoryChange(value: string) {
    if (value === NEW_CATEGORY_VALUE) {
      setIsAddingCategory(true);
      setSelectedCategory(NEW_CATEGORY_VALUE);
    } else {
      setIsAddingCategory(false);
      setSelectedCategory(value);
    }
  }

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateResource(resource.id, formData);
      if (result?.error) {
        setMessage(`Error: ${result.error}`);
        return;
      }
      router.push("/admin/resources");
    });
  }

  return (
    <form action={handleSubmit} className="card space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-ink/80 mb-1">Section</label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 bg-white"
        >
          <option value="content_hub">Content Hub</option>
          <option value="free_resource">Free Resource</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/80 mb-1">Category</label>
        <select
          name={isAddingCategory ? undefined : "category"}
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full rounded-lg border border-ink/15 px-3 py-2 bg-white"
          required={!isAddingCategory}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value={NEW_CATEGORY_VALUE}>+ Add new category</option>
        </select>

        {isAddingCategory && (
          <>
            <input type="hidden" name="category" value={NEW_CATEGORY_VALUE} />
            <input
              type="text"
              name="new_category"
              placeholder="Type new category name"
              className="mt-2 w-full rounded-lg border border-ink/15 px-3 py-2"
              required
              autoFocus
            />
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/80 mb-1">Title</label>
        <input
          name="title"
          defaultValue={resource.title}
          required
          className="w-full rounded-lg border border-ink/15 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/80 mb-1">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={resource.description ?? ""}
          className="w-full rounded-lg border border-ink/15 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/80 mb-1">Link (URL)</label>
        <input
          name="url"
          type="url"
          defaultValue={resource.url}
          required
          className="w-full rounded-lg border border-ink/15 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink/80 mb-1">
          Thumbnail URL (optional — leave blank to auto-detect from the link)
        </label>
        <input
          name="thumbnail_url"
          type="url"
          defaultValue={resource.thumbnail_url ?? ""}
          className="w-full rounded-lg border border-ink/15 px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
          {isPending ? "Saving..." : "Save changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/resources")} className="btn-secondary">
          Cancel
        </button>
      </div>

      {message && <p className="text-sm text-clay-700">{message}</p>}
    </form>
  );
}