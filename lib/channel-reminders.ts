// Reminders for Gary to write his Telegram channel posts. The daily cron (app/api/cron/channel-reminders)
// sends whatever this returns for today's date (Malaysia time) to Gary's private bot chat.
// Plan: brand/TELEGRAM-CHANNEL-PLAN.md (Part 4c). SPM paper dates: brand/SPM-2026-TIMETABLE.md.
import { todayInMalaysia } from "@/lib/exam-dates";

const DAY = 86_400_000;
const asDay = (ymd: string) => Date.parse(`${ymd}T00:00:00Z`);
const addDays = (ymd: string, n: number) => new Date(asDay(ymd) + n * DAY).toISOString().slice(0, 10);
const weekday = (ymd: string) => new Date(asDay(ymd)).getUTCDay(); // 0 = Sunday ... 2 = Tuesday ... 6 = Saturday

const POLL_START = "2026-11-25"; // first Wednesday poll, then every 14 days
const QA_START = "2026-11-28"; // first Saturday "student question answered" post, then every 14 days
const every14 = (ymd: string, start: string) => {
  const d = Math.round((asDay(ymd) - asDay(start)) / DAY);
  return d >= 0 && d % 14 === 0;
};

type Paper = { date: string; subject: string; times: string; free?: string };

// Written papers of the subjects Gary teaches (official timetable, version of 18 Aug 2026).
const PAPERS: Paper[] = [
  { date: "2026-11-23", subject: "BM", times: "Paper 1 10:45am, Paper 2 2:30pm", free: "tatabahasa 笔记" },
  { date: "2026-11-24", subject: "BI", times: "Paper 1 11:00am, Paper 2 2:30pm", free: "English Part 2 答案+解释, grammar (tenses), Part 2 collocations, reading part 2 notes" },
  { date: "2026-11-25", subject: "Moral", times: "8:15am" },
  { date: "2026-11-26", subject: "Math", times: "Paper 1 8:15am, Paper 2 10:45am" },
  { date: "2026-11-30", subject: "Sejarah", times: "Paper 1 8:15am, Paper 2 10:30am" },
  { date: "2026-12-02", subject: "Biology", times: "Paper 1 8:15am, Paper 2 10:45am", free: "biology notes" },
  { date: "2026-12-03", subject: "Physics", times: "Paper 1 8:15am, Paper 2 10:30am", free: "phy笔记大全" },
  { date: "2026-12-08", subject: "Bahasa Cina", times: "Paper 1 8:15am, Paper 2 2:30pm" },
  { date: "2026-12-10", subject: "Sains Komputer", times: "Paper 1 2:30pm" },
  { date: "2026-12-15", subject: "Chemistry", times: "Paper 1 8:15am, Paper 2 10:45am", free: "chemi笔记大全" },
  { date: "2026-12-17", subject: "Add Math", times: "Paper 1 8:15am, Paper 2 2:30pm", free: "addmath checklist" },
];

// Gary's rule (23 Nov 2026): promote a 冲刺包 every 2 weeks in the run-up to each exam, and remind him
// 1 month before. Add each exam here once its date is known (trial, mid-year, SPM 2027 dates come out
// around August 2027). Dates are Malaysia calendar days, YYYY-MM-DD.
const EXAMS: { date: string; name: string }[] = [];
const SPM_2027_CHECK = "2027-08-18"; // last year the SPM timetable came out on 18 Aug

export function channelReminders(today: string = todayInMalaysia()): string[] {
  const out: string[] = [];
  const dow = weekday(today);

  for (const e of EXAMS) {
    const daysTo = Math.round((asDay(e.date) - asDay(today)) / DAY);
    if (daysTo === 30) out.push(`📅 1 month to ${e.name} (${e.date}). Prepare the 冲刺包 and plan its promo posts: one every 2 weeks until the exam.`);
    if (daysTo === 28 || daysTo === 14) out.push(`🚀 ${daysTo} days to ${e.name}: post the 冲刺包 promotion today (channel and Instagram).`);
  }
  if (today === SPM_2027_CHECK) out.push(`🗓 The SPM 2027 timetable should be out about now. Send me the dates so I can add them to the exam list and the 冲刺包 reminders.`);

  // The evening before each paper: write the good-luck post.
  const tomorrow = addDays(today, 1);
  const paper = PAPERS.find((p) => p.date === tomorrow);
  if (paper) {
    out.push(
      [
        `🎯 Tomorrow is SPM ${paper.subject} (${paper.times}).`,
        `Write your channel good-luck post today and schedule it for 7 to 8pm tonight.`,
        paper.free ? `Free notes you can link: ${paper.free}` : `No free notes for this subject: encouragement only.`,
        `Then one product line at most. Purchases need your approval before download.`,
      ].join("\n")
    );
  }

  // Tuesday is Gary's work day: write and schedule the week's channel posts.
  if (dow === 2) {
    const lines = [
      `📝 Tuesday: channel writing day.`,
      `• Write this Sunday's letter (post at 8pm).`,
    ];
    if (every14(addDays(today, 4), QA_START)) lines.push(`• Pick and check a student question to answer, post Saturday 10am (answer it in the website inbox first).`);
    if (every14(addDays(today, 1), POLL_START)) lines.push(`• Poll for tomorrow (Wednesday) 8pm: "下个月你最想看哪一个？"`);
    lines.push(`Schedule them in Telegram: hold the send button, then Schedule Message.`);
    out.push(lines.join("\n"));
  }

  // Saturday morning: last check that Sunday's letter is scheduled.
  if (dow === 6) out.push(`💌 Is tomorrow's 8pm letter scheduled in the channel? If not, write it now.`);

  return out;
}
