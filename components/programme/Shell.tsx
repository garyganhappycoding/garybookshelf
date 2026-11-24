import Link from "next/link";

const TABS = [
  { href: "/programme", label: "日历", id: "calendar" },
  { href: "/programme/today", label: "今天", id: "today" },
  { href: "/programme/settings", label: "设置", id: "settings" },
] as const;

export default function Shell({ active, admin = false, wide = false, children }: { active?: "calendar" | "today" | "settings" | "join"; admin?: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`${wide ? "max-w-6xl" : "max-w-3xl"} mx-auto px-5 py-6 pb-44 md:py-8 md:pb-28`}>
      {admin && (
        <div className="mb-5 rounded-xl border border-clay-400 bg-clay-400/10 px-4 py-2 text-sm text-clay-700">
          管理员预览 · 学生要等你打开开关才看得到
        </div>
      )}
      {children}
      {active !== "join" && (
        <nav aria-label="陪你读书" className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom,0px)]">
          <div className="max-w-3xl mx-auto flex h-16">
            {TABS.map((t) => (
              <Link key={t.id} href={t.href} aria-current={active === t.id ? "page" : undefined}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] ${active === t.id ? "font-semibold text-clay-600" : "text-ink/60"}`}>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  {t.id === "today" && <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>}
                  {t.id === "calendar" && <><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></>}
                  {t.id === "settings" && <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>}
                </svg>
                {t.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
