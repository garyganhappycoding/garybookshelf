import { productFiles } from "@/lib/product-files";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import DownloadButton from "@/components/DownloadButton";

// making a locked, watermarked PDF can take a few seconds for a big file
export const maxDuration = 60;

const statusLabel: Record<string, string> = {
  pending_verification: "Pending verification",
  completed: "Approved",
  rejected: "Rejected",
};

const statusColor: Record<string, string> = {
  pending_verification: "text-amber-700 bg-amber-100",
  completed: "text-sage-600 bg-sage-400/15",
  rejected: "text-red-600 bg-red-100",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, amount_paid, created_at, reject_reason, link_opened_at, pdf_password, products(title, external_link, file_path, product_files, speaking_pack_attempts)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">My orders</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order: any) => (
            <div key={order.id} className="card flex flex-wrap items-center justify-between gap-y-3">
              <div>
                <p className="font-medium">{order.products?.title}</p>
                <p className="text-sm text-ink/60">RM {Number(order.amount_paid).toFixed(2)}</p>
                {order.status === "completed" && order.pdf_password && (
                  <p className="text-sm mt-1">
                    PDF password: <span className="font-mono text-base tracking-wider bg-ink/5 px-2 py-0.5 rounded select-all">{order.pdf_password}</span>
                    <span className="block text-xs text-ink/50">Only for you. Your email is printed on every page, so please don't share it.</span>
                  </p>
                )}
                {order.status === "rejected" && order.reject_reason && (
                  <p className="text-sm text-red-600 mt-1">Reason: {order.reject_reason}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[order.status]}`}>
                  {statusLabel[order.status]}
                </span>
                {order.status === "completed" && order.products?.speaking_pack_attempts && (
                  <Link href="/speaking" className="btn-secondary !py-1.5">
                    Open Speaking
                  </Link>
                )}
                {/* a plain speaking pack has nothing to download; a notes bundle with attempts shows both buttons */}
                {order.status === "completed" && productFiles(order.products ?? {}).length > 1 && (
                  <span className="text-xs text-ink/50">{productFiles(order.products).length} files below</span>
                )}
                {order.status === "completed" && productFiles(order.products ?? {}).length <= 1 && (!order.products?.speaking_pack_attempts || order.products?.external_link || order.products?.file_path) && (
                  <DownloadButton
                    orderId={order.id}
                    initiallyOpened={Boolean(order.link_opened_at && order.products?.external_link)}
                  />
                )}
              </div>
              {order.status === "completed" && productFiles(order.products ?? {}).length > 1 && (
                <ul className="basis-full divide-y divide-ink/10 border-t border-ink/10">
                  {productFiles(order.products).map((f, i) => (
                    <li key={f.path} className="flex items-center justify-between gap-3 py-2">
                      <span className="text-sm break-all">{f.name}</span>
                      <DownloadButton orderId={order.id} initiallyOpened={false} fileIndex={i} label="Download" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ink/50">No orders yet. Head to the shop to get started.</p>
      )}
    </div>
  );
}
