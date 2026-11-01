"use client";

import { useState, useTransition } from "react";
import { requestRedownload } from "@/actions/download";

// Step 8 of "how to buy": if a file failed to download or must be downloaded again, the student asks here and Gary resets it.
export default function RedownloadRequest({ orderId, alreadyRequested }: { orderId: string; alreadyRequested: boolean }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(alreadyRequested ? { ok: true, text: "Requested. Gary will review it and reset your downloads. Please check back here later." } : null);

  if (msg?.ok)
    return (
      <p className="text-sm text-sage-600 bg-sage-400/10 rounded-lg px-3 py-2 mt-2">
        ✅ {msg.text} <span className="block text-xs text-ink/50">已提交，Gary 会审核并重置，请稍后回来查看。</span>
      </p>
    );

  return (
    <div className="mt-2">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="text-sm text-clay-700 underline">
          A file failed or need to download again? Request re-download · 下载失败／需要重新下载？
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm">Tell Gary what happened (optional) · 简单说明情况（可选）</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="e.g. File 3 did not download on my phone · 例如：第3个文件在手机下载失败"
            className="w-full border border-ink/15 rounded-xl px-3 py-2 bg-white text-sm"
          />
          <div className="flex items-center gap-3">
            <button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await requestRedownload(orderId, note);
                  setMsg({ ok: r.ok, text: r.message });
                })
              }
              className="btn-primary !py-1.5 text-sm disabled:opacity-60"
            >
              {pending ? "Sending..." : "Send request"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink/50">
              Cancel
            </button>
          </div>
          {msg && !msg.ok && <p className="text-sm text-red-600">{msg.text}</p>}
        </div>
      )}
    </div>
  );
}
