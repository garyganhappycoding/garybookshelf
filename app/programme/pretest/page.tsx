import Shell from "@/components/programme/Shell";
import PretestForm from "@/components/programme/PretestForm";
import { requireProgramme } from "@/lib/programme/gate";
import { myPretests } from "@/lib/programme/pretest";

export const dynamic = "force-dynamic";
export const metadata = { title: "起点作文 · 陪你读书", robots: { index: false, follow: false } };

export default async function PretestPage() {
  const a = await requireProgramme({ allowNoPretest: true });
  const have = new Set((await myPretests(a.userId)).map((p) => p.lang));
  return (
    <Shell admin={a.isAdmin}>
      <h1 className="mb-1 text-2xl font-medium">起点作文</h1>
      <p className="mb-4 text-sm text-ink/60">开始之前，请交一篇英文作文和一篇马来文作文，让我们知道你现在的水平。以后每周、每个月的作文测验，都会和这一篇比较。</p>
      <PretestForm have={{ BI: have.has("BI"), BM: have.has("BM") }} />
    </Shell>
  );
}
