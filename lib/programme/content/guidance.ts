// "How to write it" guidance on the opening, elaboration and closing days, plus a short list of this week's words to use.
// BI formats are the Universal opening / closing / answer formats of Gary's theme packs. BM roles are the sentence types of
// his 万能开头结尾 documents and the order of his essays' isi paragraphs. Words come from the week's own Monday list.
import type { Block, Day, L, Week } from "../week-content";

const T = (zh: string, en: string): L => ({ zh, en });

const BI_OPENING: Block = {
  id: "guide", type: "table", title: T("开头怎么写（三种格式，选一种）", "How to write an opening (pick one of three formats)"),
  head: [T("格式", "Format"), T("写法", "Template"), T("什么时候用", "Use when")],
  rows: [
    ["A · Statement hook 陈述句开头", "[Hook sentence about the theme]. [Because it affects WHO / WHY it matters], it is important to understand [the main points]. In this article, I will [explain A], [describe B] and [give my opinion].", "The question is serious or informative (problems, benefits, solutions)."],
    ["B · Question hook 提问式开头", "Have you ever wondered [a question about the theme]? [Short answer or surprising truth]. This article [looks at / explains] [point A] and [point B].", "Lighter or personal topics (gadgets, spending, hobbies, travel, reviews)."],
    ["C · Saying or scene hook 名言 / 画面式开头", "[A saying, or 'Imagine…' + a short scene]. [Link it to WHO and the theme]. Let us look at [point A], [point B] and [the solution].", "You want to sound mature or emotional (society, culture, environment, stories)."],
  ],
};
const BI_CLOSING: Block = {
  id: "guide", type: "table", title: T("结尾怎么写（三种格式，选一种）", "How to write a conclusion (pick one of three formats)"),
  head: [T("格式", "Format"), T("写法", "Template"), T("什么时候用", "Use when")],
  rows: [
    ["A · Summary + opinion 总结 + 个人立场", "In conclusion, [point A] and [point B]. I firmly believe that [your opinion]. [A short final thought or hope].", "The safest closing for any question: repeat the main points in new words, then give your stand."],
    ["B · Call to action 号召行动", "It is high time that [WHO] [took action]. If we [action 1] and [action 2], we can [benefit for the future].", "The question asks for solutions, suggestions or what we should do."],
    ["C · Quote or question 金句 / 反问式结尾", "After all, [a saying or a short truth]. So the real question is not [A], but [B]. [Short sentence that invites the reader to act].", "A strong, memorable ending for society, culture, teenagers and the environment."],
  ],
};
const BI_ELABORATE: Block = {
  id: "guide", type: "table", title: T("怎样把一个要点讲开（4 步）", "How to elaborate one point (4 steps)"),
  head: [T("步骤", "Step"), T("写法", "Start with"), T("做什么", "What it does")],
  rows: [
    ["1 · Point 观点", "[Topic sentence]", "Say the point in one clear sentence."],
    ["2 · Reason 原因", "This is because …", "Explain why it is true."],
    ["3 · Example 例子", "For example, …", "Give a real case. Use your own."],
    ["4 · Result 结果", "As a result, …", "Say what happens in the end."],
  ],
};

const BM_OPENING: Block = {
  id: "guide", type: "table", title: T("开头怎么写（来自你的「万能开头结尾」）", "How to write an opening (from your 万能开头结尾 notes)"),
  head: [T("第几句", "Sentence"), T("这一句做什么", "What it does")],
  rows: [
    ["1", "点出背景 · State the background"], ["2", "点出社会现况 / 问题 · Point out the situation or problem (Waima begitu, …)"],
    ["3", "补充问题 · Add another problem (Tambahan pula, …)"], ["4", "过渡到题目 · Lead into the question (Jadi, …)"],
  ],
};
const BM_CLOSING: Block = {
  id: "guide", type: "table", title: T("结尾怎么写（来自你的「万能开头结尾」）", "How to write a conclusion (from your 万能开头结尾 notes)"),
  head: [T("第几句", "Sentence"), T("这一句做什么", "What it does")],
  rows: [
    ["1", "总结句 · Sum up (Tuntasnya, …)"], ["2", "呼吁合作 · Call on everyone to work together (Jadi, …)"], ["3", "强调好处 / 标语结尾 · Stress the benefit, or end with a slogan"],
  ],
};
const BM_ELABORATE: Block = {
  id: "guide", type: "table", title: T("怎样把一个要点讲开（来自你的范文）", "How to elaborate one point (from your model essays)"),
  head: [T("步骤", "Step"), T("写法", "Start with"), T("做什么", "What it does")],
  rows: [
    ["1 · 观点 Isi", "Yang pertamanya, … / Seterusnya, …", "Say the point in one clear sentence."],
    ["2 · 原因", "Hal ini berlaku kerana …", "Explain why it is true."],
    ["3 · 例子", "Sebagai contohnya, menurut …", "Give a real case. Use your own."],
    ["4 · 小结", "Tegasnya, …", "Wrap the point up."],
  ],
};

function words(w: Week): { word: string; zh: string }[] {
  const v = w.days.flatMap((d) => d.blocks).find((b) => b.type === "vocab");
  return v && v.type === "vocab" ? v.rows.map((r) => ({ word: r.word, zh: r.zh })) : [];
}

/**
 * BI round 1 (weeks 1 to 11): Gary's universal phrases run opening phrase first, closing phrase last, so the opening day offers
 * words 1 and 2, the elaboration day words 3 to 8 and the closing day words 9 and 10. Every other week offers all 10 words each day.
 */
function wordsFor(w: Week, key: string): { title: L; rows: string[][] } | null {
  const ws = words(w);
  if (ws.length < 10) return null;
  const roundOne = w.lang === "BI" && w.n <= 11;
  const pick = roundOne ? (key === "wed" ? ws.slice(0, 2) : key === "thu" ? ws.slice(2, 8) : ws.slice(8)) : ws;
  return {
    title: roundOne ? T("今天可以用的词（来自星期一的 10 个词）", "Words you can use today (from Monday's 10)") : T("本周的 10 个词，写的时候可以用", "This week's 10 words: use them as you write"),
    rows: pick.map((x) => [x.word, x.zh]),
  };
}

export function addGuidance(w: Week): Week {
  const guide: Record<string, Block> = w.lang === "BI" ? { wed: BI_OPENING, thu: BI_ELABORATE, fri: BI_CLOSING } : { wed: BM_OPENING, thu: BM_ELABORATE, fri: BM_CLOSING };
  return {
    ...w,
    days: w.days.map((d): Day => {
      const g = guide[d.key];
      if (!g || d.blocks.length < 2 || d.blocks[0].id !== "steps") return d;
      const wf = wordsFor(w, d.key);
      const extra: Block[] = [g];
      if (wf) extra.push({ id: "refwords", type: "table", title: wf.title, head: [T("词", "Word"), T("中文", "Chinese")], rows: wf.rows });
      return { ...d, blocks: [d.blocks[0], ...extra, ...d.blocks.slice(1)] };
    }),
  };
}
