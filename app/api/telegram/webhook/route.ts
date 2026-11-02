import { NextResponse } from "next/server";
import { approveOrderCore, rejectOrderCore } from "@/lib/orders";
import { adminChatId, answerCallback, deleteTelegramMessage, editTelegramText, sendTelegramText } from "@/lib/telegram";
import { declineRequest, getRequestInfo, releaseOrderDownloads } from "@/lib/redownload";

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

  // Re-download requests: d = allow the student to download again, x = decline (the id is the request's id)
  if ((action === "d" || action === "x") && UUID.test(orderId ?? "")) {
    const info = await getRequestInfo(orderId);
    if (!info) {
      await answerCallback(cb.id, "That request no longer exists.");
      return NextResponse.json({ ok: true });
    }
    let line: string;
    if (action === "d") {
      // allowed even if the request was already closed on the website: it is safe to repeat
      const r = await releaseOrderDownloads(info.orderId);
      line = r.error ? `⚠️ Could not allow ${info.email}: ${r.error}` : `✅ Allowed: ${info.email} can download each file once more\n${info.product}`;
    } else if (info.status !== "pending") {
      line = `ℹ️ Already handled earlier (${info.status}): ${info.email}\n${info.product}`;
    } else {
      await declineRequest(info.id);
      line = `❌ Declined: ${info.email}\n${info.product}`;
    }
    await answerCallback(cb.id, line.startsWith("⚠️") ? "Failed" : action === "d" ? "Allowed" : "Done");
    if (cb.message?.chat?.id && cb.message?.message_id) await editTelegramText(cb.message.chat.id, cb.message.message_id, line);
    else await sendTelegramText(line);
    return NextResponse.json({ ok: true });
  }

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
