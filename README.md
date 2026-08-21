# gary's bookshelf — setup guide

Follow these steps in order. Every step is small — don't skip ahead.

## 1. Install Node.js
Download and install Node.js 20 LTS from https://nodejs.org if you don't have it.
Check it worked: open a terminal and run `node -v` (should print v20.x.x or higher).

## 2. Unzip this project
Unzip the folder anywhere on your computer, e.g. `Desktop/garybookshelf`.
Open a terminal, `cd` into that folder.

## 3. Install dependencies
```
npm install
```

## 4. Create your Supabase project
1. Go to https://supabase.com and sign up (free).
2. Click "New project". Name it `garybookshelf`, set a database password (save it somewhere), pick the closest region (Singapore).
3. Wait ~2 minutes for it to finish setting up.

## 5. Run the database schema
1. In your Supabase project, go to the **SQL Editor** (left sidebar).
2. Click "New query".
3. Open `supabase/schema.sql` from this project, copy everything, paste it in, click **Run**.
4. You should see "Success. No rows returned."

## 6. Get your API keys
1. In Supabase, go to **Project Settings -> API**.
2. Copy the **Project URL** and the **anon public** key.
3. Also copy the **service_role** key (click "reveal" — keep this secret, never share it).

## 7. Set up your environment file
1. In the project folder, copy `.env.local.example` and rename the copy to `.env.local`.
2. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — the Project URL from step 6
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` — the service_role key
   - Leave `RESEND_API_KEY` for now (step 10)

## 8. Run the site locally
```
npm run dev
```
Open http://localhost:3000 — you should see the homepage.

## 9. Make yourself an admin
1. On the site, click **Log in -> Sign up** and create your own account with your real email.
2. Back in Supabase, go to **Table Editor -> profiles**.
3. Find your row (matched by email), click into the `role` cell, change it from `customer` to `admin`, save.
4. Refresh the site — you'll now see an **Admin** link in the header.

## 10. Set up Resend (for order approval emails)
1. Go to https://resend.com and sign up (free tier: 3,000 emails/month, 100/day).
2. Add and verify a sending domain (Resend walks you through adding DNS records — if you don't have a domain yet, you can skip this for now and test with Resend's sandbox sender).
3. Go to **API Keys**, create one, copy it into `.env.local` as `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to something like `"Gary's Bookshelf <orders@yourdomain.com>"`.
5. Restart `npm run dev` after editing `.env.local`.

## 11. Add your Touch 'n Go QR code
1. Save a screenshot/export of your Touch 'n Go static QR code as `tng-qr.png`.
2. Put it in the `public/` folder of this project (replacing the placeholder).

## 12. Add your first product
1. Go to `/admin/products` while logged in as admin.
2. Fill in the form — title, price, description, an optional cover image, and the actual file you want to deliver (PDF/ZIP of your notes).
3. Click "Add product". It'll show up on `/shop` immediately.

## 13. Test the full flow
1. Log out, sign up as a second (test) account.
2. Go to `/shop`, click your product, "purchase" it by uploading any image as a fake receipt.
3. Log back in as admin, go to `/admin/orders`, view the receipt, click **Approve**.
4. Log back in as the test account, go to `/dashboard` — you should see a **Download** button, and (if Resend is set up) an email.

## 14. Deploy it live
The easiest option is Vercel (free for personal projects):
1. Push this project to a GitHub repo.
2. Go to https://vercel.com, sign up with GitHub, click "New Project", import the repo.
3. In the Vercel project's **Environment Variables** settings, add the same variables from your `.env.local`, but set `NEXT_PUBLIC_SITE_URL` to your real deployed URL.
4. Click Deploy. Once it's live, point your custom domain to it under Vercel's **Domains** tab.

---

## What's still placeholder / needs your touch
- The "Content hub" and "Free resources" sections on the homepage are static example cards — swap them for your real posts/downloads whenever you're ready (I can wire these to a database table too, just ask).
- The cover image for products defaults to blank if you don't upload one.
- Email styling in `actions/admin.ts` is plain HTML — I can make it match the site's look if you want.

## If something breaks
- **"Not authorized" on /admin`** → your `profiles.role` isn't set to `admin` yet (step 9).
- **File upload fails** → check the Supabase Storage buckets exist (Table Editor -> Storage — `product-images`, `digital-assets`, `receipts` should all be there from the schema script).
- **Emails don't send** → check `RESEND_API_KEY` is set and your sending domain is verified in Resend; the order still gets approved either way, the email is best-effort.
