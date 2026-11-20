import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata = {
  title: "Which one should I buy? · Gary's Bookshelf",
  description: "What is in each product, how they differ, and which one fits your problem.",
};
export const revalidate = 600;

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

type Price = { price: number; member: number | null; live: boolean };

export default async function WhichToBuyPage() {
  const { data } = await createPublicClient().from("products").select("id, price_myr, member_price_myr, is_published").in("id", Object.values(ID));
  const prices = new Map<string, Price>((data ?? []).map((p: any) => [p.id, { price: Number(p.price_myr), member: p.member_price_myr != null ? Number(p.member_price_myr) : null, live: Boolean(p.is_published) }]));
  const rm = (id: string) => {
    const p = prices.get(id);
    return p && p.live ? `RM${p.price % 1 ? p.price.toFixed(2) : p.price}` : "";
  };
  const Buy = ({ id, label = "看产品 · View" }: { id: string; label?: string }) =>
    prices.get(id)?.live ? (
      <Link prefetch={false} href={`/shop/${id}`} className="btn-secondary !py-1.5 text-sm">
        {label}
      </Link>
    ) : (
      <span className="text-xs text-ink/50">暂时没有开卖 · Not on sale right now</span>
    );

  const picks: { problem: string; en: string; id: string; name: string; note: string; hidePrice?: boolean }[] = [
    { problem: "英文作文：单词太简单，不知道用什么词", en: "English essay: my words are too basic", id: ID.essayNotes, name: "RM5英文作文", note: "范文 + 单词表 + 句子表，帮你累积词汇" },
    { problem: "英文作文：不知道怎么开头、结尾、怎么分点写", en: "English essay: I do not know how to open, close or structure it", id: ID.writingPack, name: "writing 英文作文冲刺包", note: "教你怎么写 + 送 10 次 AI 作文批改" },
    { problem: "写好了作文，想知道几分、哪里失分", en: "I wrote an essay and want to know my mark", id: ID.essayMark10, name: "Essay marking（先用免费 10 篇）", note: `免费 10 篇用完后，再买批改 Pack（${rm(ID.essayMark10)} 起）`, hidePrice: true },
    { problem: "国文（马来文）作文：词汇太简单", en: "Malay essay: my words are too basic", id: ID.malayNotes, name: "RM5 国文作文", note: "范文 + 词汇表（普通与高级）+ 句子表" },
    { problem: "English speaking：一开口就大脑空白", en: "Speaking: my mind goes blank", id: ID.speakingPack, name: "speaking冲刺包", note: "PDF 笔记：词汇、万能句、cue card 和 model answer" },
    { problem: "想让 AI 给我的 speaking 打分", en: "I want AI feedback on my speaking", id: ID.speakingAi30, name: "Speaking Practice Pack: 30 attempts", note: "每天 2 次免费，用完再买" },
    { problem: "Sains Komputer（Tingkatan 4 + 5）笔记", en: "Sains Komputer notes", id: ID.computer, name: "Sains Komputer Notes Bundle", note: "5 份 PDF + 1 份免费样本" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-14 space-y-12">
      <header>
        <h1 className="text-2xl font-medium mb-2">我该买哪一个？ Which one should I buy?</h1>
        <p className="text-ink/70">
          看你的问题，找到适合的产品。每个产品里面有什么，下面都写清楚了。 Find your problem, then see exactly what is inside each product.
        </p>
      </header>

      <section>
        <h2 className="text-lg font-medium mb-3">1. 先看你的问题 · Start with your problem</h2>
        <div className="space-y-3">
          {picks.map((x) => (
            <div key={x.id + x.name} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{x.problem}</p>
                <p className="text-xs text-ink/50">{x.en}</p>
                <p className="text-sm mt-1">
                  👉 <b>{x.name}</b> <span className="text-ink/60">{x.hidePrice ? "" : rm(x.id)}</span>
                </p>
                <p className="text-sm text-ink/70">{x.note}</p>
              </div>
              <Buy id={x.id} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-1">2. 三个最容易搞错的 · The three that look alike</h2>
        <p className="text-sm text-ink/60 mb-3">名字很像，但里面的东西不一样。 Similar names, different things inside.</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="card space-y-2">
            <p className="font-medium">RM5英文作文 <span className="text-ink/60">{rm(ID.essayNotes)}</span></p>
            <p className="text-sm text-ink/70">帮你累积<b>词汇</b>。</p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>范文（Trial Questions）</li>
              <li>单词表（含中文）</li>
              <li>句子表（含中文）</li>
              <li>按 Theme 分类</li>
            </ul>
            <p className="text-xs text-ink/60">通过 Telegram 链接发送。没有 AI 批改。</p>
          </div>
          <div className="card space-y-2 !border-clay-400">
            <p className="font-medium">writing 英文作文冲刺包 <span className="text-ink/60">{rm(ID.writingPack)}</span></p>
            <p className="text-sm text-ink/70">教你<b>怎么写</b>一篇高分作文。</p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>11 个 PDF：8 个 Theme + Review、Report、Story</li>
              <li>万用答案（范文段落 + 6 个关键词）</li>
              <li>3 种万用开头 + 3 种万用结尾</li>
              <li>真实 Trial 作文题 + 每个要点的词汇表</li>
              <li>Universal phrases</li>
              <li><b>送 10 次 AI 作文批改</b></li>
            </ul>
            <p className="text-xs text-ink/60">买过 speaking冲刺包只需 RM5。每份 PDF 是你自己的版本，有密码。</p>
          </div>
          <div className="card space-y-2">
            <p className="font-medium">speaking冲刺包 <span className="text-ink/60">{rm(ID.speakingPack)}</span></p>
            <p className="text-sm text-ink/70">教你<b>开口说</b>。是 PDF 笔记，<b>不含 AI 练习次数</b>。</p>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>13 个 PDF：11 个 Theme + Writing toolkit + 阅读顺序指南</li>
              <li>每个 Theme：Top 20 词汇、10 句万能句、替换词句</li>
              <li>Part 2 cue card 和 Part 3 题目 + model answer</li>
            </ul>
            <p className="text-xs text-ink/60">想让 AI 打分？去 Speaking 页面，每天有 2 次免费。</p>
          </div>
        </div>
        <p className="text-sm text-ink/70 mt-3">
          小提醒：写作文用 <b>writing 英文作文冲刺包</b>；练口说用 <b>speaking冲刺包</b>。如果你两个都想要，先买 speaking冲刺包，再买 writing 冲刺包只需 RM5。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">3. AI 作文批改：免费和付费 · Essay marking: free vs paid</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-ink/10">
                <th className="py-2 pr-3 font-medium"></th>
                <th className="py-2 px-3 font-medium">免费 Free</th>
                <th className="py-2 pl-3 font-medium">付费 Paid</th>
              </tr>
            </thead>
            <tbody className="[&_td]:py-2 [&_td]:align-top divide-y divide-ink/5">
              <tr><td className="pr-3">次数</td><td className="px-3">每人 10 篇（一次性）</td><td className="pl-3">{rm(ID.essayMark10) || "RM5"} = 10 篇，{rm(ID.essayMark20) || "RM10"} = 20 篇；冲刺包送 10 篇</td></tr>
              <tr><td className="pr-3">估计分 /20 + 四个项目</td><td className="px-3">✓</td><td className="pl-3">✓</td></tr>
              <tr><td className="pr-3">每个分数的原因</td><td className="px-3">✓</td><td className="pl-3">✓</td></tr>
              <tr><td className="pr-3">逐点检查有没有答到题目</td><td className="px-3">✓</td><td className="pl-3">✓</td></tr>
              <tr className="bg-sage-400/15"><td className="pr-3 font-medium">★ 得分与失分的字句标出来</td><td className="px-3">🔒</td><td className="pl-3">✓</td></tr>
              <tr><td className="pr-3">怎样拿到下一分</td><td className="px-3">🔒</td><td className="pl-3">✓</td></tr>
              <tr><td className="pr-3">最大的进步空间</td><td className="px-3">🔒</td><td className="pl-3">✓</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ink/60 mt-2">这是 AI 估计分，不是官方分数。批改 Pack 有效期 30 天；有 Pack 的时候，连免费的几篇也是完整报告。</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link prefetch={false} href="/writing" className="btn-primary !py-1.5 text-sm">试试免费批改</Link>
          <Buy id={ID.essayMark10} label={`批改 Pack ${rm(ID.essayMark10)}`.trim()} />
          <Buy id={ID.essayMark20} label={`批改 Pack ${rm(ID.essayMark20)}`.trim()} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">4. 其他产品里面有什么 · What is inside the rest</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="card space-y-1">
            <p className="font-medium">RM5 国文作文 <span className="text-ink/60">{rm(ID.malayNotes)}</span></p>
            <p className="text-sm text-ink/70">范文、普通词汇表 + 高级词汇表、句子表，按 Theme 分类（例如 Budaya &amp; Makanan、Keselamatan Jalan Raya）。通过 Telegram 链接发送。</p>
          </div>
          <div className="card space-y-1">
            <p className="font-medium">Sains Komputer Notes Bundle <span className="text-ink/60">{rm(ID.computer)}</span></p>
            <p className="text-sm text-ink/70">Tingkatan 4 + 5，5 份 PDF + 1 份免费样本（penormalan 题目）。也可以按单份购买。每份 PDF 是你自己的版本，有密码，每个文件只能下载一次。</p>
          </div>
          <div className="card space-y-1">
            <p className="font-medium">Speaking Practice Pack: 30 attempts <span className="text-ink/60">{rm(ID.speakingAi30)}</span></p>
            <p className="text-sm text-ink/70">30 次额外的 AI speaking 打分，有效期 30 天。每天的 2 次免费另外算。用完免费的再用 Pack 的次数。</p>
          </div>
          <div className="card space-y-1">
            <p className="font-medium">怎么买？ · How to buy</p>
            <p className="text-sm text-ink/70">用 Touch &apos;n Go 付款，上传收据，Gary 确认后在 My orders 下载。</p>
            <Link href="/how-to-buy" className="text-clay-600 underline text-sm">看 8 个购买步骤</Link>
          </div>
        </div>
      </section>

      <section className="card text-center">
        <p className="font-medium mb-1">还是不确定？ · Still not sure?</p>
        <p className="text-sm text-ink/70 mb-3">告诉 Gary 你的问题和你的科目，他会告诉你该买哪一个。</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link prefetch={false} href="/question" className="btn-primary !py-1.5 text-sm">问 Gary</Link>
          <Link href="/shop" className="btn-secondary !py-1.5 text-sm">回到 Shop</Link>
        </div>
      </section>
    </div>
  );
}
