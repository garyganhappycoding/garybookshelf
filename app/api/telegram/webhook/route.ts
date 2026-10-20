import { NextResponse } from "next/server";
import { approveOrderCore, rejectOrderCore } from "@/lib/orders";
import { adminChatId, answerCallback, deleteTelegramMessage, sendTelegramText } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REJECT_REASON = "We couldn't verify your payment receipt. Please check the amount and resubmit a clear screenshot.";

// Telegram calls this when Gary taps Approve / Reject on a receipt.
// Two checks must pass: Telegram's secret header (so nobody else can POST here) and the tap must
// come from Gary's own Telegram account.
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const adminId = adminChatId();
  if (!secret || !adminId || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const cb = update?.callback_query;
  if (!cb) return NextResponse.json({ ok: true }); // other messages are ignored

  if (String(cb.from?.id) !== String(adminId)) {
    await answerCallback(cb.id, "Not allowed.");
    return NextResponse.json({ ok: true });
  }

  const [action, orderId] = String(cb.data ?? "").split(":");
  if ((action !== "a" && action !== "r") || !UUID.test(orderId ?? "")) {
    await answerCallback(cb.id, "Unknown action.");
    return NextResponse.json({ ok: true });
  }

  const result =
    action === "a"
      ? await approveOrderCore(orderId, { onlyIfPending: true })
      : await rejectOrderCore(orderId, REJECT_REASON, { onlyIfPending: true });

  const who = result.summary ? `${result.summary.title} · RM ${result.summary.amount.toFixed(2)} · ${result.summary.email ?? "student"}` : "";
  if (result.error && !result.summary) {
    await answerCallback(cb.id, result.error);
    return NextResponse.json({ ok: true });
  }

  await answerCallback(cb.id, result.error ? "Done, but check the site." : action === "a" ? "Approved" : "Rejected");
  // the receipt photo is removed from Telegram once decided; only a short text line stays
  if (cb.message?.chat?.id && cb.message?.message_id) await deleteTelegramMessage(cb.message.chat.id, cb.message.message_id);
  await sendTelegramText(`${action === "a" ? "✅ Approved" : "❌ Rejected"}: ${who}${result.error ? `\n⚠️ ${result.error}` : ""}${result.emailError ? `\n⚠️ The approval email was NOT delivered (${result.emailError}). Tell the student yourself.` : ""}`);

  return NextResponse.json({ ok: true });
}
