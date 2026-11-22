# garybookshelf: how the whole system fits together (compiled 23 Nov 2026)

One line: **teach students how to learn, then sell tools that make learning easier.** Goal: help 100 people by end of 2026, 1,000 a year, RM5,000 profit a month. Details: `BRAND.md`.

## 1. The loop (audience problem to sale and back)

```
Audience (Instagram 52k, YouTube 1k, Telegram channel)
   |  questions, comments, DMs, polls
   v
Website question inbox  -->  Notion: Audience Questions (themes, month, "addressed?")
   |                                   |
   |                                   v
   |                        Notion: Content Calendar 2027 (script, film, post, numbers)
   |                                   |
   |                                   v
   |             Claude writes script + caption; Gary edits, films; Claude edits video
   |                                   |
   |                                   v
   |             Instagram reel / YouTube long-form / Telegram post
   |                                   |
   v                                   v
Gary's replies  -->  Notion: Gary Q&A (for the future Gary AI)      Website shop (notes, packs) --> orders --> Gary approves
```

## 2. The parts

| Part | What it does | Where it lives |
|---|---|---|
| **Website** (Next.js, Supabase, Resend, Vercel) | Shop, free resources, Speaking AI, Essay marking AI, Say hi (questions, results, vote), Start here, which-to-buy | this repo |
| **Products** | RM5 国文作文 and 英文作文 notes; RM15 writing 英文作文冲刺包 (RM5 for speaking冲刺包 buyers); speaking冲刺包 RM15; Speaking Pack RM10; Essay Marking Packs RM5 and RM10; Sains Komputer bundle RM50 | Supabase `products` |
| **AI features** | Speaking marking (SPM scales), essay marking (estimated /20), daily free essay pool, backup AI | `lib/speaking`, `lib/writing` |
| **Payment and approval** | Touch 'n Go receipt, Gary approves (Telegram bot buttons or admin) | `lib/telegram.ts`, `/admin/orders` |
| **Content system** | Problem bank, 2027 calendar, workflow, SPM 2026 dates | `brand/PROBLEM-BANK.md`, `CALENDAR-2027.md`, `CONTENT-SYSTEM.md`, `SPM-2026-TIMETABLE.md` |
| **Notion hub** | Audience Questions, Content Calendar 2027, Gary Q&A, views by month and by stage | "garybookshelf 2027 content system" |
| **Telegram channel** | One-way: videos, notes news, exam countdowns, weekly letter, polls | `brand/TELEGRAM-CHANNEL-PLAN.md` |
| **Reel and video editing** | Claude cuts the talking head, adds subtitles, animated scenes and music (Remotion, landscape and vertical) | `C:\Users\garyg\reels\writing-series` |
| **Automations** | Tuesday question sync to Notion (needs the Claude app open); daily 08:30 channel writing reminders (committed, **not deployed yet**); weekly speaking report; receipt cleanup | scheduled task; `vercel.json` |
| **Brand memory** | BRAND, KNOWLEDGE, SWOT, essay benchmark, marking rules, live reports | `brand/` |

## 3. Gary's tasks (what only Gary can do)

**Every day (light):** approve or reject orders; reply to support problems.

**Every Tuesday (the one work day):**
1. Answer questions in the website inbox.
2. Pick 2 to 3 pieces from the Notion calendar and send Claude your own idea or story for each.
3. Edit the scripts, record, check subtitles.
4. Write and schedule the week's Telegram posts (Sunday letter, Saturday question, Wednesday poll in its weeks).
5. Upload reels; paste last week's numbers (views, saves, shares, comments) so Claude logs them and suggests the next test.

**Every month:** enter subscribers and notes sold in the profit planner; check AI and hosting costs (OpenRouter credit, Supabase usage); review Notion themes; tick "Approved for AI" on checked Q&A rows.

**Seasonal:** follow the 2027 calendar: warm months (Jan to Mar, Dec) build trust; mini peak Apr to May; prep in June; peak Jul to Nov = sales and countdowns.

## 4. What Claude can do for you

| Area | Examples |
|---|---|
| **Content** | Hooks, scripts in your voice (only advice you gave), captions, Telegram posts, story frames, exam-week reels, comments, replies |
| **Video** | Cut fillers and retakes, subtitles, animated scenes, B-roll of your site, music, render landscape or vertical |
| **Planning** | Calendar by month, problem themes, "have I addressed this?", exam and school dates, product timing |
| **Notion** | Keep the question list, calendar and Q&A in order; weekly sync |
| **Website** | New pages, shop pictures, offers, checkout changes, the AI marking, reminders and cron jobs |
| **Data** | Sales, students, speaking and essay usage, costs, reports from the live database |
| **Research** | Timetables, courses, competitors, how-to for tools (Telegram setup etc.) |

## 5. What Claude cannot do

- Post, schedule or message on your Instagram, YouTube or Telegram (you do it; or add your bot as channel admin later).
- Hear audio: I work from transcripts and measurements, so you must check subtitle wording.
- See Instagram insights unless you paste them.
- Decide strategy, approve orders, or speak as you in new advice you have not given.

## 6. Open items (as of 23 Nov 2026)

1. **Deploy the reminders:** commit `dad4bf8` is local on `essay-requirement-check`; push and merge so the Telegram reminders run.
2. **Channel link:** send it, so the welcome post, Start here post and Instagram story can be finished.
3. **Exam-week reels** (Sejarah, Bio, Physics, Sains Komputer, Chemistry, Add Math): decide yes or no. Today's tips must come from you.
4. **Stream reel:** check four subtitle words, then post; vertical version not re-rendered.
5. **Gary Q&A:** check each answer before ticking "Approved for AI" (several are flagged).
6. **December content:** "Before Form 4" (needs your facts), the Physics-and-stream reel, the Telegram letter.
7. **Funnel:** only about 1% of speaking users pay. Next-year backlog: offer after the free speaking result, ask buyers for results, score history chart.
8. **Risks:** free tiers (Groq, Supabase, Vercel), OpenRouter credit, notes leaks (watermarks exist for locked PDFs).
9. **Brand TODOs:** "never say" list, video fonts, follower and email targets, whether to restart 1-to-1 (parked).
