import Link from "@/components/Link";
import Shell from "@/components/programme/Shell";
import WallEditor, { type Piece } from "@/components/programme/WallEditor";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";
import { wall, tierFor, type Earned } from "@/lib/programme/badges";
import { artFor, badgeFaces } from "@/lib/programme/badge-art";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WallItem } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "成就墙 · 陪你读书", robots: { index: false, follow: false } };

export default async function WallPage() {
  const a = await requireProgramme();
  const [badges, p, { data: saved }] = await Promise.all([
    wall(a.userId), getProfile(a.userId),
    createAdminClient().from("programme_walls").select("layout, bg, frame").eq("user_id", a.userId).maybeSingle(),
  ]);
  const name = p.nickname || "同学";
  const pieces: Piece[] = [];
  let fake = 100;
  for (const b of badges) {
    // the admin preview has every badge (the 努力 n 天 badge in all four metals)
    const list: Earned[] = a.isAdmin
      ? b.id === "effort"
        ? [7, 14, 28, 60].map((n) => ({ n, tier: tierFor(n), serial: (fake += 7), edition: null, earnedAt: "", pasted: false }))
        : [{ n: null, tier: null, serial: (fake += 7), edition: b.id === "zixue" ? 37 : null, earnedAt: "", pasted: false }]
      : b.earned;
    for (const e of list) {
      const art = artFor(b.id, e);
      if (!art) continue;
      const key = `${b.id}-${e.serial}`;
      pieces.push({ key, title: b.id === "effort" && e.n ? `努力 ${e.n} 天` : b.title, svg: badgeFaces("w" + key.replace(/[^a-z0-9]/gi, ""), art, name, e.serial, b.backMessage).front });
    }
  }
  return (
    <Shell active="badges" admin={a.isAdmin} wide>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-medium">我的成就墙</h1>
        <Link href="/programme/badges" className="text-sm text-clay-600 underline">我的徽章</Link>
      </div>
      <p className="mb-4 text-sm text-ink/60">把拿到的徽章放上墙，想放哪就放哪。点一下徽章，四个角可以放大缩小，上面的圆点可以转。边框是整面墙的相框。分享不会多给奖励。</p>
      <WallEditor pieces={pieces} initial={{ layout: (saved?.layout ?? []) as WallItem[], bg: saved?.bg ?? "ink", frame: saved?.frame ?? "none" }} />
    </Shell>
  );
}
