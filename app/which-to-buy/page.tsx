import Link from "@/components/Link";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata = {
  title: "Which one should I buy? · Gary's Bookshelf",
  description: "Find your problem, then see which product fits.",
};
export const revalidate = 3600;

// The products, by id. Prices come from the shop database (so they never go out of date); the wording below is written by hand.
const ID = {
  essayNotes: "7ac67169-6ee5-416b-8254-8548d2e23293", // RM5英文作文
  malayNotes: "d00608ec-76db-4768-b573-905b018bb02b", // RM5 国文作文
  speakingPack: "45e53f42-4987-4c08-92eb-cb2147be3daf", // speaking冲刺包 (PDF notes)
  writingPack: "0f13b817-4ff7-44f7-aef7-8ccef7776a62", // writing 英文作文冲刺包 (PDF notes + 10 essay markings)
  essayMark10: "89a9c860-ea0b-4867-b1b6-4cd191c67624",
  essayMark20: "309409df-78a2-4eb8-9504-453b0f22781a",
  speakingAi30: "6e7a554c-6f7b-46fc-a4f4-e6f6ec93f98d",
  computer: "c43af49e-f75b-4bd5-9bf2-d426b0b7045a",
} as const;

type Price = { price: number; live: boolean };

export default async function WhichToBuyPage() {
  const { data } = await createPublicClient().from("products").select("id, price_myr, is_published").in("id", Object.values(ID));
  const prices = new Map<string, Price>((data ?? []).map((p: any) => [p.id, { price: Number(p.price_myr), live: Boolean(p.is_published) }]));
  const rm = (id: string) => {
    const p = prices.get(id);
    return p && p.live ? `RM${p.price % 1 ? p.price.toFixed(2) : p.price}` : "";
  };
  const View = ({ id, label = "看产品" }: { id: string; label?: string }) =>
    prices.get(id)?.live ? (
      <Link prefetch={false} href={`/shop/${id}`} className="btn-secondary !py-1.5 text-sm">
        {label}
      </Link>
    ) : (
      <span className="text-xs text-ink/50">暂时没有开卖</span>
    );

  // Section 1: problem -> product. One line each.
  const picks: { problem: string; id: string; name: string }[] = [
    { problem: "英文作文：单词太简单", id: ID.essayNotes, name: "RM5英文作文" },
    { problem: "英文作文：不会开头、结尾、分点", id: ID.writingPack, name: "writing 英文作文冲刺包" },
    { problem: "写好了，想知道几分", id: ID.essayMark10, name: "AI 作文批改（先用免费 10 篇）" },
    { problem: "国文作文：词汇太简单", id: ID.malayNotes, name: "RM5 国文作文" },
    { problem: "Speaking：一开口就大脑空白", id: ID.speakingPack, name: "speaking冲刺包" },
    { problem: "想让 AI 给 speaking 打分", id: ID.speakingAi30, name: "Speaking Practice Pack" },
    { problem: "Sains Komputer 笔记", id: ID.computer, name: "Sains Komputer Bundle" },
  ];

  const Bullets = ({ items }: { items: React.ReactNode[] }) => (
    <ul className="text-sm space-y-1.5 list-disc pl-5">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );

  return (
    <div className="max-w-4xl mx-auto px-5 py-14 space-y-12">
      <header>
        <h1 className="text-2xl font-medium mb-1">我该买哪一个？</h1>
        <p className="text-ink/60 text-sm">Which one should I buy? 先找你的问题。</p>
      </header>

      <section>
        <h2 className="text-lg font-medium mb-3">1. 你的问题是？</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {picks.map((x) => (
            <div key={x.id + x.name} className="card space-y-2">
              <p className="text-sm text-ink/60">{x.problem}</p>
              <p className="font-medium">
                👉 {x.name} <span className="text-clay-600">{x.id === ID.essayMark10 ? "" : rm(x.id)}</span>
              </p>
              <div className="pt-2">
                <View id={x.id} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-1">2. 最容易搞错的三个</h2>
        <p className="text-sm text-ink/60 mb-3">名字很像，里面不一样。</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="card space-y-3">
            <div>
              <p className="font-medium">RM5英文作文</p>
              <p className="text-clay-600 font-medium">{rm(ID.essayNotes)}</p>
            </div>
            <p className="text-sm">📚 累积<b>词汇</b></p>
            <Bullets items={["范文", "单词表（有中文）", "句子表（有中文）"]} />
            <p className="text-xs text-ink/60">❌ 没有 AI 批改</p>
          </div>
          <div className="card space-y-3 !border-clay-400">
            <div>
              <p className="font-medium">writing 英文作文冲刺包</p>
              <p className="text-clay-600 font-medium">{rm(ID.writingPack)}</p>
            </div>
            <p className="text-sm">✍️ 教你<b>怎么写</b></p>
            <Bullets items={["11 个 PDF", "万用答案 + 开头结尾", "每个要点的词汇", <b key="b">✅ 送 10 次 AI 批改</b>]} />
            <p className="text-xs text-ink/60">买过 speaking冲刺包只需 RM5</p>
          </div>
          <div className="card space-y-3">
            <div>
              <p className="font-medium">speaking冲刺包</p>
              <p className="text-clay-600 font-medium">{rm(ID.speakingPack)}</p>
            </div>
            <p className="text-sm">🎤 教你<b>开口说</b></p>
            <Bullets items={["13 个 PDF", "Top 20 词汇 + 万能句", "Cue card + model answer"]} />
            <p className="text-xs text-ink/60">❌ 没有 AI 练习次数</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">3. AI 作文批改：免费 vs 付费</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="card space-y-3">
            <p className="font-medium">免费 · 每人 10 篇</p>
            <Bullets items={["估计分 /20 + 四个项目", "每个分数的原因", "逐点检查有没有答到题目"]} />
          </div>
          <div className="card space-y-3 !border-clay-400">
            <p className="font-medium">付费 · 全部免费的，再加：</p>
            <Bullets items={[<b key="a">得分与失分的字句，逐句标出来</b>, "怎样拿到下一分", "最大的进步空间"]} />
          </div>
        </div>
        <div className="card mt-3 space-y-2">
          <p className="font-medium">批改 Pack（30 天有效）</p>
          <div className="flex flex-wrap gap-2">
            <Link prefetch={false} href="/writing" className="btn-primary !py-1.5 text-sm">试试免费批改</Link>
            <View id={ID.essayMark10} label={`10 篇 ${rm(ID.essayMark10)}`.trim()} />
            <View id={ID.essayMark20} label={`20 篇 ${rm(ID.essayMark20)}`.trim()} />
          </div>
          <p className="text-xs text-ink/60">AI 估计分，不是官方分数。</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">4. 其他产品</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="card space-y-2">
            <p className="font-medium">RM5 国文作文 <span className="text-clay-600">{rm(ID.malayNotes)}</span></p>
            <Bullets items={["范文", "普通 + 高级词汇表", "句子表"]} />
          </div>
          <div className="card space-y-2">
            <p className="font-medium">Sains Komputer <span className="text-clay-600">{rm(ID.computer)}</span></p>
            <Bullets items={["Tingkatan 4 + 5", "5 份 PDF + 1 份免费样本", "也可以单份买"]} />
          </div>
          <div className="card space-y-2">
            <p className="font-medium">Speaking Practice Pack <span className="text-clay-600">{rm(ID.speakingAi30)}</span></p>
            <Bullets items={["30 次 AI 打分", "30 天有效", "每天 2 次免费另外算"]} />
          </div>
        </div>
      </section>

      <section className="card text-center">
        <p className="font-medium mb-1">还是不确定？</p>
        <p className="text-sm text-ink/70 mb-3">告诉 Gary 你的问题和科目。</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link prefetch={false} href="/question" className="btn-primary !py-1.5 text-sm">问 Gary</Link>
          <Link href="/how-to-buy" className="btn-secondary !py-1.5 text-sm">怎么买？</Link>
          <Link href="/shop" className="btn-secondary !py-1.5 text-sm">回到 Shop</Link>
        </div>
      </section>
    </div>
  );
}
