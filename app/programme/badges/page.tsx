import Link from "@/components/Link";
import Shell from "@/components/programme/Shell";
import BadgeWall, { type WallItem } from "@/components/programme/BadgeWall";
import WallPreview from "@/components/programme/WallPreview";
import type { Piece } from "@/components/programme/WallEditor";
import type { WallItem as WallLayoutItem } from "@/app/programme/wall/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";
import { wall, tierFor, markBadgesSeen, type Earned } from "@/lib/programme/badges";
import { artFor, badgeFaces, TIER_NAME } from "@/lib/programme/badge-art";

export const dynamic = "force-dynamic";
export const metadata = { title: "徽章 · 陪你读书", robots: { index: false, follow: false } };

const dateOf = (e: Earned) => e.earnedAt;

export default async function BadgesPage({ searchParams }: { searchParams: Promise<{ as?: string }> }) {
  const a = await requireProgramme();
  const sp = await searchParams;
  // admin only: ?as=student shows the page the way a student with no badges sees it (the normal admin preview has every badge)
  const preview = a.isAdmin && sp.as !== "student";
  const [badges, p, { data: saved }] = await Promise.all([
    wall(a.userId), getProfile(a.userId),
    createAdminClient().from("programme_walls").select("layout, bg, frame").eq("user_id", a.userId).maybeSingle(),
  ]);
  const name = p.nickname || "同学";
  if (!a.isAdmin) await markBadgesSeen(a.userId); // opening this page clears the "new badge" notice on the home page
  const items: WallItem[] = [];
  const pieces: Piece[] = [];
  let lockedCount = 0;
  let fake = 100;
  for (const b of badges) {
    // The admin preview shows every badge as earned (the 努力 n 天 badge in all four metals) so Gary can see the whole wall.
    const list: Earned[] = preview
      ? b.id === "effort"
        ? [7, 14, 28, 60].map((n) => ({ n, tier: tierFor(n), serial: (fake += 7), edition: null, earnedAt: new Date().toISOString(), pasted: false }))
        : [{ n: null, tier: null, serial: (fake += 7), edition: b.id === "zixue" ? 37 : null, earnedAt: new Date().toISOString(), pasted: false }]
      : b.earned;
    if (!list.length) { lockedCount += 1; continue; } // not earned yet: only a plain grey blank is shown, never what it is
    for (const e of list) {
      const art = artFor(b.id, e);
      if (!art) continue;
      const sub = b.id === "effort" && e.n ? `${TIER_NAME[e.tier ?? "bronze"]} · ${e.n} 天` : b.id === "zixue" && e.edition ? `№ ${String(e.edition).padStart(3, "0")} / 200` : "";
      pieces.push({ key: `${b.id}-${e.serial}`, title: b.id === "effort" && e.n ? `努力 ${e.n} 天` : b.title, svg: badgeFaces("w" + `${b.id}-${e.serial}`.replace(/[^a-z0-9]/gi, ""), art, name, e.serial, b.backMessage).front });
      items.push({ key: `${b.id}-${e.serial}`, badgeId: b.id, title: b.id === "effort" && e.n ? `努力 ${e.n} 天` : b.title, how: b.how, earned: true, art, serial: e.serial, earnedAt: dateOf(e), backMessage: b.backMessage, sub });
    }
  }
  return (
    <Shell active="badges" admin={a.isAdmin}>
      <h1 className="mb-1 text-2xl font-medium">我的徽章</h1>
      <p className="mb-4 text-sm text-ink/60">拿到徽章的时候，首页会通知你。每一枚背面都有你的名字和 Gary 的话。</p>
      {a.isAdmin && <p className="mb-3 text-xs text-ink/60">{preview ? <>管理员预览：现在显示所有徽章。<Link href="/programme/badges?as=student" className="underline">看看学生一枚都没有时的样子</Link></> : <>现在是学生一枚都没有时的样子。<Link href="/programme/badges" className="underline">回到管理员预览</Link></>}</p>}
      <div className="mb-6"><WallPreview pieces={pieces} layout={(saved?.layout ?? []) as WallLayoutItem[]} bg={saved?.bg ?? "ink"} frame={saved?.frame ?? "none"} /></div>
      <BadgeWall items={items} name={name} preview={preview} lockedCount={lockedCount} />
    </Shell>
  );
}
