import Shell from "@/components/programme/Shell";
import MonthlyForm from "@/components/programme/MonthlyForm";
import { requireProgramme } from "@/lib/programme/gate";
import { pendingMonthly } from "@/lib/programme/monthly";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata = { title: "月测 · 陪你读书", robots: { index: false, follow: false } };

export default async function MonthlyPage() {
  const a = await requireProgramme();
  const item = (await pendingMonthly(a.userId, a.today))[0];
  return (
    <Shell admin={a.isAdmin}>
      <h1 className="mb-1 text-2xl font-medium">本月作文测验</h1>
      {item ? (
        <>
          <p className="mb-4 text-sm text-ink/60">每个月最后一个周日，用这个月第一周的题目写一篇英文和一篇马来文作文。不计入连续打卡，分数会画在「我的进步」里。</p>
          <MonthlyForm item={item} />
        </>
      ) : <p className="card text-sm text-ink/70">现在没有要交的月测。</p>}
    </Shell>
  );
}
