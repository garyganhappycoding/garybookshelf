import { productFiles } from "@/lib/product-files";

// the files this order includes (everything, unless the buyer picked some), with each file's place in the product
const ownedFiles = (order: any) =>
  productFiles(order.products ?? {})
    .map((f, i) => ({ f, i }))
    .filter(({ i }) => !order.file_indexes || order.file_indexes.includes(i) || (order.products?.free_file_indexes ?? []).includes(i)); // free bonus files always show
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import DownloadButton from "@/components/DownloadButton";
import InAppBrowserNotice from "@/components/InAppBrowserNotice";
import RedownloadRequest from "@/components/RedownloadRequest";

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
    .select("id, status, amount_paid, created_at, reject_reason, link_opened_at, pdf_password, file_indexes, products(title, external_link, file_path, product_files, personalize_pdf, speaking_pack_attempts, writing_pack_attempts, free_file_indexes)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // attempts left in the student's Speaking pack, so the dashboard can invite them to use it
  const { data: pack } = await supabase.rpc("speaking_pack_status");
  const packRow = Array.isArray(pack) ? pack[0] : pack;
  const packLeft: number = packRow?.pack_left ?? 0;
  const packExpiry: string | null = packRow?.next_expiry ?? null;
  // essay markings left in the student's essay pack
  const { data: essayPack } = await supabase.rpc("writing_pack_status");
  const essayRow = Array.isArray(essayPack) ? essayPack[0] : essayPack;
  const essayLeft: number = essayRow?.pack_left ?? 0;
  const essayExpiry: string | null = essayRow?.next_expiry ?? null;
  const hasCompleted = (orders ?? []).some((o: any) => o.status === "completed");

  // which files of one-time (locked PDF) orders were already downloaded; read here on the server because buyers cannot read this table
  const usedFiles = new Set<string>();
  const lockedIds = (orders ?? []).filter((o: any) => o.products?.personalize_pdf).map((o: any) => o.id);
  if (lockedIds.length) {
    const { data: used } = await createAdminClient().from("file_downloads").select("order_id, file_index").in("order_id", lockedIds).eq("released", false);
    for (const u of used ?? []) usedFiles.add(`${u.order_id}:${u.file_index}`);
  }
  // orders where Gary has not yet answered a re-download request
  const requestedOrders = new Set<string>();
  if (lockedIds.length) {
    const { data: reqs } = await createAdminClient().from("redownload_requests").select("order_id").in("order_id", lockedIds).eq("status", "pending");
    for (const r of reqs ?? []) requestedOrders.add(r.order_id);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <InAppBrowserNotice />
      <h1 className="text-2xl font-medium mb-2">My orders</h1>
      <p className="text-sm mb-1"><Link prefetch={false}  href="/replies" className="text-clay-700 underline">💌 Gary&apos;s replies to my questions</Link></p>
      <p className="text-sm mb-6"><Link href="/how-to-buy" className="text-clay-700 underline">📖 How to buy and download · 购买与下载步骤</Link></p>

      {packLeft > 0 && (
        <div className="card !border-clay-400 mb-6">
          <p className="font-medium mb-1">🎤 You have {packLeft} speaking attempts ready</p>
          <p className="text-sm text-ink/70 mb-3">
            {packExpiry ? `They are yours until ${new Date(packExpiry).toLocaleDateString("en-MY", { day: "numeric", month: "long" })}. ` : ""}
            Your attempts give the full report: every problem, phrase upgrades, your sentences rewritten with phrases from Gary&apos;s notes, and your pace and fillers.
            Do your first one now, it takes about 3 minutes.
          </p>
          <Link prefetch={false}  href="/speaking" className="btn-primary">Do my first attempt</Link>
        </div>
      )}

      {essayLeft > 0 && (
        <div className="card !border-clay-400 mb-6">
          <p className="font-medium mb-1">✍️ You have {essayLeft} essay markings ready</p>
          <p className="text-sm text-ink/70 mb-3">
            {essayExpiry ? `They are yours until ${new Date(essayExpiry).toLocaleDateString("en-MY", { day: "numeric", month: "long" })}. ` : ""}
            Every essay you mark with them gets the full report: the reason for every mark, how to reach the next mark, and your essay with the words that earned and lost marks highlighted.
          </p>
          <Link prefetch={false} href="/writing" className="btn-primary">Mark an essay</Link>
        </div>
      )}

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
                  <Link prefetch={false}  href="/speaking" className="btn-secondary !py-1.5">
                    Open Speaking
                  </Link>
                )}
                {order.status === "completed" && order.products?.writing_pack_attempts && (
                  <Link prefetch={false} href="/writing" className="btn-secondary !py-1.5">
                    Open essay marking
                  </Link>
                )}
                {/* a plain speaking pack has nothing to download; a notes bundle with attempts shows both buttons */}
                {order.status === "completed" && ownedFiles(order).length > 1 && (
                  <span className="text-xs text-ink/50">{ownedFiles(order).length} files below</span>
                )}
                {order.status === "completed" && ownedFiles(order).length <= 1 && ((!order.products?.speaking_pack_attempts && !order.products?.writing_pack_attempts) || order.products?.external_link || order.products?.file_path) && (
                  <DownloadButton
                    orderId={order.id}
                    initiallyOpened={Boolean(order.link_opened_at && order.products?.external_link)}
                    fileIndex={ownedFiles(order)[0]?.i ?? 0}
                    oneTime={Boolean(order.products?.personalize_pdf)}
                    alreadyDownloaded={usedFiles.has(`${order.id}:${ownedFiles(order)[0]?.i ?? 0}`)}
                  />
                )}
              </div>
              {order.status === "completed" && ownedFiles(order).length > 1 && (
                <div className="basis-full">
                  {order.products?.personalize_pdf && (
                    <p className="text-sm text-clay-700 bg-clay-400/15 rounded-lg px-3 py-2 mb-2">
                      Each file can be downloaded <strong>once</strong>. Please download on your own phone or laptop, where you will read it.
                      每个文件只能下载一次，请用你自己要阅读的手机或电脑下载。
                    </p>
                  )}
                <ul className="divide-y divide-ink/10 border-t border-ink/10">
                  {ownedFiles(order).map(({ f, i }) => (
                    <li key={f.path} className="flex items-center justify-between gap-3 py-2">
                      <span className="text-sm break-all">{f.name}</span>
                      <DownloadButton
                        orderId={order.id}
                        initiallyOpened={false}
                        fileIndex={i}
                        label="Download"
                        oneTime={Boolean(order.products?.personalize_pdf)}
                        alreadyDownloaded={usedFiles.has(`${order.id}:${i}`)}
                      />
                    </li>
                  ))}
                </ul>
                </div>
              )}
              {order.status === "completed" && order.products?.personalize_pdf && (
                <div className="basis-full">
                  <RedownloadRequest orderId={order.id} alreadyRequested={requestedOrders.has(order.id)} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ink/60">
          No orders yet. New here? <Link href="/start" className="text-clay-600 underline">Start here</Link>, try the{" "}
          <Link prefetch={false}  href="/speaking" className="text-clay-600 underline">free Speaking AI</Link>, or head to the{" "}
          <Link href="/shop" className="text-clay-600 underline">shop</Link>.
        </p>
      )}
      {hasCompleted && (
        <p className="text-sm text-ink/60 mt-8">
          Got your notes or attempts? <Link prefetch={false}  href="/feedback" className="text-clay-600 underline">Tell Gary how it went</Link>. He reads every message.
        </p>
      )}
    </div>
  );
}
