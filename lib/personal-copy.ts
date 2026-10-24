// SERVER-ONLY. Gives a buyer a download link for one file of their order. When the product is a "locked PDF" the file is
// made for that buyer on the first tap: their email watermarked on every page and a password that is theirs alone.
// Copies are not kept for long (the daily cleanup removes them after COPY_KEEP_DAYS); tapping Download again just makes
// a fresh one with the same password. Originals stay in the "digital-assets" bucket and are stored once.
import { createAdminClient } from "@/lib/supabase/admin";
import { makePdfPassword, personalizePdf } from "@/lib/personal-pdf";
import { productFiles } from "@/lib/product-files";
import { logDownload, storedSize } from "@/lib/download-log";

export const COPY_KEEP_DAYS = 3;

export { productFiles, type ProductFile } from "@/lib/product-files";

const isPdf = (name: string) => name.toLowerCase().endsWith(".pdf");

// One password per order, used for every PDF in the bundle. Safe to call again: it never changes once set.
export async function ensurePdfPassword(orderId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, status, pdf_password, products(personalize_pdf, file_path, product_files, title)")
    .eq("id", orderId)
    .single();
  const product = (order as any)?.products;
  if (!order || order.status !== "completed" || !product?.personalize_pdf) return null;
  if (!productFiles(product).some((f) => isPdf(f.name) || isPdf(f.path))) return null;
  if (order.pdf_password) return order.pdf_password;

  const password = makePdfPassword();
  await admin.from("orders").update({ pdf_password: password }).eq("id", order.id).is("pdf_password", null);
  const { data: fresh } = await admin.from("orders").select("pdf_password").eq("id", order.id).single();
  return fresh?.pdf_password ?? password;
}

export async function getOrderFileUrl(orderId: string, index: number): Promise<{ url?: string; password?: string; error?: string }> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, status, product_id, profiles(email), products(title, file_path, product_files, personalize_pdf)")
    .eq("id", orderId)
    .single();
  const product = (order as any)?.products;
  if (!order || order.status !== "completed" || !product) return { error: "Order not found." };

  const files = productFiles(product);
  const file = files[index];
  if (!file) return { error: "No file or link set up for this product." };

  // plain file: a short-lived link to the original
  if (!product.personalize_pdf || !(isPdf(file.name) || isPdf(file.path))) {
    const { data, error } = await admin.storage.from("digital-assets").createSignedUrl(file.path, 60 * 10, { download: file.name });
    if (error || !data) return { error: "Could not generate download link." };
    await logDownload(order.id, order.product_id, index, await storedSize("digital-assets", "", file.path));
    return { url: data.signedUrl };
  }

  const password = await ensurePdfPassword(orderId);
  if (!password) return { error: "Could not prepare your PDF. Please try again." };

  const copyPath = `${order.id}/${index}.pdf`;
  const { data: existing } = await admin.storage.from("personal-copies").list(order.id, { search: `${index}.pdf` });
  if (!existing?.some((f) => f.name === `${index}.pdf`)) {
    const email: string = (order as any).profiles?.email ?? "buyer";
    const { data: blob, error: dlErr } = await admin.storage.from("digital-assets").download(file.path);
    if (dlErr || !blob) return { error: "Could not read the file. Please message Gary." };
    const bytes = await personalizePdf(new Uint8Array(await blob.arrayBuffer()), email, password, order.id);
    const { error: upErr } = await admin.storage
      .from("personal-copies")
      .upload(copyPath, bytes, { contentType: "application/pdf", upsert: true });
    if (upErr) return { error: "Could not prepare your PDF. Please try again." };
  }

  const { data, error } = await admin.storage.from("personal-copies").createSignedUrl(copyPath, 60 * 10, { download: file.name });
  if (error || !data) return { error: "Could not generate download link." };
  await logDownload(order.id, order.product_id, index, await storedSize("personal-copies", order.id, `${index}.pdf`));
  return { url: data.signedUrl, password };
}
