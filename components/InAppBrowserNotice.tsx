"use client";

import { useEffect, useState } from "react";

// Instagram, Facebook, TikTok, WeChat and Line open links inside their own small browser, which usually cannot save files.
// Students who download there lose their one download, so we ask them to open the page in Safari or Chrome first.
export const IN_APP_BROWSER = /Instagram|FBAN|FBAV|FB_IAB|TikTok|musical_ly|MicroMessenger|Line\//i;

export default function InAppBrowserNotice() {
  const [inApp, setInApp] = useState(false);
  useEffect(() => setInApp(IN_APP_BROWSER.test(navigator.userAgent)), []);
  if (!inApp) return null;
  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-medium mb-1">Open this page in Safari or Chrome before you download</p>
      <p>
        You are inside the Instagram (or another app&apos;s) browser. It often cannot save PDF files. Tap the <b>⋯</b> or share button at the
        top or bottom, choose <b>Open in browser</b>, log in again, then tap Download.
      </p>
      <p className="mt-1">你现在在 Instagram 等 App 内置浏览器，通常无法保存 PDF。请点右上角 ⋯，选择「在浏览器中打开」(Safari / Chrome)，再登录并下载。</p>
    </div>
  );
}
