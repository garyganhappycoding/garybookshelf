// Turns one extracted WeekData (see brand/PROGRAMME-CONTENT-SPEC.md) into the day cards, in the same shape as the
// week 1 model Gary reviewed. Only Gary's own text goes into the data; the wording below is instructions only.
import type { Block, Day, L, Week } from "../week-content";

export type WeekData = {
  n: number; lang: "bi" | "bm"; theme: string; level?: string | null;
  essayTitle: string | null; source?: string | null; essayUrl?: string | null;
  paragraphs: string[];
  points: { code: string; text: string }[];
  openingIdx: number[]; keyPoint: { idx: number; prompt: string | null } | null; closingIdx: number[];
  words: { word: string; zh: string; example: string | null }[];
  goodPhrases: { phrase: string; zh: string }[];
  gaps: string[];
};

const THEME_ZH: Record<string, string> = {
  "Technology": "科技", "Environment": "环境", "Health & Sports": "健康与运动", "School & Education": "学校与教育", "Finance & Consumerism": "金钱与消费",
  "People & Culture": "人与文化", "Teenagers & Society": "青少年与社会", "Travel / Leisure / Home": "旅行、休闲与家", "Review": "评论", "Report": "报告", "Story": "故事",
};

const core = (w: string) => w.replace(/…/g, "").replace(/\s+/g, " ").trim();
const joinIdx = (d: WeekData, idx: number[]) => idx.filter((i) => d.paragraphs[i] !== undefined).map((i) => d.paragraphs[i]);
const T = (zh: string, en: string): L => ({ zh, en });
const TODAY = T("今天做什么", "What to do today");
const CHECKS = T("AI 会检查", "What the AI checks");

/** Words of the list that really appear in the essay (blue), and the essay's own good phrases that appear (red). */
export function highlights(d: WeekData) {
  const text = [d.essayTitle ?? "", ...d.paragraphs].join(" ").toLowerCase();
  const inText = (s: string) => core(s).length > 2 && text.includes(core(s).toLowerCase());
  const blue = d.words.filter((w) => inText(w.word)).map((w) => core(w.word));
  const red = d.goodPhrases.filter((g) => inText(g.phrase) && !blue.some((b) => b.toLowerCase() === core(g.phrase).toLowerCase())).map((g) => core(g.phrase));
  return { blue, red };
}

export function makeWeek(d: WeekData): Week {
  const lang = d.lang === "bi" ? "BI" : "BM";
  const hasEssay = !!d.essayTitle && d.paragraphs.length > 0;
  const title = d.essayTitle ?? "";
  const essayParas = hasEssay ? [title, ...d.paragraphs] : [];
  const { blue, red } = highlights(d);
  const marks = [...blue.map((p) => ({ phrase: p, color: 1 as const })), ...red.map((p) => ({ phrase: p, color: 2 as const }))];
  const kp = d.keyPoint && d.paragraphs[d.keyPoint.idx] !== undefined ? d.keyPoint : null;
  const opening = joinIdx(d, d.openingIdx), closing = joinIdx(d, d.closingIdx);
  const notReady: Block = { id: "steps", type: "steps", title: TODAY, items: [T("这一周的范文还在准备，今天先休息。", "This week's model essay is still being prepared. Take today off.")] };

  const mon: Day = {
    key: "mon", label: T("第 1 天", "Day 1"), minutes: 10, blocks: [
      { id: "steps", type: "steps", title: TODAY, items: [
        T("看下面 10 个词，每个词的中文和例句都读一遍。", "Read the 10 words below, with the Chinese meaning and the example sentence for each."),
        T("每个词写一句自己的句子。一共 10 句。", "Write one sentence of your own for each word. 10 sentences in total."),
        T("做小测验：看中文，想出英文。", "Do the quick quiz: read the Chinese and recall the word."),
        T("交出去，AI 会给你反馈。", "Submit. The AI gives you feedback."),
      ] },
      { id: "vocab", type: "vocab", title: T("本周 10 个词", "This week's 10 words"), rows: d.words.map((w) => ({ word: w.word, zh: w.zh, example: w.example ?? "" })) },
      { id: "quiz", type: "quiz", title: T("小测验：看中文，想出词", "Quick quiz: read the Chinese, recall the word"), rows: d.words.map((w) => ({ zh: w.zh, answer: w.word })) },
      { id: "checks", type: "checks", title: CHECKS, items: [
        T("每个词有没有用对。", "Whether each word is used correctly."),
        T("句子的语法对不对。", "Whether the grammar is correct."),
        T("是不是只抄了例句。", "Whether you only copied the example sentence."),
      ] },
    ],
  };

  const tue: Day = { key: "tue", label: T("第 2 天", "Day 2"), minutes: 10, blocks: !hasEssay ? [notReady] : [
    { id: "steps", type: "steps", title: TODAY, items: [
      T("读下面的范文。", "Read the model essay below."),
      T("用蓝色标出本周 10 个词里，出现在范文里的词。", "Highlight in blue the words from this week's list that appear in the essay."),
      T("用红色标出你觉得好的词和短语。", "Highlight in red the words and phrases that you think are good."),
      T("交出去，对照答案。", "Submit, then compare with the answer."),
    ] },
    { id: "essay", type: "text", interactive: true, title: T("范文（先选颜色，再点你要标的词）", "Model essay (pick a colour, then tap the words to highlight)"), paragraphs: essayParas },
    { id: "answer", type: "text", reveal: true, title: T("答案（交了之后才显示）", "Answer (shown after submitting)"), paragraphs: essayParas, highlight: marks,
      note: T(`蓝色是本周的词，范文里有 ${blue.length} 个。红色是范文里的好词好句，来自你的范文词汇表。`, `Blue = this week's words (${blue.length} of the 10 are in this essay). Red = the good words and phrases from the essay's own vocabulary table.`) },
  ] };

  const qBlock: Block = d.points.length
    ? { id: "question", type: "table", title: T("这周的题目", "This week's question"), head: [T("要点", "Point"), T("题目要求", "What the question asks")], rows: d.points.map((p) => [p.code, p.text]) }
    : { id: "question", type: "prompt", title: T("这周的题目", "This week's question"), text: T(title, title) };

  const wed: Day = { key: "wed", label: T("第 3 天", "Day 3"), minutes: 10, blocks: !hasEssay ? [notReady] : [
    { id: "steps", type: "steps", title: TODAY, items: [
      T("看这周的题目。", "Look at this week's question."),
      T(`为「${title}」写开头。`, `Write the opening for "${title}".`),
      T("至少用本周的 2 个词。", "Use at least 2 words from this week's list."),
      T("交出去，看范文。", "Submit, then read the model."),
    ] },
    qBlock,
    { id: "model", type: "text", reveal: true, title: T("范文开头（交了之后才显示）", "Model opening (shown after submitting)"), paragraphs: opening },
    { id: "checks", type: "checks", title: CHECKS, items: [T("有没有用到本周的 2 个词。", "Whether you used 2 words from this week's list."), T("有没有点出主题。", "Whether the main idea is stated.")] },
  ] };

  const thuOk = hasEssay && kp;
  const thu: Day = { key: "thu", label: T("第 4 天", "Day 4"), minutes: 10, blocks: !thuOk ? [notReady] : [
    { id: "steps", type: "steps", title: TODAY, items: [
      T("今天只写一个要点，见下面。", "Today you write one point only, shown below."),
      T("写成一段，按 4 步：观点、原因、例子、结果。例子要用你自己的。", "Write one paragraph in 4 steps: point, reason, example, result. Use your own example."),
      T("交出去，看参考。", "Submit, then read the reference."),
    ] },
    { id: "point", type: "prompt", title: T("今天的要点", "Today's point"), text: kp!.prompt ? T(kp!.prompt, kp!.prompt) : T(d.paragraphs[kp!.idx].split(/(?<=[.!?])\s+/)[0], d.paragraphs[kp!.idx].split(/(?<=[.!?])\s+/)[0]) },
    { id: "model", type: "text", reveal: true, title: T("范文里这个要点的段落（你的范文）", "The paragraph for this point in the model essay (your essay)"), paragraphs: [d.paragraphs[kp!.idx]] },
    ...(() => {
      const para = d.paragraphs[kp!.idx].toLowerCase();
      const rows = d.goodPhrases.filter((g) => para.includes(core(g.phrase).toLowerCase())).map((g) => [core(g.phrase), g.zh]);
      return rows.length ? [{ id: "words", type: "table" as const, reveal: true, title: T("这一段用到的好词（范文词汇表）", "Good phrases used in this paragraph (the essay's vocabulary table)"), head: [T("词", "Word"), T("中文", "Chinese")], rows }] : [];
    })(),
    { id: "checks", type: "checks", title: CHECKS, items: [T("4 步齐不齐。", "Whether all 4 steps are there."), T("例子是不是你自己的。", "Whether the example is your own."), T("有没有用上本周的词。", "Whether you used some of this week's words.")] },
  ] };

  const fri: Day = { key: "fri", label: T("第 5 天", "Day 5"), minutes: 10, blocks: !hasEssay ? [notReady] : [
    { id: "steps", type: "steps", title: TODAY, items: [
      T(`为「${title}」写结尾。`, `Write the conclusion for "${title}".`),
      T("可以用本周的词。", "You may use words from this week's list."),
      T("交出去，看范文。", "Submit, then read the model."),
    ] },
    { id: "model", type: "text", reveal: true, title: T("范文结尾（交了之后才显示）", "Model conclusion (shown after submitting)"), paragraphs: closing },
    { id: "checks", type: "checks", title: CHECKS, items: [T("有没有总结全文的看法。", "Whether the view of the whole article is summed up."), T("有没有一句话收尾。", "Whether it ends with a closing sentence.")] },
  ] };

  const sat: Day = { key: "sat", label: T("休息日", "Rest day"), minutes: 0, blocks: [{ id: "steps", type: "steps", title: TODAY, items: [T("休息。", "Rest.")] }] };
  const sun: Day = { key: "sun", label: T("周末选做", "Weekend choice"), minutes: 0, blocks: !hasEssay ? [sat.blocks[0]] : [
    { id: "steps", type: "steps", title: TODAY, items: [
      T(`选项 A：写完整的「${title}」。用第 3 到 5 天写好的开头、主体和结尾，再补上其他段落。交给作文 AI 批改。`, `Option A: write the full piece "${title}". Use your opening, body paragraph and conclusion from days 3 to 5, then add the other paragraphs. It goes to the essay-marking AI.`),
      T("选项 B：休息。", "Option B: rest."),
    ] },
    { id: "model", type: "text", reveal: true, title: T("参考：你的范文", "Reference: your model essay"), paragraphs: essayParas },
  ] };

  return {
    n: d.n, lang, theme: T(THEME_ZH[d.theme] ?? d.theme, d.theme), essay: title || "(essay coming soon)", source: d.source ?? d.essayUrl ?? "",
    days: [mon, tue, wed, thu, fri, sat, sun],
  };
}
