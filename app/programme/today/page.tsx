import Shell from "@/components/programme/Shell";
import TodayView, { type TodayData } from "@/components/programme/TodayView";
import { requireProgramme } from "@/lib/programme/gate";
import { hasSubmitted, listComments } from "@/lib/programme/daily";
import { classKey, getProfile } from "@/lib/programme/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "今天 · 陪你读书", robots: { index: false, follow: false } };

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const a = await requireProgramme();
  const sp = await searchParams;
  const lang = sp.lang === "BI" ? "BI" : "BM";
  const p = await getProfile(a.userId);
  const sub = await hasSubmitted(a.userId, a.today, lang);
  // classmates' comments are only loaded once the student has handed in their own answer; the class is state + Form
  const comments = sub ? await listComments(a.userId, classKey(p), a.today, lang) : [];
  const data: TodayData = {
    day: a.today, lang, state: p.state, demo: a.isAdmin,
    submitted: !!sub, submissionId: sub?.id ?? null, feedback: sub?.ai_feedback ?? null, aiStatus: sub?.ai_status ?? null, comments,
  };
  return (
    <Shell active="today" admin={a.isAdmin}>
      <TodayView data={data} />
    </Shell>
  );
}
