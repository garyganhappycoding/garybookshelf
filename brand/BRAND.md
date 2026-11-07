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

## In progress: vocab by essay question (Gary, 7 Nov 2026)
- Gary wants **essay questions only** (not the speaking cue cards). For each theme, every essay question is split into the points it asks; each point has an idea and vocab for **Reason / Example / Result**. Table columns: vocab, 中文, level, scenario, example sentence. The question is listed below its tables.
- Source: the "Question Analysis" tables in the trial-paper docs in Gary's essay Drive folder (the question paper itself is an image, so questions are rebuilt from the analysis). Technology draft done (7 questions, 37 points, 222 terms). Waiting for Gary's check before the other themes.
- Technology essay vocab draft now shows the **original question image** under each question (taken from the top of each trial-paper doc). Also drafted: **universal opening and closing paragraphs** (3 openings: statement, question, saying or scene; 3 closings: summary and opinion, call to action, quote or question), with a theme bank built from each theme's universal phrases. Both waiting for Gary's check.
- Universal phrases (10 per tab, 11 tabs) are now printed at the end of the universal opening/closing document, and each theme's own 10 go at the end of that theme's essay vocab document (Technology done). Source: the 10 universal phrases in each of Gary's theme docs.
- **Theme pack format (Gary, 7 Nov 2026):** each theme document = 1 universal opening (3 types, theme examples), 2 the real questions, each with the original question image ABOVE its vocab tables, 3 universal closing (3 types), then the theme's 10 universal phrases. Vocab tables: 3 terms per Reason / Example / Result, more C1 (about 45% C1), columns vocab, 中文, level, scenario, example sentence. Technology pack done (50 pages); other themes pending Gary's check.
- **Quick version per theme (Gary, 7 Nov 2026):** the full pack was judged too long (49 pages). Each theme also gets a short read-first version: a map from each question point to 8 to 11 UNIVERSAL ANSWERS (benefits, problems, solutions, stand), each with a ready Point/Reason/Example/Result paragraph and 6 key words, plus one opening and one closing pair. Technology quick version done (9 pages).
- **speaking冲刺包** (12 PDFs from Gary's Drive folder, RM15, blue pill picture made 30 Oct 2026). Gary must reword the drafting notes in the Docs ("your folder", "I added") before selling.

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
- **RM10 bundle product created 20 Oct 2026** (in the Supabase `products` table, id `0483e301-b951-4602-a9c9-d3e1b7ef7c69`): "English 作文 Notes + 15 Speaking Attempts", RM10, uses the same Telegram notes link as the RM5 English notes, 15 attempts valid 30 days. It was **published on 20 Oct 2026** (pictures reuse the English notes cover and the speaking pack picture; Gary can swap in a custom bundle picture later) and a reminder is set to **unpublish it at the end of 28 Oct 2026 (Malaysia time)**; Gary will then decide whether to keep it. Code now supports products that include both a notes link and speaking attempts (dashboard shows both buttons; the Speaking page still links to the plain RM10 / 30 attempts pack). Shop reality on 20 Oct: only three products existed (Speaking pack 30 attempts RM10, BM notes RM5, English notes RM5); no RM5 / 15 attempts pack exists.
- **Merged to main and deployed 20 Oct 2026** (pull request #2). The weekly report now lists sales per product, best seller first. Main also gained a Bookshelf 100 feedback system (one-tap reaction after speaking, bonus-attempt reward, Wall of Wins) built outside this session. Gary confirmed the bonus-attempt reward only applies when he says a person is OK to receive it.
- **Price colour rule for pictures (Gary, 20 Oct 2026): RM5 products use a GREEN pill, RM10 products use a RED (clay) pill, RM2.50 uses a YELLOW pill.**
- **Shop pictures (20 Oct 2026):** the RM10 bundle, English notes and BM notes now have cards in the Speaking pack style, made from HTML and saved in `public/` (`english-essay-15-attempts.webp`, `english-essay-notes-green.webp`, `bm-essay-notes.webp`). The old chat-screenshot pictures stay later in each product's gallery. Product `image_url` points at these site paths.
- **Sains Komputer bundle (24 Oct 2026):** 5 PDFs (T4 B1, T4 B3, T4+T5 B2, T5 B1, T5 B3, about 64 MB), RM50 (red pill, `public/sains-komputer-bundle.webp`). Each buyer gets their own copy per file, locked with one password per order and their email on every page plus "garybookshelf | @gary_bookshelf" (Admin → tick "Lock each buyer's copy"). Copies are made when the buyer taps Download and deleted after 3 days (free-tier storage); the original PDFs stay in Supabase `digital-assets`. Products can now have several files. **Decision (Gary, 24 Oct 2026): stay on Supabase free tier** (5 GB/month downloads is about 70-80 bundles; Gary expects under 60-70). Telegram warns at 2.5 GB and 3.5 GB of bundle downloads in a month; if that happens, offer Cloudflare R2 (free downloads) before Supabase Pro.
- **Speaking reset (1 Nov 2026):** two practice types. **Part 2 = cue card, speak 1 minute. Part 3 = discussion question, speak 2 minutes** (one Part 3 question per topic, written from each card's opinion bullet; replace with Gary's own bank any time in `lib/speaking/cards.ts`). Marking now follows Gary's "Speaking Mark Sheet F4 & F5" (official SPM 1119/3 scales): Grammar, Vocabulary, Communicative Competence (Assessor) and Overall Spoken Performance (Interlocutor), each 0-6, total /24. Older reports that say "Pronunciation & Fluency" still display. Paid students get a paid-only backup AI (OpenRouter key `OPENROUTER_API_KEY`) and a second Whisper model; free students never use the backup.
- **冷门题 (uncommon speaking topics, 1 Nov 2026):** 30 extra Part 2 cards + Part 3 questions that rarely come out in SPM or trial papers (wedding, reality show, comedy show, homestay...). Data: `lib/speaking/uncommon.ts` (ids `u-1`..`u-30`), marked 冷门 on the Speaking page with a "冷门题 only" filter and a Random 冷门 button. Gary removed "online game" and "your first phone" as too basic. Also added to his Google Doc "练习" as 冷门 sections.
- **Backup AI for free students too (Gary, 4 Nov 2026, reverses the 1 Nov rule):** when Groq is busy or failing, free attempts are marked by the OpenRouter backup so free students do not meet "AI busy" (they still get the limited free report). A paid student whose pack is used up counts as a free student (free lane, free report). Reason: about half of free attempts were failing on Groq's daily limit; the backup costs about RM0.01 per attempt.
- **Question inbox (4 Nov 2026):** "Make Instagram card" on each question draws a sticky-note picture (1080x1350, shark palette, no name or email, long questions split into several cards; `lib/ig-card.ts`). "Clear" hides a question from "Needs me" when Gary already answered it by private message (stored as `payload.cleared`, student sees nothing). Gary chose design A (sticky note) from four.
- Essay phrase list for the AI: `lib/speaking/essay-vocab-data.ts` (241 phrases from the Part 2 Q2, article and review notes; story and report notes left out because they suit writing, not speaking). Regenerate when notes change.
- Scheduling: skip Metricool for now (free plan cannot connect multiple accounts). Gary writes reel scripts himself; Claude helps with hooks, captions and edits on request. Reels send people to the website.
- **AI cost cap for speaking (accepted 20 Oct 2026):** shadow budget RM50/month at about RM0.009 per attempt; alert at 80%; cap free use before paid students are affected.
- **Conversion plan (20 Oct 2026, discussed, not built yet):** (1) make the free speaking result a partial result and put the deeper feedback behind the paid pack; (2) add an **exam countdown** to the website (Gary likes it; needs exam dates); (3) test a checkout add-on: buy RM5 notes, add RM5 for speaking attempts (Gary suggested 10 attempts for the RM5 add-on, total RM10). Bundling notes + a full subscription is **not** wanted right now.

## Next-year backlog (Gary, 7 Nov 2026: speaking season is over, build these before the 2027 push, not now)
1. **Offer after the free speaking result:** one clear card on the result page ("Want the full report and the notes? RM15", link to the 冲刺包). In 2026, 273 of 567 speaking users never saw a report, so also show it on the error screen.
2. **Ask buyers for before/after scores:** after the exam, ask each pack/bundle buyer for their result (feeds The Bookshelf 100, the homepage and the Wall of Wins; only 1 result was approved in 2026).
3. **Score history chart:** a simple chart of a student's last scores on the Speaking page ("10, 11, 12, 13") so paid students see their improvement.
- Also on the list from the 2026 live report (`brand/UBBI-LIVE-REPORT-31OCT-4NOV.md`, section 7): AI capacity for peak day, Vercel Pro for the live week, web analytics, real email sender, server-side checkout price, 2 downloads per file.
- After 17 Dec 2026 the SPM cohort leaves; target current Form 4 students for 2027.

## Reporting rules (Gary, 24 Oct 2026)
- **Sales = approved orders only** (status `completed`). Rejected orders (wrong receipt or a problem with the transaction) and orders still waiting are never counted in sales, buyers or revenue.
- The RM10 bundle (English essay notes + 15 attempts) stays on sale for now. The banner offer text still ends 28 Oct 2026. **30 Oct 2026: the expired offer line was removed from the bundle description (price stays RM10 for now) and the top menu was cut to four: Speaking, Shop, Free resources, Say hi. "Start here" stays on the homepage and footer; "Ask Gary" is hidden until it is built.**
- **Speaking pack ladder (decided 24 Oct 2026):** RM10 = 30 attempts, RM5 = 15 attempts (notes bundle RM10 = notes + 15), RM2.50 = 5 attempts. Every paid pack uses the strongest model and the full report (priority marking); free attempts use the weak model first. Per attempt: RM0.33 (30), RM0.33 (15), RM0.50 (5), so buying small packs never beats the 30 pack. AI cost about RM0.009 per attempt, so profit stays above 95%.
- The RM2.50 picture uses a **yellow** pill. The Speaking page's "get a pack" link goes to the **30-attempt** pack. No Cerebras key (Gary's decision, 24 Oct 2026). Free attempts use the weak model only (no borrowing of the strong model) and get the limited report, so the strong model's tokens go to paid reports.
- (Earlier idea: a RM2 starter pack for free users.) Break-even is RM2 / cost per attempt (RM0.05 gives 40 attempts, the planner's measured cost of about RM0.01 gives about 200). Not decided.

## Growth goals & metrics
- Students helped to learn how to learn: 100 this year → 10,000 in 5 years.
- Impact metrics: grade improvement, students who begin self-studying. Few testimonials so far and Gary is not counting them yet. TODO: decide how to collect real before/after proof.
- Business metric: RM5,000/month profit.
- Instagram: 52.4k followers, YouTube: 1k subs (20 Oct 2026). TODO: follower and email-list targets.
- **Monthly profit planner (live):** https://claude.ai/artifact/LavGxGUYkMjfdusfWF47aH. Default plan: profit grows from RM200 (Nov 2026) to RM5,000 (Oct 2027) with 40% of money from notes and 60% from subscribers. At the goal month that needs about 320 subscribers and about 426 notes sold a month, which is about 0.6% of followers subscribing plus 0.8% buying notes. Gary types real subscribers and notes sold each month into the planner to track against the target. When asked for a monthly check-in, ask Gary for those two numbers and compare with the target.
