// SERVER-ONLY. Makes (once) the buyer's own locked + watermarked copy of a product's PDF and remembers its password.
import { createAdminClient } from "@/lib/supabase/admin";
import { makePdfPassword, personalizePdf } from "@/lib/personal-pdf";

export type PersonalCopy = { path: string; password: string };

// Safe to call again: if the copy already exists it is returned as is (the password never changes for an order).
// Returns null when this order's product is not a locked PDF; throws if the copy could not be made.
export async function ensurePersonalCopy(orderId: string): Promise<PersonalCopy | null> {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("id, status, pdf_password, personal_pdf_path, profiles(email), products(file_path, personalize_pdf)")
    .eq("id", orderId)
    .single();
  const product = (order as any)?.products;
  if (!order || !product?.personalize_pdf || !product.file_path) return null;
  if (order.status !== "completed") return null;
  if (!String(product.file_path).toLowerCase().endsWith(".pdf")) {
    throw new Error("This product is set to lock the PDF, but the uploaded file is not a .pdf.");
  }

  if (order.pdf_password && order.personal_pdf_path) return { path: order.personal_pdf_path, password: order.pdf_password };

  const email: string = (order as any).profiles?.email ?? "buyer";
  const { data: blob, error: dlErr } = await admin.storage.from("digital-assets").download(product.file_path);
  if (dlErr || !blob) throw new Error(`Could not read the product PDF: ${dlErr?.message ?? "missing"}`);

  const password = order.pdf_password ?? makePdfPassword();
  const bytes = await personalizePdf(new Uint8Array(await blob.arrayBuffer()), email, password);

  const path = `${order.id}.pdf`;
  const { error: upErr } = await admin.storage
    .from("personal-copies")
    .upload(path, bytes, { contentType: "application/pdf", upsert: true });
  if (upErr) throw new Error(`Could not save the buyer's copy: ${upErr.message}`);

  await admin.from("orders").update({ pdf_password: password, personal_pdf_path: path }).eq("id", order.id);
  return { path, password };
}
