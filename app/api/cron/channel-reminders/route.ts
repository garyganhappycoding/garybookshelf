import { NextResponse } from "next/server";
import { sendTelegramText } from "@/lib/telegram";
import { channelReminders } from "@/lib/channel-reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Runs every morning at 8:30 Malaysia time (see vercel.json) and tells Gary, on his private Telegram bot,
// which channel post he should write today. No student data is involved.
// Testing: call it with the cron secret and ?date=2026-11-24 to see what would be sent for that day.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = new URL(req.url).searchParams.get("date");
  const messages = channelReminders(date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined);
  for (const m of messages) await sendTelegramText(m);
  return NextResponse.json({ ok: true, sent: messages.length });
}
