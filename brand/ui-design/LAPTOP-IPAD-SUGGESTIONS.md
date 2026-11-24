# Laptop and iPad: UI suggestions for 陪你读书

All items are **suggestions** by Claude, not decisions by Gary. Each is tied to something in the code I read (DayCard.tsx, TodayView.tsx, FlashQuiz.tsx, HighlightEssay.tsx, BlockView.tsx, CalendarView.tsx) or to research. Not read: SettingsView.tsx, Shell.tsx, StartView.tsx, ExamsView.tsx.

## A. Research: Cerdek (what I could and could not see)

Gary confirmed the app is **Cerdek** (cerdek.com; web app at app.cerdek.com).

Could read (public, logged out):
- Marketing page, blog titles, media kit, and the logged-out first screen of the web app.
- It is an AI revision tutor for SPM / KSSM, answers checked against the syllabus, usable in Chinese, English or BM. Features named: past papers with instant marking, mistake book (wrong answers saved, removed once answered correctly), flashcards made from quiz questions, translation by selecting text, timer for past papers, topic insights (which chapters appear most), speaking and listening mock, essay assistant, SPM calendar. Free plan has weekly AI credits; paid plan costs RM30 (the page is unclear whether monthly or one-time).
- Web app first screen: a left menu of named tools, a mascot (a kancil), a few quick-action chips, one input box, a language switch (English, BM, Chinese) with flags, an announcements panel with filters (All, Update, Event, Notice, Rewards), and Google sign-in only.
- Tone of copy: friendly, plain, encouraging.

Could NOT see: anything behind login (lesson and quiz screens, streaks, progress bars, real colours and fonts, phone layout). The media kit and site give no colour or font information and no screenshots. I could not find reviews or an app store page for Cerdek. So I do not claim anything about its streaks or visual style.

Comparable apps used for what Cerdek did not show (from web search summaries and general knowledge, not hands-on testing):
- Duolingo: streak and daily goal as the main habit hook; bottom tab bar; one lesson at a time; completion screen with reward. Critics note users sometimes do the shortest lesson only to keep the streak, and that icon-only tabs confuse.
- EduBijak (Malaysian SPM app, FMT article): short sessions, reminders, points and league tables, explains every option after each answer, BM and English.
- Cerdik BM, a different primary-school Malay app on the App Store (not the app Gary means): levels, stars, collectible cards, Chinese translations on words. Mentioned only because I first found it by the spelling "Cerdik".
- Quizlet and Anki style flash cards: one card, flip, grade yourself; already what FlashQuiz does.

Sources:
- https://cerdek.com/ , https://cerdek.com/blog/ , https://cerdek.com/media-kit.html , https://app.cerdek.com
- https://www.freemalaysiatoday.com/category/leisure/2025/06/19/how-the-edubijak-app-is-making-spm-prep-fun
- https://apps.apple.com/us/app/-/id6748868185 (Cerdik BM)
- https://uxplanet.org/ux-and-gamification-in-duolingo-40d55ee09359 and other Duolingo write-ups from the search results

## B. What is already good in the code (keep)
- Streak, week count and RM earned are all visible at the top of the calendar (CalendarView stat card); streak greys out when broken.
- Instruction language switch (中文 / English) on every day.
- Flash card is one card at a time with a Chinese front (FlashQuiz).
- Highlight uses two clear colours with a legend.
- AI failure states are written kindly ("your answer is saved and today counts as done").
- Past days can always be opened for make-up.

## C. Ranked suggestions

Effort: S under half a day, M 1 to 2 days, L more. Benefit: H/M/L, my estimate, not measured.

| # | Suggestion | Effort | Benefit |
|---|---|---|---|
| 1 | Auto-save drafts | S | H |
| 2 | A daily "start" screen on Today | S | H |
| 3 | Model answer beside the student's answer | M | H |
| 4 | Focus mode for writing | S | M-H |
| 5 | Progress and streak shown on Today, not only the calendar | S | M-H |
| 6 | Empty and error states with next step | S | M |
| 7 | Accessibility pass (contrast, sizes, Chinese font) | S-M | M-H |
| 8 | Celebrate a finished week | S | M |
| 9 | Gentle reminder design | M | M |
| 10 | Word-by-word flash-card practice for Sunday recall | M | M |

### 1. Auto-save drafts (S, high)
Evidence: DayCard's textarea `answer` and the day 1 inputs `s0..sN` live only in the browser; a reload, a lost connection or a closed tab loses them. The failed-AI message says the answer is saved, but only after hand-in.
Suggestion: save to localStorage per day (key by day + lang) every couple of seconds, show "已自动保存" under the box, clear it after hand-in. No server cost, no personal data leaves the device. Needs Gary's OK (see PHONE doc question 2).

### 2. A daily "start" screen (S, high)
Evidence: TodayView opens straight into the full DayCard: language switches, long panels, instructions. The calendar has the "打开这一天" button after a lot of content.
Suggestion: top of Today shows one card: today's task in one line (from `card.label`), time estimate (`card.minutes`), a big 开始 button that scrolls to the first step. Cerdek's first screen is also few choices plus one input; Duolingo shows one next step. Keep the existing content below.

### 3. Model answer beside the student's answer (M, high)
Evidence: after hand-in, DayCard shows "我的答案" then feedback, and the highlight day says "compare with the answer below" while the model answer is a separate panel below. On a laptop there is space for two columns (the grid already exists for the write days).
Suggestion: after hand-in on laptop/iPad, two columns: left the student's answer (or marks), right the model/example answer with the same blue/red marks (BlockView `Marked`). AI feedback sits under both. Needs care: do not show the model before hand-in (existing rule via `submitted`).

### 4. Focus mode for writing (S, medium to high)
Evidence: writing days put steps, picture, table and word list in the left column and the box in the sticky right column (`lg:sticky lg:top-4`).
Suggestion: a button "专心写" that hides the left column except a collapsible question picture, widens the textarea, and shows a word counter. Esc or the same button leaves it. Pure CSS state in DayCard.

### 5. Progress and streak on Today (S, medium to high)
Evidence: streak, weeks, RM sit only in CalendarView. A student who goes straight to /programme/today never sees them.
Suggestion: small strip at the top of Today: 🔥 streak, "本周 3/5 天", dots for the week (done, today, locked). Duolingo uses a daily-goal ring and streak on the main screen; the criticism that people do the minimum lesson to keep the streak is a reminder to tie streak to a real hand-in (which the code already does via submissions), not to clicks.

### 6. Empty and error states (S, medium)
Evidence in code:
- No card: one plain sentence in a card (ended / exam week / content not ready / holiday). 
- `Nothing to hand in today.`
- "Handed in. Reload the page to see the feedback." (asks the student to reload by hand).
- `res.error` shows plain red text under the button; no retry guidance.
Suggestions: each empty state gets one friendly line plus one next action (e.g. "看看上周的答案", "回到日历"); replace the reload sentence with a 刷新 button that refetches; error text stays above the button and says the draft is kept (needs suggestion 1).

### 7. Accessibility (S to M, medium to high)
Evidence in code:
- `text-xs` used for labels and legends (flash card hint, highlight legend, calendar legend, report links); `text-ink/50` and `text-ink/60` low-opacity grey text is likely below 4.5:1 contrast on cream backgrounds (I did not measure the real colours; check with a contrast tool).
- Highlight colours blue-200 and red-200 differ only by hue: add a small label or underline style (red = dotted underline) so colour-blind students can tell them apart.
- Highlight words are `span onClick`, not buttons: no keyboard access. Use `<button>` or `role="button" tabIndex=0` plus Enter/Space.
- Flash card button has an aria-label; good. Calendar cells have aria-labels; good.
- Chinese text: set a CJK-friendly font stack and `line-height` about 1.6 to 1.7 for body Chinese; the vocab table's 中文 column should be at least 16 px.
Suggestion: raise minimum text to 14 px on laptop (16 px on phone), darken secondary text to about ink/70, add focus rings.

### 8. Celebrate a finished week (S, medium)
Evidence: after hand-in there is only "已交上去"-style text; calendar cells turn green. Cerdik BM gives stars and cards; Duolingo gives a completion screen; Cerdek's announcement panel has a "Rewards" filter.
Suggestion: when the last required day of a week is handed in, show one card: "第 N 周完成", the week's words, streak, RM progress. No animation required; optional confetti is a later nice-to-have. Wording must respect Gary's rule that rewards are manually approved: say "你赚了…" only if that is true after approval, otherwise "等 Gary 确认". Check with the reward rules in memory before writing the copy.

### 9. Gentle reminder design (M, medium)
Evidence: no reminder UI in the files I read. EduBijak uses reminders. Duolingo-style pushes can feel nagging.
Suggestion: reminders are opt-in in settings (off by default), one time per day, text like "今天的 10 分钟在等你", never shames a broken streak, quiet hours, easy off. Channel is Gary's decision (memory says no Telegram for student feedback; not necessarily for reminders, so ask). Only a design; nothing decided.

### 10. Sunday recall flash cards, word by word (M, medium)
Evidence: FlashQuiz already takes `rows` (zh + answer), flips and grades; Sunday is an optional full essay with no recall step.
Suggestion: reuse FlashQuiz on Sunday with the whole week's words, plus a "mistake book" idea from Cerdek: words marked 还没记住 come back first next time (needs storing the miss list; today the result is only in the form field `qk`). Marked optional; Gary has not asked for it.

## D. Not recommended now
- Leaderboards or league tables (EduBijak, Duolingo): comparison could discourage weaker students and conflicts with the discussion rule that students only use nicknames; no sign Gary wants it.
- Mascot: nice (Cerdek has one) but a brand decision for Gary.

## E. Suggested order
1 (auto-save), 2 and 5 (start strip with progress), 6 and 7 (states and accessibility), 3 (side by side), 4 (focus), 8, 10, 9.
