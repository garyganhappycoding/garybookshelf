# Night list (24 Nov 2026): make the student pages solid for every week

Gary asked (24 Nov 2026) for the UI of EVERY week to be built and checked while he is away. The pages are generated from data, so this means: walk through every week, find what looks broken, fix it, merge. Rules: read brand/PROGRAMME-BUILD-TODO.md first (top section) and brand/GARY-CHECKLIST.md. Keep PROGRAMME_OPEN off. Admin only. Test with a throw-away admin user (create with the Supabase admin API, set profiles.role='admin', delete everything afterwards and verify). Merge each finished fix to main yourself (tsc clean + your own test first). Do not touch BM marking (Gary wants to change it first), do not change AI feedback wording (Gary will say how), do not do the phone UI (later), do not open anything to students.

Usage rule (Gary): if the 5-hour limit resets within about 1 hour, use all you have left; if it resets in a long time, use about 2 hours' worth per run; leave some for Gary. Stop cleanly, commit, push.

## Work list
- [x] N1 `npx tsx scripts/audit-content.mts` is clean except known gaps (BM week 4, short Form 5 BM weeks).
- [x] N2 Browser walk, FORM 4, BI: one week of each of the 11 themes (weeks 1 to 11), days Mon to Sun with `?date=` (week N starts 4 Jan 2027 + 7 x (N-1) days, skipping exam weeks: from week 16 the date moves by 3 weeks, i.e. week 16 starts 17 May 2027). Check: page loads (no 404/500, no console errors), Day 1 has N flash cards and N sentence boxes (N = words), Day 2 essay is tappable, Days 3 to 5 show the question picture (where the week has one), the how-to table and the word list, the reference is NOT visible before hand-in and IS after, layout is two columns on a wide window. Hand in on at most 3 days per theme (AI calls cost money; Telegram alerts go to Gary if the AI is unsure, so use clear answers).
- [x] N3 Same for FORM 4 BM (one week per topic, 19 topics).
- [x] N4 FORM 5 (set programme_profiles.form = 5 on the test user): one week of each BI theme and some BM topics; check 15 flash cards, 15 sentence boxes, the end rule (nothing after SPM start once e4 has a date), exam weeks show the exam message.
- [x] N5 Instruction language switch, both ways, on a few pages; the calendar page (`/programme`) shows the right week/theme and exam weeks; the settings and exam pages still work.
- [x] N6 `/admin/programme-performance` shows the test user's answers correctly (create a few answers first), then delete the data.
- [x] N7 Fix everything found (small, safe fixes only; anything that is a content or design decision goes to the list below instead), merge each fix.
- [x] N8 Write the findings in brand/NIGHT-REPORT-1124.md: what was checked, what was fixed, what needs Gary (copy any content problems he must decide). Then disable the scheduled task `programme-overnight-2`.

## Found problems that need Gary (add here)
- (none — see brand/NIGHT-REPORT-1124.md)

## Progress log (newest first)
- 2026-11-24 13:50 all items done. Fixed and merged: arrow overlap + empty-column layout + duplicate question label (relayed from Gary via another session, PR #51), no-content messages not following instruction language + wrong "year-end exam" wording for Form 5's SPM end rule (found this run, PR #52). N2-N6 checked via a throw-away admin test user and a throw-away confirmed-student test user, both fully deleted and verified clean (0 rows left). Full report: brand/NIGHT-REPORT-1124.md. Scheduled task programme-overnight-2 disabled.
- 2026-11-24 11:21 run started (programme-overnight-2).
- 2026-11-24 night list created.

RUNNING: no
