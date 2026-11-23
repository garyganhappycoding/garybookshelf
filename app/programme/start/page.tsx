import { redirect } from "next/navigation";
import Shell from "@/components/programme/Shell";
import StartView from "@/components/programme/StartView";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile } from "@/lib/programme/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "开始 · 陪你读书", robots: { index: false, follow: false } };

export default async function StartPage() {
  const a = await requireProgramme();
  const p = await getProfile(a.userId);
  if (p.setupDone) redirect("/programme");
  return (
    <Shell admin={a.isAdmin}>
      <StartView state={p.state} form={p.form} />
    </Shell>
  );
}
