"use client";
import { useState } from "react";
import { GROUP_PRICE } from "@/lib/programme/calendar";

export default function JoinView() {
  const [mode, setMode] = useState<"solo" | "group">("solo");
  const [size, setSize] = useState<2 | 3>(3);
  const price = mode === "solo" ? GROUP_PRICE[1] : GROUP_PRICE[size];

  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">加入陪你读书</h1>
      <p className="text-sm text-ink/60 mb-4">一年 RM200，大约每个上课日 RM1。每做完一个上课日，就赚回 RM1。</p>

      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => setMode("solo")} className={mode === "solo" ? "btn-primary text-sm" : "btn-secondary text-sm"}>我一个人</button>
        <button type="button" onClick={() => setMode("group")} className={mode === "group" ? "btn-primary text-sm" : "btn-secondary text-sm"}>和朋友一起</button>
      </div>

      {mode === "group" && (
        <div className="card mb-4">
          <p className="font-medium mb-2">我们几个人？（最多 3 个人）</p>
          <div className="flex gap-2 mb-2">
            {([2, 3] as const).map((n) => (
              <button key={n} type="button" onClick={() => setSize(n)} className={size === n ? "btn-primary text-sm" : "btn-secondary text-sm"}>
                {n} 人 · 每人 RM{GROUP_PRICE[n]}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink/60">2 人每人少 5%，3 人每人少 10%。</p>
        </div>
      )}

      <div className="card mb-4">
        <p className="text-sm text-ink/60">每人要付</p>
        <p className="text-3xl font-semibold tabular-nums">RM{price}</p>
      </div>

      {mode === "group" && (
        <div className="card mb-4 space-y-3 text-sm">
          <p className="font-medium">朋友组怎么报名</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>组长选好人数，用这个价钱付款，上传自己的收据。</li>
            <li>每个朋友各自付同样的价钱、各自上传收据，并写上<b>组长的 Gmail</b>。</li>
            <li>Gary 一张一张确认。每确认一位朋友，系统做一条专属链接，只显示在组长的页面。</li>
            <li>组长把链接发给那位朋友。一条链接只给一个人用。</li>
          </ol>
          <p className="rounded-lg bg-clay-400/15 p-3">
            <b>全部人都付款并被确认之后，大家才一起开始使用。</b>只有一部分人付款的话，先不开放，大家的钱不会白付，等其他人补上就可以。
          </p>
        </div>
      )}

      <div className="card text-sm text-ink/70">
        <p className="font-medium text-ink mb-1">付款（示范）</p>
        <p>真实网站这里会放收据上传表格：邮箱{mode === "group" ? "、组长的 Gmail" : ""}、收据图片。送出之后等 Gary 确认。</p>
        <button type="button" disabled className="btn-primary mt-3 text-sm opacity-40">送出收据（示范，还不能用）</button>
      </div>
    </div>
  );
}
