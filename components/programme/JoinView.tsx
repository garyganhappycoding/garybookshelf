"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { GROUP_PRICE } from "@/lib/programme/calendar";
import { createGroupAction, receiptAction, type ActionResult } from "@/app/programme/join/actions";

export type GroupView = {
  groupNo: number; size: number; price: number; status: "waiting" | "ready" | "active" | "cancelled"; isLeader: boolean; canEnter: boolean;
  members: { id: string; email: string; role: "leader" | "friend"; status: string; me: boolean}[];
};

const STATUS_ZH: Record<string, string> = {
  awaiting_receipt: "还没交收据", receipt_uploaded: "收据已交，等 Gary", confirmed: "已确认", rejected: "收据没通过，请重新上传",
};
const init: ActionResult = {};

function Receipt({ groupNo, label }: { groupNo?: number; label: string }) {
  const [state, action, pending] = useActionState(receiptAction, init);
  const [no, setNo] = useState(groupNo ? String(groupNo) : "");
  return (
    <form action={action} className="space-y-3">
      {groupNo ? <input type="hidden" name="group_no" value={groupNo} /> : (
        <label className="block text-sm">朋友组号码（向组长拿）
          <input name="group_no" inputMode="numeric" value={no} onChange={(e) => setNo(e.target.value)} required className="mt-1 w-full rounded-lg border border-ink/20 bg-white px-3 py-2" />
        </label>
      )}
      <label className="block text-sm">收据图片
        <input type="file" name="receipt" accept="image/*" required className="mt-1 block w-full text-sm" />
      </label>
      <button type="submit" disabled={pending} className="btn-primary text-sm disabled:opacity-50">{pending ? "上传中…" : label}</button>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.ok && <p className="text-sm text-sage-600">收据已送出。</p>}
    </form>
  );
}

function NewGroup() {
  const [state, action, pending] = useActionState(createGroupAction, init);
  const [size, setSize] = useState(3);
  return (
    <form action={action} className="card mb-4">
      <p className="font-medium mb-2">我是组长：我们几个人？（最多 3 个人）</p>
      <input type="hidden" name="size" value={size} />
      <div className="flex flex-wrap gap-2 mb-2">
        {[1, 2, 3].map((n) => (
          <button key={n} type="button" onClick={() => setSize(n)} className={size === n ? "btn-primary text-sm" : "btn-secondary text-sm"}>
            {n === 1 ? "我一个人" : `${n} 人`} · 每人 RM{GROUP_PRICE[n as 1 | 2 | 3]}
          </button>
        ))}
      </div>
      <p className="text-sm text-ink/60 mb-3">2 人每人少 5%，3 人每人少 10%。</p>
      <button type="submit" disabled={pending} className="btn-primary text-sm disabled:opacity-50">建立我的朋友组</button>
      {state.error && <p role="alert" className="text-sm text-red-700 mt-2">{state.error}</p>}
    </form>
  );
}

export default function JoinView({ group }: { group: GroupView | null }) {
  const mine = group?.members.find((m) => m.me);

  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">加入陪你读书</h1>
      <p className="text-sm text-ink/60 mb-2">一年 RM200，大约每个上课日 RM1。每做完一个上课日，就「赚回」RM1。</p>
      <p className="text-xs text-ink/60 mb-4">「赚回」是给你的鼓励，用来看自己坚持了多少，<b>不是退款</b>。付款之后不能退款，请想清楚再报名。</p>

      {!group ? (
        <>
          <NewGroup />
          <div className="card mb-4">
            <p className="font-medium mb-2">我是朋友：用组长给的号码交收据</p>
            <Receipt label="送出收据" />
          </div>
          <div className="card text-sm space-y-2">
            <p className="font-medium">怎么运作</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>组长选人数，拿到一个朋友组号码，发给朋友。</li>
              <li>每个人按这个价钱各自付款，各自上传自己的收据。</li>
              <li>全部人的收据都交齐，Gary 才会收到通知，一次确认全部。</li>
              <li>确认之后，我们会发一封邮件通知每个人账号已开通，直接登录就能用，不需要任何链接。</li>
            </ol>
            <p className="rounded-lg bg-clay-400/15 p-3"><b>只要有一个人没付款，大家都不能开始。</b>等最后一位付款并被确认，三个人同时开通。</p>
          </div>
        </>
      ) : (
        <>
          <div className="card mb-4">
            <p className="text-sm text-ink/60">朋友组号码</p>
            <p className="text-3xl font-semibold tabular-nums">{group.groupNo}</p>
            <p className="text-sm text-ink/70 mt-1">{group.size} 人 · 每人 RM{group.price}</p>
            <p className="mt-2 text-sm">
              {group.status === "active" ? "✅ 已开通。" : group.status === "ready" ? "全部收据已交齐，等 Gary 确认。" : "还在等大家交收据。没交齐之前，谁都还不能开始。"}
            </p>
          </div>

          {group.canEnter && (
            <Link href="/programme" className="btn-primary inline-block text-sm mb-4">进入陪你读书</Link>
          )}
          <div className="card mb-4">
            <p className="font-medium mb-2">成员（{group.members.length}/{group.size}）</p>
            <ul className="space-y-3 text-sm">
              {group.members.map((m) => (
                <li key={m.id}>
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>{m.role === "leader" ? "组长" : "朋友"} · {m.email}{m.me ? "（我）" : ""}</span>
                    <span className={m.status === "awaiting_receipt" || m.status === "rejected" ? "text-clay-700" : "text-sage-600"}>
                      {m.status === "awaiting_receipt" || m.status === "rejected" ? "⏳ " : "✅ "}{STATUS_ZH[m.status] ?? m.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {Array.from({ length: Math.max(0, group.size - group.members.length) }, (_, i) => (
              <p key={i} className="text-sm text-clay-700 mt-3">⏳ 还有一位朋友没加入 · 把号码 {group.groupNo} 发给 TA，请 TA 尽快上传收据</p>
            ))}
            {group.status !== "active" && <p className="text-xs text-ink/60 mt-3">大家都交了收据、Gary 确认之后，三个人同时开通。看到还有人没交，可以提醒 TA 快一点。</p>}
          </div>

          {group.status !== "active" && mine && (mine.status === "awaiting_receipt" || mine.status === "rejected") && (
            <div className="card"><p className="font-medium mb-2">上传我的收据（RM{group.price}）</p><Receipt groupNo={group.groupNo} label="送出收据" /></div>
          )}
        </>
      )}
    </div>
  );
}
