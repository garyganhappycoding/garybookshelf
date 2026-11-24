// Merges lib/programme/content/raw/<lang>-wNN.json into data.bi.json and data.bm.json. Run: node scripts/build-content.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const dir = "lib/programme/content";
for (const lang of ["bi", "bm"]) {
  const files = readdirSync(`${dir}/raw`).filter((f) => f.startsWith(`${lang}-w`) && f.endsWith(".json")).sort();
  const out = [];
  for (const f of files) {
    try { out.push(JSON.parse(readFileSync(`${dir}/raw/${f}`, "utf8"))); } catch (e) { console.log("skipped (bad JSON):", f); }
  }
  out.sort((a, b) => a.n - b.n);
  writeFileSync(`${dir}/data.${lang}.json`, JSON.stringify(out));
  console.log(lang, out.length, "weeks");
}

// Which weeks have a picture of the real exam question (public/programme/q/bi-wNN.jpg).
import { existsSync } from "node:fs";
const qs = [];
for (let n = 1; n <= 44; n++) if (existsSync(`public/programme/q/bi-w${String(n).padStart(2, "0")}.jpg`)) qs.push(n);
writeFileSync(`${dir}/questions.json`, JSON.stringify(qs));
console.log("question pictures:", qs.length);
