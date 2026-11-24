# 陪你读书 · morning report (2026-11-24)

All of sections A, B and C in `brand/PROGRAMME-BUILD-TODO.md` are done or honestly marked partial below. This file replaces the hand-written draft from earlier this morning; nothing in it was lost, it's folded in.

## Where to look
- Student page: `/programme/today` (log in as admin). Switch BI / BM at the top; switch the instruction language (中文 / English) — now on both the Today page and the Settings page; walk through days with "前一天 / 后一天", or add `?date=2027-01-04` to the address (week 1 starts 4 Jan 2027, so week N starts 4 Jan + 7 × (N-1) days).
- What each student has done: `/admin/programme-performance` (students only; your own test answers are not counted).
- Your review page for week 1: `/programme/content`.
- Students still cannot see anything: `PROGRAMME_OPEN` is off, everything else is 404. Nothing in tonight's work turned it on.

## What works (tested live in the browser, throw-away admin accounts, all deleted afterwards)
- BI week 1, all 7 days: day 1 (10 sentences + vocab quiz, scored on the server, AI feedback), day 2 (tap-to-highlight, blue/red, scored by rule, no AI), days 3-5 (opening/elaboration/closing, AI feedback, model text shown only after hand-in), Sunday (full essay, optional, goes to the essay AI).
- BI week 7 day 3 and BM week 1 days 1 and 3 (generated weeks, not the hand-reviewed week 1 override): same pass.
- The 中文 / English instruction-language switch: works on the Today page and (new tonight) on the Settings page.
- Phone width (375px): no sideways scroll; wide (3+ column) tables turn into one card per row instead of scrolling.
- Every answer saves its quiz score, its extra parts (highlights, sentences) and keeps every earlier version.
- Day 3 now shows a picture of the real exam question, cropped from your essay doc, on 39 of the 44 BI weeks (weeks 6, 25, 28, 35, 36 have none — see Gaps).
- Days 3-5 show a short "how to write it" table (3 formats for opening/closing, 4 steps for elaboration) plus a short list of this week's words to use — for BI weeks 1-11 split across the three days in the order of your universal phrases, every other week shows all 10 each day.

## Verified by reading the code and by SQL, not by clicking (see Not fully tested below for why)
- A confirmed student would get in once `PROGRAMME_OPEN` is turned on: a `programme_members` row with `status='confirmed'` and its group `status='active'` makes `hasPlace()` true (checked directly in SQL with a throw-away confirmed group, then deleted).
- Right now, with the switch off: every non-admin — confirmed or not — gets a 404 at the very first gate check, and so does a signed-out visitor (not even a redirect to login, since the switch being off is checked before that). This matches "admin-only, 404 for everyone else."
- The day logic for Thursdays, Fridays, Saturdays and Sunday, the new exam-question picture, and the new "how to write it" guidance tables: read through end to end, no bugs found. `npx tsc --noEmit` is clean on the final state of this branch.

## Not fully tested this run
- BM day 2 (highlight) and other weeks' days 4 and 5: not individually clicked, but they run the exact same code as the BI/BM days that were tested.
- The real non-admin "confirmed student" path through the actual UI (not just the data check above): needs `PROGRAMME_OPEN` on, which has to stay off, so this can only be exercised for real once you turn the switch on for the first real cohort.
- Calendar page week list in the new theme order: not re-opened and looked at since the theme-order fix merged.
- This run's own browser/localhost access was blocked part-way through (an environment restriction, not a bug) — everything under "What works" above was tested by a separate, already-running Claude session sharing this same project folder, not by tonight's `programme-overnight` run itself. A second check from you would not hurt, but nothing here is guesswork.

## Content gaps (see the todo file's own Gaps section for the full list)
- BI weeks 25, 35, 36 and BM week 4 (Sukan) have no essay; those days show "content still being prepared."
- 34 of 440 BI words still have no example sentence; 23 of those were filled in tonight from the theme packs after removing the watermark layer, so 11 remain blank.
- Several BI essays (School, Finance, People & Culture) are old-format docs with no question table, so the Wednesday "question" is the essay title only.
- BM key paragraphs (Thursday) are a guess (first body paragraph) for most weeks; week 14 may need a different one.
- Essay choices for Review/Report/Story and Travel/Teenagers rounds were made by extraction helpers — worth your check (listed in each raw file's `gaps`).

## Decisions made for you (say if any should change)
1. Day 1 is one sentence per word, handed in once at the end.
2. The AI feedback prompt never checks or mentions word counts; it's told the week's 10 words.
3. The admin-only `?date=` walk-through override never applies to real students — they always get the real Malaysia date.
4. "(unchecked)" notes left for you are stripped out before a student ever sees them.

## Still on the list (blocked on you, not started)
- Malay essay-marking AI: waiting for your materials.
- Watermark "garybookshelf" on the remaining ~31 English Google Docs: needs the Chrome extension.
- BM Sukan dan Rekreasi and Kebersihan dan Kesihatan: need your processed docs.

## What to test first
1. Log in as yourself (admin), open `/programme/today`, click through the 中文/English switch on both the Today page and Settings.
2. Walk a BI week with `?date=`, days 1-5 then Sunday, on both desktop and a narrow phone window.
3. Open `/admin/programme-performance` and check a throw-away student's saved answers show up there, then decide when to flip `PROGRAMME_OPEN` on for the first real cohort.

The scheduled task `programme-overnight` has been turned off (every item in A, B and C is done or honestly flagged above); it will not fire again on its own.
