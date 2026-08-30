"use client";

import { useState } from "react";
import { getDownloadUrl } from "@/actions/download";

export default function DownloadButton({
  orderId,
  initiallyOpened,
}: {
  orderId: string;
  initiallyOpened: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(initiallyOpened);

  async function handleClick() {
    // Open a blank tab immediately, synchronously, while still inside the
    // click event, so browsers don't block it as a popup. Fill in the real
    // URL once we have it from the server.
    const newWindow = window.open("", "_blank");

    setLoading(true);
    const result = await getDownloadUrl(orderId);
    setLoading(false);

    if (result.url) {
      if (newWindow) {
        newWindow.location.href = result.url;
      } else {
        window.location.href = result.url;
      }
      if (result.isLink) setOpened(true);
    } else {
      newWindow?.close();
      alert(result.error || "Something went wrong.");
    }
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
      {loading ? "Loading..." : "Download"}
    </button>
  );
}
