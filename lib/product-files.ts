// Safe to import from both server and browser code (no secrets).
export type ProductFile = { path: string; name: string };

// a product's files; older products that only have a single file_path are included
export function productFiles(product: { product_files?: unknown; file_path?: string | null; title?: string | null }): ProductFile[] {
  const list = Array.isArray(product.product_files) ? (product.product_files as ProductFile[]).filter((f) => f?.path) : [];
  if (list.length) return list;
  if (product.file_path) {
    const ext = product.file_path.includes(".") ? product.file_path.slice(product.file_path.lastIndexOf(".")) : "";
    return [{ path: product.file_path, name: `${product.title ?? "download"}${ext}` }];
  }
  return [];
}
