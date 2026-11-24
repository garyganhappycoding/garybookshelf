# 陪你读书: phone UI design (375 to 430 px, one hand)

Status: design proposal by Claude. Nothing here is built. Everything labelled "suggestion" is not a decision by Gary.
Basis: I read components/programme/DayCard.tsx, TodayView.tsx, FlashQuiz.tsx, HighlightEssay.tsx, BlockView.tsx, CalendarView.tsx. SettingsView.tsx and Shell.tsx were not read; the settings section is therefore generic and must be checked against that file.

## 0. Research basis (short; details in LAPTOP-IPAD-SUGGESTIONS.md section A)

Gary means **Cerdek** (cerdek.com, app at app.cerdek.com). What I could read: the public marketing page, the blog titles, the media kit, and the web app's logged-out first screen. I could NOT see anything behind the Google login, so I did not see its lesson/quiz flow, streaks or real colours/fonts. What the public pages do show, and what I borrow:
- A chat-first home with a few quick-action chips (Explain, Quiz, Marking) and one input box. Lesson: few choices on the first screen.
- Tools are a short row of named shortcuts (Flashcards, Mistakes, Calendar, Topics). Lesson: name the tool, do not hide it in menus.
- Three language switches (BM / EN / 中) always available. We already have 中文 / English for instructions.
- A mistake book that removes an item once answered correctly. Lesson: shrinking "to review" list is motivating.
- A mascot (a kancil). Lesson: one friendly character, optional.
Comparable apps used for what Cerdek did not show (general knowledge plus search results, not hands-on): Duolingo (bottom tab bar, one lesson at a time, daily goal ring, streak), EduBijak (short sessions, reminders, explain each answer, BM and EN), Quizlet/Anki style flash cards (one card, flip, two grade buttons; already what FlashQuiz does).

## 1. Global phone rules

| Rule | Value | Tailwind / note |
|---|---|---|
| Width | design at 375, test 360 to 430 | `max-w-md mx-auto px-4` on the page wrapper |
| Tap target | at least 44 x 44 px, 8 px gap | `min-h-11` (44px) on buttons, `py-3` |
| Body text | 16 px minimum (also stops iOS zoom on inputs) | inputs/textarea `text-base`, never `text-sm` on phone |
| Thumb zone | primary actions in the bottom 40% | sticky bottom bar |
| Safe area | add bottom padding for home bar | `pb-[env(safe-area-inset-bottom)]` |
| Chinese font | system CJK stack, line-height 1.6 | `leading-relaxed` already used |
| One idea per screen | long content folded | accordions and step cards, below |

### Bottom tab bar (new, phone only, `md:hidden`)
```
+-------------------------------------+
|  [ 今天 ]   [ 日历 ]   [ 设置 ]      |   h-14, fixed bottom
+-------------------------------------+
```
3 tabs only: 今天 (/programme/today), 日历 (/programme), 设置 (/programme/settings). Icon plus Chinese label (Duolingo critics note unlabelled icons confuse; label every tab). Active tab filled sage.
Laptop: keep whatever Shell.tsx does now (not read); the bar is `md:hidden`.
New component: `PhoneTabBar` inside Shell.tsx (needs reading Shell.tsx first).

### Sticky layers on Today (top to bottom)
1. Top strip (sticky top, h-12): `< 日历`, "第 N 周 · 星期X", fire streak number, BM/BI switch as a small segmented control.
2. Content scrolls.
3. Bottom action bar (sticky, above the tab bar): the ONE primary action of the day (see per day). 

When the keyboard is open, hide the tab bar and keep only the action bar (see 3.3).

## 2. Home / calendar screen (CalendarView)

Laptop today: header, big stat row, legend, selected-day card, 12 month grids in 2 columns.
Problem on phone: the stat row has four items on one line (already `text-[13px]`, tight), the legend is 9 items, and 12 months of grid is a very long scroll. The key action ("open today") sits under all of it.

```
+-------------------------------------+
| 陪你读书 2027                        |
| 第 3/40 周   🔥 5   赚回 RM30/200    |  <- stat card, 2 rows
|-------------------------------------|
| 今天 · 1月20日 星期三                |
| 第 3 周 · 主题 · Level              |
| 任务：写一个论点                     |
| [        打开今天        ]  44px+    |  <- big primary, top of page
|-------------------------------------|
| 本周                                 |
| 一 二 三 四 五 六 日                 |
| ✓  ✓  ●  ○  ○  ·  ·                 |  <- week strip, tap a day
|-------------------------------------|
| v 整个月历 (折叠)                    |
|   1月 [month grid 7 cols]            |
|   < 1月 >   (one month at a time)    |
| v 颜色说明 (折叠)                    |
+-------------------------------------+
| [今天]  [日历]  [设置]               |
+-------------------------------------+
```
- Stat card: two lines. Line 1: 周 and 天上课. Line 2: streak and RM. Same data (`f.week, f.weeks, f.left, f.total, f.earned, f.streak`).
- Week strip (new, small): 7 buttons, each `min-h-11 flex-1 rounded`, reusing `cellTone`. Tapping selects the day and the selected-day card updates (existing `selected` state).
- Full calendar: show ONE month at a time with prev/next arrows (cells 44 px wide is impossible at 7 columns on 375 px: 375-32 padding = 343, minus week label 26 = about 45 px per cell, so cells are about 44 px; just OK. Keep `py-2.5` to make height 44). Replace the 12-month list on phone with a month pager; keep the 12-month grid at `sm:` and up.
- Legend: collapse into `<details>` on phone.
- Selected-day card: becomes the card directly under the week strip; "打开这一天" is full width.
- Tap targets: week-strip buttons 44 px; month cells about 44 px.
- No keyboard here.
Needs phone variant: CalendarView (month pager, week strip, details legend). Mostly `sm:` class changes plus two small additions.

## 3. Today screen

TodayView currently stacks: date, title "今天", BM/BI tabs, DayCard, then 同学讨论. DayCard starts with the instruction-language switch plus a metadata line, then panels.

Phone header (applies to all days):
```
+-------------------------------------+
| <  1月20日 星期三            🔥 5   |  sticky top
| [ BM | BI ]   说明: [中文|English]  |  segmented, h-10
| 第 3 周 · 主题 · 预计 10 分钟        |
+-------------------------------------+
```
- Merge the two language controls into one compact row (they are separate in TodayView and DayCard today).
- The "今天" h1 is dropped on phone (the tab already says it).

### 3.1 Day 1: vocabulary, flash cards, sentences

Laptop: vocab table, then two columns (flash cards left, sentences right).
Phone: a **step-by-step flow with 3 steps**, one visible at a time, progress dots at the top. The student never sees the whole table plus 15 inputs at once.

Step 1, 看词 (read the words). The vocab table has 4 columns with min widths (12+10+16 rem) and scrolls sideways: bad on a phone. Show each word as a card (same idea as the existing `table` case for 3+ columns):
```
+-------------------------------------+
| ● ○ ○   步骤 1/3 · 看词              |
|-------------------------------------|
| 1  elaborate                         |
|    详细说明                          |
|    "She elaborated on her plan."     |
|-------------------------------------|
| 2  ...                               |
| (list, 15 cards, each ~88 px)        |
+-------------------------------------+
| [   下一步：闪卡   ]  sticky         |
+-------------------------------------+
```
Cards collapse the example sentence behind a tap? Suggestion: keep the example visible (students need it for the sentence step); make the long list a native scroll.

Step 2, 闪卡 (FlashQuiz). Already close to phone-ready (single card, tap to flip, two buttons). Changes:
```
+-------------------------------------+
| ○ ● ○   步骤 2/3 · 闪卡    4 / 15   |
|                                     |
|   +-----------------------------+   |
|   |   中文，点一下翻面          |   |
|   |        详细说明             |   |  min-h-[16rem]
|   +-----------------------------+   |
|                                     |
+-------------------------------------+
| [ 还没记住 ]        [ 记得 ]        |  sticky bottom, h-14 each
+-------------------------------------+
```
- Move the two buttons into the sticky bottom bar (thumb reach). They are inside the card flow now.
- Card `min-h-[16rem]`, whole card is the flip target (already a button).
- Add swipe (suggestion, small JS): swipe right = knew it, left = not yet, with the buttons still there.
- Finished state "7 / 15": add button 下一步 to step 3 beside 再来一次.
- Tap targets 56 px.

Step 3, 写句子 (one sentence per word, 15 inputs). Today: all inputs in a column, `text-base`? No: `px-3 py-1.5` and default size (16 px by browser default for input unless text-sm; it is not text-sm, so fine; the label is).
```
+-------------------------------------+
| ○ ○ ●   步骤 3/3 · 写句子   3/15    |
|-------------------------------------|
| 3. elaborate                         |
| +---------------------------------+ |
| | I will ...                      | |  h-12, text-base
| +---------------------------------+ |
|  (Next word shows next, or list)    |
+-------------------------------------+
| [ < 上一个 ]   [ 下一个 > ]          |
+-------------------------------------+
```
Two options; suggestion is B:
- A: keep the plain list, but make inputs `py-3` and sticky 交上去.
- B (suggested): one word at a time, with a small chip row of 15 numbers (filled when written). Fewer scrolling jumps with the keyboard open. Risk: the form must still submit all `s0..s14`; render all inputs, hide inactive ones with `hidden` class, so form data is intact.
- Sticky bottom: on the last word, "下一个" becomes the primary 交上去 (the existing submit button).
Keyboard: see 3.3. Use `enterKeyHint="next"`; Enter moves to the next word (preventDefault on Enter so it does not submit the form early).

### 3.2 Day 2: highlight the essay

Laptop: colour chips on top, essay below, tap words.
Phone issues in HighlightEssay: words are tiny tap targets (inline spans `px-0.5`), the colour chips scroll away with the essay, `select-none` is fine.
```
+-------------------------------------+
| 点词来标记                           |
| essay paragraph, text-[17px]        |
| leading-8 (line spacing 32 px so    |
| fingers can hit lines)              |
| ...                                 |
+-------------------------------------+
| [ 蓝 本周词 ]  [ 红 好词 ]  [清除]   |  sticky bottom, h-12
| [        交上去        ]            |
+-------------------------------------+
```
- Move the colour chips to the sticky bottom (thumb). The active one has a thick ring and the other one is outlined. 12px text is too small: use `text-sm py-2.5 px-4` (44 px high).
- Increase word hit area: `px-1 py-1` plus `leading-9` on phone. Words stay inline.
- Essay length: show the paragraphs in an accordion? No. Highlight needs the whole essay. Instead show a thin progress count at the top: "蓝 7 / 红 3" (suggestion).
- Add the week's word list as a collapsible chip strip at the top (`<details>` 本周词表) so the student does not need to leave the page to know which words are blue. The vocab block is already there as a panel above on laptop; on phone make it collapsed by default on day 2.
- Keyboard: none (tap only). If the textarea in 同学讨论 is used afterwards, see 3.3.
- Prevent double-tap zoom: `touch-action: manipulation` (Tailwind `touch-manipulation`) on the essay.
Needs phone variant: HighlightEssay (bigger line height and hit area, sticky chip bar).

### 3.3 Days 3 to 5: write (opening, one elaborated point, conclusion)

Laptop: left 3/5 shows steps, exam question picture, how-to table, word list; right 2/5 sticky textarea plus checklist.
Phone: the textarea cannot sit beside the content. Use **three collapsible panels above, a big writing box below, sticky hand-in**.
```
+-------------------------------------+
| 今天：写开头                         |
| v 题目 (picture)        [展开/收起]  |  open the first time, then collapsed
| v 怎么写 (steps + how-to cards)      |  collapsed by default
| v 词表 (this week's words)           |  collapsed by default
|-------------------------------------|
| 我的答案                              |
| +---------------------------------+ |
| |                                 | |  textarea min-h-[40vh]
| |                                 | |
| +---------------------------------+ |
| 字数 38                  已自动保存  |
| v 检查清单                           |
+-------------------------------------+
| [ 看题目 ]            [ 交上去 ]     |  sticky bottom
+-------------------------------------+
```
- Accordions: native `<details><summary class="min-h-11 flex items-center">`. Question picture folded means the student can collapse it to see the writing box on a small screen, and re-open with one tap.
- "看题目" button in the sticky bar opens the picture in a **bottom sheet** (new, simple): a fixed panel covering the lower 70% of the screen with the picture, close with a big X or tap outside. This lets the student look at the question while the textarea stays at the top of the screen. Cheaper alternative: just scroll up. Suggest the sheet only if testing shows students lose their place. Mark as optional.
- Picture: `w-full`, tap to open full-screen with pinch zoom (an `<a href target=_blank>` wrapper on the image is the cheapest option).
- How-to table: already turns into one card per row for 3+ columns. For 2 columns it is a table; on phone make all tables cards.
- Textarea: `text-base` (16 px), `rows` ignored, `min-h-[40vh]`, `p-3`, `leading-relaxed`. Change `rows={9}` which is too small.
- Checklist ("checks" block): collapsed `<details>` under the box.
- Keyboard behaviour: when the keyboard opens the visible area shrinks about 40 to 50%. Therefore:
  - Hide the bottom tab bar while a textarea or input is focused (use `focus-within` on the form with a CSS rule, or JS `visualViewport` resize). The hand-in bar stays, pinned to the top of the keyboard (position: fixed bottom with `visualViewport` offset, or `sticky bottom-0` within a scrolling container; in iOS Safari `fixed` follows the layout viewport, so prefer `sticky bottom-0` inside the form).
  - Do not use `autoFocus` on load (it would pop the keyboard before the student reads the question).
  - `scroll-margin-top` on the textarea so the browser keeps it visible.
  - Chinese IME composes in the textarea: never submit on Enter in a textarea.
- Auto-save draft: suggested (not built): save to localStorage per day every 2 s, show "已自动保存". On phone it matters most because students switch to the camera or a chat app and the browser tab reloads.
- Confirm before hand-in: a small confirm sheet "交上去后不能改，确定？" with 再看看 / 交上去. (Suggestion; today there is no confirm.)
- Hand-in pending state: the text "交上去中，AI 在看…" is long; on phone the button shows a spinner plus "交上去中…" and AI text shows below.

Needs phone variant: DayCard (restructure layout, accordions, sticky bar), BlockView (tables to cards, image tap-to-zoom).

### 3.4 Saturday: rest
```
+-------------------------------------+
|            😴 (or the kancil-style    |
|             mascot, optional)        |
|     今天休息                          |
|     今天没有要交的东西。              |
|  本周你完成了 4/5 天                  |
|  [ 看看本周的答案 ]                   |
+-------------------------------------+
```
Current text: "今天没有要交的东西。" (DayCard). Keep it, add the week summary line and one link (suggestion). No sticky bar except the tab bar.

### 3.5 Sunday: optional full essay
Same as days 3 to 5 but the textarea is bigger (`r.optional` uses `rows={14}`) and clearly marked 选做 with a soft grey tag so students do not feel it is compulsory (matching the code label "我的作文（选做）"). On phone:
- Header chip "选做" next to the title.
- The sticky bar has 交上去 plus a secondary "今天先不做" that simply goes back to the calendar (no data written). Suggestion; confirm with Gary whether "skipped" should be recorded at all.
- Textarea `min-h-[55vh]`, word counter, autosave as above.
- Sunday recall flash cards: only if Gary decides (see laptop doc suggestion; not decided).

### 3.6 同学讨论 (comments) on Today
Folded by default on phone into a `<details>` "同学讨论 (N)". Only opens after hand-in (already gated). The comment textarea uses `text-base`; when focused, the sticky bar is the tab bar replaced by "留言" button. Report links: `text-xs` is too small to tap, give `py-2 px-1` padding (hit area 44 px high).

## 4. After hand-in: result and model answer

Laptop today: a "我的答案" card (answer text or read-only highlight with marks), then feedback box (sage), then the panels (model answer comes from `rest` blocks and the comparison text).
Phone: show in **tabs** so the two things to compare are one tap apart.
```
+-------------------------------------+
| ✓ 已交上去            🔥 6           |
| [ 我的答案 | 反馈 | 参考答案 ]       |  3 tabs, h-11 segmented
|-------------------------------------|
| (selected tab content)               |
| feedback text, text-base             |
|                                     |
| 觉得 AI 的反馈不好？告诉 Gary        |  link, h-11 hit area
+-------------------------------------+
| [   下一天   ]  [ 同学讨论 ]         |
+-------------------------------------+
```
- Default tab: 反馈 when feedback exists; 参考答案 when the day is highlight (the text says "Compare with the answer below": on phone the tab replaces "below").
- 参考答案 tab holds the model essay with blue/red marks (BlockView `Marked`) and the legend line, which is `text-xs` today: raise to `text-sm`.
- States (all exist in code): feedback present; waiting_gary (yellow box); failed (grey box, "today counts as done"); none yet ("Reload the page to see the feedback", which is awkward on phone: suggest a pull-to-refresh style "刷新" button, a small client fetch).
- Highlight day: show "我的标记" and "参考答案" side by side is impossible at 375 px, so use the tabs and keep both with the same scroll position (suggestion; optional).
- Tap targets: tabs 44 px, report link 44 px.
New component: `ResultTabs` (a small client component with 3 buttons and conditional content, about 30 lines).

## 5. Settings
I did not read SettingsView.tsx; design from CalendarView, which links "改" to /programme/settings for state, form and group.
```
+-------------------------------------+
| <  设置                              |
| 州属    [ Selangor            v ]    |  native select, h-12
| Form    [ 4 ] [ 5 ]                  |  segmented, h-12
| 组别    [ A ] [ B ]  (short note)    |
| 说明的语言  [中文] [English]          |
| 提醒    [ off ] (suggestion only)    |
|                                     |
| [   保存   ]  sticky                 |
+-------------------------------------+
```
- Use native `<select>` on phone (best picker on iOS/Android).
- The A/B note ("A 组学校星期日到四上课…") appears under the choice, `text-sm`.
- Save button sticky; after saving go back to the calendar.
Check against the real file before building.

## 6. What changes from laptop (summary table)

| Area | Laptop/iPad now | Phone |
|---|---|---|
| Navigation | Shell links | Bottom tab bar, 3 tabs |
| Calendar | 12 months, 2 col, legend open | Stat card, week strip, one month at a time, legend folded |
| Day 1 | table plus 2 columns | 3-step flow, word cards, sticky flash buttons |
| Day 2 | chips on top | chips sticky bottom, bigger line height |
| Days 3-5 | 2 columns, sticky box right | accordions, big box, sticky 交上去, question sheet |
| Result | stacked cards | tabs: 我的答案 / 反馈 / 参考答案 |
| Keyboard | n/a | hide tab bar, keep hand-in bar, 16 px text |
| Language switches | 2 rows | 1 compact row |

## 7. Components that need a phone variant

| Component | Work | Size |
|---|---|---|
| Shell.tsx | add `PhoneTabBar` (read file first) | small |
| CalendarView | stat card two lines, week strip, month pager, legend in details | medium |
| TodayView | compact header, merge language switches, folded comments | small |
| DayCard | step flow for day 1, accordions and sticky bar for day 3 to 5, result tabs | large |
| FlashQuiz | sticky buttons, taller card, "next step" at the end | small |
| HighlightEssay | sticky chips, bigger hit area | small |
| BlockView | vocab to cards on phone (`md:hidden` cards plus `hidden md:block` table), all tables to cards, image tap to zoom | medium |
| New: `StickyBar`, `Accordion`(details), `ResultTabs`, `StepDots` | tiny presentational parts | small |

All of this is doable with existing Tailwind utilities (`md:hidden`, `hidden md:block`, `sticky bottom-0`, `min-h-11`) and the existing `.card`, `.btn-primary`, `.btn-secondary` classes. No new library is needed. Use `md:` as the switch so iPad (768 and up) keeps the finished layout.

## 8. Open questions for Gary (do not guess)
1. Should Sunday allow "skip today"? Does skipping count for anything?
2. Auto-save drafts: allowed to store the student's draft in the browser (localStorage)? It stays on the device.
3. Confirm dialog before hand-in: wanted?
4. A mascot: wanted at all? (Cerdek uses one; not required.)
5. Settings file: please let me read SettingsView.tsx and Shell.tsx before building.

Sources used for Job 1 are listed in LAPTOP-IPAD-SUGGESTIONS.md.
