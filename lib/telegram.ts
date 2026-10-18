// SERVER-ONLY. Sends a private alert to Gary's Telegram chat. Does nothing until
// TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set in the environment, and never
// throws, so a Telegram outage can't break checkout.
export async function notifyAdminTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("telegram alert failed", res.status);
  } catch (e) {
    console.error("telegram alert failed", e);
  }
}
