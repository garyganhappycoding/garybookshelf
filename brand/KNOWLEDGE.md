# garybookshelf — Knowledge Bank

> Everything Gary learns from others that can help grow the brand. Claude reads this before every task.
> Newest entries at the top. Keep entries short and actionable.

## 2027 programme essay-test marking standard (Gary, 25 Nov 2026)
- The programme's essay tests must NOT judge the student's wording or language level. The tests only check the parts the programme teaches: opening, closing and elaboration.
- Gary will write this marking standard himself and discuss it with Claude. Everything in it still comes from the original English marking essay AI (/api/writing/mark), adapted, not a new invention.
- Until then the BI test uses the original marker as is (lib/writing/markcore.ts); BM uses the private BM marker. Both are temporary.
- Starting essay: type it, or take a photo of the handwritten essay and type the text into the field (typing is required).

## How to add an entry
Copy this template under "Entries":

```
### YYYY-MM-DD — Short title
- Source: person / book / video / link
- Insight: what was learned
- Apply to garybookshelf: how it could be used (content, product, site, pricing...)
- Status: idea | testing | adopted | superseded
```

## Principles (distilled, long-lasting rules)
- (none yet — promote repeated lessons here)


## Mentors & sources (who Gary learns from)
| Source | Learn what | Link |
|---|---|---|
| AI companies | business management | (general) |
| Cerdek | pricing, funnel, testimonials, how they operate their AI | https://cerdek.com/ |
| Cikgu Minah (MAXC Academy) | pricing, funnel, testimonials, how they operate their AI | https://maxcacademy.com/testimonial |
| addmath atlas | video editing style | https://www.instagram.com/addmaths.atlas/ |
| Emily (emilykpx28) | video editing style | https://www.instagram.com/emilykpx28/ |
| Amin (amin.studydaily) | video editing (music, flow) and **video scripting** (her scripts are very good) | https://www.instagram.com/amin.studydaily/reels/ |
| Fisher Mode | video scripting | https://www.instagram.com/fisher_mode/ |

## Entries
### 2026-11-17 — Become an "artisan" (Dan Koe) and own the audience in 2027
- Source: Gary, citing Dan Koe
- Insight: an artisan makes a series of products that keep people watching; it does not need huge reach, only authenticity. Not "how to do it" teaching but "what I understood, what I failed at, how I overcame it": the process, as long-form video. Gary also wants a personal place to reach his audience directly (not Instagram, which depends on the platform's reach).
- Apply to garybookshelf: a monthly long-form process series for batch 09 (Form 5 in 2027) and batch 10 (Form 4 in 2027); a Telegram channel for personal updates; a year calendar in `brand/CALENDAR-2027.md` that pushes notes in exam months. Note the SWOT decision that YouTube long-form was ruled out because students don't watch it: needs revisiting.
- Status: adopted in part. Gary decided on 17 Nov 2026: **long-form goes to YouTube** (supersedes the SWOT note that YouTube long-form was ruled out), a Telegram channel is the personal place, and his own month-by-month plan is in `brand/CALENDAR-2027.md`.

### 2026-11-13 — No required counts for linkers or vocabulary (Gary's correction)
- Source: Gary, while checking the SPM writing live-talk score card
- Insight: Claude had written "at least 6 linkers" and "4 to 8 less common words" in `brand/ESSAY-BENCHMARK.md` and put "6 linkers" on the talk's score card. Neither is in the examiners' guide. Language has **no required counts**; what counts is variety where it fits and correct control. In Part 1 the top level is simple connectors used correctly. "Use fancy words only if sure" is also too cautious: the Part 2 and Part 3 top levels allow occasional misuse of less common words.
- Apply to garybookshelf: never put numeric targets for linkers, vocabulary or complex sentences in notes, talks, the score card or the marker. Benchmark rules 4 and 5 marked [superseded] and rewritten. Gary has already corrected the live-talk doc himself.
- Status: adopted

### 2026-11-09 — Examiners' guide for SPM English Paper 2 writing (the standard marking benchmark)
- Source: "SPM Instructions for Writing Examiners V3" (25 pages, © ES 2021, for examiner use only), link: https://online.anyflip.com/jshpx/zpkn/mobile/index.html (page images at `.../files/mobile/N.webp`)
- Insight: each part has its own scale (one continuum: Part 1 band 5 ~ B1, Part 2 ~ B2, Part 3 ~ C1); Content is judged by the cumulative effect on the reader, and **misreading one aspect of the task is about band 3, a global misreading band 1, a missing reason band 3 or 4**; accuracy is only a tie-breaker; length is not a criterion; "linking words" are basic and "cohesive devices" (incl. reference words like "it") are higher. Page map in the memory note `reference-spm-writing-examiner-guide`.
- Apply to garybookshelf: the essay marker uses our own paraphrase of these rules (`lib/writing/mark.ts`, `brand/MARKING-RULES.md`). The guide is marked strictly confidential (must not be reproduced or used for teaching or test practice), so never copy the descriptors or show them to students.
- Status: adopted (paraphrased); confidentiality risk flagged to Gary

### 2026-11-08 — Professional feedback on the speaking AI's marking
- Source: a professional examiner's feedback, passed on by Gary
- Insight: (1) prioritise what costs marks: one basic word like "fun" next to varied vocabulary is not a fault; (2) "um" and short pauses are fine, only long stops (about 5s+) cost marks; (3) every scale got a 3 by habit, so each band must be justified against the descriptor; (4) grammar: a MISTAKE (slip, once or twice) is ignored, an ERROR (same wrong pattern again and again) costs marks, and nothing is deducted if it is not obvious; grammar covers complex and compound sentences, cohesive devices, connectors and tenses; (5) Overall Spoken Performance depends on partner interaction and how much the interlocutor must help, so in solo practice judge it as "could they carry on alone".
- Apply to garybookshelf: built into `lib/speaking/analyze.ts` (SCORING_METHOD, WHAT_MATTERS, GRAMMAR_RULES, HESITATION_RULES). Revisit after Gary checks a batch of real reports.
- Status: adopted (not yet deployed or tested on real recordings)

### 2026-11-08 — SPM 2025 English Paper 2 answer-quality report (KMJ)
- Source: *Kupasan Mutu Jawapan SPM 2025 BI Kertas 2 (1119/2)*, Lembaga Peperiksaan; Gary sent the PDF
- Insight: what high vs average answers look like for Part 1 (email), Part 2 (essay), Part 3 (story, report, article) on the four criteria Content, Communicative Achievement, Organisation, Language. Full write-up in `brand/ESSAY-BENCHMARK.md`. The most common losses: omitting or misreading a content point, wrong tone for the genre (reports written like stories), only simple connectors, misused advanced words.
- Apply to garybookshelf: model essays in Gary's notes and the planned essay-marking AI must follow this benchmark. Gary will add good and bad essays as calibration samples.
- Status: adopted (benchmark written; marking AI not built yet, waiting for Gary's samples)

### 2026-11-07 — UBBI live week lessons (31 Oct - 4 Nov 2026)
- Source: Gary's own live week, compiled from the database; full numbers in `brand/UBBI-LIVE-REPORT-31OCT-4NOV.md`
- Insight: 230 orders / RM2,830 in 5 days (83% in the first 2 days), 508 sign-ups, 25% of new sign-ups bought. But 57% of speaking attempts failed "AI busy" and 48% of speaking users never saw a report. Failed tries caused retry storms. Downloads on phones caused 24 re-download requests. Emails and analytics were missing.
- Apply to garybookshelf: before any live, size the AI for about 1,000 tries on the busiest day (paid tier or two providers for everyone), cap tries, switch Vercel to Pro for the week, set up email and web analytics, and keep a download fallback. Sell bundles (RM15 sold 163 vs RM5 notes 48).
- Status: adopted (report written; fixes partly done: backup AI for free students, stuck-attempt refunds, CPU cuts)

### 2026-10-20 — What students value most (from Gary)
- Source: Gary's own observation of his audience
- Insight: followers like his study techniques most; most-saved posts are "how to study [subject]" and "how to improve your grades". Most competing study accounts don't teach how to study at all.
- Apply to garybookshelf: lead with technique content in every channel; treat notes as the packaged result of the method, not the headline.
- Status: adopted

### 2026-10-20 — Cerdek and Cikgu Minah: what to study
- Source: https://cerdek.com/ and https://maxcacademy.com/testimonial
- Insight: Gary learns four things from them: pricing, funnel, testimonials, and how they run their AI.
- Apply to garybookshelf: study their price ladder and free-to-paid funnel (the speaking tab has 449 trying students but only 5 paying, so the funnel is the biggest lever). Collect student grade-improvement testimonials, since Gary's success metric is grades improved. Gary has not studied their pages in detail yet; what he has learned so far is their management (how they run the team and operations). TODO: Gary to add specifics when he goes through them.
- Status: idea

### 2026-10-20 — Amin's reels: music and script flow
- Source: amin.studydaily Instagram reels
- Insight: music choice and the flow of the script are very strong.
- Apply to garybookshelf: study her pacing/structure when writing Gary's reel scripts (hook-analyzer skill can break these down).
- Status: idea
