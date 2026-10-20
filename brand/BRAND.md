# garybookshelf — Brand Foundation

> Source of truth for what the brand is. Claude reads this before every task.
> Fields marked TODO are waiting for Gary's answers.

## What it is
- Name: garybookshelf (@gary_bookshelf)
- Core idea: teach students **how to learn** (study technique, revision, exam prep), then give them tools that make learning easier and more effective.
- Current site offers: shop (digital notes), content hub, free resources, "ask Gary", speaking practice (AI feedback for students).
- One-line description: TODO (suggested: "Helping Malaysian students learn how to learn")

## Mission & vision
- Why it exists: help people **learn how to learn**.
- How success is measured: (1) students' grades improved, (2) students start to self-study. Core question: *did I help students get better grades and better study habits?*
- **By end of 2026: help 100 people** learn how to learn.
- **Yearly run rate: 1,000 people a year** (the pace to build toward).
- **5-year goal: 5,000 people** helped in total.
- Products' main purpose: make learning easier and more effective. Side mission: **RM5,000 profit per month**.

## Audience
- Broad: students in Malaysia (Form 1–3, Form 4–5, UEC, IGCSE).
- **Primary (be specific): Form 4 and Form 5 students preparing for SPM.**
- Secondary: Form 1–3; UEC and IGCSE students (occasionally).
- Problems they have (use these as content/product hooks):
  1. Don't know how to study
  2. Don't know how to learn to learn
  3. Don't know where to start learning
  4. No motivation to start studying
  5. Don't know how to start self-study / self-revision
  6. Don't get good grades
  7. Don't get good grades even after studying
  8. Want to improve but don't know what to do
  9. Lazy to study but still want better grades, don't know where to start
  10. Struggle to revise effectively or prepare for exams

### Instagram insights, 19 Sep – 19 Oct 2026 (exported by Gary)
- 52,515 followers. 1.4M reel views, 301K viewers, 20 reels in 30 days.
- 61K likes, 3.5K comments, 2.7K reposts, **26K shares**, 14K saves.
- **Follower age: 13–17 = 16.6%, 18–24 = 25.4%, 25–34 = 29.7%, 35–44 = 16.4%, 45–54 = 9.9%, 55+ = 2%.** Only about 8.7k followers are in the SPM age band. Caveat: age is self-reported and some students set an older age. The larger older groups may be parents, teachers, older students or general learners. TODO: check the viewer (not follower) age split.
- Gender: 62.8% women, 37.2% men.
- Top countries: Malaysia 88.9%, Taiwan 5.1%, Singapore 3.0%, Hong Kong 1.7%, China 0.3%. Top cities: Kuala Lumpur 12.7%, Johor Bahru 9.5%, Singapore 4.3%, Bukit Mertajam 4.0%, George Town 3.5%.
- Reels in the report show formats that work: Chinese-language hooks like "English essay big update", "can't memorize Sejarah, do notes help?", "SPM account free notes" and an **"SPM is in 40 days" countdown**.
- Telegram group: about **6k members**. No email list or WhatsApp group.

## Positioning (what makes Gary different)
1. Emphasizes **how to study**: techniques nobody explains online right now.
2. Explains specific concepts when many people ask for them.
3. Explains **how to study for specific subjects**.
4. Can **diagnose a student's problem and stage**, then give a specific solution to upgrade their grades.
5. Specialist in analyzing a student's **effort vs predicted grades vs study technique**, and whether that technique is actually working for them.

## Voice & personality
- Languages: English + Chinese + Malay mix, **mostly Chinese**. Match this in captions, scripts and UI copy.
- Personality: **friendly senior** (an older student who has been through SPM and genuinely wants you to do well; warm, relatable, practical, never preachy or condescending).
- Never do / never say: TODO

## Visual identity
- Logo / mascot: **cute blue shark eating chips** (`public/dolphin-icon.png`, confirmed as the correct logo; the filename says "dolphin" but it is the shark). Round avatar, kawaii style: soft periwinkle body, pink blush cheeks, a bag of chips, thin dark outline.
- **Two palettes, both kept (Gary's decision):**
  1. **Shark palette: use for videos, reels, thumbnails, social posts and any new brand material.**
     | Role | Color | Hex |
     |---|---|---|
     | Primary (shark blue) | periwinkle | `#B4C6E9` (tint `#DCE6F7`, deep `#5B78B8` for buttons/links) |
     | Accent (chips) | butter yellow | `#EEE1AC` (deeper `#E0B94A` for highlights) |
     | Accent (cheeks) | blush pink | `#F4B6C2` |
     | Ink / text | dark navy-black | `#1C2433` |
     | Background | near-white | `#FCFCFC` |
     Style: friendly, soft, rounded, playful; keep text high-contrast (deep blue or ink for text, never pale blue on white).
  2. **Website palette: KEEP for the live site, emails and website pages** (Gary likes this look and background). Warm "notebook / paper" feel:
     | Role | Hex |
     |---|---|
     | Page background (paper) | `#FBF6EC` |
     | Cream tints | `#FEFCF8`, `#FAF3E7`, `#F4E7D3` (hero band) |
     | Ink / text | `#3B2F26` |
     | Clay (buttons, accents) | `#E0997B` / `#D2764F` / `#B85C38` (primary button) / `#8F4327` (hover, headings) |
     | Sage (soft highlights) | `#9CB380` / `#7F9A63` / `#647E4A` |
     Style rules from the code: Inter for body, **Caveat** (handwritten) for the logo/wordmark and warm accents; white cards with `rounded-2xl`, hairline `ink/10` border and small padding; **pill-shaped** (fully rounded) buttons, clay-filled for primary, white with border for secondary; hero is a cream band with a headline on the left and a photo on the right; faint ruled "notebook lines" background available; clay and sage used at low opacity for soft chips. Tone of copy is warm and first person ("Hi, I'm Gary...").
  - When designing a **new website page or web tool**, use the website palette. When designing **video / Instagram / YouTube**, use the shark palette. When a page covers both worlds, use the website palette for the page and the shark mascot as the illustration.
  - Site source of truth: `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`. Live site: https://garybookshelf-three.vercel.app/ (not reachable from Claude's cloud sandbox, so Claude reads the code instead; Gary can paste screenshots).
- Fonts: site uses Inter + Caveat. TODO: pick video fonts.
- Homepage hero now says "52k+ followers" (updated 20 Oct 2026). Update the number as followers grow.

## Content pillars
1. How to study for [subject X]
2. "If you want to improve your grades, you should be doing this"
3. How to prepare for [exam X]
4. How to prepare for speaking practice

## Platforms & channels
- **Main: Instagram** (reels): **52.4k followers** (as of 20 Oct 2026). **Side: YouTube:** **1k subscribers.**
- Video style/script references: see `KNOWLEDGE.md`.

## Products / revenue
- Current products (prices):
  - **BI notes: RM5.** High-score essay (exam + extended version), vocab (basic to good level, general + specific categories), beautiful sentences, question analysis, speaking questions.
  - **BM notes: RM5.** High-score essay, vocab (basic to high level), beautiful sentences & phrases.
  - **RM10 pack: English essay notes + 15 speaking attempts** (new bundle).
  - The **old RM10 pack for 30 attempts still stays on sale** (confirmed 20 Oct 2026).
  - **Speaking subscription: RM10 per month** (30 attempts; a RM5 / 15 attempts pack also exists). AI speaking practice with feedback; every student also gets 2 free attempts a day.
- Payment: manual Touch 'n Go QR + receipt upload, admin approves (no card fees).
- Essay notes live in Gary's Google Drive folder (https://drive.google.com/drive/folders/1aqkWuIkD0ij9L3LLVphsmOHnq_8S-WBh): about 30 Google Docs, one per state trial paper question (Part 2 Q2, Part 3 Q3/Q4/Q5), each with Question Analysis, Exam Version, Extended Version, Table 1 (phrases and vocab, General vs Specific, with Chinese meanings) and Table 2 (beautiful sentences with Chinese translation). Claude can read them through the Drive connector.
- Planned / under consideration: **1-to-1 diagnosis** or **1-to-1 tuition** (undecided). Diagnosis fits Gary's positioning (analyzing effort, predicted grades and technique) best. TODO: decide, then price it.
- Profit target: RM5,000/month (a goal, not current). In off-peak months notes bring about RM100 a month, which Gary considers a lot for off-peak.
- Cost and margin source: the "Speaking Profit Planner" artifact (https://claude.ai/artifact/729fGFHokRSyG2nDUdbiVD). Snapshot from 10–20 Oct 2026:
  - 1,122 registered members; 449 students have tried speaking; 348 active in last 7 days; 5 paying students (about 1%); RM50 revenue.
  - AI cost about RM0.009 per marked attempt; a full 30-attempt pack costs about RM0.27 of AI, so margin on paid packs is about 97–99%.
  - Free students are the main cost (about RM36/month once Groq bills); roughly 4 packs a month covers it.
  - Hosting (Groq, Supabase, Vercel) is on free plans; upgrading both costs about RM198/month and needs about 23 paying students first.
  - Conversion is the lever: more of the 449 trying students need to buy.
  - Note: RM5k/month needs about 500 students paying RM10 monthly (or a mix with notes and a higher-priced 1-to-1 service), so pricing/product mix matters.

## Exam calendar, SPM 2026 (from Lembaga Peperiksaan KPM, via Gary, 20 Oct 2026; Claude has not checked the official PDF)
- Bahasa Melayu speaking test: 26–29 Oct. **English speaking test: 2–5 Nov.** Science practicals: 16–18 Nov. BM listening: 23 Nov. English listening: 24 Nov. **Written papers: 23 Nov – 17 Dec.**
- After 17 Dec the SPM cohort leaves: off-peak. Target the current Form 4 students for 2027.
- The site now has an exam countdown banner driven by `lib/exam-dates.ts` (edit that file each year).

## Credibility (use in content and site copy)
- Gary scored a **4.00 flat in matriculation** (photo on the homepage), and studied through SPM and matriculation.
- Proof from students: only a few testimonials so far. Gary does **not** want to count those yet. Do not claim student results in copy until real before/after proof exists.

## Decisions log
- 1-to-1 diagnosis / tuition: **parked**. Gary does not plan to offer 1-to-1 now. Current business = **notes + speaking subscription only**.
- Website colors: **keep** the warm theme (do not migrate to shark blue).
- Both palettes are saved for future videos and websites.
- **Free vs paid speaking report (final decision, 20 Oct 2026):** FREE = score and criteria bands, overall comment, points checklist, problem #1, transcript, progress history (not built yet), repeated words, and **vocabulary upgrades**. PAID = everything else: remaining problems, higher-band rewrites, phrase upgrades, fluency stats (pauses, fillers), and a new **example rewrite of the student's own words using Gary's essay vocabulary** (not built yet). The paywall must be enforced on the server, not only hidden in the page.
- **Feedback:** no free attempts as a reward (students would spam it). Gary says feedback collection is already settled; do nothing more on it.
- Shark logo not needed on the website.
- **Built 20 Oct 2026 (on branch, not yet deployed):** (a) countdown banner now carries the offer "English essay notes + 15 speaking attempts for RM10", last day **28 Oct 2026** (5 days before the 2 Nov English speaking test); (b) free vs paid speaking reports, enforced when the report is made and saved (free reports never contain paid parts); (c) paid report has a "Band upgrade" rewrite of the student's own sentences using phrases from Gary's essay notes, highlighted, with Chinese meanings. Paid = student has an active pack when the attempt is made. A free attempt's report is never upgraded later. The 2 free attempts a day stay for everyone, including paying students. Progress history already existed and stays free.
- **Report structure (approved 20 Oct 2026):** one "Upgrade your English" section laid out as a ladder: Step 1 Words (free), Step 2 Phrases (paid; multi-word expressions and linkers only), Step 3 Sentences (paid; student's own sentences rewritten with highlighted essay phrases), Step 4 Essay toolkit (paid; 6 **general** essay phrases, no AI cost, with Chinese meanings). Free students see Step 1 and a locked list of Steps 2 to 4 with a link to the shop.
- Essay phrase list for the AI: `lib/speaking/essay-vocab-data.ts` (241 phrases from the Part 2 Q2, article and review notes; story and report notes left out because they suit writing, not speaking). Regenerate when notes change.
- Scheduling: skip Metricool for now (free plan cannot connect multiple accounts). Gary writes reel scripts himself; Claude helps with hooks, captions and edits on request. Reels send people to the website.
- **AI cost cap for speaking (accepted 20 Oct 2026):** shadow budget RM50/month at about RM0.009 per attempt; alert at 80%; cap free use before paid students are affected.
- **Conversion plan (20 Oct 2026, discussed, not built yet):** (1) make the free speaking result a partial result and put the deeper feedback behind the paid pack; (2) add an **exam countdown** to the website (Gary likes it; needs exam dates); (3) test a checkout add-on: buy RM5 notes, add RM5 for speaking attempts (Gary suggested 10 attempts for the RM5 add-on, total RM10). Bundling notes + a full subscription is **not** wanted right now.

## Growth goals & metrics
- Students helped to learn how to learn: 100 this year → 10,000 in 5 years.
- Impact metrics: grade improvement, students who begin self-studying. Few testimonials so far and Gary is not counting them yet. TODO: decide how to collect real before/after proof.
- Business metric: RM5,000/month profit.
- Instagram: 52.4k followers, YouTube: 1k subs (20 Oct 2026). TODO: follower and email-list targets.
- **Monthly profit planner (live):** https://claude.ai/artifact/LavGxGUYkMjfdusfWF47aH. Default plan: profit grows from RM200 (Nov 2026) to RM5,000 (Oct 2027) with 40% of money from notes and 60% from subscribers. At the goal month that needs about 320 subscribers and about 426 notes sold a month, which is about 0.6% of followers subscribing plus 0.8% buying notes. Gary types real subscribers and notes sold each month into the planner to track against the target. When asked for a monthly check-in, ask Gary for those two numbers and compare with the target.
