import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redeemLink } from "@/lib/programme/groups";

export const dynamic = "force-dynamic";
export const metadata = { title: "陪你读书", robots: { index: false, follow: false } };

// A friend opens the link the group leader sent them. Not behind the admin gate: friends are ordinary students.
// It reveals nothing unless the signature is right, the group is active and the signed-in email is the one that paid.
export default async function LinkPage({ params }: { params: Promise<{ member: string; sig: string }> }) {
  const { member, sig } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-14">
        <h1 className="text-xl font-medium mb-2">陪你读书</h1>
        <p className="text-sm text-ink/70 mb-4">请先用付款时写的邮箱登录或注册，再回来打开这条链接。</p>
        <Link href="/login" className="btn-primary text-sm">登录</Link>
      </div>
    );
  }
  const r = await redeemLink(member, sig, user.email ?? null, ip);
  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <h1 className="text-xl font-medium mb-2">陪你读书</h1>
      <p className={`text-sm mb-4 ${r.ok ? "" : "text-red-700"}`}>{r.message}</p>
      {r.ok && <Link href="/programme" className="btn-primary text-sm">进入</Link>}
    </div>
  );
}
