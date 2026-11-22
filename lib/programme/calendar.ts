// 陪你读书: pure calendar logic (no database). Ported from the prototype Gary approved.
// Dates are plain "YYYY-MM-DD" strings, parsed at local noon so timezones never shift the day.
import HOLIDAYS from "./holidays-2027.json";

export type Group = "A" | "B";
export type StateInfo = { id: string; zh: string; group: Group };

export const STATES: StateInfo[] = [
  { id: "KL", zh: "吉隆坡", group: "B" }, { id: "Selangor", zh: "雪兰莪", group: "B" }, { id: "Putrajaya", zh: "布城", group: "B" },
  { id: "Johor", zh: "柔佛", group: "B" }, { id: "Penang", zh: "槟城", group: "B" }, { id: "Perak", zh: "霹雳", group: "B" },
  { id: "Melaka", zh: "马六甲", group: "B" }, { id: "N9", zh: "森美兰", group: "B" }, { id: "Pahang", zh: "彭亨", group: "B" },
  { id: "Perlis", zh: "玻璃市", group: "B" }, { id: "Sabah", zh: "沙巴", group: "B" }, { id: "Sarawak", zh: "沙捞越", group: "B" },
  { id: "Labuan", zh: "纳闽", group: "B" },
  { id: "Kedah", zh: "吉打", group: "A" }, { id: "Kelantan", zh: "吉兰丹", group: "A" }, { id: "Terengganu", zh: "登嘉楼", group: "A" },
];

const TERMS: Record<Group, [string, string][]> = {
  A: [["2027-01-04", "2027-03-04"], ["2027-03-14", "2027-05-20"], ["2027-06-06", "2027-08-26"], ["2027-09-05", "2027-12-02"]],
  B: [["2027-01-04", "2027-03-05"], ["2027-03-15", "2027-05-21"], ["2027-06-07", "2027-08-27"], ["2027-09-06", "2027-12-03"]],
};
const BREAKS: Record<Group, [string, string, string][]> = {
  A: [["2027-03-05", "2027-03-13", "学校假期"], ["2027-05-21", "2027-06-05", "年中假期"], ["2027-08-27", "2027-09-04", "学校假期"], ["2027-12-03", "2027-12-31", "年终假期"], ["2027-01-01", "2027-01-03", "年假"]],
  B: [["2027-03-06", "2027-03-14", "学校假期"], ["2027-05-22", "2027-06-06", "年中假期"], ["2027-08-28", "2027-09-05", "学校假期"], ["2027-12-04", "2027-12-31", "年终假期"], ["2027-01-01", "2027-01-03", "年假"]],
};

const ZH: Record<string, string> = {
  "New Year": "元旦", "Chinese New Year": "农历新年", "Chinese New Year (2nd day)": "农历新年第 2 天", "Workers' Day": "劳动节",
  "Wesak Day": "卫塞节", "SPB Yang di-Pertuan Agong's Birthday": "最高元首诞辰", "National Day": "国庆日", "Malaysia Day": "马来西亚日",
  "Deepavali": "屠妖节", "Christmas": "圣诞节", "Federal Territory (FT) Day": "联邦直辖区日", "Good Friday": "耶稣受难日",
  "Thaipusam": "大宝森节", "Christmas Eve": "平安夜", "Gawai Dayak Festival": "Gawai 节",
};

export const THEMES = ["Technology", "Environment", "Health & Sports", "School & Education", "Finance & Consumerism", "People & Culture", "Teenagers & Society", "Travel / Leisure / Home", "Review", "Report", "Story"];
export const LEVELS = ["B1 基础", "B2 进阶", "B2 到 C1 提高", "C1 挑战"];

export type Exam = { id: string; name: string; start: string; end: string };
export const DEFAULT_EXAMS: Exam[] = [
  { id: "e1", name: "年中考（估计）", start: "2027-04-26", end: "2027-05-14" },
  { id: "e2", name: "Form 5 模拟考（估计）", start: "2027-07-19", end: "2027-08-20" },
  { id: "e3", name: "Form 4 年终考（估计）", start: "2027-10-11", end: "2027-10-29" },
  { id: "e4", name: "SPM 2027（等 KPM 公布日期）", start: "", end: "" },
];

const TASKS_B: Record<number, [string, string]> = {
  1: ["星期一", "学这周的 10 个 BM 词和 10 个 BI 词，每个词造一个句子。"],
  2: ["星期二", "读这个主题的范文，留意词怎么用。"],
  3: ["星期三", "写作文开头的草稿，用上这周的词。"],
  4: ["星期四", "写主体段落，练习怎样把想法讲开。"],
  5: ["星期五", "写结尾，把整篇作文收好。"],
  6: ["星期六", "休息。"],
  0: ["星期日", "回忆这个主题学过的词，不看笔记先说一遍。"],
};
// Group A study days are Sunday to Thursday, so their week is shifted by one day.
const TASKS_A: Record<number, [string, string]> = {
  0: ["星期日", "学这周的 10 个 BM 词和 10 个 BI 词，每个词造一个句子。"],
  1: ["星期一", "读这个主题的范文，留意词怎么用。"],
  2: ["星期二", "写作文开头的草稿，用上这周的词。"],
  3: ["星期三", "写主体段落，练习怎样把想法讲开。"],
  4: ["星期四", "写结尾，把整篇作文收好。"],
  5: ["星期五", "休息。"],
  6: ["星期六", "回忆这个主题学过的词，不看笔记先说一遍。"],
};

export const WEEKDAY_ZH = ["日", "一", "二", "三", "四", "五", "六"];
export const parse = (k: string) => new Date(k + "T12:00:00");
export const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
export const cn = (d: Date) => `${d.getMonth() + 1} 月 ${d.getDate()} 日`;

export const themeOf = (week: number) => THEMES[(week - 1) % THEMES.length];
export const levelOf = (week: number) => LEVELS[Math.min(LEVELS.length - 1, Math.floor((week - 1) / THEMES.length))];

export type Holiday = { name: string; sub: boolean };
export type Calendar = ReturnType<typeof buildCalendar>;

export function buildCalendar(stateId: string) {
  const st = STATES.find((s) => s.id === stateId) ?? STATES[0];
  const g = st.group;
  const restDay = g === "A" ? 5 : 0; // weekly rest day that a public holiday cannot be "lost" on
  const src = (HOLIDAYS as Record<string, Record<string, string>>)[st.id] ?? {};
  const hol: Record<string, Holiday> = {};
  Object.keys(src).forEach((k) => { hol[k] = { name: src[k], sub: false }; });
  // A holiday on the weekly rest day moves to the next day that is not already a holiday.
  Object.keys(src).sort().forEach((k) => {
    if (parse(k).getDay() === restDay) {
      let n = addDays(parse(k), 1);
      while (hol[key(n)]) n = addDays(n, 1);
      hol[key(n)] = { name: src[k], sub: true };
    }
  });
  const terms = TERMS[g], brks = BREAKS[g];
  const inTerm = (k: string) => terms.some((t) => k >= t[0] && k <= t[1]);
  const weekNo: Record<string, number> = {};
  let count = 0;
  for (let d = parse("2027-01-04"); key(d) <= "2027-12-06"; d = addDays(d, 7)) {
    if (inTerm(key(d))) { count += 1; weekNo[key(d)] = count; }
  }
  const schoolDow = g === "A" ? [0, 1, 2, 3, 4] : [1, 2, 3, 4, 5];
  const isSchool = (d: Date) => schoolDow.includes(d.getDay()) && inTerm(key(d)) && !hol[key(d)];
  let days = 0;
  for (let d = parse("2027-01-01"); key(d) <= "2027-12-31"; d = addDays(d, 1)) if (isSchool(d)) days += 1;
  return {
    state: st, group: g, hol, weekNo, weeks: count, days, inTerm, isSchool,
    breakOf: (k: string) => brks.find((b) => k >= b[0] && k <= b[1])?.[2] ?? null,
    weekOf: (d: Date) => weekNo[key(mondayOf(g === "A" && d.getDay() === 0 ? addDays(d, 1) : d))] ?? 0,
    tasks: g === "A" ? TASKS_A : TASKS_B,
    dayOff: g === "A" ? [5, 6] : [0, 6],
  };
}

export const holidayName = (h: Holiday) => (ZH[h.name] ?? h.name) + (h.sub ? "（补假）" : "");

export const examsOn = (exams: Exam[], k: string) =>
  exams.map((e, i) => ({ e, i })).filter((x) => x.e.start && x.e.end && k >= x.e.start && k <= x.e.end);

/** Numbers for the header: week, school days left, RM earned back, streak. `missed` = school days not done so far. */
export function facts(cal: Calendar, today: string, missed: number) {
  let passed = 0, left = 0;
  for (let d = parse("2027-01-01"); key(d) <= "2027-12-31"; d = addDays(d, 1)) {
    if (!cal.isSchool(d)) continue;
    if (key(d) < today) passed += 1; else left += 1; // today still counts as to-do
  }
  const done = Math.max(0, passed - missed);
  return { week: cal.weekOf(parse(today)), weeks: cal.weeks, left, total: cal.days, earned: Math.min(done, 200), streak: done };
}

// Friend-group pricing: 1 person RM200, 2 people each RM190 (5% off), 3 people each RM180 (10% off). Max 3.
export const GROUP_PRICE: Record<1 | 2 | 3, number> = { 1: 200, 2: 190, 3: 180 };

// The prototype used a fixed "today" so the pages always show something meaningful before launch.
export const DEMO_TODAY = "2027-02-17";
