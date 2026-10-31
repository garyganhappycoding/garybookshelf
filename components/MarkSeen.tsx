"use client";

import { useEffect } from "react";
import { markSeen } from "@/lib/my-threads";

// Opening the tracking page counts as reading Gary's reply (clears the red "New reply" tag) and saves it on this device.
export default function MarkSeen({ token, lastAt }: { token: string; lastAt: string }) {
  useEffect(() => {
    markSeen(token, lastAt);
  }, [token, lastAt]);
  return null;
}
