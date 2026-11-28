# Vercel usage rules (read before building anything)

Why this file exists: in the 30 days to 24 Nov 2026 the site hit the Vercel Hobby limits (Fluid Active CPU 4h50m of 4h, CDN requests 1.2M of 1M, ISR writes 135K of 200K) and was paused. Most of the load was real student traffic from the launch week, but several design habits multiplied it. Gary's rule: **avoid designs that cost Vercel usage, as long as the student experience stays the same.**

## What is counted
- **CDN / edge requests:** every request that reaches Vercel (page, script, image, font, API call, link prefetch). A normal page view is already 15 to 30 requests.
- **Fluid Active CPU:** time functions spend working (not waiting). Heavy work: building locked PDFs (`lib/personal-pdf.ts`), image or audio processing.
- **ISR writes:** each time a cached page is rebuilt. Short `revalidate` times and every new deployment cause these.
- Deployments are separate, but each push clears cached pages and makes returning visitors download changed scripts again.

## Rules
1. **Links:** import `Link` from `@/components/Link`, never from `next/link`. It turns off background prefetching (each prefetched link is a counted request; the header alone added 4 to every page view). Use `prefetch={true}` only for one truly important link (the Shop card on the home page).
2. **Public pages must stay cacheable:** do not read cookies, headers or the logged-in user in a public page or in the layout/header. Login state is read in the browser (`HeaderAccount`). Pages that need the user (dashboard, speaking, writing, admin) are dynamic on purpose.
3. **`revalidate` times:** default 3600 (1 hour) or longer for public pages. Never use 60 or 300 on a page that many people open. When an admin action changes the data, call `revalidatePath` for every page that shows it (use `"layout"` for a folder of pages, e.g. `/free-resources`), so a long cache never makes edits look slow.
4. **Pictures:** use `next/image` for product pictures (30-day cache is set in `next.config.js`). Files in `/public` are cached for a week by the headers in `next.config.js`, so give a replaced picture a new file name.
5. **No polling.** Never `setInterval` + `fetch` to the site's own API. Ask once, or use a form/server action. Do not call the site's API from the header or footer.
6. **Middleware (`middleware.ts`) runs a function per request,** so keep its `matcher` limited to the pages that really need the login cookie. Never widen it to `/` or `/(.*)`.
7. **Heavy work:** do not add CPU-heavy steps to routes that every visitor hits. Locked PDFs are built once per file per buyer on purpose; do not rebuild on every view, and do not add new per-request image or PDF processing.
8. **Bundle downloads:** the Supabase free plan allows 5 GB of downloads a month (shared with the whole site). Large new files should go to Cloudflare R2 instead of Supabase storage.
9. **Analytics and third-party scripts:** each adds a request per page view. Add them only with a reason (Vercel Web Analytics is installed for the weekly visitor count).
10. **Pushes:** many pushes mean many deployments. Batch changes into one or two pushes a day during busy weeks (launches, exam season).

## What was fixed on 28 Nov 2026
- All `Link`s switched to the no-prefetch wrapper (`components/Link.tsx`): removes the header's 4 prefetches on every page, the shop's one per product card, and the home, start and hi card prefetches.
- Public images get a 7-day cache header (the logo was re-requested on every page view).
- `revalidate` raised: shop, product pages, start, free-resources, content-hub 300 to 3600; /hi and /100 60 to 1800; which-to-buy 600 to 3600. Admin edits already refresh these pages immediately (added the buying guide and category pages to the product and resource edits).

## Known remaining costs (not changed on purpose)
- Speaking and essay pages are dynamic (they read the logged-in user).
- Locked PDF building is CPU-heavy but only once per file per buyer.
- Vercel Web Analytics adds one small request per page view.
