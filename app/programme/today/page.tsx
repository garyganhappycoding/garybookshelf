import Shell from "@/components/programme/Shell";
import TodayView, { type TodayData } from "@/components/programme/TodayView";
import { requireProgramme } from "@/lib/programme/gate";
import { hasSubmitted, listComments } from "@/lib/programme/daily";
import { classKey, getProfile, myHistoryRows } from "@/lib/programme/profile";
import { addDays, buildCalendar, demoHistory, facts, key, mondayOf, parse, programmeEnd, realHistory } from "@/lib/programme/calendar";
import { resolveDay, studentBlocks } from "@/lib/programme/dayflow";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { pendingExam } from "@/lib/programme/results";
import { pendingMonthly } from "@/lib/programme/monthly";
import { dayKeyFor } from "@/lib/programme/content/index";

export const dynamic = "force-dynamic";
export const metadata = { title: "今天 · 陪你读书", robots: { index: false, follow: false } };

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ lang?: string; date?: string; beta?: string }> }) {
  const a = await requireProgramme();
  const sp = await searchParams;
  // the monthly essay test is mandatory: until it is handed in, Today sends the student to it (the admin preview is not blocked)
  if (!a.isAdmin && (await pendingMonthly(a.userId, a.today)).length) redirect("/programme/monthly");
  const lang = sp.lang === "BI" ? "BI" : "BM";
  // ?date=YYYY-MM-DD opens another day: the admin may open any day, a student only days that have already started (to catch up).
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? "");
  const today = dateOk && (a.isAdmin || String(sp.date) <= a.today) ? String(sp.date) : a.today;
  const p = await getProfile(a.userId);
  const sub = await hasSubmitted(a.userId, today, lang);
  // classmates' comments are only loaded once the student has handed in their own answer; the class is state + Form
  const comments = sub ? await listComments(a.userId, classKey(p), today, lang) : [];
  const found = resolveDay(buildCalendar(p.state), today, lang, p.exams, programmeEnd(p.exams, p.form), p.form);
  const examWeek = !!found && "exam" in found;
  const ended = !!found && "ended" in found;
  const card = found && !("exam" in found) && !("ended" in found) ? {
    label: found.day.label, minutes: found.day.minutes, blocks: studentBlocks(found.day, !!sub), response: found.day.response ?? { kind: "none" as const },
    week: { n: found.week.n, theme: found.week.theme, essay: found.week.essay },
  } : null;
  // The numbers and the week strip at the top (as on the calendar page)
  const cal = buildCalendar(p.state);
  const history = a.isAdmin ? demoHistory(cal, a.today) : realHistory(cal, a.today, await myHistoryRows(a.userId));
  const f = facts(cal, a.today, history);
  const mon = mondayOf(parse(today)), first = cal.group === "A" ? addDays(mon, -1) : mon;
  const LABEL: Record<string, string> = { mon: "1", tue: "2", wed: "3", thu: "4", fri: "5", sat: "六", sun: "日" };
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dd = addDays(first, i), k = key(dd);
    return { k, label: LABEL[dayKeyFor(cal.group, dd.getDay())], state: history[k] ?? null, future: !a.isAdmin && k > a.today };
  });
  const resultPrompt = await pendingExam(a.userId, p.exams, a.today);
  // beta testers: today's feedback they already sent (so the form shows it and they can change it)
  // the admin can add ?beta=1 to see the page the way a beta tester sees it
  const betaView = a.beta || (a.isAdmin && sp.beta === "1");
  const betaSaved = betaView
    ? (await createAdminClient().from("programme_beta_feedback").select("time_spent, ai_helpful, ai_why, stuck, change, badges_note").eq("user_id", a.userId).eq("day", today).maybeSingle()).data
    : null;
  const data: TodayData = {
    resultPrompt: resultPrompt ? { id: resultPrompt.id, name: resultPrompt.name } : null,
    todayReal: a.today, stats: { week: f.week, weeks: f.weeks, left: f.left, total: f.total, earned: f.earned, streak: f.streak }, weekDays,
    day: today, lang, state: p.state, demo: a.isAdmin, ilang: p.instructionLang, form: p.form, card, examWeek, ended,
    beta: betaView ? { saved: betaSaved ?? null } : null,
    submitted: !!sub, submissionId: sub?.id ?? null, feedback: sub?.ai_feedback ?? null, aiStatus: sub?.ai_status ?? null, answerText: sub?.answer ?? null, marks: Array.isArray((sub?.details as { marks?: unknown } | null)?.marks) ? ((sub!.details as { marks: { k: string; w: string; c: 1 | 2 }[] }).marks) : null, comments,
  };
  return (
    <Shell active="today" admin={a.isAdmin} wide>
      <TodayView data={data} />
    </Shell>
  );
}
