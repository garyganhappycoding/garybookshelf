# garybookshelf — SWOT (work in progress)

> Started 20 Oct 2026. Strengths answered by Gary; the other three sections are waiting for his answers.
> **Time frame:** next month first (Nov 2026), then review. **Judge against:** RM5,000 profit a month, and **100 students giving feedback by end of 2026**.
> Numbers Gary will share later: Instagram insights, notes sales, exact audience split. Customer voice will come through the website feedback page.

## Strengths (Gary's own answers)
- **What followers like most:** the content and the **study techniques** Gary delivers, and how he delivers them.
- **Top-saved content:** "how to study [subject X] to get good grades" and "how to improve your grades".
- **Strongest asset: his teaching method, not the notes.** He knows how to teach and how to study, and converts that into notes. The notes are the product of the method.
- **Cheaper and different:** notes are cheaper than other study accounts, and most study accounts do not teach *how to study* at all. Gary does.
- **Runs without his time:** AI speaking and the notes shop. He only taps on them now.
- **Skills beyond studying:** video editing, building websites (web code), digital marketing for businesses. Not design.
- From the brand files: 52.4k Instagram followers, 1k YouTube subscribers, 4.00 flat in matriculation, about 97–99% margin on speaking packs, 449 students have tried speaking.

## Weaknesses (Gary's answers, 20 Oct 2026)
- **Time is split across brands.** Gary gives a whole day (usually Tuesday, mostly mornings) to garybookshelf, and balances it with his studies, other work and digital marketing for other brands.
- **Manual video work.** Publishing videos and editing videos are the two things that should be automated. He currently spends no money on tools, so he publishes by hand. (He mentioned a publishing tool called "Haiku"; likely Metricool. TODO: confirm.)
- **Very low conversion on speaking.** Most free speaking users will not pay: they do not want to spend money on studying and feel free is enough, so they get the value for free. Gary's open question: how to make students who don't want to pay actually pay.
- **Audience mismatch (Instagram insights, 19 Oct 2026):** only 16.6% of followers are aged 13–17 (about 8.7k). 25.4% are 18–24 and 29.7% are 25–34. 88.9% are in Malaysia. Gary believed most were Form 4–5, so the target audience is a smaller share of the following than assumed. Reach is huge (301K viewers, 1.4M reel views a month) but few visitors turn into buyers. Telegram has about 6k members.
- **Revenue is about RM1,000 a month now, and this is peak season.** Expect lower in off-season. Goal is RM5,000.
- **No repeat buyers.** Notes are bought once and updated for free afterwards, so there is no recurring income from notes.
- **Content gaps:** Chinese (the subject) is not covered: Gary is weak at it and does not want to focus on it. He focuses on BI, BM and science-type subjects: Biology, Physics, Chemistry, Sejarah, Science, Computer (TODO: confirm exact subject list).
- **Channels:** has a Telegram group; no email list and no WhatsApp group, so the audience depends on Instagram.
- Dislikes nothing about the business at present.
- From files: only about 1% of speaking users pay (5 of 449); few testimonials; no proof of grade gains yet.

## Opportunities (Gary's answers, 20 Oct 2026)
- **Top student requests (from DMs):** Sejarah, how to study, how to memorize, speaking, English, Science / Computer Science (mainly Java), Biology. These are the next notes and content to make.
- **Seasonal spikes:** views and activity rise a lot in exam and trial-exam months. Gary's question: what to do in off-peak months to keep value and revenue up (see Priority actions).
- **Telegram study groups** are an existing ecosystem Gary can use.
- **Time-critical:** the SPM English speaking test is 2–5 Nov and written papers run 23 Nov – 17 Dec, so the window to sell speaking to this cohort is only about two weeks. After 17 Dec the cohort leaves.
- **Exam countdown** on the website (built, see `lib/exam-dates.ts`) (Gary likes it) and an exam-date offer.
- **Checkout add-on:** notes + speaking attempts (to test). A bundle of notes plus subscription is not wanted now, but Gary will consider a bundle later.
- **Ask Gary** (AI chat on the website) is the differentiator in progress: Gary's own learning method built into the AI, teaching students how to learn.
- Ruled out for now (decided by Gary): partnerships with schools, tuition centres or teachers; school licenses (prices are too low to make sense); YouTube long-form (students don't watch it; channel is not active); other exam levels (focus stays Form 4–5); selling outside Malaysia (SPM is Malaysia-only). Creator collaborations were already tried and are part of the past journey; not a focus now.

## Threats (Gary's answers, 20 Oct 2026)
- **Closest competitors:** Cerdek (an all-subject AI) and Cikgu Minah (subject-focused). Gary's edge: his own learning method and style built into the AI, so it teaches students *how to learn*, not only the subject.
- **Free AI tools (ChatGPT style):** Gary believes they can't replace his notes or speaking practice because both are built on his own essay database and rubric.
- **Instagram:** Gary earns no money from Instagram itself, but students find the products through it. He hasn't seen income depend on it yet.
- **Copying and resale:** Gary has seen people copy, resell and leak his notes. Plan: add watermarks.
- **Platform dependence:** relies on Groq (AI), Supabase and Vercel. If limits or prices change, the business is in trouble. This is the main reason he is focusing on conversion now.
- **Rule changes:** none known that affect him (SPM format).
- **Biggest worry:** keeping conversion up in off-peak months, helping students get more value, and **not getting feedback from users**.
- **Constraint:** the cost of AI.
- **Sacrifices:** none chosen. Gary doesn't know what to drop first; YouTube is already inactive.

## Priority actions (draft, 20 Oct 2026; Gary to confirm)
1. **Get to 100 feedback users by end of 2026.** Add a one-tap rating after each speaking result and reward feedback with extra attempts. Post a feedback request in the Telegram group.
2. **Raise conversion before the peak ends:** free users see a partial report; the rest is paid (see decision log in BRAND.md). Add the exam countdown with an offer end date.
3. **Plan for off-peak:** target next year's Form 5 students (current Form 4) early; sell the new notes students ask for (Sejarah, Science, Computer / Java, Biology); promote Ask Gary as a study-habit coach students use all year.
4. **Own the audience:** grow the Telegram group and start an email list or WhatsApp channel, so sales don't depend only on Instagram reach.
5. **Protect the notes:** watermark each file with the buyer's name or email, so leaks can be traced.
6. **Reduce platform risk:** keep a second AI provider ready (Cerebras fallback already exists), watch the free-plan limits using the profit planner, and know the trigger for when to move to paid plans.
7. **Save time:** batch scripts and film in one session, and schedule posts.
