# UBBI live week report: 31 Oct to 4 Nov 2026

> Written 7 Nov 2026 from the live database, Vercel, Supabase, OpenRouter and the git history.
> Assumption: "day 1" of the UBBI live = **31 Oct 2026**, so the 5 days are 31 Oct, 1, 2, 3 and 4 Nov (Malaysia time).
> Not available to me: Instagram insights, Groq's own dashboard, and website analytics (Vercel Web Analytics is not switched on, so there is no visitor or source data).

## 1. The week in numbers

| | 7 days before (24-30 Oct) | **The 5 days (31 Oct - 4 Nov)** | After (5-6 Nov) |
|---|---|---|---|
| Approved orders | 94 | **230** | 4 |
| Sales (RM) | 690 | **2,830** | 75 |
| New sign-ups | 391 | **508** | 11 |
| Speaking attempts (all tries) | 772 (28-30 Oct) | **2,467** | 13 |

Sales by day: 31 Oct **108 orders / RM1,415**, 1 Nov **83 / RM1,017.50**, 2 Nov 23 / RM257.50, 3 Nov 9 / RM85, 4 Nov 7 / RM55. Two days made 83% of the money; by day 4 it was back to a normal day. Rejected orders in the 5 days: 5.

Sales by product (5 days):

| Product | Orders | RM |
|---|---|---|
| speaking冲刺包 (RM15) | **163** | **2,445** (86% of sales) |
| English vocab notes (RM5) | 33 | 165 |
| BM essay notes (RM5) | 15 | 75 |
| English essay notes + 15 attempts (RM10) | 8 | 80 |
| Speaking pack, 30 attempts (RM10) | 5 | 50 |
| Speaking pack, 5 attempts (RM2.50) | 6 | 15 |

People: **198 different buyers** (537 buyers ever, 2,223 accounts in total). 127 of the 198 had signed up **during** the week, and 127 of the 508 new sign-ups (25%) bought something within the week. Orders came in all day, not in one spike (busiest hours: 31 Oct 18:00 with 11, 16:00 with 10, 1 Nov 15:00 with 11).

Profit: about RM2,830 in, and the extra running cost is tiny: OpenRouter US$0.16 so far, Vercel, Supabase and Groq were all on free plans. (The website total is RM10 above what TNG received for the same amounts; see the earlier TNG check: 166 payments / RM1,820 in TNG for the five package prices against 161 orders / RM1,830 on the site. Not explained; check unmatched payments.)

## 2. Speaking practice during the live

| Day | People who tried | Attempts (incl. retries) | Got a report | "AI busy" | Paid reports | Free reports |
|---|---|---|---|---|---|---|
| 31 Oct | 179 | 499 | 179 | 306 | 66 | 113 |
| 1 Nov | **300** | **1,075** | 292 | **704** | 193 | 99 |
| 2 Nov | 181 | 568 | 188 | 336 | 111 | 77 |
| 3 Nov | 73 | 242 | 149 | 70 | 77 | 72 |
| 4 Nov | 29 | 83 | 71 | 2 | 37 | 34 |
| **5 days** | **567** | **2,467** | **879 (36%)** | **1,418 (57%)** | 484 | 395 |

- **This was the biggest problem of the week.** Only 36% of attempts produced a report. 294 of the 567 people (52%) got at least one report; 273 people (48%) never got a single one.
- Cause: the free Groq AI has a daily limit (200,000 tokens per model per day). The lighter model used by free students can mark about 85 reports a day; the strong model about the same for paid students. Demand on 1 Nov was 3 to 4 times that.
- Failed tries made demand worse: on 1 Nov, 85 free students tried once, but 50 tried 3 times, 24 tried 4 times and 4 students tried 13 times, because every "AI busy" made them press again.
- The paid side held up better: paid students got reports on all days. From 1 Nov 08:30 the OpenRouter backup served paid students when Groq was full (129 reports on 1 Nov, 70 on 2 Nov).
- Other failures in the 5 days: 92 stopped the recording early, 17 too little speech, 10 too long, 45 server timeouts (these were the stuck attempts, now refunded), 5 transcription errors.
- Quality signals: average score about 11 / 24 each day (10.2 on 4 Nov). **24 thumbs given: 22 up, 2 down (92% positive).** Part 3 (new on 1 Nov) was used 141 times in 4 days.
- Pack students: 21 bought a pack in the week (320 attempts); only 118 (37%) used.

## 3. Downloads, support and questions

- **1,780 file downloads** in the 5 days (691 on 31 Oct, 779 on 1 Nov), about 1.56 GB. Supabase egress for the whole billing cycle (since 20 Oct) is 2.46 GB of the free 5 GB, so downloads were not the problem.
- **24 re-download requests** (13 on 1 Nov, 9 on 2 Nov, 2 on 3 Nov), about 15% of the 163 bundle buyers. Typical notes: "file 8 did not download on my phone", "pressed back and it was gone", "opened inside Instagram". The one-download-per-file rule plus phone and in-app browsers caused this.
- Inbox: 15 questions in the 5 days (all but 3 answered or read), 1 result feedback approved.
- Password reset emails do not arrive (Supabase default mailer; see section 6). Not fixed yet.

## 4. Website and hosting usage

| Service | Used | Limit | Verdict |
|---|---|---|---|
| Vercel Active CPU (rolling 30 days) | **6h 08m** | 4h | **over 153%** |
| Vercel CDN requests | **1.1M** | 1M | **over** |
| Vercel Fast Origin Transfer | 8.97 GB | 10 GB | 90% |
| Vercel function calls | 787K | 1M | 79% |
| Vercel data transfer | 12.6 GB | 100 GB | fine |
| Supabase egress | 2.46 GB | 5 GB | fine |
| Supabase database | 57 MB | 500 MB | fine |
| Supabase storage | 0.33 GB | 1 GB | fine |
| Supabase monthly active users | 1,439 | 50,000 | fine |
| OpenRouter | US$0.16 spent, US$4.84 left (295 requests, key never expires, US$5 key limit) | | fine |

- Vercel's warning emails (from late October) said projects will be paused automatically. **The site stayed up the whole time** (still answering on 7 Nov) even though CPU and CDN were over for about a week. I cannot promise it always will. The "Your project was paused" emails in your inbox were for another project (psy111-recall-cards, paused through the API on 29 Oct), not this site.
- The busiest CPU days were 31 Oct and 1 Nov (about 30 minutes each). After the CPU cuts the normal day is about 8 to 12 minutes.
- Biggest CPU users: `/dashboard`, the marking route and `/speaking`.

## 5. What changed on the website (24 Oct to 4 Nov)

**Selling and delivery**
- 24 Oct: Start-here guide; locked per-buyer PDFs (email watermark, own password, one download per file); several files per product; Sains Komputer bundle; admin Students page.
- 30 Oct: menu cut to four items; Cerdek-style homepage; "where is my order" notes.
- 31 Oct: approve or reject payments and re-allow downloads from the Students page; downloads kept about an hour only (storage); warning for Instagram/app browsers.
- 1 Nov: How-to-buy guide with 8 phone screenshots; Request re-download button and admin list.
- 2 Nov: Allow button always available; **Allow / Decline buttons inside the Telegram alert**.

**Questions and replies**
- 25-31 Oct: questions need a free account; Gary's answers are read on the site (Gary's replies), not by email.
- 4 Nov: **Instagram sticky-note card** for each question and a **Clear** button.

**Speaking**
- 24 Oct: free attempts use the lighter model.
- 1 Nov: paid-only OpenRouter backup, second Whisper model, Part 2 (1 min) and Part 3 (2 min), marking from the official SPM mark sheet, Telegram alerts for paid failures, 30 uncommon (冷门) topics, Google sign-in, rejection of empty reports, transcript correction (once per attempt), thin-report alert.
- 4 Nov: free students use the OpenRouter backup too (up to 250 a day, stops at US$2.50 left); stuck attempts refunded (44 cleared) and swept daily.

**Cost cutting**
- 31 Oct: session proxy only where needed; 2 Nov: no background loading of login pages.

## 6. What went wrong (and what it cost)

1. **Not enough AI capacity for the live (biggest).** 1,418 "AI busy" results, 48% of speaking users never saw a report. The backup was added at 08:30 on 1 Nov, after day 1 had already passed, and only for paid students; free students got it on 4 Nov, after the peak.
2. **Retry storms.** Each failure made students retry, which made the AI busier. One student tried 13 times in a day.
3. **Pack attempts lost to stuck attempts.** 44 attempts stuck as pending quietly used up students' pack attempts (17 paying students lost 1 to 6 each). Found on 2 Nov, fixed on 4 Nov.
4. **Downloads failing on phones.** 24 re-download requests; each needed you to tap Allow.
5. **Emails do not work.** Password reset emails and approval emails are not delivered; Resend is not set up (still the placeholder domain) and the Gmail test failed.
6. **Vercel over its free limits** for a week. No pause happened, but it was a live risk during the busiest days.
7. **A build failed** on 4 Nov (font download) and the new question page did not appear until the retry.
8. **Empty AI reports** from one backup provider (1 of 82), now rejected and alerted.
9. **No analytics.** Nothing tells you where buyers came from (reel, link in bio, Telegram), how many visited the shop, or where they dropped off.
10. **Checkout price still comes from the browser** (Gary decided "not now"). Anyone could change the price. Fix before next year.

## 7. Next year: how to prepare

**Before the next big live or reel push**
1. **Plan the AI for peak, not for an average day.** Rule of thumb from this week: 300 people on the busiest day means about 1,000 tries. Buy Groq's paid tier or keep two providers connected before the live, for everyone, not only paid. Run a test with 50 people first.
2. **Stop retry storms:** one automatic retry only, a clear "your place in line" message, and a hard cap on tries per student per day (including failed ones).
3. **Upgrade Vercel to Pro for the live week** (about US$20) and set alerts at 80%. Keep the CPU savings. Turn on Vercel Web Analytics so you see visitors and sources.
4. **Fix delivery:** a "download all" option, 2 downloads per file instead of 1, and a Telegram or Drive delivery fallback for phone and in-app browser problems. Target: under 5% re-download requests.
5. **Fix email early:** set up a real sender (Resend with your own domain) so approvals, password reset and "your answer is ready" work.
6. **Fix the checkout price** so it is read on the server.
7. **Pre-load and rehearse:** write the live-day checklist (usage dashboards open, Telegram alerts on, backup keys topped up, someone to approve payments).

**Reading the numbers right**
- The sales curve was a spike: 83% of the money in 2 days, then 7 orders a day. Plan the next one around the exam calendar (speaking test, then written papers) and expect the same shape.
- Orders were spread across the whole day, which suggests many people found you through reels and shares, not only during the live. Add UTM links (live, reel, bio) to see which one worked.

## 8. What to do next to be more useful and sell more

**This week (SPM written papers run 23 Nov to 17 Dec)**
1. **Sell to the people you already have:** 537 buyers, 2,223 accounts and about 6,000 Telegram members. Offer last-minute notes for the written papers (English vocab and BM essay notes sold 48 in the 5 days at RM5) and a RM15-style bundle for the papers. The RM15 bundle sold 163 times, so bundles beat single items.
2. **Move free users toward the bundle:** after each free speaking result, show one clear card: "Want the full report and the notes? RM15". 273 people saw only an error and never saw this.
3. **Collect proof now:** 22 thumbs-up and a handful of results. Ask every pack buyer for a before/after score after the exam; this feeds The Bookshelf 100 and the homepage (only 1 result approved so far).
4. **Remind pack students:** 63% of their attempts are unused. A Telegram or in-site reminder with an expiry date raises usage and later renewals.

**Make the site more useful**
5. **Show progress:** a simple score history chart ("your last 5 scores: 10, 11, 12, 13"). Paid students want to see improvement.
6. **Tell people when AI is busy** with a time estimate and an option to be told when ready (now the backup should make this rare, check the numbers for a few days).
7. **Add a short "what to do first" path** for new visitors: 1) free speaking try, 2) see report, 3) bundle, 4) ask Gary.
8. **Plan the next product** for after 17 Dec: a "Form 4 to Form 5" starter bundle (your goal group for 2027) and a study-technique mini course, because the brand's mission is learn how to learn.

**Measure it**
9. Track four numbers weekly: sign-ups, first speaking report seen, paid conversion, re-download requests. This week: 508 sign-ups, 294 saw a report, 127 bought (25%), 24 re-download requests.
