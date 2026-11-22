import Shell from "@/components/programme/Shell";
import TodayView from "@/components/programme/TodayView";
import { requireProgrammeAdmin } from "@/lib/programme/gate";

export const dynamic = "force-dynamic";
export const metadata = { title: "今天 · 陪你读书（管理员预览）", robots: { index: false, follow: false } };

export default async function TodayPage() {
  await requireProgrammeAdmin();
  return (
    <Shell active="today">
      <TodayView />
    </Shell>
  );
}
