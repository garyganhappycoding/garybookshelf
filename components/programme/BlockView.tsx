import type { Block } from "@/lib/programme/week-content";

type Lang = "en" | "zh";
export type Marks = { phrase: string; color: 1 | 2 }[];

function Marked({ text, marks }: { text: string; marks?: Marks }) {
  if (!marks?.length) return <>{text}</>;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${marks.map((m) => esc(m.phrase)).join("|")})`, "gi");
  return <>{text.split(re).map((part, i) => {
    const m = marks.find((x) => x.phrase.toLowerCase() === part.toLowerCase());
    return m ? <mark key={i} className={m.color === 1 ? "bg-blue-200 rounded px-0.5" : "bg-red-200 rounded px-0.5"}>{part}</mark> : <span key={i}>{part}</span>;
  })}</>;
}

/** Shows one block of a day card (text only, no inputs). Blocks that need the student to type or tap are handled by DayCard. */
export default function BlockView({ b, lang }: { b: Block; lang: Lang }) {
  const t = (l: { zh: string; en: string }) => l[lang];
  switch (b.type) {
    case "steps": return <ol className="list-decimal pl-5 space-y-1">{b.items.map((s, i) => <li key={i}>{t(s)}</li>)}</ol>;
    case "prompt": return <p className="rounded-lg bg-cream/60 p-3 text-[15px] leading-relaxed">{t(b.text)}</p>;
    case "checks": return <ul className="list-disc pl-5 space-y-1">{b.items.map((s, i) => <li key={i}>{t(s)}</li>)}</ul>;
    case "text": return (
      <div className="space-y-2 leading-relaxed">
        {b.paragraphs.map((p, i) => <p key={i}><Marked text={p} marks={b.highlight} /></p>)}
        {b.highlight && <p className="text-xs text-ink/60"><mark className="bg-blue-200 px-0.5 rounded">{lang === "en" ? "blue: this week's list" : "蓝色：本周词表"}</mark> · <mark className="bg-red-200 px-0.5 rounded">{lang === "en" ? "red: good words" : "红色：好词"}</mark></p>}
        {b.note && <p className="text-sm text-ink/70">{t(b.note)}</p>}
      </div>
    );
    case "vocab": return (
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-ink/60"><th className="py-1 pr-3">#</th><th className="pr-3">Word</th><th className="pr-3">中文</th><th>Example</th></tr></thead>
        <tbody>{b.rows.map((r, i) => <tr key={i} className="border-t border-ink/10 align-top"><td className="py-1.5 pr-3">{i + 1}</td><td className="pr-3 font-medium">{r.word}</td><td className="pr-3">{r.zh}</td><td>{r.example}</td></tr>)}</tbody></table></div>
    );
    case "table":
      // Wide tables (3 or more columns) become one card per row, so they read well on a phone.
      if (b.head.length >= 3) return (
        <div className="space-y-3">
          {b.rows.map((r, i) => (
            <div key={i} className="rounded-lg border border-ink/10 p-3 text-sm">
              <p className="font-medium mb-1">{r[0]}</p>
              {r.slice(1).map((c, j) => <p key={j} className="mt-1"><span className="text-xs text-ink/50">{t(b.head[j + 1])}: </span>{c}</p>)}
            </div>
          ))}
        </div>
      );
      return (
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-ink/60">{b.head.map((h, i) => <th key={i} className="py-1 pr-3">{t(h)}</th>)}</tr></thead>
        <tbody>{b.rows.map((r, i) => <tr key={i} className="border-t border-ink/10 align-top">{r.map((c, j) => <td key={j} className="py-1.5 pr-3">{c}</td>)}</tr>)}</tbody></table></div>
    );
    case "quiz": return (
      <ol className="list-decimal pl-5 space-y-1 text-sm">{b.rows.map((r, i) => <li key={i}>{r.zh}{r.answer ? <> → <span className="font-medium">{r.answer}</span></> : null}</li>)}</ol>
    );
  }
}
