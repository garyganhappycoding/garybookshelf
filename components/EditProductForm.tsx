"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { productFiles, type ProductFile } from "@/lib/product-files";
import { updateProductRecord } from "@/actions/admin";

export default function EditProductForm({ product }: { product: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCover, setSavedCover] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"file" | "link">(product.external_link ? "link" : "file");
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const initialFiles = productFiles(product);
  const [keptFiles, setKeptFiles] = useState<ProductFile[]>(initialFiles);
  const [uploadMsg, setUploadMsg] = useState("");

  const existingImages: string[] = product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [];

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setPreviews(files.map((file) => ({ url: URL.createObjectURL(file), file })));
    setCoverIndex(0);
  }

  function setCoverFromExisting(url: string) {
    setSavedCover(false);
    startTransition(async () => {
      const reordered = [url, ...existingImages.filter((u) => u !== url)];
      const result = await updateProductRecord(product.id, {
        title: product.title,
        description: product.description,
        price: Number(product.price_myr),
        category: product.category,
        imageUrl: url,
        imageUrls: reordered,
      });
      if (result?.error) setError(result.error);
      else {
        setSavedCover(true);
        router.refresh();
      }
    });
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setUploading(true);
    const supabase = createClient();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const newAssets = (formData.getAll("asset") as File[]).filter((f) => f && f.size > 0);
    const link = formData.get("link") as string | null;

    let imageUrls: string[] | null = null;
    if (previews.length > 0) {
      const orderedFiles = [previews[coverIndex].file, ...previews.filter((_, i) => i !== coverIndex).map((p) => p.file)];
      imageUrls = [];
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
    }

    let files: ProductFile[] | undefined;
    let externalLink: string | null = null;

    if (deliveryType === "link" && link && link.trim() !== "") {
      externalLink = link.trim();
    } else if (deliveryType === "file" && (newAssets.length > 0 || keptFiles.length !== initialFiles.length)) {
      files = [...keptFiles];
      for (let i = 0; i < newAssets.length; i++) {
        setUploadMsg(`Uploading file ${i + 1} of ${newAssets.length}...`);
        const asset = newAssets[i];
        const ext = asset.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("digital-assets").upload(path, asset);
        if (upErr) {
          setError(`Upload of "${asset.name}" failed: ${upErr.message}`);
          setUploading(false);
          return;
        }
        files.push({ path, name: asset.name });
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
        files,
        externalLink: externalLink || undefined,
        personalizePdf: deliveryType === "file" && formData.get("personalizePdf") === "on",
      });
      if (result?.error) setError(result.error);
      else router.push("/admin/products");
    });
  }

  return (
    <div className="space-y-6">
      {existingImages.length > 0 && (
        <div className="card">
          <p className="font-medium mb-1">Current cover image</p>
          <p className="text-xs text-ink/50 mb-3">Click one to make it the thumbnail shown in shop listings — saves immediately.</p>
          <div className="flex gap-2 flex-wrap">
            {existingImages.map((url) => (
              <button
                type="button"
                key={url}
                onClick={() => setCoverFromExisting(url)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  url === product.image_url ? "border-clay-600" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                {url === product.image_url && (
                  <span className="absolute bottom-0 inset-x-0 bg-clay-600 text-white text-[10px] text-center">
                    Cover
                  </span>
                )}
              </button>
            ))}
          </div>
          {savedCover && <p className="text-sm text-sage-600 mt-2">Cover updated.</p>}
        </div>
      )}

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
          <input name="images" type="file" accept="image/*" multiple className="w-full text-sm" onChange={handleImagesChange} />
          <p className="text-xs text-ink/50 mt-1">Leave empty to keep current images.</p>

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
              {keptFiles.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {keptFiles.map((f) => (
                    <li key={f.path} className="flex items-center justify-between text-sm bg-ink/5 rounded-lg px-3 py-1.5">
                      <span className="break-all">{f.name}</span>
                      <button type="button" onClick={() => setKeptFiles((cur) => cur.filter((x) => x.path !== f.path))} className="text-red-600 text-xs ml-3 shrink-0">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <input name="asset" type="file" multiple className="w-full text-sm" />
              <p className="text-xs text-ink/50 mt-1">Pick one or several files to add. Files listed above stay unless you remove them.</p>
        <label className="flex items-start gap-2 text-sm mt-3">
          <input type="checkbox" name="personalizePdf" defaultChecked={Boolean(product.personalize_pdf)} className="mt-1" />
          <span>
            <strong>Lock each buyer's copy (PDF only).</strong> After you approve an order, the buyer gets their own copy with their email
            printed faintly on every page, locked with a password only they receive.
          </span>
        </label>
            </>
          ) : (
            <input name="link" type="url" defaultValue={product.external_link || ""} placeholder="https://..." className="w-full border border-ink/15 rounded-lg px-3 py-2" />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={isPending || uploading} className="btn-primary disabled:opacity-60">
          {uploading ? uploadMsg || "Uploading..." : isPending ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}