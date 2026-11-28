import Shell from "@/components/programme/Shell";
import PretestForm from "@/components/programme/PretestForm";
import { requireProgramme } from "@/lib/programme/gate";
import { myPretests } from "@/lib/programme/pretest";

export const dynamic = "force-dynamic";
export const metadata = { title: "起点作文 · 陪你读书", robots: { index: false, follow: false } };

export default async function PretestPage() {
  const a = await requireProgramme({ allowNoPretest: true });
  const rows = await myPretests(a.userId);
  const done = (l: "BI" | "BM") => rows.some((p) => p.lang === l && p.body.split(/\s+/).filter(Boolean).length >= 30);
  const skipped = (l: "BI" | "BM") => !done(l) && rows.some((p) => p.lang === l && p.skipped);
  return (
    <Shell admin={a.isAdmin}>
      <h1 className="mb-1 text-2xl font-medium">起点作文</h1>
      <p className="mb-4 text-sm text-ink/60">开始之前，请交一篇英文作文和一篇马来文作文，让我们知道你现在的水平。以后每周、每个月的作文测验，都会和这一篇比较。现在还没有作文的话，可以勾「以后再补」先跳过，有了再回来交。</p>
      <PretestForm have={{ BI: done("BI"), BM: done("BM") }} skipped={{ BI: skipped("BI"), BM: skipped("BM") }} />
    </Shell>
  );
}
