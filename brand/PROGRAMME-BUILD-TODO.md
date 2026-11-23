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
- [ ] A0 Move BI week 1 into `lib/programme/content/bi/w01.ts` and add `getWeek(lang, n)`; keep the review page working for all weeks.
- [ ] A1 BI weeks 1 to 44. Words and order: `brand/PROGRAMME-BI-VOCAB.md`. Essays: Gary's reorganised Drive folder 15igSQPwFQlLPoCzjGVjCfQoOvgQx7xOA (11 themes x 4 rounds; the theme packs are linked in the vocab file). Per week: essay text, question points, 10 words + example sentence (from the essay or the theme pack's universal phrases), quiz, highlight lists, Wed/Thu/Fri references taken from the essay.
- [ ] A2 BM weeks 1 to 44. Words: `brand/PROGRAMME-BM-VOCAB.md`; essay text from the Malay folder 1-Dd... (see `brand/PROGRAMME-BM-VOCAB.md` links). Examples = the `ayat` column. Wed opening, Thu one isi, Fri closing = from the essay.
- [ ] A3 Gaps list: write every week that could not be filled (missing essay, no table) to the "Gaps" section below instead of inventing content.

### B. Student UI (the real thing, not the review prototype)
- [ ] B1 Profile column `instruction_lang` (en | zh) + switch in the settings page and on the Today page. Default zh.
- [ ] B2 Today page renders the day card from the week content (calendar week n -> content week n, both languages the same day, 10 min each).
- [ ] B3 Day 1: 10 sentence boxes + quiz (scored on the server against the answer key; saves quiz_correct/quiz_total and `details`).
- [ ] B4 Day 2: tap-to-highlight, saved in `details`; answer key shown after submit.
- [ ] B5 Days 3 to 5: one text box; the reference (from the essay) is shown only after submit.
- [ ] B6 Saturday rest card; Sunday choice (full essay or rest).
- [ ] B7 AI feedback prompt per day type, using the "What the AI checks" list of that day (no word-count checks).
- [ ] B8 Everything saves to programme_submissions (+ answer log) and shows on /admin/programme-performance.

### C. Test run (do it yourself and fix what breaks)
- [ ] C1 Throw-away student with a confirmed place: go through a full week in the browser (desktop + mobile width), both languages, both instruction languages. Check saved rows, AI feedback, performance page.
- [ ] C2 Check a student who is not confirmed, and a signed-out visitor, cannot see anything (404 / redirect).
- [ ] C3 Delete all test accounts and rows. Verify the database is clean.
- [ ] C4 Write `brand/PROGRAMME-MORNING-REPORT.md`: what works, what does not, what Gary should test first, every gap.

## Gaps (fill in as you find them)
- (none yet)

## Progress log (newest first, one line per run)
- 2026-11-23 23:25 list created. Nothing built yet.

RUNNING: no
