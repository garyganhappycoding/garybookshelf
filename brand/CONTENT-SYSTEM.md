# Content system: from audience problem to published post and back

> Agreed with Gary, 21 Nov 2026. One loop, repeated every week.

## The loop
1. **Collect** (Gary, any time): add audience problems to `brand/PROBLEM-BANK.md` in their own words (DMs, comments, Telegram polls). Screenshots are fine; Claude types them in.
2. **Analyse** (Claude, each time new problems arrive, and once a month): group into themes, count them, and place each on the calendar (`brand/CALENDAR-2027.md`). Rule: the more students ask, the earlier it is made.
3. **Choose** (Gary, weekly): pick the next piece from the calendar and add his own idea or story for it (the personal part: what he understood, failed at, or overcame).
4. **Script** (Claude): 3 hook options, the spoken script in Gary's voice (mostly Chinese, some English and Malay, friendly senior), on-screen text, and a call to action. Gary's own idea is the core; Claude does not invent facts about exams, school rules or results.
5. **Edit** (Gary, then Claude): Gary changes what does not sound like him; Claude tightens it again. Gary records on his Tuesday work day (batch several scripts).
6. **Caption** (Claude): caption and hashtags to match the video (first line must hold without "...more"), plus a one-line Telegram post for the same piece.
7. **Upload** (Gary): posts by hand and adds the video link or the date to the log below.
8. **Feedback** (Gary, 3 to 7 days later): pastes the numbers (views, average watch time or retention, saves, shares, comments, follows) and a few real comments.
9. **Improve** (together): Claude compares with earlier posts, says what the hook, topic and length seem to have done, and proposes the next test. Lessons go into `brand/KNOWLEDGE.md`; the problem's status changes in the bank.

## Notion workspace (built 21 Nov 2026)
Hub page "garybookshelf 2027 content system": https://app.notion.com/p/41fe62dc5ffd81738363ee5a0f190875
- **Audience Questions** (data source `collection://41fe62dc-5ffd-810e-83b3-000b47979b34`): website questions from the Supabase `submissions` table (`kind = 'question'`), with theme, level, emotion, coverage by old reels, planned month, and an "Addressed?" formula (Planned in calendar / Covered by old reel / Not yet).
- **Content Calendar 2027** (data source `collection://41fe62dc-5ffd-8140-9142-000b6559de2d`): one row per piece, linked to the questions it answers; each row has headings for hook, script, caption, Telegram post and feedback.
- **Sync rule:** when Gary says "sync questions", Claude reads new `submissions` questions that are not yet in Notion (match on the 8-character `Source ID`), copies ONLY the question text, level, date and flags (never name, contact, email or user id), classifies them, and links them to calendar rows. Support and product questions are kept but marked "Not a content topic".
- **Automated (21 Nov 2026):** a scheduled Claude task "Sync website questions to Notion" runs every Tuesday at about 08:30 (Gary's work day) and does the sync above. It runs only while the Claude desktop app is open on Gary's computer (if closed, it runs on next launch). Gary can still say "sync questions" any time, or run it from the Scheduled section in the sidebar. A direct website-to-Notion sync would need a Notion API key and site code; not built.
- **Gary Q&A (for Gary AI)** (data source `collection://41fe62dc-5ffd-8148-b086-000b35a877a0`, added 21 Nov 2026): what a student asked and how Gary really answered, in his own words, linked to the Audience Question. Filled from Gary's private replies on the website (`submissions.reply`) plus new scripts. "Approved for AI" stays unchecked until Gary has checked each answer; "Needs checking" flags answers that conflict with his rules or may be outdated. Do not copy phone numbers or Telegram invite links into it.
- Imported 21 Nov 2026: 54 questions (about 24 content ideas, the rest support, product, fan or off-topic).

## Weekly rhythm (fits one work day, Tuesday)
- Morning: choose 2 to 3 topics, give Claude your ideas.
- Claude returns scripts and captions; Gary edits and records.
- Later in the week: upload; the Telegram letter goes out.
- The following week: feedback and improvement talk, then the next loop.

## Script request (copy, paste, fill in)
```
Problem ID(s): P__
Format: reel / carousel / YouTube long-form
My idea or story for it: ...
What I want students to feel or do after: ...
Facts I know are true (exam rules, my own results): ...
```

## Results log (one row per posted piece)
| Date posted | Problem ID | Format | Hook used | Views | Avg watch / retention | Saves | Shares | Comments | Follows | What worked / did not | Next test |
|---|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | | |

Metrics that matter most for this brand: **saves and shares** (they show the technique was useful), then retention on the first 3 seconds (the hook), then comments (new problems for the bank).

## Rules
- Do not invent exam rules, dates, school policies or student results. If Gary has not said it, Claude asks.
- No claims about student grade gains until real before/after proof exists (see `brand/BRAND.md` credibility).
- Peak months (Aug to Nov): more sales content (notes, packs). Warm months: trust content and the YouTube series.
