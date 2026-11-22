# garybookshelf — instructions for Claude

garybookshelf is a **brand to grow**, not just a codebase. Gary treats the site, content, products and social presence as one brand.

## Before every task in this repo
1. Read `brand/BRAND.md` (identity, audience, voice, goals, strategy).
2. Read `brand/KNOWLEDGE.md` (ideas and lessons Gary has collected from others).
3. If it exists, read `brand/SWOT.md` too (strengths, weaknesses, opportunities, threats and priority actions).
4. Let them shape your work: code, copy, UI, emails, captions, product ideas. If a task conflicts with them, say so.

## Keeping the memory up to date
- When Gary shares a new idea, lesson or decision, add it to `brand/KNOWLEDGE.md` (newest first, with date and source) or update `brand/BRAND.md` if it changes the brand itself.
- Don't delete entries without asking. Mark outdated ones `[superseded]` instead.
- If `BRAND.md` still has `TODO` fields that are relevant to the task, ask Gary instead of guessing.

## Tech stack (quick reference)
Next.js (app router) + Supabase + Resend, deployed on Vercel. Setup details are in `README.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
