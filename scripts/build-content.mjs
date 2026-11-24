// Merges lib/programme/content/raw/<form>/<lang>-wNN.json into data.<form>.<lang>.json (form = f4 or f5) and lists which weeks have a
// picture of the real exam question (public/programme/q/<form>/bi-wNN.jpg). Run: node scripts/build-content.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
const dir = "lib/programme/content";
for (const form of ["f4", "f5"]) {
  for (const lang of ["bi", "bm"]) {
    const files = readdirSync(`${dir}/raw/${form}`).filter((f) => f.startsWith(`${lang}-w`) && f.endsWith(".json")).sort();
    const out = [];
    for (const f of files) {
      try { out.push(JSON.parse(readFileSync(`${dir}/raw/${form}/${f}`, "utf8"))); } catch (e) { console.log("skipped (bad JSON):", form, f); }
    }
    out.sort((a, b) => a.n - b.n);
    writeFileSync(`${dir}/data.${form}.${lang}.json`, JSON.stringify(out));
    console.log(form, lang, out.length, "weeks");
  }
  const qs = [];
  for (let n = 1; n <= 44; n++) if (existsSync(`public/programme/q/${form}/bi-w${String(n).padStart(2, "0")}.jpg`)) qs.push(n);
  writeFileSync(`${dir}/questions.${form}.json`, JSON.stringify(qs));
  console.log(form, "question pictures:", qs.length);
}
