# 陪你读书 · morning report (2026-11-24, 09:25)

Written by hand from the state of the build. The overnight task had not finished its own report yet, so the "not tested" list below is real.

## Where to look
- Student page: `/programme/today` (log in as admin). Switch BI / BM at the top; switch the instruction language (中文 / English); walk through days with "前一天 / 后一天", or add `?date=2027-01-04` to the address (week 1 starts 4 Jan 2027, so week N starts 4 Jan + 7 x (N-1) days).
- What each student has done: `/admin/programme-performance` (students only; your own test answers are not counted).
- Your review page for week 1: `/programme/content`.
- Students still cannot see anything: `PROGRAMME_OPEN` is off, everything else is 404.

## What works (tested in the browser as a throw-away admin account, deleted afterwards)
- BI week 1 day 1: 10 sentences + vocabulary quiz (scored on the server), AI feedback in Chinese. Saved.
- BI week 1 day 2: tap-to-highlight (blue = this week's word, red = a word you like). Saved, scored by rule, no AI.
- BI week 7 day 3 and BM week 1 day 3: opening day of a generated week. AI feedback, model opening shown only after hand-in.
- Phone width (375 px): no sideways scroll; the three-column format tables turn into cards.
- Every answer is saved with its quiz score, its extra parts and every earlier version.

## Content
- BI 44 weeks, BM 44 weeks extracted from your Google Docs. No sentence of yours was rewritten.
- BI weeks 25, 35, 36 have no essay (not enough new-format essays in those folders). BM week 4 (Sukan) is empty. Those days show "content still being prepared".
- 34 of 440 BI words still have no example sentence (the pack has none for them). The Monday table shows a blank for those. I filled 23 from the packs after removing the watermark layer.
- Several BI essays (School, Finance, People & Culture) are old-format docs with no question table, so the Wednesday "question" is the essay title only.
- Review / Report / Story and Travel / Teenagers essay choices were made by my helpers (listed in each raw file's `gaps`). Please check them.
- BM key paragraphs (Thursday) are the first body paragraph in most weeks; week 14 may need a different one. Many BM weeks reuse the same essay.
- Days 3 to 5 now show how to write the opening, the elaboration and the closing, plus a few words from Monday. For BI weeks 1 to 11 the words are split by the order of your universal phrases; for other weeks all 10 words are shown.

## Tested later the same morning
- BI week 1 days 4, 5 and Sunday (hand in, AI feedback, reference shown after): pass. BM week 1 day 1 (10 sentences + quiz): pass. The 中文 / English switch (Today page and Settings page): works, takes a few seconds in the dev server.
- Day 3 now shows a picture of the real exam question, cropped from your essay doc (39 weeks; weeks 6, 25, 28, 35, 36 have none).

## Not tested yet
- BM day 2 (highlight) and other weeks' days 4 and 5 (they use the same code as the weeks tested).
- A real student account (non-admin) with a confirmed place: it goes through the same code as the admin but I did not run it, because that needs the launch switch on.
- Calendar page week list in the new theme order (changed, not looked at).

## Known gaps and decisions for you
1. Language switch is on the Today page and in Settings.
2. Day 1: one sentence per word, handed in once at the end (Gary confirmed).
3. The AI feedback prompt does not check word counts (your rule). It is told the week's 10 words.
4. Admin walk-through date override is admin only; students always get the real Malaysia date.
5. "(unchecked)" notes that I wrote for you are hidden from students automatically.

## Still on the list
- Malay essay-marking AI: waiting for your materials, not started.
- Watermark on the remaining ~31 English Google Docs: needs the Chrome extension.
- BM Sukan and Kebersihan: need your processed docs.
- Overnight task `programme-overnight` is still scheduled (every 2 hours); it will test the rest and update this file.
