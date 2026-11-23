// Prototype of the real weekly content, BI week 1 (Technology). Only the admin sees it (see /programme/content).
// Every essay, word, example sentence and Chinese meaning comes from Gary's own Google Docs.
// Anything marked "unchecked" is a label or instruction Claude wrote and Gary has not approved yet.
export type L = { zh: string; en: string };
export type Block =
  | { id: string; type: "steps"; title: L; items: L[]; reveal?: boolean }
  | { id: string; type: "prompt"; title: L; text: L; reveal?: boolean }
  | { id: string; type: "vocab"; title: L; rows: { word: string; zh: string; example: string }[]; reveal?: boolean }
  | { id: string; type: "text"; title: L; paragraphs: string[]; highlight?: { phrase: string; color: 1 | 2 }[]; note?: L; reveal?: boolean }
  | { id: string; type: "table"; title: L; head: L[]; rows: string[][]; reveal?: boolean }
  | { id: string; type: "checks"; title: L; items: L[]; reveal?: boolean };
export type Day = { key: string; label: L; minutes: number; blocks: Block[] };
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
  id: "question", type: "table", title: { zh: "这周的题目（5 个要点）", en: "This week's question (5 points)" },
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
          { zh: "用颜色 1 标出本周 10 个词里，出现在范文里的词。", en: "Highlight in colour 1 the words from this week's list that appear in the essay." },
          { zh: "用颜色 2 标出范文里你觉得好的词和短语。", en: "Highlight in colour 2 the other good words and phrases you find in the essay." },
          { zh: "交出去，对照答案。", en: "Submit, then compare with the answer." },
        ] },
        { id: "essay", type: "text", title: { zh: "范文", en: "Model essay" }, paragraphs: ESSAY },
        { id: "answer", type: "text", reveal: true, title: { zh: "答案（交了之后才显示）", en: "Answer (shown after submitting)" }, paragraphs: ESSAY, highlight: HIGHLIGHT,
          note: { zh: "颜色 1 是本周的词，共 3 个。另外 7 个词不在这篇范文里，它们是 Technology 的万能词，要你自己写的时候用。", en: "Colour 1 = this week's words (3 of them). The other 7 words are not in this essay: they are general Technology phrases for you to use in your own writing." } },
      ],
    },
    {
      key: "wed", label: { zh: "第 3 天", en: "Day 3" }, minutes: 10, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [
          { zh: "看题目的 5 个要点和下面的开头格式。", en: "Look at the 5 points of the question and the opening format below." },
          { zh: "为 \"Smartphones: Friend or Foe?\" 写开头，30 到 45 个字。", en: "Write the opening for \"Smartphones: Friend or Foe?\", 30 to 45 words." },
          { zh: "至少用本周的 2 个词。", en: "Use at least 2 words from this week's list." },
          { zh: "交出去，看范文。", en: "Submit, then read the model." },
        ] },
        QUESTION_TABLE,
        { id: "format", type: "prompt", title: { zh: "开头格式（提问式）", en: "Opening format (question hook)" }, text: {
          zh: "Have you ever wondered [关于主题的问题]? [简短回答或意外的事实]. This article [looks at / explains] [要点 A] and [要点 B].",
          en: "Have you ever wondered [a question about the theme]? [Short answer or surprising truth]. This article [looks at / explains] [point A] and [point B].",
        } },
        { id: "model", type: "text", reveal: true, title: { zh: "范文开头（交了之后才显示）", en: "Model opening (shown after submitting)" }, paragraphs: [
          "Can you imagine a day without your smartphone? For most teenagers today, this small device has become an extension of themselves. Technology has truly transformed the way we live.",
        ], note: { zh: "第 1 句用问题吸引读者，第 2 句说这件事跟青少年有什么关系，第 3 句点出主题。（这个说明是 Claude 写的，未确认）", en: "Sentence 1 hooks the reader with a question, sentence 2 links it to teenagers, sentence 3 states the main idea. (Written by Claude, unchecked)" } },
        { id: "pack", type: "text", reveal: true, title: { zh: "参考：pack 里的 Opening B", en: "Reference: Opening B from the pack" }, paragraphs: [
          "Have you ever wondered how your life would look without a smartphone? For most teenagers, it would be almost impossible. This article explains why technology is so useful and how we can use it wisely.",
        ] },
        { id: "checks", type: "checks", title: { zh: "AI 会检查", en: "What the AI checks" }, items: [
          { zh: "有没有用到本周的 2 个词。", en: "Whether you used 2 words from this week's list." },
          { zh: "有没有点出主题。", en: "Whether the main idea is stated." },
          { zh: "字数是不是 30 到 45。", en: "Whether the length is 30 to 45 words." },
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
        { id: "ref", type: "text", reveal: true, title: { zh: "参考（pack 的 U1，49 个字）", en: "Reference (pack U1, 49 words)" }, paragraphs: [
          "Technology gives students access to a wealth of knowledge. This is because they can learn at their own pace and bridge learning gaps whenever they need. For example, tutorial videos break down difficult topics step by step. As a result, students deepen their understanding and improve their academic performance.",
        ] },
        { id: "model", type: "text", reveal: true, title: { zh: "范文里的 C2 段", en: "The C2 paragraph in the model essay" }, paragraphs: [
          "First and foremost, smartphones make learning more convenient. With educational apps and online videos, students can revise anytime and anywhere, even on a bus ride home. Complex topics can be explained through animations at the tap of a finger.",
        ] },
        { id: "words", type: "table", reveal: true, title: { zh: "这个要点可以用的词（U1）", en: "Words you can use for this point (U1)" }, head: [{ zh: "词", en: "Word" }, { zh: "中文", en: "Chinese" }], rows: [
          ["access to a wealth of knowledge", "获取丰富的知识"], ["bridge learning gaps", "弥补学习差距"], ["improve their academic performance", "提高学业表现"],
          ["at their own pace", "按自己的节奏"], ["deepen their understanding", "加深理解"], ["tutorial videos", "教学视频"],
        ] },
        { id: "checks", type: "checks", title: { zh: "AI 会检查", en: "What the AI checks" }, items: [
          { zh: "4 步齐不齐。", en: "Whether all 4 steps are there." },
          { zh: "例子是不是你自己的。", en: "Whether the example is your own." },
          { zh: "有没有用上上面的词。", en: "Whether you used some of the words above." },
        ] },
      ],
    },
    {
      key: "fri", label: { zh: "第 5 天", en: "Day 5" }, minutes: 10, blocks: [
        { id: "steps", type: "steps", title: { zh: "今天做什么", en: "What to do today" }, items: [
          { zh: "为 \"Smartphones: Friend or Foe?\" 写结尾，30 到 45 个字。", en: "Write the conclusion for \"Smartphones: Friend or Foe?\", 30 to 45 words." },
          { zh: "用下面的格式，并且用上 \"a double-edged sword\"。", en: "Use the format below and include \"a double-edged sword\"." },
          { zh: "交出去，看范文。", en: "Submit, then read the model." },
        ] },
        { id: "format", type: "prompt", title: { zh: "结尾格式（总结加立场）", en: "Conclusion format (summary + opinion)" }, text: {
          zh: "In conclusion, [要点 A] and [要点 B]. I firmly believe that [你的立场]. [最后的想法或希望].",
          en: "In conclusion, [point A] and [point B]. I firmly believe that [your opinion]. [A short final thought or hope].",
        } },
        { id: "model", type: "text", reveal: true, title: { zh: "范文结尾（交了之后才显示）", en: "Model conclusion (shown after submitting)" }, paragraphs: [
          "In a nutshell, the smartphone is a double-edged sword. If we use it wisely, it can be a powerful tool that enriches our lives rather than controls them.",
        ] },
        { id: "pack", type: "text", reveal: true, title: { zh: "参考：pack 里的 Closing A", en: "Reference: Closing A from the pack" }, paragraphs: [
          "In conclusion, technology makes our lives easier and keeps us connected, but too much screen time harms our health and relationships. I firmly believe that the answer is balance. If we use gadgets wisely, they will serve us well.",
        ] },
        { id: "checks", type: "checks", title: { zh: "AI 会检查", en: "What the AI checks" }, items: [
          { zh: "有没有总结要点。", en: "Whether the main points are summed up." },
          { zh: "有没有说出你的立场。", en: "Whether you state your opinion." },
          { zh: "有没有用 a double-edged sword，字数是不是 30 到 45。", en: "Whether you used \"a double-edged sword\" and wrote 30 to 45 words." },
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
