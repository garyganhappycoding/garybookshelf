import Shell from "@/components/programme/Shell";
import TodayView, { type TodayData } from "@/components/programme/TodayView";
import { requireProgramme } from "@/lib/programme/gate";
import { hasSubmitted, listComments } from "@/lib/programme/daily";
import { classKey, getProfile } from "@/lib/programme/profile";
import { buildCalendar } from "@/lib/programme/calendar";
import { resolveDay, studentBlocks } from "@/lib/programme/dayflow";

export const dynamic = "force-dynamic";
export const metadata = { title: "今天 · 陪你读书", robots: { index: false, follow: false } };

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ lang?: string; date?: string }> }) {
  const a = await requireProgramme();
  const sp = await searchParams;
  const lang = sp.lang === "BI" ? "BI" : "BM";
  // The admin can walk through any day with ?date=YYYY-MM-DD (students always get the real Malaysia date).
  const today = a.isAdmin && /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "") ? String(sp.date) : a.today;
  const p = await getProfile(a.userId);
  const sub = await hasSubmitted(a.userId, today, lang);
  // classmates' comments are only loaded once the student has handed in their own answer; the class is state + Form
  const comments = sub ? await listComments(a.userId, classKey(p), today, lang) : [];
  const found = resolveDay(buildCalendar(p.state), today, lang);
  const card = found ? {
    label: found.day.label, minutes: found.day.minutes, blocks: studentBlocks(found.day, !!sub), response: found.day.response ?? { kind: "none" as const },
    week: { n: found.week.n, theme: found.week.theme, essay: found.week.essay },
  } : null;
  const data: TodayData = {
    day: today, lang, state: p.state, demo: a.isAdmin, ilang: p.instructionLang, card,
    submitted: !!sub, submissionId: sub?.id ?? null, feedback: sub?.ai_feedback ?? null, aiStatus: sub?.ai_status ?? null, answerText: sub?.answer ?? null, comments,
  };
  return (
    <Shell active="today" admin={a.isAdmin}>
      <TodayView data={data} />
    </Shell>
  );
}
