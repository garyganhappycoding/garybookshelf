## Done 25 Nov 2026 (essay tests)
- BI essay tests now use the real English marking pipeline (lib/writing/markcore.ts, a copy of /api/writing/mark's steps; the live route is untouched). An 85-word weak essay now gets 7/20 instead of 20/20.
- Starting essays must be TYPED (30+ words) for BI and BM; a PDF/photo is an optional extra for Gary.
- Monthly essay test is mandatory: last Sunday card of each month, first content week's question, BI and BM, /programme/monthly; Today redirects there until done (admin preview not blocked). Not counted in the streak.
- Still to do: calibrate BI and BM markers with Gary's good/weak essays (BI top score looks a little generous).

# 陪你读书 · PENDING LIST (updated 2026-11-24, read this first)

## Waiting for Gary (do not start until he says)
- [ ] **BM essay marking (karangan)**: Gary wants to change things first and says "don't publish yet". It is merged but PRIVATE (admin and beta testers only, `/writing/bm`, 404/403 for everyone else; nothing links to it). Do not open it to students, do not announce it. Rules: brand/BM-MARKING-RULES.md. Needs his good and weak essays to calibrate (it marked his model essay Baik 50/70, too harsh).
- [ ] BM Sukan and Kebersihan: he will check later.
- [ ] He is reading all 44 weeks of BI and BM vocab and content now; apply his corrections as he sends them.
- [ ] 10 BI words still have no example sentence (see raw files' gaps).

## New from Gary (25 Nov 2026)
- [x] **Results before and after each exam period**: `/programme/results`. Students (not admin) cannot use the programme until they have shared their baseline results (a mark per subject, optional photo of the result slip, optional photos of the whole paper: "Gary may help analyse your weaknesses"). After every exam period (exam end date passed) a banner on Today and Calendar asks for that exam's results; the page shows the change since the baseline. Tables programme_result_sets / programme_results, files in the private `receipts` bucket under programme-results/<user>/<set>/. Admin sees marks and signed links in the student detail page.
- [x] **Badges (built 25 Nov 2026, Gary's decisions)**: variable-ratio reward: first badge at a 3-day streak, then the next after a random 3 to 7 more days (a broken streak restarts the schedule); 12 spine badges (3 rare, 20% chance among the free ones), 进步徽章 when an exam's average beats the baseline, and the ultimate 自学 badge when every other badge is collected (Gary will explain the why later). Each badge has a word from Gary on its back (edit in /admin/programme-badges; EMPTY until he writes them) and can be pasted into the student's "我的书". Wall of badges at /programme/badges. The student picks their own nickname (Settings) and it is printed on the badge; no grade or state on the badge. Sharing earns NOTHING extra (Gary: they can share many times). Badge names are my proposals. Not built: a referral promo code (friends who join with a student's code get a discount): needs a design talk.
- [x] Results: upload PDF (best) or image; optional part scores (BM speaking, English writing, paper parts); Gary may analyse some papers by spin wheel (copy says "有机会").
- [x] **Weekly essay test (built 25 Nov 2026, Gary's rule)**: the day that was "write the full essay or rest" (Sunday) IS the weekly test: the student writes the full essay on the week's question (the same question as Wed to Fri, no new questions to write), it is marked by the essay marker (BI: lib/writing/mark.ts criteria /20; BM: private marker /70) via lib/programme/essayscore.ts, the score is stored in programme_essay_tests and drawn on /programme/progress (BI and BM lines, starting essay as the first point). The test does NOT count toward the streak. The starting essays are scored after saving when typed (an uploaded file cannot be marked by the AI: Gary reads those).
- [ ] **Monthly essay test**: Gary asked for one too; the question rule is not decided (ask him: e.g. the question of the month's first week, written on the last Sunday). Not built.
- [ ] **Calibration**: the BI marker gave 20/20 (100%) to an essay of about 85 words (Part 3 expects 200 to 250); a weak essay got 6/20. Gary must calibrate both markers with good and weak essays before the scores mean anything. Scores are labelled estimates.
- [ ] Starting-essay scoring needs typed text: uploads (PDF or image) are not scored. Ask Gary if the student should type text for scoring.
- [ ] **Quizzes**: pre-test before the plan, a weekly quiz and a monthly quiz built from the week's vocabulary and example sentences, a progress tracker of how much they improve. Not built yet; waiting for Gary's answers on where the weekly quiz sits and how the pre-test is scored.

## Badges and wall (Gary, 25 Nov 2026, later message)
- [x] Starting point essay: before starting, every student gives one essay in BI AND one in BM (written or uploaded PDF/image): /programme/pretest, after the baseline results. Table programme_pretest; admin sees them in the student detail page. The essay tests compare with it.
- [ ] **Gary does NOT want a bookshelf ("book") for badges.** He wants an achievement WALL the student can edit: paste and arrange badges, edit text, borders, and put their studying timelapse video on it. Badge designs are in the artifact "陪你读书 徽章" (medals, not book spines); Gary will decide what to add after seeing them. The current /programme/badges page is still the bookshelf version: replace it once he decides. 'first' badge renamed 起步.

## To do (decided 2026-11-24)
- [x] **Phone UI built on the real site (first pass, 24 Nov 2026)** from brand/ui-design/PHONE-UI-DESIGN.md and the prototype: bottom tab bar with icons and safe area; stats strip and a week strip on Today; Day 1 in three steps with a sticky bottom action bar; reading blocks folded into accordions; vocabulary as cards; result tabs (my answer / feedback / model); calendar one month at a time with a month/year switch and a bottom sheet; students can open any past day (`?date=`, not future days). Laptop/iPad layout unchanged. Not yet done from the design: auto-saved drafts, confirm-before-hand-in, collapsible keyboard behaviour, the phone settings page check. Test on a real phone.
- [x] Form 5 ends when SPM starts (`programmeEnd`, exam id e4; no end until the SPM date is filled in). Gary's checklist: brand/GARY-CHECKLIST.md.
- [x] `npx tsx scripts/audit-content.mts` checks every week of both forms and languages (176 weeks): only real gaps remain (BM week 4 empty, a few short BM weeks in Form 5).
- [x] **Form 5 plan = the same weekly plan as Form 4, with 15 words a week** (Gary, 24 Nov 2026). Essays are the Form 4 ones; the themes that lack or repeat essays are listed in brand/lists/FORM5-ESSAY-GAPS.md for Gary to check. Form 5 end date still open (no end rule until the SPM date is known).
- [x] **Form 5 vocab (Gary, 24 Nov 2026) built**: 15 words per week. BI: about 2:3:5 = 3 B2 + 4 or 5 middle (C1-tagged phrases of 1 to 2 words) + 7 or 8 top C1 (3+ words), from the theme packs' tables and the Form 4 lists; a short tier is filled from another tier and flagged. BM: 7 or 8 advanced + the rest ordinary; short advanced lists are filled with ordinary words and flagged. Script: scratchpad f5vocab.py (not in repo); data in raw/f5. Form 5 essays are still copies of Form 4; the SPM-sprint plan is still to design.
- [x] **Form 4 and Form 5 content is separate** (24 Nov 2026): raw/f4 and raw/f5, data.f4.*/data.f5.*, question pictures in public/programme/q/f4 and f5. Form 5 is a COPY of Form 4 for now, to be replaced with the real Form 5 (SPM revision) vocab and essays when Gary provides them. Edit the right folder.
- [x] **Form 4: the programme ends when the year-end exam starts** (Gary: 考完年终考后就结束; content weeks that do not fit are simply removed): 33 content weeks for Form 4 (`programmeEnd` in calendar.ts). Form 5 has no end rule yet (36 content weeks fit); design it with the SPM-sprint plan. Lists in brand/lists regenerated.
- [ ] **Form 5 is more SPM revision (Gary, 24 Nov 2026)**: the Form 5 plan is not designed. For now Form 5 uses the same 44-week content as Form 4 (36 weeks fit). Design the SPM-sprint plan with Gary.
- [x] A partial exam week (exam on some days only) moves the WHOLE week: no vocabulary at all that week (Gary confirmed).
- [x] Four lists sent to Gary: brand/lists/FORM4-BI, FORM4-BM, FORM5-BI, FORM5-BM (weekly vocab + essay, gaps marked GAP).
- [ ] **Feedback is not specific enough** (AI feedback after days 1, 3, 4, 5): Gary will figure out how to improve it. Do not change until he says how.
- [ ] **Phone UI**: design laptop and iPad first (done in this pass); design the phone UI later.
- [ ] **BM real question pictures**: the BM essay docs have no question picture; BM days 3 and 4 show no question. Ask Gary for the BM questions (or pictures).
- [ ] **Exam weeks carry no content** (done in code, `contentWeekOf` in lib/programme/dayflow.ts): the content counts only non-exam school weeks, using the student's own exam dates. With the default estimated exams a Form 4 student has about 6 exam weeks, so only about 38 of the 44 content weeks fit in 2027 (fewer for Form 5). Gary must decide what to drop or reorder.
- [x] Default exams now depend on the Form (calendar.ts `defaultExams`): Form 4 = mid-year + year-end (6 exam weeks, 38 content weeks fit); Form 5 = mid-year + mock + SPM TBD (8 exam weeks, 36 fit). Exams are stored only after the student edits them. The calendar page shows 考试周 and the shifted content week. Gary still has to decide which of the 44 weeks to drop (the last 6 for Form 4, the last 8 for Form 5).

# 陪你读书 · overnight build list

Started 2026-11-23 night. Gary wants to wake up and test a complete student UI with working functionality.
This file is the single source of truth for unattended runs: read it first, do the next unchecked item, tick it, log it, commit.

## Rules (from Gary, do not break)
- PROGRAMME_OPEN stays off. Everything stays admin-only (404 for everyone else). Never turn the switch on.
- Merging: Gary asked on 2026-11-23 for the work to be on the live site by morning. Merge a PR to main only when `npx tsc --noEmit` is clean AND your own test run passed. Admin-gated work only.
- Test with throw-away accounts and delete them (and their rows) afterwards. During tests never send real Telegram, email or Groq calls that cost money in a loop; stub or skip them.
- Content comes only from Gary's own Google Docs and his brand files. Do not invent examples, advice or sample answers. Anything written by Claude is labelled "(unchecked)".
- Gary's content rules: no word-count limits on opening or closing; no forced phrases in the closing; reference answers come from HIS essays, never from the pack; Day 1 = 10 sentences + quick quiz (Chinese shown, recall English); Day 2 = read essay, tap-to-highlight, blue = word in this week's list, red = word the student thinks is good; Day 3 opening, Day 4 elaborate one key point, Day 5 closing; Saturday rest; Sunday = full essay or rest. Instruction language is chosen by the user (English or 中文).
- Do not touch or reorganise his Google Drive (read only). Do not merge anything else. Do not push to main directly.
- If a run hits a limit, stop cleanly after committing; the scheduled task `programme-overnight` continues.
- Only one run at a time: if "RUNNING" below is newer than 90 minutes, exit at once.

## Blocked on Gary (keep on the list, do NOT start)
- [ ] Malay essay-marking AI. Gary will send the materials. Build it after he does.
- [ ] BM Sukan dan Rekreasi (5 raw drafts without tables) and Kebersihan dan Kesihatan (11 raw docs): needs him to process them.
- [ ] Watermark "garybookshelf" on the remaining ~31 English Google Docs (needs the Chrome extension).

## Work list
### A. Week content (44 weeks x 2 languages), stored as data
Format: `lib/programme/content/bi/w01.ts` ... `w44.ts` and `bm/w01.ts` ... (type `Week` in `lib/programme/week-content.ts`; week 1 BI is the finished model).
- [x] A0 (done: lib/programme/content/index.ts getWeek, build.ts makeWeek, scripts/build-content.mjs merges raw/*.json into data.bi.json/data.bm.json; week 1 BI stays the reviewed override) Move BI week 1 into `lib/programme/content/bi/w01.ts` and add `getWeek(lang, n)`; keep the review page working for all weeks.
- [x] A1 (all 44 extracted; weeks 25, 35, 36 have no essay, many examples blank, see Gaps) BI weeks 1 to 44. Words and order: `brand/PROGRAMME-BI-VOCAB.md`. Essays: Gary's reorganised Drive folder 15igSQPwFQlLPoCzjGVjCfQoOvgQx7xOA (11 themes x 4 rounds; the theme packs are linked in the vocab file). Per week: essay text, question points, 10 words + example sentence (from the essay or the theme pack's universal phrases), quiz, highlight lists, Wed/Thu/Fri references taken from the essay.
- [x] A2 (all 44 extracted; week 4 empty, many essays reused) BM weeks 1 to 44. Words: `brand/PROGRAMME-BM-VOCAB.md`; essay text from the Malay folder 1-Dd... (see `brand/PROGRAMME-BM-VOCAB.md` links). Examples = the `ayat` column. Wed opening, Thu one isi, Fri closing = from the essay.
- [x] A3 Gaps list: every week that could not be filled is listed in the "Gaps" section below.

### B. Student UI (the real thing, not the review prototype)
- [x] B1 Profile column `instruction_lang` (en | zh) + switch in the settings page and on the Today page. Default zh.
- [x] B2 Today page renders the day card from the week content (calendar week n -> content week n, both languages the same day, 10 min each).
- [x] B3 Day 1: 10 sentence boxes + quiz (scored on the server against the answer key; saves quiz_correct/quiz_total and `details`).
- [x] B4 Day 2: tap-to-highlight, saved in `details`; answer key shown after submit.
- [x] B5 Days 3 to 5: one text box; the reference (from the essay) is shown only after submit.
- [x] B6 Saturday rest card; Sunday choice (full essay or rest).
- [x] B7 AI feedback prompt per day type, using the "What the AI checks" list of that day (no word-count checks).
- [x] B8 Everything saves to programme_submissions (+ answer log) and shows on /admin/programme-performance.

### C. Test run (do it yourself and fix what breaks)
- [~] C1 (tested in the browser, as the admin preview, by a session sharing this checkout: BI wk1 days 1-5 + Sunday, BM wk1 day 1, both instruction languages via the toggle on Today AND Settings, phone width 375px. NOT yet clicked: BM day 2 highlight, other weeks' days 4/5 (same code as the tested weeks), the real non-admin "confirmed student" path (needs PROGRAMME_OPEN, which must stay off), calendar week list in the new theme order.) Throw-away student with a confirmed place: go through a full week in the browser (desktop + mobile width), both languages, both instruction languages. Check saved rows, AI feedback, performance page.
- [x] C2 (verified by code reading gate.ts, and by SQL: a confirmed `programme_members` row makes `hasPlace()` true, no row makes it false; `requireProgrammeSignedIn` 404s every non-admin, confirmed or not, while `PROGRAMME_OPEN` is off, and 404s a signed-out visitor too (not even a redirect, since the switch is off)) Check a student who is not confirmed, and a signed-out visitor, cannot see anything (404 / redirect).
- [x] C3 Delete all test accounts and rows. Verify the database is clean (verified by SQL: 0 rows in every programme_* table except Gary's own programme_profiles row; 0 leftover ui-test-*/overnight-* auth users).
- [x] C4 Write `brand/PROGRAMME-MORNING-REPORT.md`: what works, what does not, what Gary should test first, every gap.

## Gaps (fill in as you find them)
- Raw extraction status: run `ls lib/programme/content/raw` then `node scripts/build-content.mjs`. Agents were still running when this was written; BI weeks of themes 1-6 (weeks 1-6,12-17,23-28,34-39) and BM weeks 26-44 may be missing: re-run the extraction for missing weeks per brand/PROGRAMME-CONTENT-SPEC.md.
- THEME ORDER MISMATCH: calendar.ts THEMES puts Teenagers (7) before Travel (8); the BI vocab file puts Travel at weeks 7/18/29/40 and Teenagers at 8/19/30/41. The student Today page uses the content theme (correct). CalendarView / week list still use calendar.ts themeOf: change it to the content's theme names.
- BM week 4 (Sukan): no content. BM week 3/22 (Kebersihan): examples are near matches (see its gaps).
- Many BI words have no example sentence (pack PDFs scrambled by watermark): see each raw file's `gaps`. The Monday table shows a blank example for those.
- BI essays chosen by agents for Review/Report/Story and Travel/Teenagers: Gary should check the choices (listed in each raw file's gaps).
- BM key paragraph (keyPoint.idx) is a guess for most weeks (first body paragraph); BM week 14 may need idx 4.
- BI weeks 35, 25, 36 (Environment round 4, Health rounds 3 and 4) have no essay: those themes have too few new-format essays in the Drive folder (old-format .docx drafts were left unused; Gary can say if they should fill the gaps). Weeks 24 and 14 use old-format essays (no question table). Technology essays used: SBP, Kedah, Terengganu, Johor; WPKL unused.
- Admin-only: Today page accepts ?date=YYYY-MM-DD for the admin to walk through days (students always get the real date).

## Progress log (newest first, one line per run)
- 2026-11-24 09:45 A, B and C all done or honestly flagged partial. C1/C2 verified by code review + SQL (this run's own browser access was blocked mid-run; the actual click-testing in the report was done by a separate session sharing this checkout — see PR 35 and its follow-up commit for exam-question pictures). C3: throw-away test users/rows + one leftover orphan account all deleted, DB verified clean. C4: brand/PROGRAMME-MORNING-REPORT.md rewritten as the real final report. tsc clean. Scheduled task disabled.
- 2026-11-24 09:24 B1 done: added the 中文/English instruction-language switch to the settings page (same action/pattern as the Today page toggle). tsc clean. Note: PR 35 (guidance/word-list formatting + 23 filled example sentences) landed on main from a separate session while this run was paused — see its own commit. Next: C1-C4 (test, cleanup, morning report).
- 2026-11-24 03:30 PR 32 (all weeks) and PR 33 (calendar theme order fixed: calendar.ts THEMES now Travel=7, Teenagers=8) merged. DONE: A0-A2, B2-B8, calendar theme names. REMAINING: B1 settings-page language switch, C1 test Thu/Fri/Sun + mobile width + clicking the 中文/English toggle (create a throw-away admin user ui-test-*, set profiles.role=admin, log in at localhost, use ?date=), C2, C3 cleanup, C4 morning report (brand/PROGRAMME-MORNING-REPORT.md), then disable this scheduled task.
- 2026-11-24 03:00 all 7 extraction agents finished: BI 44 weeks, BM 44 weeks in lib/programme/content/raw (data.*.json rebuilt). BI essays for weeks 4-6,15-17,26-28,37-39 (School, Finance, People & Culture) are mostly OLD-format docs without a question table; Finance has no new-format essay. Remaining: test Thu/Fri/Sun + mobile + toggle, settings switch, calendar theme names, morning report.
- 2026-11-24 02:10 tested as admin test user: BI wk1 Mon (10 sentences + quiz 9/10 + AI), Tue (highlight, saved), BI wk7 Wed (generated week, AI), BM wk1 Wed (generated). Test user and rows deleted. AI task now includes the week's 10 words. Still to test: Thu/Fri/Sun, mobile width, Chinese/English toggle click, calendar theme names.
- 2026-11-24 01:45 generator, student Today UI (Day 1 sentences+quiz, Day 2 highlight, text days, language toggle, saving) built and tested in the browser as an admin test user (Mon, Tue pass). Remaining: finish extraction, test Wed to Sun + BM + mobile, settings switch, calendar theme names, cleanup test user ui-test-*, morning report.
- 2026-11-23 23:45 spec written (brand/PROGRAMME-CONTENT-SPEC.md); 7 extraction agents launched, writing lib/programme/content/raw/*.json (bi-wNN.json, bm-wNN.json). Next: A0 generator + B student UI while they run.
- 2026-11-23 23:25 list created. Nothing built yet.

RUNNING: no
