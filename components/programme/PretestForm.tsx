"use client";
import Link from "@/components/Link";
import { useActionState } from "react";
import { savePretestAction, type PretestState } from "@/app/programme/pretest/actions";

const init: PretestState = {};

function Block({ lang, title, hint, done, skipped }: { lang: "BI" | "BM"; title: string; hint: string; done: boolean; skipped: boolean }) {
  return (
    <section className="card space-y-3">
      <p className="font-medium">{title}{done && <span className="ml-2 text-xs text-sage-600">已经交过了，可以更换</span>}</p>
      <p className="text-sm text-ink/70">{hint}</p>
      <textarea name={`text-${lang}`} rows={9} aria-label={`${lang} essay`} placeholder="在这里打字写，或把手写作文拍照后的文字打进来（至少 30 个字）。现在没有的话，勾下面的「以后再补」" className="min-h-[11rem] w-full rounded-lg border border-ink/20 bg-white p-3 text-base" />
      <label className="block text-sm">
        <span className="text-ink/70">手写的作文？拍张照，然后把照片里的字打进上面的格子里。也可以另外上传 PDF 或照片给 Gary 看（选填）</span>
        <input type="file" name={`file-${lang}`} accept="application/pdf,image/*" className="mt-1 block w-full text-sm" />
      </label>
      {!done && (
        <label className="flex min-h-11 items-center gap-2 rounded-xl bg-ink/5 px-3 text-sm">
          <input type="checkbox" name={`skip-${lang}`} defaultChecked={skipped} className="h-4 w-4 accent-clay-600" />
          <span>我现在没有这篇，<b>以后再补</b>（先跳过）</span>
        </label>
      )}
    </section>
  );
}

export default function PretestForm({ have, skipped }: { have: { BI: boolean; BM: boolean }; skipped: { BI: boolean; BM: boolean } }) {
  const [state, action, pending] = useActionState(savePretestAction, init);
  if (state.ok) {
    return (
      <div className="card text-center">
        <p className="mb-2 text-xl font-medium">收到了，谢谢！</p>
        <p className="mb-4 text-sm text-ink/70">现在可以开始了。以后每周和每个月，我们会请你再写一篇，看你比现在进步了多少。</p>
        <Link href="/programme" className="btn-primary inline-block text-sm">开始</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <Block lang="BI" title="英文作文（BI）" hint="打字写一篇英文作文，或把你写过的贴上来。系统会批改，当作你的起点。" done={have.BI} skipped={skipped.BI} />
      <Block lang="BM" title="马来文作文（BM）" hint="打字写一篇马来文作文（karangan），或把你写过的贴上来。系统会批改，当作你的起点。" done={have.BM} skipped={skipped.BM} />
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary min-h-12 text-sm disabled:opacity-50">{pending ? "交上去中…" : "交上去"}</button>
    </form>
  );
}
