'use client';

import { useEffect, useState, useTransition } from 'react';
import { createResource, getResourceCategories, type ResourceType } from '@/actions/resources';

const NEW_CATEGORY_VALUE = '__new__';

export default function NewResourceForm({ defaultType }: { defaultType?: ResourceType }) {
  const [type, setType] = useState<ResourceType>(defaultType ?? 'content_hub');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getResourceCategories(type).then((cats) => {
      setCategories(cats);
      setSelectedCategory('');
      setIsAddingCategory(false);
    });
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
      const result = await createResource(formData);
      if (result?.error) {
        setMessage(`Error: ${result.error}`);
        return;
      }
      setMessage('Resource added!');
      setSelectedCategory('');
      setIsAddingCategory(false);
      const form = document.getElementById('new-resource-form') as HTMLFormElement | null;
      form?.reset();
      const refreshed = await getResourceCategories(type);
      setCategories(refreshed);
    });
  }

  return (
    <form id="new-resource-form" action={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Section</label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="w-full rounded-md border border-stone-300 px-3 py-2"
        >
          <option value="content_hub">Content Hub</option>
          <option value="free_resource">Free Resource</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
        <select
          name={isAddingCategory ? undefined : 'category'}
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full rounded-md border border-stone-300 px-3 py-2"
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
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2"
              required
              autoFocus
            />
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
        <input name="title" required className="w-full rounded-md border border-stone-300 px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
        <textarea name="description" rows={3} className="w-full rounded-md border border-stone-300 px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Link (URL)</label>
        <input name="url" type="url" required className="w-full rounded-md border border-stone-300 px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Thumbnail URL (optional)</label>
        <input name="thumbnail_url" type="url" className="w-full rounded-md border border-stone-300 px-3 py-2" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {isPending ? 'Adding...' : 'Add Resource'}
      </button>

      {message && <p className="text-sm text-stone-600">{message}</p>}
    </form>
  );
}