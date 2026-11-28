"use client";

import { useState } from "react";
import Link from "@/components/Link";
import { logout } from "@/actions/auth";

const TABS = [
  { href: "/programme", label: "日历", id: "calendar" },
  { href: "/programme/today", label: "今天", id: "today" },
  { href: "/programme/badges", label: "徽章", id: "badges" },
  { href: "/programme/settings", label: "设置", id: "settings" },
] as const;

function Icon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      {id === "today" && <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>}
      {id === "calendar" && <><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>}
      {id === "badges" && <><path d="M6 4h9a3 3 0 0 1 3 3v13H9a3 3 0 0 1-3-3V4z" /><path d="M9 4v13a3 3 0 0 0 3 3" /></>}
      {id === "settings" && <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>}
    </svg>
  );
}

// The left sidebar of the programme (replaces the site's top banner and the old bottom bar). On a laptop or iPad it is always there;
// on a phone it is a drawer behind one round button, so the page keeps its full height.
export default function ProgrammeNav({ active, admin, bare }: { active?: string; admin: boolean; bare: boolean }) {
  const [open, setOpen] = useState(false);
  const item = "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm";
  const panel = (
    <div className="flex h-full flex-col gap-1 p-4">
      <Link href="/programme" onClick={() => setOpen(false)} className="mb-4 flex items-center gap-2 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/dolphin-icon.png" alt="" className="h-8 w-8 rounded-full" />
        <span className="font-hand text-xl leading-none text-clay-700">陪你读书 2027</span>
      </Link>
      {!bare && TABS.map((t) => (
        <Link key={t.id} href={t.href} onClick={() => setOpen(false)} aria-current={active === t.id ? "page" : undefined}
          className={`${item} ${active === t.id ? "bg-clay-400/20 font-semibold text-clay-700" : "text-ink/70 hover:bg-ink/5"}`}>
          <Icon id={t.id} />{t.label}
        </Link>
      ))}
      <div className="mt-auto flex flex-col gap-1 border-t border-ink/10 pt-3">
        {admin && <Link href="/admin" className={`${item} text-ink/60 hover:bg-ink/5`}>后台 Admin</Link>}
        <Link href="/" className={`${item} text-ink/60 hover:bg-ink/5`}>← 回到网站</Link>
        <form action={logout}><button type="submit" className={`${item} w-full text-left text-ink/50 hover:bg-ink/5`}>退出登录</button></form>
      </div>
    </div>
  );
  return (
    <>
      <aside aria-label="陪你读书" className="hidden border-r border-ink/10 bg-white/70 md:sticky md:top-0 md:block md:h-screen md:w-56 md:shrink-0">{panel}</aside>
      <button type="button" aria-label="打开菜单" onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-white/95 shadow-md backdrop-blur md:hidden">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label="菜单">
          <div className="w-64 max-w-[80%] bg-paper shadow-2xl">{panel}</div>
          <button type="button" aria-label="关闭菜单" onClick={() => setOpen(false)} className="flex-1 bg-black/30" />
        </div>
      )}
    </>
  );
}
