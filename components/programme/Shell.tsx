import Link from "next/link";

const TABS = [
  { href: "/programme", label: "日历", id: "calendar" },
  { href: "/programme/today", label: "今天", id: "today" },
  { href: "/programme/settings", label: "设置", id: "settings" },
] as const;

export default function Shell({ active, admin = false, children }: { active?: "calendar" | "today" | "settings" | "join"; admin?: boolean; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-8 pb-28">
      {admin && (
        <div className="mb-5 rounded-xl border border-clay-400 bg-clay-400/10 px-4 py-2 text-sm text-clay-700">
          管理员预览 · 示范日期 · 学生要等你打开开关才看得到
        </div>
      )}
      {children}
      {active !== "join" && (
        <nav aria-label="陪你读书" className="fixed bottom-0 inset-x-0 bg-paper/95 backdrop-blur border-t border-ink/10">
          <div className="max-w-3xl mx-auto flex">
            {TABS.map((t) => (
              <Link key={t.id} href={t.href}
                className={`flex-1 text-center py-3 text-sm ${active === t.id ? "font-semibold text-clay-600 border-t-2 border-clay-600 -mt-px" : "text-ink/60"}`}>
                {t.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
