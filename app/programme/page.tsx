import { redirect } from "next/navigation";
import Shell from "@/components/programme/Shell";
import CalendarView from "@/components/programme/CalendarView";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile, myHistoryRows } from "@/lib/programme/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "陪你读书", robots: { index: false, follow: false } };

export default async function ProgrammeHome() {
  const a = await requireProgramme();
  const p = await getProfile(a.userId);
  if (!p.setupDone && !a.isAdmin) redirect("/programme/start");
  const subs = a.isAdmin ? [] : await myHistoryRows(a.userId);
  return (
    <Shell active="calendar" admin={a.isAdmin}>
      <CalendarView state={p.state} form={p.form} exams={p.exams} today={a.today} subs={subs} demo={a.isAdmin} />
    </Shell>
  );
}
