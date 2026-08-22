"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createProductRecord } from "@/actions/admin";

export default function NewProductForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<"file" | "link">("file");
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setPreviews(files.map((file) => ({ url: URL.createObjectURL(file), file })));
    setCoverIndex(0);
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setUploading(true);
    const supabase = createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const assetFile = formData.get("asset") as File | null;
    const link = formData.get("link") as string | null;

    // put the chosen cover image first so it becomes image_url
    const orderedFiles = previews.length > 0
      ? [previews[coverIndex].file, ...previews.filter((_, i) => i !== coverIndex).map((p) => p.file)]
      : [];

    const imageUrls: string[] = [];
    for (const file of orderedFiles) {
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

    let filePath: string | null = null;
    let externalLink: string | null = null;

    if (deliveryType === "file") {
      if (!assetFile || assetFile.size === 0) {
        setError("Please attach the digital file to deliver to buyers.");
        setUploading(false);
        return;
      }
      const ext = assetFile.name.split(".").pop();
      filePath = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("digital-assets").upload(filePath, assetFile);
      if (upErr) {
        setError(`Asset upload failed: ${upErr.message}`);
        setUploading(false);
        return;
      }
    } else {
      if (!link || link.trim() === "") {
        setError("Please paste the link you want to deliver to buyers.");
        setUploading(false);
        return;
      }
      externalLink = link.trim();
    }

    setUploading(false);
    startTransition(async () => {
      const result = await createProductRecord({
        title,
        description,
        price,
        category,
        imageUrl: imageUrls[0] || null,
        imageUrls,
        filePath,
        externalLink,
      });
      if (result?.error) setError(result.error);
      else {
        formRef.current?.reset();
        setPreviews([]);
        setCoverIndex(0);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="card space-y-3">
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
        <input name="images" type="file" accept="image/*" multiple className="w-full text-sm" onChange={handleImagesChange} />

        {previews.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-ink/50 mb-2">Click an image to set it as the cover/thumbnail:</p>
            <div className="flex gap-2 flex-wrap">
              {previews.map((p, i) => (
                <button
                  type="button"
                  key={p.url}
                  onClick={() => setCoverIndex(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    i === coverIndex ? "border-clay-600" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  {i === coverIndex && (
                    <span className="absolute bottom-0 inset-x-0 bg-clay-600 text-white text-[10px] text-center">
                      Cover
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">How will you deliver this?</label>
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setDeliveryType("file")} className={deliveryType === "file" ? "btn-primary !py-1.5 !px-4 text-sm" : "btn-secondary !py-1.5 !px-4 text-sm"}>
            Upload a file
          </button>
          <button type="button" onClick={() => setDeliveryType("link")} className={deliveryType === "link" ? "btn-primary !py-1.5 !px-4 text-sm" : "btn-secondary !py-1.5 !px-4 text-sm"}>
            Paste a link
          </button>
        </div>
        <input type="hidden" name="deliveryType" value={deliveryType} />
        {deliveryType === "file" ? (
          <input name="asset" type="file" className="w-full text-sm" />
        ) : (
          <input name="link" type="url" placeholder="https://drive.google.com/..." className="w-full border border-ink/15 rounded-lg px-3 py-2" />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={isPending || uploading} className="btn-primary disabled:opacity-60">
        {uploading ? "Uploading images..." : isPending ? "Saving..." : "Add product"}
      </button>
    </form>
  );
}