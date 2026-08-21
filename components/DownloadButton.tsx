"use client";

import { useState } from "react";
import { getDownloadUrl } from "@/actions/download";

export default function DownloadButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await getDownloadUrl(orderId);
    setLoading(false);
    if (result.url) {
      window.open(result.url, "_blank");
    } else {
      alert(result.error || "Something went wrong.");
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-primary !py-1.5 !px-4 text-sm disabled:opacity-60">
      {loading ? "Loading..." : "Download"}
    </button>
  );
}
