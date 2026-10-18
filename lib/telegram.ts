// SERVER-ONLY. Gary's private Telegram bot: sends new receipts for review with Approve / Reject
// buttons, and the webhook (app/api/telegram/webhook) acts on the taps.
// Everything here does nothing until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set, and never
// throws, so a Telegram outage can't break checkout.

const token = () => process.env.TELEGRAM_BOT_TOKEN;
export const adminChatId = () => process.env.TELEGRAM_CHAT_ID;

async function call(method: string, body: BodyInit, json = true) {
  const t = token();
  if (!t) return null;
  try {
    const res = await fetch(`https://api.telegram.org/bot${t}/${method}`, {
      method: "POST",
      headers: json ? { "Content-Type": "application/json" } : undefined,
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("telegram call failed", method, res.status);
    return res.ok ? await res.json() : null;
  } catch (e) {
    console.error("telegram call failed", method, e);
    return null;
  }
}

export async function sendTelegramText(text: string) {
  const chat = adminChatId();
  if (!chat) return;
  await call("sendMessage", JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }));
}

// The receipt photo with Approve / Reject buttons. Falls back to a text alert if the photo can't be sent.
export async function sendReceiptForReview(photo: Blob, filename: string, caption: string, orderId: string) {
  const chat = adminChatId();
  if (!chat || !token()) return;

  const form = new FormData();
  form.append("chat_id", chat);
  form.append("caption", caption);
  form.append("photo", photo, filename);
  form.append(
    "reply_markup",
    JSON.stringify({
      inline_keyboard: [[
        { text: "✅ Approve", callback_data: `a:${orderId}` },
        { text: "❌ Reject", callback_data: `r:${orderId}` },
      ]],
    })
  );
  const sent = await call("sendPhoto", form, false);
  if (!sent) await sendTelegramText(`${caption}\n(The receipt photo could not be sent. Review it on the website.)`);
}

export async function answerCallback(callbackId: string, text: string) {
  await call("answerCallbackQuery", JSON.stringify({ callback_query_id: callbackId, text }));
}

export async function deleteTelegramMessage(chatId: number | string, messageId: number) {
  await call("deleteMessage", JSON.stringify({ chat_id: chatId, message_id: messageId }));
}
