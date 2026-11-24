import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { writingAccess } from "@/lib/writing/config";
import BmMarker from "@/components/writing/BmMarker";

export const dynamic = "force-dynamic";
export const metadata = { title: "Karangan BM · 批改", robots: { index: false, follow: false } };

// Private preview of the Malay essay marking: admin and beta testers only; everyone else gets a 404.
export default async function BmPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/writing/bm");
  const access = await writingAccess(supabase, user);
  if (!access.canTest) notFound();
  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="text-xs text-ink/60">马来文作文批改 · 内部试用，只有你和 beta 测试者看得到</p>
      <h1 className="text-2xl font-medium mb-1">Karangan Bahasa Melayu (Kertas 1)</h1>
      <p className="text-sm text-ink/60 mb-6">估计分数，只用来练习，不是官方分数。评分标准在 brand/BM-MARKING-RULES.md。</p>
      <BmMarker />
    </div>
  );
}
