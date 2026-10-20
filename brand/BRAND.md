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

## Credibility (use in content and site copy)
- Gary scored a **4.00 flat in matriculation** (photo on the homepage), and studied through SPM and matriculation.
- Proof from students: only a few testimonials so far. Gary does **not** want to count those yet. Do not claim student results in copy until real before/after proof exists.

## Decisions log
- 1-to-1 diagnosis / tuition: **parked**. Gary does not plan to offer 1-to-1 now. Current business = **notes + speaking subscription only**.
- Website colors: **keep** the warm theme (do not migrate to shark blue).
- Both palettes are saved for future videos and websites.

## Growth goals & metrics
- Students helped to learn how to learn: 100 this year → 10,000 in 5 years.
- Impact metrics: grade improvement, students who begin self-studying. Few testimonials so far and Gary is not counting them yet. TODO: decide how to collect real before/after proof.
- Business metric: RM5,000/month profit.
- Instagram: 52.4k followers, YouTube: 1k subs (20 Oct 2026). TODO: follower and email-list targets.
- **Monthly profit planner (live):** https://claude.ai/artifact/LavGxGUYkMjfdusfWF47aH. Default plan: profit grows from RM200 (Nov 2026) to RM5,000 (Oct 2027) with 40% of money from notes and 60% from subscribers. At the goal month that needs about 320 subscribers and about 426 notes sold a month, which is about 0.6% of followers subscribing plus 0.8% buying notes. Gary types real subscribers and notes sold each month into the planner to track against the target. When asked for a monthly check-in, ask Gary for those two numbers and compare with the target.
