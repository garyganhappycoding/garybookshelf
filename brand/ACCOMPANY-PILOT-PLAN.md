# 陪你读书 pilot plan (drafted 23 Nov 2026, for Gary to decide)

Scope agreed with Gary: **language track first** (BM and BI vocab, essay cycle), **live discussion under every day**, **future days locked on the server**, **calendar by state (Group A and B)**. Price idea RM1 per school day, about RM200 a year. Full requirements: `BRAND.md`.

## 1. What the pilot must prove (before selling RM200)
| Question | How we measure it |
|---|---|
| Is the daily load a burden? | Minutes per day (self-report after each task), share of students who finish each weekday, week-3 drop-off |
| Does discussion keep people coming back? | Share of students who post or reply, return rate on days with a reply from Gary |
| Does the loop improve their language? | A quiz in week 1 and week 4 built from the same word bank |
| Will parents and students pay? | Interest list and a price test AFTER the pilot, not during |

Pilot size: **20 to 30 students, 4 weeks**, invited from the Telegram channel and the website (like the essay marking beta testers: a list of Gmails). Free for the pilot. No refund wording needed because nobody paid.

## 2. What already exists and gets reused
- Login, profiles, admin pages, Telegram alerts to Gary (`lib/telegram.ts`).
- Order approval and 30-day grants (`lib/orders.ts`): the yearly plan becomes a product that grants membership when approved.
- Essay marking AI (`lib/writing/mark.ts`): marks the Wednesday to Friday drafts.
- Spam helpers for forms (`lib/community.ts`: honeypot, timing, per-visitor limits).
- The calendar data and rules from the prototype (per-state holidays, Group A and B terms).

## 3. What gets built (new)
**Tables (Supabase)**
- `programme_members`: user_id, state, group (A or B), form level, cohort_id, nickname, starts_on, ends_on.
- `programme_days`: week_no, weekday, track (language), theme, level, vocab_bm (10), vocab_bi (10), task text, published flag. Content is keyed by programme week and weekday, NOT by calendar date, so Group A (shifted week) uses the same rows.
- `programme_submissions`: user_id, week_no, weekday, answer text, minutes taken, created_at.
- `programme_posts`: cohort_id, week_no, weekday, user_id, parent_id, body, status (visible, pending, hidden), pinned.
- `programme_reports`: post_id, reporter_id, reason.
- `programme_exam_dates`: user_id, name, start, end (what students edit in the calendar).

**Server rules (the lock)**
- One route returns a day's content: it works out the student's state calendar, converts "today in Malaysia" to week and weekday, and refuses any day in the future. A future day's text is never sent to the browser or put in the page code.
- Past days stay open for catch-up. Gary can unpublish a day.
- Comments are scoped to the student's cohort. A student sees classmates' answers and replies only after they submitted their own for that day.

**Pages**
- `/programme` (calendar for the student's state, tap a day).
- `/programme/day/[week]/[weekday]` (task, vocab, submit answer, discussion).
- `/programme/join` (state, form level, nickname, parent consent tick).
- `/admin/programme` (members, cohorts, content, reports and pending comments, pin and hide).

## 4. Discussion and safety rules (live in the pilot)
1. Nicknames only. No photos, no real names shown.
2. Block links, phone numbers, emails and handles in comments (checked in code before saving).
3. AI screening for unsafe or off-topic comments: unsure ones go to `pending` and Gary approves.
4. A report button on every comment; reported comments are hidden until Gary reviews.
5. Cohorts of 20 to 30 students so it feels like a class.
6. Gary can pin one reply a day (his own explanation).
7. Parent consent at sign-up because students are minors; privacy text updated.
8. Telegram alert to Gary only when something needs him (a report, or more than N pending comments), not for every comment.

## 5. Content for the pilot (weeks 1 to 4)
Themes: Technology, Environment, Health & Sports, School & Education (B1 words). Claude drafts each week's 10 BM and 10 BI words from Gary's BM karangan and BI essay notes (vocab data already in the repo for BI essays; BM from Gary's Drive notes). Gary checks every word and meaning before it goes live. Task wording per weekday is already in the calendar prototype.

## 6. Order of work
1. Calendar data and the server day route with the lock (small, testable).
2. Tables, join page, member approval list.
3. Day page: task, vocab, submit answer.
4. Discussion with the answer-first rule, filters, report, admin queue.
5. Essay and sentence marking hook (reuse the marking AI).
6. Pilot content weeks 1 to 4, then invite students.

## 7. Open decisions for Gary
1. Pilot start: **mid Dec 2026 holiday edition** (as the "before Form 4" preparation) or **Jan 2027** after school starts.
2. Pilot students: how many, and invite from the Telegram channel only?
3. BM vocab source: which BM karangan notes (Drive folder or file) are the word source?
4. Sentence marking: allow AI to check each student's 10 to 20 sentences once a day (about RM0.01 a day each)?
5. Parent consent wording and who answers parent questions.
