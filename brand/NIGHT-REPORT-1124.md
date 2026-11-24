# Night report (24 Nov 2026): all-weeks UI check

Ran brand/NIGHT-LIST-1124.md overnight while Gary was away. `PROGRAMME_OPEN` stayed off the whole time; everything below was checked as an admin-only preview with a throw-away admin test user, created with the Supabase admin API and fully deleted afterwards (verified by SQL: 0 leftover rows in every `programme_*` table, 0 leftover auth users with the test emails).

## What was checked
- **N1 content audit**: `npx tsx scripts/audit-content.mts` — 176 weeks checked, only the already-known gaps remain (BM week 4 has no content; a few short Form 5 BM weeks). Nothing new.
- **N2/N3 Form 4, BI (11 themes) and BM (19 topics)**: every theme/topic week, every day Monday to Sunday, fetched as the admin test user and checked for page errors, the right week/theme/day label, word counts, quiz, question image/table, how-to-write guidance, and rest/Sunday cards. All 11 BI weeks and all 19 BM topics came back clean (one real submission was also handed in by hand through the browser, see below). Note: a batch of rapid back-to-back requests made the Next.js **dev server** (not the real site) return occasional spurious 404s mid-compile; every one of those re-checked clean once requests were spaced out, so this was a local tooling artefact, not a site bug.
- **N4 Form 5**: switched the test profile to `form = 5` — Day 1 correctly shows 15 flash cards and 15 sentence boxes (was 10 for Form 4). Set a real SPM date (`exams.e4`) and confirmed the programme correctly keeps running the day before SPM starts and shows the "programme has ended" card on and after the SPM start date. Confirmed the same for the Form 5 mock-exam window (exam-week card, not a blank day).
- **N5 instruction language + calendar**: switched 中文/English on the Today page and on the new "ended"/exam-week/holiday messages (see fixes below); the `/programme` calendar page for the Form 5 test profile shows the right week number, theme, level, and correctly colours the mid-year exam, the Form 5 mock exam and the SPM window after exam dates were set. `/programme/settings` and `/programme/settings/exams` both load and show the state/Form picker and the 3 exam rows.
- **N6 admin performance**: created a second throw-away **non-admin, confirmed** student (confirmed students are the only ones this page counts — the admin's own test answers are deliberately excluded, by design), gave it 2 submissions with a quiz score, and confirmed `/admin/programme-performance` shows 1 student, the right class (KL-F4), the right BI/BM submission counts, and the right quiz average. Then deleted it all.

## What was fixed and merged
Three small UI bugs were relayed by another session from Gary while this run was going (PR #51), fixed and verified in the browser at laptop and ~800px width:
1. The demo-day ← → arrows overlapped the date line above them — now a spaced row of circular buttons.
2. On Day 3-5/Sunday, when there is nothing to read on the left (e.g. Sunday before hand-in), the answer box used to sit alone in a half-empty page — it now takes the full width.
3. The question-image block ("这周的真题") and the question-points table ("这周的题目") now both say "题目" / "Question", so a page never shows two differently-worded question blocks.

Found and fixed during this run (PR #52):
4. The "this week is an exam week" / "programme has ended" / "content not ready" / "school holiday" messages on the Today page were always Chinese, even when a student had chosen English instructions. They now follow the same instruction-language toggle as the rest of the day.
5. The "programme has ended" message always said "年终考开始了" (the year-end exam has started), even for Form 5, whose programme actually ends when **SPM** starts, not the year-end exam. Form 5 now reads "SPM has started" / "SPM 开始了".

Both PRs: `npx tsc --noEmit` clean, tested in the browser, squash-merged to main.

## Found problems that need Gary
None new. The only gaps are the ones already tracked in `brand/PROGRAMME-BUILD-TODO.md` (BM week 4 Sukan, BM Sukan/Kebersihan raw docs, the 10 BI words with no example sentence, Malay essay marking) and `brand/GARY-CHECKLIST.md` — nothing in this run surfaced a new content or design decision for Gary.

## Not done this run
- Did not hand in more than one real answer (one BI Day 1, Form 5, to check the submission pipeline and the performance page) — AI marking calls cost money, and the night list asked to keep that to a minimum. The one hand-in correctly saved the answer and fell back to "AI is busy, your answer is saved" (no Groq/OpenRouter keys reachable from this sandbox), which confirms that fallback path works.
- Did not check all 44 BI/BM weeks, only one week per theme/topic (11 BI themes, 19 BM topics) as the list asked — the content audit script (N1) is what covers all 176 weeks for data-level gaps.
- Phone UI, BM marking, and AI feedback wording were left untouched, as instructed.

Scheduled task `programme-overnight-2` is now disabled.
