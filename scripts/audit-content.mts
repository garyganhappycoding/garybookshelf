// Checks every week of every form and language for things that would look broken to a student. Run: npx tsx scripts/audit-content.mts
import { getWeek, forStudent, formKey } from "../lib/programme/content/index";
import { existsSync } from "node:fs";
const problems: string[] = [];
let weeks = 0;
for (const form of [4, 5]) for (const lang of ["BI", "BM"] as const) for (let n = 1; n <= 44; n++) {
  const w = getWeek(formKey(form), lang, n);
  const tag = `F${form} ${lang} w${n}`;
  if (!w) { problems.push(`${tag}: no week data`); continue; }
  weeks++;
  const days = Object.fromEntries(w.days.map((d) => [d.key, d]));
  for (const k of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]) if (!days[k]) problems.push(`${tag}: missing day ${k}`);
  const mon = days.mon; const vocab = mon?.blocks.find((b) => b.type === "vocab");
  if (!vocab || vocab.type !== "vocab" || vocab.rows.length < 10) problems.push(`${tag}: Monday vocab has ${vocab && vocab.type === "vocab" ? vocab.rows.length : 0} words`);
  const hasEssay = w.essay && !w.essay.startsWith("(essay");
  for (const k of ["tue", "wed", "thu", "fri"]) {
    const d = days[k]; if (!d) continue;
    if (hasEssay && d.response?.kind === "none") problems.push(`${tag}: ${k} has an essay but nothing to hand in`);
    if (!hasEssay && d.response?.kind !== "none") problems.push(`${tag}: ${k} has no essay but asks for an answer`);
    for (const b of d.blocks) {
      const json = JSON.stringify(b);
      if (/unchecked|未确认/i.test(forStudent(json))) problems.push(`${tag}: ${k} shows an 'unchecked' note to students`);
      if (b.type === "text" && b.paragraphs.some((p) => !p.trim())) problems.push(`${tag}: ${k} block ${b.id} has an empty paragraph`);
      if (b.type === "image" && !existsSync("public" + b.src)) problems.push(`${tag}: ${k} image missing ${b.src}`);
    }
  }
  if (hasEssay) {
    if (!days.wed.blocks.some((b) => b.id === "model" && b.type === "text" && b.paragraphs.length)) problems.push(`${tag}: Wednesday has no model opening`);
    if (!days.thu.blocks.some((b) => b.id === "model" && b.type === "text" && b.paragraphs.length)) problems.push(`${tag}: Thursday has no model paragraph`);
    // a Friday without a model closing is fine (the essay has no conclusion): the student still writes one
  }
}
console.log(`checked ${weeks} weeks, ${problems.length} problems`);
const byKind = new Map<string, number>();
for (const p of problems) { const k = p.replace(/^F\d (BI|BM) w\d+: /, "").replace(/\d+/g, "N"); byKind.set(k, (byKind.get(k) ?? 0) + 1); }
for (const [k, c] of byKind) console.log(`${c} x ${k}`);
console.log(problems.slice(0, 25).join("\n"));
