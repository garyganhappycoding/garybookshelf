import Shell from "@/components/programme/Shell";
import SettingsView from "@/components/programme/SettingsView";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "设置 · 陪你读书", robots: { index: false, follow: false } };

export default async function SettingsPage() {
  const a = await requireProgramme();
  const p = await getProfile(a.userId);
  return (
    <Shell active="settings" admin={a.isAdmin}>
      <SettingsView state={p.state} form={p.form} instructionLang={p.instructionLang} />
    </Shell>
  );
}
