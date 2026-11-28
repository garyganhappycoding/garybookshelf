import { redirect } from "next/navigation";
import Shell from "@/components/programme/Shell";
import CalendarView from "@/components/programme/CalendarView";
import { requireProgramme } from "@/lib/programme/gate";
import { getProfile, myHistoryRows } from "@/lib/programme/profile";
import { pendingExam } from "@/lib/programme/results";
import { unseenBadges } from "@/lib/programme/badges";
import { missingPretests } from "@/lib/programme/pretest";

export const dynamic = "force-dynamic";
export const metadata = { title: "陪你读书", robots: { index: false, follow: false } };

export default async function ProgrammeHome() {
  const a = await requireProgramme();
  const p = await getProfile(a.userId);
  if (!p.setupDone && !a.isAdmin) redirect("/programme/start");
  const subs = a.isAdmin ? [] : await myHistoryRows(a.userId);
  const prompt = await pendingExam(a.userId, p.exams, a.today);
  const fresh = a.isAdmin ? [] : await unseenBadges(a.userId);
  const missing = a.isAdmin ? [] : await missingPretests(a.userId);
  return (
    <Shell active="calendar" admin={a.isAdmin}>
      {missing.length > 0 && (
        <a href="/programme/pretest" className="mb-4 block rounded-2xl border border-ink/15 bg-white p-4 text-sm">
          你还没交{missing.map((m) => (m === "BI" ? "英文" : "马来文")).join("和")}起点作文。有了就回来补上，不急 →
        </a>
      )}
      {fresh.length > 0 && (
        <a href="/programme/badges" className="mb-4 block rounded-2xl border border-clay-400 bg-clay-400/15 p-4 text-sm">
          <b>🎉 你拿到了{fresh.length > 1 ? ` ${fresh.length} 枚` : "一枚"}新徽章：{fresh.map((f) => (f.id === "effort" && f.n ? `努力 ${f.n} 天` : f.title)).join("、")}</b> 去看看 →
        </a>
      )}
      {prompt && (
        <a href={`/programme/results?exam=${prompt.id}`} className="mb-4 block rounded-2xl border border-clay-400 bg-clay-400/15 p-4 text-sm">
          <b>{prompt.name.replace(/（.*?）/g, "")}考完了。</b> 把成绩单交上来，看看你进步了多少 →
        </a>
      )}
      <CalendarView state={p.state} form={p.form} exams={p.exams} today={a.today} subs={subs} demo={a.isAdmin} />
    </Shell>
  );
}
