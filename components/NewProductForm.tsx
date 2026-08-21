"use client";

import { useRef, useState, useTransition } from "react";
import { createProduct } from "@/actions/admin";

export default function NewProductForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createProduct(formData);
          if (result?.error) setError(result.error);
          else formRef.current?.reset();
        });
      }}
      className="card space-y-3"
    >
      <p className="font-medium">Add a new item</p>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input name="title" required className="w-full border border-ink/15 rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" rows={3} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Price (RM)</label>
          <input name="price" type="number" step="0.01" min="0" required className="w-full border border-ink/15 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="category" className="w-full border border-ink/15 rounded-lg px-3 py-2">
            <option value="notes">Notes</option>
            <option value="course">Course</option>
            <option value="template">Template</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover image (optional)</label>
        <input name="image" type="file" accept="image/*" className="w-full text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Digital file to deliver (PDF/ZIP)</label>
        <input name="asset" type="file" required className="w-full text-sm" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
        {isPending ? "Uploading..." : "Add product"}
      </button>
    </form>
  );
}
