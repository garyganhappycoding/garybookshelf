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
- Palette derived from the logo (proposed, not yet applied to the site):
  | Role | Color | Hex |
  |---|---|---|
  | Primary (shark blue) | periwinkle | `#B4C6E9` (tint `#DCE6F7`, deep `#5B78B8` for buttons/links) |
  | Accent (chips) | butter yellow | `#EEE1AC` (deeper `#E0B94A` for highlights) |
  | Accent (cheeks) | blush pink | `#F4B6C2` |
  | Ink / text | dark navy-black | `#1C2433` |
  | Background | near-white | `#FCFCFC` |
- Style: friendly, soft, rounded, playful illustrations; keep text high-contrast (use deep blue or ink for text, never pale blue on white).
- **Gap:** the live site (`tailwind.config.ts`, email templates in `lib/orders.ts`) uses a warm cream / clay / sage "notebook" theme that does **not** match the shark logo. Decide whether to migrate the site to the shark palette. TODO: Gary to decide.
- Fonts: TODO.

## Content pillars
1. How to study for [subject X]
2. "If you want to improve your grades, you should be doing this"
3. How to prepare for [exam X]
4. How to prepare for speaking practice

## Platforms & channels
- **Main: Instagram** (reels). **Side: YouTube.**
- Video style/script references: see `KNOWLEDGE.md`.

## Products / revenue
- Current products (prices):
  - **BI notes: RM5.** High-score essay (exam + extended version), vocab (basic to good level, general + specific categories), beautiful sentences, question analysis, speaking questions.
  - **BM notes: RM5.** High-score essay, vocab (basic to high level), beautiful sentences & phrases.
  - **Speaking subscription: RM10 per month** (30 attempts; a RM5 / 15 attempts pack also exists). AI speaking practice with feedback; every student also gets 2 free attempts a day.
- Payment: manual Touch 'n Go QR + receipt upload, admin approves (no card fees).
- Planned / under consideration: **1-to-1 diagnosis** or **1-to-1 tuition** (undecided). Diagnosis fits Gary's positioning (analyzing effort, predicted grades and technique) best. TODO: decide, then price it.
- Profit target: RM5,000/month.
- Cost and margin source: the "Speaking Profit Planner" artifact (https://claude.ai/artifact/729fGFHokRSyG2nDUdbiVD). Snapshot from 10–20 Oct 2026:
  - 1,122 registered members; 449 students have tried speaking; 348 active in last 7 days; 5 paying students (about 1%); RM50 revenue.
  - AI cost about RM0.009 per marked attempt; a full 30-attempt pack costs about RM0.27 of AI, so margin on paid packs is about 97–99%.
  - Free students are the main cost (about RM36/month once Groq bills); roughly 4 packs a month covers it.
  - Hosting (Groq, Supabase, Vercel) is on free plans; upgrading both costs about RM198/month and needs about 23 paying students first.
  - Conversion is the lever: more of the 449 trying students need to buy.
  - Note: RM5k/month needs about 500 students paying RM10 monthly (or a mix with notes and a higher-priced 1-to-1 service), so pricing/product mix matters.

## Growth goals & metrics
- Students helped to learn how to learn: 100 this year → 10,000 in 5 years.
- Impact metrics: grade improvement, students who begin self-studying. TODO: decide how to collect this (before/after grade form, testimonials).
- Business metric: RM5,000/month profit.
- TODO: Instagram follower target and email-list target.
