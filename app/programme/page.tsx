import Shell from "@/components/programme/Shell";
import CalendarView from "@/components/programme/CalendarView";
import { requireProgrammeAdmin } from "@/lib/programme/gate";

export const dynamic = "force-dynamic";
export const metadata = { title: "陪你读书（管理员预览）", robots: { index: false, follow: false } };

export default async function ProgrammeHome() {
  await requireProgrammeAdmin();
  return (
    <Shell active="calendar">
      <CalendarView />
    </Shell>
  );
}
