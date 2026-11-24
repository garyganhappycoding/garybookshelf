"use client";
import { useState } from "react";
import type { BmResult } from "@/lib/writing/mark-bm";

const LEVEL: Record<string, string> = { tinggi: "bg-sage-400/20", sederhana: "bg-yellow-100", lemah: "bg-red-100" };

export default function BmMarker() {
  const [part, setPart] = useState<"A" | "B">("B");
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [r, setR] = useState<BmResult | null>(null);
  const words = essay.split(/\s+/).filter(Boolean).length;

  async function send() {
    setBusy(true); setError(""); setR(null);
    try {
      const res = await fetch("/api/writing/mark-bm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ part, question, essay }) });
      const j = await res.json();
      if (!res.ok) setError(j.error ?? "出错了。"); else setR(j.result);
    } catch { setError("网络出错了，请再试一次。"); }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <div className="flex gap-2">
          {(["A", "B"] as const).map((p) => (
            <button key={p} type="button" onClick={() => setPart(p)} className={part === p ? "btn-primary text-sm" : "btn-secondary text-sm"}>
              Bahagian {p} {p === "A" ? "(30 markah, 150–200 patah)" : "(70 markah, 350–500 patah)"}
            </button>
          ))}
        </div>
        <label className="block text-sm">题目（把整个题目贴上来，包括材料）
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-ink/20 bg-white p-3 text-sm" />
        </label>
        <label className="block text-sm">你的作文（{words} 个字）
          <textarea value={essay} onChange={(e) => setEssay(e.target.value)} rows={14} className="mt-1 w-full rounded-lg border border-ink/20 bg-white p-3 text-sm" />
        </label>
        <button type="button" onClick={send} disabled={busy} className="btn-primary text-sm disabled:opacity-50">{busy ? "批改中…（大约半分钟）" : "批改"}</button>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>

      {r && (
        <div className="space-y-3">
          <div className="card">
            <p className="text-sm text-ink/60">估计分数</p>
            <p className="text-3xl font-semibold tabular-nums">{r.mark} / {r.max} <span className="text-base font-normal text-ink/70">· {r.band}</span></p>
            {r.wordNote && <p className="text-sm text-clay-700 mt-1">{r.wordNote}</p>}
            <p className="mt-2 text-sm">{r.summary}</p>
            <p className="mt-2 text-sm"><b>要保持：</b>{r.strength}</p>
            <p className="mt-1 text-sm"><b>最能加分的一步：</b>{r.biggest_gain}</p>
          </div>
          {r.areas.map((a) => (
            <div key={a.area} className={`rounded-xl p-4 text-sm ${LEVEL[a.level] ?? "bg-ink/5"}`}>
              <p className="font-medium">{a.area} · {a.level}</p><p className="mt-1">{a.comment}</p>
            </div>
          ))}
          {r.evidence.mistakes.length > 0 && (
            <div className="card text-sm">
              <p className="font-medium mb-2">扣分的错误</p>
              <ul className="space-y-2">{r.evidence.mistakes.map((m, i) => <li key={i}>“{m.quote}” — {m.problem} <span className="text-sage-600">→ {m.fix}</span></li>)}</ul>
            </div>
          )}
          {(r.evidence.good_phrases.length > 0 || r.evidence.peribahasa_used.length > 0) && (
            <div className="card text-sm space-y-2">
              {r.evidence.peribahasa_used.length > 0 && <p><b>用到的 peribahasa：</b>{r.evidence.peribahasa_used.map((p) => `${p.quote}（${p.fits ? "用得对" : "不太贴切"}）`).join("；")}</p>}
              {r.evidence.good_phrases.length > 0 && <p><b>好句子和好词：</b>{r.evidence.good_phrases.join("；")}</p>}
            </div>
          )}
          <div className="card text-sm"><p className="font-medium mb-1">下一步</p><ol className="list-decimal pl-5 space-y-1">{r.next_steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
        </div>
      )}
    </div>
  );
}
