import Shell from "@/components/programme/Shell";
import SettingsView from "@/components/programme/SettingsView";
import { requireProgrammeAdmin } from "@/lib/programme/gate";

export const dynamic = "force-dynamic";
export const metadata = { title: "设置 · 陪你读书（管理员预览）", robots: { index: false, follow: false } };

export default async function SettingsPage() {
  await requireProgrammeAdmin();
  return (
    <Shell active="settings">
      <SettingsView />
    </Shell>
  );
}
