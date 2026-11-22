import Shell from "@/components/programme/Shell";
import TodayView, { type TodayData } from "@/components/programme/TodayView";
import { requireProgrammeAdmin } from "@/lib/programme/gate";
import { createClient } from "@/lib/supabase/server";
import { hasSubmitted, listComments } from "@/lib/programme/daily";
import { DEMO_TODAY } from "@/lib/programme/calendar";

export const dynamic = "force-dynamic";
export const metadata = { title: "今天 · 陪你读书（管理员预览）", robots: { index: false, follow: false } };

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ lang?: string; state?: string }> }) {
  await requireProgrammeAdmin();
  const sp = await searchParams;
  const lang = sp.lang === "BI" ? "BI" : "BM";
  const state = sp.state && /^[A-Za-z0-9]{2,12}$/.test(sp.state) ? sp.state : "KL";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sub = user ? await hasSubmitted(user.id, DEMO_TODAY, lang) : null;
  // classmates' comments are only loaded once the student has handed in their own answer
  const comments = user && sub ? await listComments(user.id, state, DEMO_TODAY, lang) : [];
  const data: TodayData = {
    day: DEMO_TODAY, lang, state,
    submitted: !!sub, submissionId: sub?.id ?? null, feedback: sub?.ai_feedback ?? null, aiStatus: sub?.ai_status ?? null, comments,
  };
  return (
    <Shell active="today">
      <TodayView data={data} />
    </Shell>
  );
}
