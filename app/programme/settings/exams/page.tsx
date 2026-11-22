import Shell from "@/components/programme/Shell";
import ExamsView from "@/components/programme/ExamsView";
import { requireProgrammeAdmin } from "@/lib/programme/gate";

export const dynamic = "force-dynamic";
export const metadata = { title: "考试日期 · 陪你读书（管理员预览）", robots: { index: false, follow: false } };

export default async function ExamsPage() {
  await requireProgrammeAdmin();
  return (
    <Shell active="settings">
      <ExamsView />
    </Shell>
  );
}
