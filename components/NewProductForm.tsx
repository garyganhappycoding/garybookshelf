"use client";

import { useRef, useState, useTransition } from "react";
import { createProduct } from "@/actions/admin";

export default function NewProductForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"file" | "link">("file");

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
        <label className="block text-sm font-medium mb-1">Images (optional, pick multiple)</label>
        <input name="images" type="file" accept="image/*" multiple className="w-full text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">How will you deliver this?</label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setDeliveryType("file")}
            className={deliveryType === "file" ? "btn-primary !py-1.5 !px-4 text-sm" : "btn-secondary !py-1.5 !px-4 text-sm"}
          >
            Upload a file
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType("link")}
            className={deliveryType === "link" ? "btn-primary !py-1.5 !px-4 text-sm" : "btn-secondary !py-1.5 !px-4 text-sm"}
          >
            Paste a link
          </button>
        </div>

        <input type="hidden" name="deliveryType" value={deliveryType} />

        {deliveryType === "file" ? (
          <input name="asset" type="file" className="w-full text-sm" />
        ) : (
          <input
            name="link"
            type="url"
            placeholder="https://drive.google.com/..."
            className="w-full border border-ink/15 rounded-lg px-3 py-2"
          />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-60">
        {isPending ? "Uploading..." : "Add product"}
      </button>
    </form>
  );
}