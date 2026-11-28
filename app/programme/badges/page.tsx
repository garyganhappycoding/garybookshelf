import Link from "@/components/Link";
import Shell from "@/components/programme/Shell";
import BadgeWall, { type WallItem } from "@/components/programme/BadgeWall";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";
import { wall, tierFor, type Earned } from "@/lib/programme/badges";
import { artFor, TIER_NAME } from "@/lib/programme/badge-art";

export const dynamic = "force-dynamic";
export const metadata = { title: "徽章 · 陪你读书", robots: { index: false, follow: false } };

const dateOf = (e: Earned) => e.earnedAt;

export default async function BadgesPage() {
  const a = await requireProgramme();
  const [badges, p] = await Promise.all([wall(a.userId), getProfile(a.userId)]);
  const name = p.nickname || "同学";
  const items: WallItem[] = [];
  let fake = 100;
  for (const b of badges) {
    // The admin preview shows every badge as earned (the 努力 n 天 badge in all four metals) so Gary can see the whole wall.
    const list: Earned[] = a.isAdmin
      ? b.id === "effort"
        ? [7, 14, 28, 60].map((n) => ({ n, tier: tierFor(n), serial: (fake += 7), edition: null, earnedAt: new Date().toISOString(), pasted: false }))
        : [{ n: null, tier: null, serial: (fake += 7), edition: b.id === "zixue" ? 37 : null, earnedAt: new Date().toISOString(), pasted: false }]
      : b.earned;
    if (!list.length) {
      const art = artFor(b.id, { n: b.id === "effort" ? 7 : null, tier: b.id === "effort" ? "bronze" : null, edition: null });
      if (art) items.push({ key: `${b.id}-locked`, badgeId: b.id, title: b.title, how: b.how, earned: false, art, serial: 0, earnedAt: null, backMessage: "", sub: "" });
      continue;
    }
    for (const e of list) {
      const art = artFor(b.id, e);
      if (!art) continue;
      const sub = b.id === "effort" && e.n ? `${TIER_NAME[e.tier ?? "bronze"]} · ${e.n} 天` : b.id === "zixue" && e.edition ? `№ ${String(e.edition).padStart(3, "0")} / 200` : "";
      items.push({ key: `${b.id}-${e.serial}`, badgeId: b.id, title: b.id === "effort" && e.n ? `努力 ${e.n} 天` : b.title, how: b.how, earned: true, art, serial: e.serial, earnedAt: dateOf(e), backMessage: b.backMessage, sub });
    }
  }
  return (
    <Shell active="badges" admin={a.isAdmin}>
      <h1 className="mb-1 text-2xl font-medium">我的徽章</h1>
      <p className="mb-4 text-sm text-ink/60">坚持下去，会不定时拿到徽章。每一枚背面都有你的名字和 Gary 的话。一直做到最后，你会拿到最高的一枚「自学」。</p>
      <Link href="/programme/wall" className="card mb-4 block hover:shadow-md transition"><p className="font-medium">我的成就墙</p><p className="text-sm text-ink/60">把徽章放上墙，自己排，自己改大小，加文字和边框。</p></Link>
      <BadgeWall items={items} name={name} preview={a.isAdmin} />
    </Shell>
  );
}
