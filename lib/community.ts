// SERVER-ONLY helpers for the no-login pages: questions, "tell me your result" feedback and votes.
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramText } from "@/lib/telegram";

export const GOAL = 100; // The Bookshelf 100
export const GOAL_DEADLINE = "2026-12-31";
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

// trim and cap text coming from a form
export const clean = (v: unknown, max: number) => String(v ?? "").replace(/\u0000/g, "").trim().slice(0, max);
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

// A private fingerprint of the visitor's internet address, used only to stop spam and double voting.
// It is hashed with a secret, so the real address is never stored.
export async function visitorHash(extra = "") {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${process.env.CRON_SECRET ?? "bookshelf"}|${ip}|${extra}`).digest("hex").slice(0, 40);
}

// Bots fill every field and submit instantly. A hidden field (honeypot) and a "form was opened at" time catch most of them.
export function spamCheck(formData: FormData): string | null {
  if (clean(formData.get("website"), 50)) return "Something went wrong. Please try again.";
  const opened = Number(formData.get("t"));
  const age = Date.now() - opened;
  if (!opened || age < 4000) return "That was quick! Please take a moment to fill it in, then try again.";
  if (age > 6 * 3600 * 1000) return "This page has been open for a long time. Please refresh it and try again.";
  return null;
}

// at most 2 submissions in 10 minutes and 6 a day from the same visitor
export async function tooManySubmissions(hash: string) {
  const admin = createAdminClient();
  const now = Date.now();
  const count = async (ms: number) => {
    const { count } = await admin
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", hash)
      .in("kind", ["question", "feedback"])
      .gte("created_at", new Date(now - ms).toISOString());
    return count ?? 0;
  };
  const [recent, day] = await Promise.all([count(10 * 60 * 1000), count(24 * 3600 * 1000)]);
  return recent >= 2 || day >= 6;
}

const EMAIL_FRAME = (inner: string) => `
  <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; background: #FBF6EC; padding: 32px 24px; border-radius: 16px;">
    <p style="font-family: cursive; font-size: 22px; color: #8F4327; margin: 0 0 20px;">gary's bookshelf</p>
    ${inner}
    <p style="color: #8a8a8a; font-size: 12px; margin-top: 24px;">— Gary</p>
  </div>`;

// Sends one email. Two ways, tried in this order:
//  1. Gmail (free, no domain needed): set GMAIL_USER and GMAIL_APP_PASSWORD. Emails go out from that Gmail address.
//  2. Resend: set RESEND_API_KEY. Needs a verified domain to email anyone except the Resend account owner.
// It never throws: an email problem must never break a form or an approval. The result says what went wrong.
export async function sendRawEmail(to: string, subject: string, html: string, resendFrom?: string): Promise<{ ok: boolean; error?: string }> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    try {
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass.replace(/\s+/g, "") } });
      await transport.sendMail({ from: `"Gary's Bookshelf" <${gmailUser}>`, to, subject, html });
      return { ok: true };
    } catch (e) {
      console.error("gmail email failed", e);
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  if (!process.env.RESEND_API_KEY) return { ok: false, error: "No email sender is set up (add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel)" };
  try {
    // Resend reports problems (for example "you can only send to your own address") in the result, not as an exception
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: resendFrom || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject,
      html,
    });
    if (error) {
      console.error("email failed", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("email failed", e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export const sendEmail = (to: string, subject: string, inner: string, resendFrom?: string) => sendRawEmail(to, subject, EMAIL_FRAME(inner), resendFrom);

// A short heads-up on Gary's own Telegram (the admin chat used for orders). Students never use the bot, they only
// use the website forms. `path` is the admin page to open, for example /admin/inbox?tab=question.
export async function notifyGary(title: string, summary: string, path = "/admin/inbox") {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  await sendTelegramText(`${title}
${summary}

Open: ${site}${path}`);
}

export { EMAIL_FRAME };
