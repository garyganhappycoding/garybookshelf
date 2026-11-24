// Prototype of the real weekly content, BI week 1 (Technology). Only the admin sees it (see /programme/content).
// Every essay, word, example sentence and Chinese meaning comes from Gary's own Google Docs.
// Anything marked "unchecked" is a label or instruction Claude wrote and Gary has not approved yet.
export type L = { zh: string; en: string };
export type Block =
  | { id: string; type: "steps"; title: L; items: L[]; reveal?: boolean }
  | { id: string; type: "prompt"; title: L; text: L; reveal?: boolean }
  | { id: string; type: "vocab"; title: L; rows: { word: string; zh: string; example: string }[]; reveal?: boolean }
  | { id: string; type: "text"; title: L; paragraphs: string[]; highlight?: { phrase: string; color: 1 | 2 }[]; interactive?: boolean; note?: L; reveal?: boolean }
  | { id: string; type: "quiz"; title: L; rows: { zh: string; answer: string }[]; reveal?: boolean }
  | { id: string; type: "image"; title: L; src: string; alt: string; reveal?: boolean }
  | { id: string; type: "table"; title: L; head: L[]; rows: string[][]; reveal?: boolean }
  | { id: string; type: "checks"; title: L; items: L[]; reveal?: boolean };
/** What the student has to hand in on a day. Filled in for every week by withResponses() in content/index.ts. */
export type Response =
  | { kind: "sentences"; words: { word: string; zh: string }[] }        // day 1: one sentence per word, then the quiz
  | { kind: "highlight" }                                                // day 2: tap-to-highlight the essay
  | { kind: "text"; optional?: boolean; test?: boolean }                               // days 3 to 5 (and the optional full essay on Sunday)
  | { kind: "none" };                                                    // rest day, or a week whose essay is not ready
export type Day = { key: string; label: L; minutes: number; blocks: Block[]; response?: Response };
export type Week = { n: number; lang: "BI" | "BM"; theme: L; essay: string; source: string; days: Day[] };

const ESSAY = [
  "Smartphones: Friend or Foe?",
  "By: Gary Gan 5 Cengal",
  "Can you imagine a day without your smartphone? For most teenagers today, this small device has become an extension of themselves. Technology has truly transformed the way we live.",
  "A technology commonly used by teenagers is the smartphone. It is no longer just a device for making calls, but a camera, a library and a classroom rolled into one.",
  "First and foremost, smartphones make learning more convenient. With educational apps and online videos, students can revise anytime and anywhere, even on a bus ride home. Complex topics can be explained through animations at the tap of a finger. Furthermore, smartphones help teenagers stay connected with family and friends. A quick message lets parents know that their children are safe.",
  "However, teenagers must use their smartphones responsibly by limiting their screen time. Setting a daily time limit prevents them from becoming addicted to social media and games, which can affect their sleep and studies. Moreover, they should think twice before sharing anything online. Posting personal details or hurtful comments can have serious consequences that last for years.",
  "In a nutshell, the smartphone is a double-edged sword. If we use it wisely, it can be a powerful tool that enriches our lives rather than controls them.",
];

const HIGHLIGHT: { phrase: string; color: 1 | 2 }[] = [
  { phrase: "stay connected with", color: 1 }, { phrase: "think twice", color: 1 }, { phrase: "double-edged sword", color: 1 },
  { phrase: "transformed", color: 2 }, { phrase: "anytime and anywhere", color: 2 }, { phrase: "at the tap of a finger", color: 2 },
  { phrase: "enriches our lives", color: 2 }, { phrase: "an extension of themselves", color: 2 }, { phrase: "rolled into one", color: 2 },
  { phrase: "addicted to", color: 2 }, { phrase: "screen time", color: 2 },
];

const QUESTION_TABLE: Block = {
  id: "question", type: "table", title: { zh: "题目（5 个要点）", en: "Question (5 points)" },
  head: [{ zh: "要点", en: "Point" }, { zh: "题目要求", en: "What the question asks" }],
  rows: [
    ["C1", "State a technology commonly used by teenagers (one technology)"],
    ["C2", "Explain the benefits: benefit 1"],
    ["C3", "Explain the benefits: benefit 2"],
    ["C4", "Discuss how teenagers can use it responsibly: way 1"],
    ["C5", "Discuss how teenagers can use it responsibly: way 2"],
  ],
};

export const BI_WEEK1: Week = {
  n: 1, lang: "BI", theme: { zh: "科技", en: "Technology" },
  essay: "Smartphones: Friend or Foe?", source: "SBP 2026 · Paper 2 · Part 3 Q3 · Article, 200–250 words",
  days: [
    {
      key: "mon", label: { zh: "第 1 天", en: "Day 1" }, minutes: 10, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [
          { zh: "看下面 10 个词，每个词的中文和例句都读一遍。", en: "Read the 10 words below, with the Chinese meaning and the example sentence for each." },
          { zh: "每个词写一句自己的句子，主题是「青少年和科技」。一共 10 句。", en: "Write one sentence of your own for each word, about teenagers and technology. 10 sentences in total." },
          { zh: "做下面的小测验：看中文，想出英文。", en: "Do the quick quiz below: read the Chinese and recall the English." },
          { zh: "交出去，AI 会给你反馈。", en: "Submit. The AI gives you feedback." },
        ] },
        { id: "vocab", type: "vocab", title: { zh: "本周 10 个词", en: "This week's 10 words" }, rows: [
          { word: "In this digital age, …", zh: "在这个数字时代", example: "In this digital age, almost every teenager owns a smartphone." },
          { word: "Technology has revolutionised the way we …", zh: "科技彻底改变了我们……的方式", example: "Technology has revolutionised the way we communicate." },
          { word: "… at the touch of a button", zh: "一键之间", example: "We can order food at the touch of a button." },
          { word: "… is just a click away", zh: "只需轻轻一点", example: "Information on any topic is just a click away." },
          { word: "stay connected with …", zh: "与……保持联系", example: "Video calls help us stay connected with relatives overseas." },
          { word: "be glued to their screens", zh: "盯着屏幕不放", example: "Many teenagers are glued to their screens until midnight." },
          { word: "fall victim to …", zh: "成为……的受害者", example: "Careless users often fall victim to online scams." },
          { word: "think twice before …", zh: "三思而后……", example: "We should think twice before posting personal details." },
          { word: "strike a balance between … and …", zh: "在……与……之间取得平衡", example: "Students must strike a balance between screen time and real life." },
          { word: "a double-edged sword", zh: "双刃剑", example: "Technology is a double-edged sword, so we must use it wisely." },
        ] },
        { id: "quiz", type: "quiz", title: { zh: "小测验：看中文，想出英文", en: "Quick quiz: read the Chinese, recall the English" }, rows: [
          { zh: "在这个数字时代", answer: "In this digital age, …" },
          { zh: "科技彻底改变了我们……的方式", answer: "Technology has revolutionised the way we …" },
          { zh: "一键之间", answer: "… at the touch of a button" },
          { zh: "只需轻轻一点", answer: "… is just a click away" },
          { zh: "与……保持联系", answer: "stay connected with …" },
          { zh: "盯着屏幕不放", answer: "be glued to their screens" },
          { zh: "成为……的受害者", answer: "fall victim to …" },
          { zh: "三思而后……", answer: "think twice before …" },
          { zh: "在……与……之间取得平衡", answer: "strike a balance between … and …" },
          { zh: "双刃剑", answer: "a double-edged sword" },
        ] },
        { id: "checks", type: "checks", title: { zh: "AI 会检查", en: "What the AI checks" }, items: [
          { zh: "每个词有没有用对。", en: "Whether each word is used correctly." },
          { zh: "句子的语法对不对。", en: "Whether the grammar is correct." },
          { zh: "是不是只抄了例句。", en: "Whether you only copied the example sentence." },
        ] },
      ],
    },
    {
      key: "tue", label: { zh: "第 2 天", en: "Day 2" }, minutes: 10, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [
          { zh: "读下面的范文。", en: "Read the model essay below." },
          { zh: "用蓝色标出本周 10 个词里，出现在范文里的词。", en: "Highlight in blue the words from this week's list that appear in the essay." },
          { zh: "用红色标出你觉得好的词和短语。", en: "Highlight in red the words and phrases that you think are good." },
          { zh: "交出去，对照答案。", en: "Submit, then compare with the answer." },
        ] },
        { id: "essay", type: "text", interactive: true, title: { zh: "范文（先选颜色，再点你要标的词）", en: "Model essay (pick a colour, then tap the words to highlight)" }, paragraphs: ESSAY },
        { id: "answer", type: "text", reveal: true, title: { zh: "答案（交了之后才显示）", en: "Answer (shown after submitting)" }, paragraphs: ESSAY, highlight: HIGHLIGHT,
          note: { zh: "蓝色是本周的词，范文里有 3 个。另外 7 个词不在这篇范文里，是 Technology 的万能词，写作时用。红色是范文里的好词好句，来自你的范文 Table 1。", en: "Blue = this week's words (3 of them are in this essay). The other 7 are general Technology phrases for your own writing. Red = the good words and phrases from the essay's Table 1." } },
      ],
    },
    {
      key: "wed", label: { zh: "第 3 天", en: "Day 3" }, minutes: 10, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [
          { zh: "看题目的 5 个要点和下面的开头写法。", en: "Look at the 5 points of the question and how an opening is built below." },
          { zh: "为 \"Smartphones: Friend or Foe?\" 写开头。", en: "Write the opening for \"Smartphones: Friend or Foe?\"." },
          { zh: "至少用本周的 2 个词。", en: "Use at least 2 words from this week's list." },
          { zh: "交出去，看范文。", en: "Submit, then read the model." },
        ] },
        QUESTION_TABLE,
        { id: "format", type: "prompt", title: { zh: "开头的写法（来自范文）", en: "How the opening is built (from the model essay)" }, text: {
          zh: "第 1 句：用一个问题吸引读者。第 2 句：说这件事跟青少年有什么关系。第 3 句：点出主题的大意。（这个写法是 Claude 从你的范文整理的，未确认）",
          en: "Sentence 1: hook the reader with a question. Sentence 2: link it to teenagers. Sentence 3: state the main idea. (Taken from the model essay by Claude, unchecked)",
        } },
        { id: "model", type: "text", reveal: true, title: { zh: "范文开头（交了之后才显示）", en: "Model opening (shown after submitting)" }, paragraphs: [
          "Can you imagine a day without your smartphone? For most teenagers today, this small device has become an extension of themselves. Technology has truly transformed the way we live.",
        ] },
        { id: "checks", type: "checks", title: { zh: "AI 会检查", en: "What the AI checks" }, items: [
          { zh: "有没有用到本周的 2 个词。", en: "Whether you used 2 words from this week's list." },
          { zh: "有没有点出主题。", en: "Whether the main idea is stated." },
        ] },
      ],
    },
    {
      key: "thu", label: { zh: "第 4 天", en: "Day 4" }, minutes: 10, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [
          { zh: "今天只写一个要点：C2「智能手机让学习更方便」。", en: "Today you write one point only: C2, \"smartphones make learning more convenient\"." },
          { zh: "写成一段，按 4 步：观点、原因、例子、结果。例子要用你自己的。（4 步的名字是 Claude 整理的，未确认）", en: "Write one paragraph in 4 steps: point, reason, example, result. Use your own example. (The 4 step names were written by Claude, unchecked)" },
          { zh: "交出去，看参考。", en: "Submit, then read the reference." },
        ] },
        { id: "format", type: "prompt", title: { zh: "4 步的写法", en: "The 4 steps" }, text: {
          zh: "观点：Technology gives students … ｜ 原因：This is because … ｜ 例子：For example, … ｜ 结果：As a result, …",
          en: "Point: Technology gives students … | Reason: This is because … | Example: For example, … | Result: As a result, …",
        } },
        { id: "model", type: "text", reveal: true, title: { zh: "范文里的 C2 段（你的范文）", en: "The C2 paragraph in the model essay (your essay)" }, paragraphs: [
          "First and foremost, smartphones make learning more convenient. With educational apps and online videos, students can revise anytime and anywhere, even on a bus ride home. Complex topics can be explained through animations at the tap of a finger.",
        ] },
        { id: "words", type: "table", reveal: true, title: { zh: "范文里这一段用到的好词（范文 Table 1）", en: "Good phrases used in this paragraph (the essay's Table 1)" }, head: [{ zh: "词", en: "Word" }, { zh: "中文", en: "Chinese" }], rows: [
          ["anytime and anywhere", "随时随地"], ["at the tap of a finger", "只需轻轻一点"],
        ] },
        { id: "checks", type: "checks", title: { zh: "AI 会检查", en: "What the AI checks" }, items: [
          { zh: "4 步齐不齐。", en: "Whether all 4 steps are there." },
          { zh: "例子是不是你自己的。", en: "Whether the example is your own." },
          { zh: "有没有用上本周的词。", en: "Whether you used some of this week's words." },
        ] },
      ],
    },
    {
      key: "fri", label: { zh: "第 5 天", en: "Day 5" }, minutes: 10, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [
          { zh: "为 \"Smartphones: Friend or Foe?\" 写结尾。", en: "Write the conclusion for \"Smartphones: Friend or Foe?\"." },
          { zh: "可以用本周的词。", en: "You may use words from this week's list." },
          { zh: "交出去，看范文。", en: "Submit, then read the model." },
        ] },
        { id: "format", type: "prompt", title: { zh: "结尾的写法（来自范文）", en: "How the conclusion is built (from the model essay)" }, text: {
          zh: "第 1 句：总结全文的看法。第 2 句：用一句话收尾，说我们应该怎样做。（这个写法是 Claude 从你的范文整理的，未确认）",
          en: "Sentence 1: sum up the view of the whole article. Sentence 2: end with one sentence on what we should do. (Taken from the model essay by Claude, unchecked)",
        } },
        { id: "model", type: "text", reveal: true, title: { zh: "范文结尾（交了之后才显示）", en: "Model conclusion (shown after submitting)" }, paragraphs: [
          "In a nutshell, the smartphone is a double-edged sword. If we use it wisely, it can be a powerful tool that enriches our lives rather than controls them.",
        ] },
        { id: "checks", type: "checks", title: { zh: "AI 会检查", en: "What the AI checks" }, items: [
          { zh: "有没有总结全文的看法。", en: "Whether the view of the whole article is summed up." },
          { zh: "有没有一句话收尾。", en: "Whether it ends with a closing sentence." },
        ] },
      ],
    },
    {
      key: "sat", label: { zh: "休息日", en: "Rest day" }, minutes: 0, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [{ zh: "休息。", en: "Rest." }] },
      ],
    },
    {
      key: "sun", label: { zh: "周末选做", en: "Weekend choice" }, minutes: 0, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [
          { zh: "选项 A：写完整的 \"Smartphones: Friend or Foe?\"，200 到 250 个字。用第 3 到 5 天写好的开头、主体和结尾，再补上 C1、C3、C4、C5。交给作文 AI 批改。", en: "Option A: write the full article \"Smartphones: Friend or Foe?\", 200 to 250 words. Use your opening, body paragraph and conclusion from days 3 to 5, then add C1, C3, C4 and C5. It goes to the essay-marking AI." },
          { zh: "选项 B：休息。", en: "Option B: rest." },
        ] },
        { id: "model", type: "text", reveal: true, title: { zh: "参考：你的 Exam Version（204 个字）", en: "Reference: the Exam Version (204 words)" }, paragraphs: ESSAY },
      ],
    },
  ],
};

export const WEEKS: Week[] = [BI_WEEK1];
