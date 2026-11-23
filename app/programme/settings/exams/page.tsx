import Shell from "@/components/programme/Shell";
import ExamsView from "@/components/programme/ExamsView";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "考试日期 · 陪你读书", robots: { index: false, follow: false } };

export default async function ExamsPage() {
  const a = await requireProgramme();
  const p = await getProfile(a.userId);
  return (
    <Shell active="settings" admin={a.isAdmin}>
      <ExamsView initial={p.exams} />
    </Shell>
  );
}
