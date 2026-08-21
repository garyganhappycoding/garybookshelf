"use client";

import { useRef, useState, useTransition } from "react";
import { createResource } from "@/actions/admin";

export default function NewResourceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createResource(formData);
          if (result?.error) setError(result.error);
          else formRef.current?.reset();
        });
      }}
      className="card space-y-3"
    >
      <p className="font-medium">Add an item</p>

      <div>
        <label className="block text-sm font-medium mb-1">Section</label>
        <select name="type" className="w-full border border-ink/15 rounded-lg px-3 py-2">
          <option value="content_hub">Content hub</option>
          <option value="free_resource">Free resources</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input name="title" required className="w-full border border-ink/15 rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input name="description" className="w-full border border-ink/15 rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Link (Google Drive share link, Instagram post, etc.)</label>
        <input name="url" type="url" required placeholder="https://drive.google.com/..." className="w-full border border-ink/15 rounded-lg px-3 py-2" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
        {isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}