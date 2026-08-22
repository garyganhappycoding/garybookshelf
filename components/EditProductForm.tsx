"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProductRecord } from "@/actions/admin";

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"file" | "link">(product.external_link ? "link" : "file");

  async function handleSubmit(formData: FormData) {
    setError(null);
    setUploading(true);
    const supabase = createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const newImages = (formData.getAll("images") as File[]).filter((f) => f && f.size > 0);
    const newAsset = formData.get("asset") as File | null;
    const link = formData.get("link") as string | null;

    let imageUrls: string[] | null = null;
    if (newImages.length > 0) {
      imageUrls = [];
      for (const file of newImages) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file);
        if (upErr) {
          setError(`Image upload failed: ${upErr.message}`);
          setUploading(false);
          return;
        }
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrls.push(data.publicUrl);
      }
    }

    let filePath: string | null = null;
    let externalLink: string | null = null;

    if (deliveryType === "link" && link && link.trim() !== "") {
      externalLink = link.trim();
    } else if (deliveryType === "file" && newAsset && newAsset.size > 0) {
      const ext = newAsset.name.split(".").pop();
      filePath = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("digital-assets").upload(filePath, newAsset);
      if (upErr) {
        setError(`Asset upload failed: ${upErr.message}`);
        setUploading(false);
        return;
      }
    }

    setUploading(false);
    startTransition(async () => {
      const result = await updateProductRecord(product.id, {
        title,
        description,
        price,
        category,
        imageUrl: imageUrls ? imageUrls[0] : undefined,
        imageUrls: imageUrls || undefined,
        filePath: filePath || undefined,
        externalLink: externalLink || undefined,
      });
      if (result?.error) setError(result.error);
      else router.push("/admin/products");
    });
  }

  return (
    <form action={handleSubmit} className="card space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input name="title" defaultValue={product.title} required className="w-full border border-ink/15 rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" defaultValue={product.description} rows={3} className="w-full border border-ink/15 rounded-lg px-3 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Price (RM)</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue={product.price_myr} required className="w-full border border-ink/15 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select name="category" defaultValue={product.category} className="w-full border border-ink/15 rounded-lg px-3 py-2">
            <option value="notes">Notes</option>
            <option value="course">Course</option>
            <option value="template">Template</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Replace images (optional, pick multiple)</label>
        <input name="images" type="file" accept="image/*" multiple className="w-full text-sm" />
        <p className="text-xs text-ink/50 mt-1">Leave empty to keep current images.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Delivery</label>
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setDeliveryType("file")} className={deliveryType === "file" ? "btn-primary !py-1.5 !px-4 text-sm" : "btn-secondary !py-1.5 !px-4 text-sm"}>
            Upload a file
          </button>
          <button type="button" onClick={() => setDeliveryType("link")} className={deliveryType === "link" ? "btn-primary !py-1.5 !px-4 text-sm" : "btn-secondary !py-1.5 !px-4 text-sm"}>
            Paste a link
          </button>
        </div>
        {deliveryType === "file" ? (
          <>
            <input name="asset" type="file" className="w-full text-sm" />
            <p className="text-xs text-ink/50 mt-1">Leave empty to keep current file.</p>
          </>
        ) : (
          <input name="link" type="url" defaultValue={product.external_link || ""} placeholder="https://..." className="w-full border border-ink/15 rounded-lg px-3 py-2" />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending || uploading} className="btn-primary disabled:opacity-60">
        {uploading ? "Uploading..." : isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}