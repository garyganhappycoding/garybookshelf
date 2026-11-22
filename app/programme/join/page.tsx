import Shell from "@/components/programme/Shell";
import JoinView from "@/components/programme/JoinView";
import { requireProgrammeAdmin } from "@/lib/programme/gate";

export const dynamic = "force-dynamic";
export const metadata = { title: "加入 · 陪你读书（管理员预览）", robots: { index: false, follow: false } };

export default async function JoinPage() {
  await requireProgrammeAdmin();
  return (
    <Shell active="join">
      <JoinView />
    </Shell>
  );
}
