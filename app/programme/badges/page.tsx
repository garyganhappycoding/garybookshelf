import Link from "next/link";
import Shell from "@/components/programme/Shell";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";
import { wall, setPasted, type WallBadge } from "@/lib/programme/badges";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "徽章 · 陪你读书", robots: { index: false, follow: false } };

const COLORS = ["#a65d3f", "#5d7a52", "#3f6a8a", "#8a5a8f", "#b08a2e", "#4f7f78", "#9a4a4a", "#6b6f3a", "#7a5c3e", "#5a6a9a", "#a2623a", "#46705a", "#8a6a2e"];
const hash = (s: string) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

async function pasteAction(form: FormData) {
  "use server";
  const a = await requireProgramme();
  await setPasted(a.userId, String(form.get("badge")), form.get("on") === "1");
  revalidatePath("/programme/badges");
}

function Spine({ b, selected }: { b: WallBadge; selected: boolean }) {
  const earned = !!b.earnedAt, h = 120 + (hash(b.id) % 5) * 12;
  const bg = earned ? (b.rarity === "rare" ? "linear-gradient(160deg,#e6c15a,#b08a2e)" : b.rarity === "ultimate" ? "linear-gradient(160deg,#3b3028,#a65d3f)" : COLORS[hash(b.id) % COLORS.length]) : "#e9e1d6";
  return (
    <Link href={`/programme/badges?b=${b.id}`} aria-label={earned ? b.title : "还没拿到的徽章"}
      className={`flex w-11 shrink-0 items-center justify-center rounded-t-md px-1 text-sm font-medium shadow-sm ${earned ? "text-white" : "text-ink/30"} ${selected ? "outline outline-2 outline-offset-2 outline-ink" : ""}`}
      style={{ height: h, background: bg, writingMode: "vertical-rl" }}>
      {earned ? b.title : "?"}
    </Link>
  );
}

export default async function BadgesPage({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  const a = await requireProgramme();
  const sp = await searchParams;
  const [badges, p] = await Promise.all([wall(a.userId), getProfile(a.userId)]);
  const ultimate = badges.find((b) => b.rarity === "ultimate");
  const spines = badges.filter((b) => b.rarity !== "ultimate");
  const got = spines.filter((b) => b.earnedAt).length;
  const sel = badges.find((b) => b.id === sp.b);
  const pasted = badges.filter((b) => b.pasted);
  const name = p.nickname || "同学";

  return (
    <Shell active="badges" admin={a.isAdmin}>
      <h1 className="text-2xl font-medium mb-1">我的徽章墙</h1>
      <p className="text-sm text-ink/60 mb-4">一直做下去，会不定时拿到一本书。集齐全部，就能拿到最后一枚「自学」。已经拿到 {got} / {spines.length}。</p>

      <section className="card mb-4 overflow-x-auto" aria-label="书架">
        <div className="flex min-w-max items-end gap-2 border-b-4 border-clay-700/40 pb-0 pt-3">
          {spines.map((b) => <Spine key={b.id} b={b} selected={sel?.id === b.id} />)}
          {ultimate && <div className="ml-4"><Spine b={ultimate} selected={sel?.id === ultimate.id} /></div>}
        </div>
        <p className="mt-2 text-xs text-ink/60">点一本书，看它背面 Gary 写给你的话。灰色的还没拿到，继续加油。</p>
      </section>

      {sel && (
        <section className="mb-4 grid gap-4 md:grid-cols-2" aria-live="polite">
          {/* The front: made to be screenshotted and shared. Sharing earns nothing extra: share as often as you like. */}
          <div className="rounded-3xl p-6 text-white shadow-lg" style={{ background: sel.earnedAt ? (sel.rarity === "rare" ? "linear-gradient(160deg,#d4aa3e,#8a6a1e)" : sel.rarity === "ultimate" ? "linear-gradient(160deg,#2b2320,#a65d3f)" : COLORS[hash(sel.id) % COLORS.length]) : "#b9ada0" }}>
            <p className="text-xs tracking-widest opacity-80">陪你读书 2027 · @gary_bookshelf</p>
            <p className="mt-10 text-4xl font-semibold">{sel.earnedAt ? sel.title : "？"}</p>
            <p className="mt-2 text-sm opacity-90">{sel.earnedAt ? (sel.rarity === "rare" ? "稀有徽章" : sel.rarity === "ultimate" ? "最后一枚" : "一本书") : sel.how}</p>
            {sel.earnedAt && <p className="mt-10 text-lg">{name}</p>}
            {sel.earnedAt && <p className="text-xs opacity-80">{new Date(sel.earnedAt).toLocaleDateString("zh-CN")}</p>}
          </div>
          <div className="card">
            <p className="text-xs text-ink/60 mb-1">背面</p>
            {sel.earnedAt ? (
              <>
                <p className="whitespace-pre-wrap">{sel.backMessage || "Gary 还没有写这一枚的话。"}</p>
                <form action={pasteAction} className="mt-4">
                  <input type="hidden" name="badge" value={sel.id} /><input type="hidden" name="on" value={sel.pasted ? "0" : "1"} />
                  <button className="btn-secondary text-sm min-h-11">{sel.pasted ? "从我的书里拿下来" : "贴进我的书"}</button>
                </form>
                <p className="mt-3 text-xs text-ink/60">想分享的话，截图正面就可以，标记 @gary_bookshelf。</p>
              </>
            ) : (
              <p className="text-sm text-ink/70">{sel.how}。拿到之后，这里会出现 Gary 写给你的一句话。</p>
            )}
          </div>
        </section>
      )}

      <section className="card">
        <p className="font-medium mb-2">我的书</p>
        {pasted.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {pasted.map((b) => (
              <div key={b.id} className="rounded-2xl border border-ink/10 bg-paper p-4">
                <p className="font-medium">{b.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink/70">{b.backMessage || "—"}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-ink/60">把徽章背面的话贴进来，慢慢写成你自己的一本书。</p>}
      </section>
    </Shell>
  );
}
