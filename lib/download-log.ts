// SERVER-ONLY. Records every file download and warns Gary on Telegram before the bundle downloads use up
// Supabase's free 5 GB monthly bandwidth (the whole site shares that 5 GB, so the warnings are early on purpose).
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyGary } from "@/lib/community";

const GB = 1024 * 1024 * 1024;
export const BANDWIDTH_ALERTS_GB = [2.5, 3.5];

export async function logDownload(orderId: string, productId: string | null, fileIndex: number, bytes: number) {
  try {
    const admin = createAdminClient();
    await admin.from("file_downloads").insert({ order_id: orderId, product_id: productId, file_index: fileIndex, bytes });

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const { data: rows } = await admin.from("file_downloads").select("bytes").gte("created_at", monthStart).limit(20000);
    const total = (rows ?? []).reduce((sum, r) => sum + Number(r.bytes), 0);

    for (const limit of BANDWIDTH_ALERTS_GB) {
      if (total < limit * GB) continue;
      const key = `bandwidth-${limit}gb-${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
      // the primary key makes sure each warning is sent once per month, even if two downloads land together
      const { error } = await admin.from("site_alerts").insert({ key });
      if (error) continue;
      await notifyGary(
        `⚠️ Bundle downloads this month: ${(total / GB).toFixed(1)} GB`,
        `Supabase's free plan allows 5 GB of downloads a month for the whole site. Bundle PDFs alone have used ${(total / GB).toFixed(1)} GB (warning at ${limit} GB). ` +
          `Options: move the PDFs to Cloudflare R2 (free downloads) or upgrade Supabase.`,
        "/admin/orders"
      );
    }
  } catch (e) {
    console.error("download log failed", e); // never block a buyer's download because logging failed
  }
}

// size in bytes of one stored file (0 if it cannot be read)
export async function storedSize(bucket: string, folder: string, name: string): Promise<number> {
  const { data } = await createAdminClient().storage.from(bucket).list(folder, { search: name, limit: 5 });
  const hit = data?.find((f) => f.name === name);
  return Number((hit?.metadata as any)?.size ?? 0);
}
