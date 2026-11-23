import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProgrammeAdmin } from "@/lib/programme/gate";
import { WEEKS, type Block, type L } from "@/lib/programme/week-content";
import Shell from "@/components/programme/Shell";
import HighlightEssay from "@/components/programme/HighlightEssay";

export const dynamic = "force-dynamic";

// Gary's review pass over the real weekly content. Admin only: a student (or anyone signed out) gets a 404 here.
async function reviewAction(form: FormData) {
  "use server";
  await requireProgrammeAdmin();
  const week = Number(form.get("week")), lang = String(form.get("lang")), item = String(form.get("item") ?? "").slice(0, 80);
  const verdict = String(form.get("verdict")), note = String(form.get("note") ?? "").slice(0, 1500);
  if (!Number.isInteger(week) || !["BI", "BM"].includes(lang) || !item) return;
  const admin = createAdminClient();
  if (verdict === "clear") await admin.from("programme_content_reviews").delete().match({ lang, week, item });
  else if (verdict === "right" || verdict === "wrong")
    await admin.from("programme_content_reviews").upsert({ lang, week, item, verdict, note, updated_at: new Date().toISOString() }, { onConflict: "lang,week,item" });
  revalidatePath("/programme/content");
}

function Marked({ text, marks }: { text: string; marks?: { phrase: string; color: 1 | 2 }[] }) {
  if (!marks?.length) return <>{text}</>;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${marks.map((m) => esc(m.phrase)).join("|")})`, "gi");
  return <>{text.split(re).map((part, i) => {
    const m = marks.find((x) => x.phrase.toLowerCase() === part.toLowerCase());
    return m ? <mark key={i} className={m.color === 1 ? "bg-blue-200 rounded px-0.5" : "bg-red-200 rounded px-0.5"}>{part}</mark> : <span key={i}>{part}</span>;
  })}</>;
}

type Review = { item: string; verdict: string; note: string };

function ReviewBox({ week, lang, item, review, back }: { week: number; lang: string; item: string; review?: Review; back: string }) {
  return (
    <form action={reviewAction} className="mt-3 border-t border-ink/10 pt-3 text-sm">
      <input type="hidden" name="week" value={week} /><input type="hidden" name="lang" value={lang} /><input type="hidden" name="item" value={item} />
      <div className="flex flex-wrap items-center gap-2">
        {review && <span className={review.verdict === "right" ? "text-sage-600 font-medium" : "text-red-700 font-medium"}>{review.verdict === "right" ? "✓ 对" : "✗ 错"}</span>}
        <input name="note" defaultValue={review?.note ?? ""} placeholder="哪里错？应该怎样改？" className="flex-1 min-w-[12rem] rounded-lg border border-ink/20 bg-white px-3 py-1.5" />
        <button name="verdict" value="right" className="btn-secondary text-xs">✓ 对</button>
        <button name="verdict" value="wrong" className="btn-primary text-xs">✗ 错</button>
        {review && <button name="verdict" value="clear" className="text-xs text-ink/50 underline">清除</button>}
      </div>
      <span className="sr-only">{back}</span>
    </form>
  );
}

function Body({ b, t, lang }: { b: Block; t: (l: L) => string; lang: "en" | "zh" }) {
  switch (b.type) {
    case "steps": return <ol className="list-decimal pl-5 space-y-1">{b.items.map((s, i) => <li key={i}>{t(s)}</li>)}</ol>;
    case "prompt": return <p className="rounded-lg bg-cream/60 p-3 font-mono text-[13px] leading-relaxed">{t(b.text)}</p>;
    case "checks": return <ul className="list-disc pl-5 space-y-1">{b.items.map((s, i) => <li key={i}>{t(s)}</li>)}</ul>;
    case "text":
      if (b.interactive) return <HighlightEssay paragraphs={b.paragraphs} lang={lang} />;
      return (
        <div className="space-y-2 leading-relaxed">
          {b.paragraphs.map((p, i) => <p key={i}><Marked text={p} marks={b.highlight} /></p>)}
          {b.highlight && <p className="text-xs text-ink/60"><mark className="bg-blue-200 px-0.5 rounded">{lang === "en" ? "blue: this week's list" : "蓝色：本周词表"}</mark> · <mark className="bg-red-200 px-0.5 rounded">{lang === "en" ? "red: good words" : "红色：好词"}</mark></p>}
          {b.note && <p className="text-sm text-ink/70">{t(b.note)}</p>}
        </div>
      );
    case "quiz": return (
      <div>
        <ol className="space-y-2">
          {b.rows.map((r, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-6 text-ink/50">{i + 1}</span>
              <span className="w-56 font-medium">{r.zh}</span>
              <input placeholder="English" className="flex-1 min-w-[10rem] rounded-lg border border-ink/20 bg-white px-3 py-1.5" />
            </li>
          ))}
        </ol>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-ink/60">{lang === "en" ? "Show the answers (after the student checks)" : "看答案（学生做完才看）"}</summary>
          <ol className="list-decimal pl-5 mt-2 space-y-1">{b.rows.map((r, i) => <li key={i}>{r.answer}</li>)}</ol>
        </details>
      </div>
    );
    case "vocab": return (
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-ink/60"><th className="py-1 pr-3">#</th><th className="pr-3">Word</th><th className="pr-3">中文</th><th>Example</th></tr></thead>
        <tbody>{b.rows.map((r, i) => <tr key={i} className="border-t border-ink/10 align-top"><td className="py-1.5 pr-3">{i + 1}</td><td className="pr-3 font-medium">{r.word}</td><td className="pr-3">{r.zh}</td><td>{r.example}</td></tr>)}</tbody></table></div>
    );
    case "table": return (
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-ink/60">{b.head.map((h, i) => <th key={i} className="py-1 pr-3">{t(h)}</th>)}</tr></thead>
        <tbody>{b.rows.map((r, i) => <tr key={i} className="border-t border-ink/10 align-top">{r.map((c, j) => <td key={j} className="py-1.5 pr-3">{c}</td>)}</tr>)}</tbody></table></div>
    );
  }
}

export default async function ContentReview({ searchParams }: { searchParams: Promise<{ l?: string; d?: string }> }) {
  await requireProgrammeAdmin();
  const sp = await searchParams;
  const lang: "en" | "zh" = sp.l === "zh" ? "zh" : "en";
  const week = WEEKS[0];
  const day = week.days.find((d) => d.key === sp.d) ?? week.days[0];
  const t = (l: L) => l[lang];
  const { data } = await createAdminClient().from("programme_content_reviews").select("item, verdict, note").eq("lang", week.lang).eq("week", week.n);
  const reviews = new Map<string, Review>((data ?? []).map((r) => [r.item as string, r as Review]));
  const href = (l: string, d: string) => `/programme/content?l=${l}&d=${d}`;

  return (
    <Shell admin>
      <div className="mb-4">
        <p className="text-xs text-ink/60">内容审核 · 只有你看得到</p>
        <h1 className="text-2xl font-medium">第 {week.n} 周 · {week.lang} · {t(week.theme)}</h1>
        <p className="text-sm text-ink/70 mt-1">范文：{week.essay}（{week.source}）</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
        <span className="text-ink/60">说明的语言 / Instructions:</span>
        <Link href={href("en", day.key)} className={lang === "en" ? "btn-primary text-xs" : "btn-secondary text-xs"}>English</Link>
        <Link href={href("zh", day.key)} className={lang === "zh" ? "btn-primary text-xs" : "btn-secondary text-xs"}>中文</Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {week.days.map((d) => (
          <Link key={d.key} href={href(lang, d.key)} className={d.key === day.key ? "btn-primary text-xs" : "btn-secondary text-xs"}>
            {t(d.label)}
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-medium mb-1">{t(day.label)}{day.minutes ? ` · ${day.minutes} min` : ""}</h2>
      <div className="space-y-4">
        {day.blocks.map((b) => {
          const item = `${day.key}.${b.id}`;
          return (
            <section key={b.id} className="card">
              <p className="font-medium mb-2">
                {t(b.title)}
                {b.reveal && <span className="ml-2 rounded bg-clay-400/20 px-2 py-0.5 text-xs text-clay-700">{lang === "en" ? "shown after the student submits" : "学生交了之后才看到"}</span>}
              </p>
              <Body b={b} t={t} lang={lang} />
              <ReviewBox week={week.n} lang={week.lang} item={item} review={reviews.get(item)} back={day.key} />
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
