"use client";

import { useState } from "react";
import { getDownloadUrl } from "@/actions/download";

export default function DownloadButton({
  orderId,
  initiallyOpened,
  fileIndex = 0,
  label = "Download",
  oneTime = false,
  alreadyDownloaded = false,
}: {
  orderId: string;
  initiallyOpened: boolean;
  fileIndex?: number;
  label?: string;
  oneTime?: boolean;
  alreadyDownloaded?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(initiallyOpened);
  const [downloaded, setDownloaded] = useState(alreadyDownloaded);

  async function handleClick() {
    if (
      oneTime &&
      !window.confirm(
        "You can download this file only ONCE. Please do it on your own phone or laptop, where you will open it.\n\n这个文件只能下载一次，请用你自己要阅读的手机或电脑下载。\n\nDownload now?"
      )
    )
      return;

    // Open a blank tab immediately, synchronously, while still inside the
    // click event, so browsers don't block it as a popup. Fill in the real
    // URL once we have it from the server.
    const newWindow = window.open("", "_blank");

    setLoading(true);
    const result = await getDownloadUrl(orderId, fileIndex);
    setLoading(false);

    if (result.url) {
      if (newWindow) {
        newWindow.location.href = result.url;
      } else {
        window.location.href = result.url;
      }
      if (result.isLink) setOpened(true);
      if (result.oneTime) setDownloaded(true);
    } else {
      newWindow?.close();
      alert(result.error || "Something went wrong.");
    }
  }

  if (downloaded) {
    return (
      <div className="text-right">
        <button disabled className="btn-secondary !py-1.5 !px-4 text-sm opacity-60 cursor-not-allowed">
          Downloaded
        </button>
        <p className="text-xs text-ink/50 mt-1 max-w-[220px]">Each file can be downloaded once. Failed? Message Gary.</p>
      </div>
    );
  }

  if (opened) {
    return (
      <div className="text-right">
        <button disabled className="btn-primary !py-1.5 !px-4 text-sm opacity-50 cursor-not-allowed">
          Opened
        </button>
        <p className="text-xs text-clay-600 mt-1 max-w-[200px]">
          Please make sure you've joined the Telegram group! 记得加入 Telegram 群组喔!
        </p>
      </div>
    );
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-primary !py-1.5 !px-4 text-sm disabled:opacity-60">
      {loading ? "Preparing..." : label}
    </button>
  );
}
