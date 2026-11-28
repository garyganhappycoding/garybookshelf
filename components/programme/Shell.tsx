import ProgrammeNav from "@/components/programme/ProgrammeNav";

// Every programme page sits in this frame: a sidebar on the left (a drawer on phones) and the page on the right.
export default function Shell({ active, admin = false, wide = false, children }: { active?: "calendar" | "today" | "badges" | "settings" | "join"; admin?: boolean; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <ProgrammeNav active={active} admin={admin} bare={active === "join"} />
      <div className="min-w-0 flex-1">
        <div className={`${wide ? "max-w-6xl" : "max-w-3xl"} mx-auto px-5 pb-28 pt-16 md:px-8 md:py-8`}>
          {admin && (
            <div className="mb-5 rounded-xl border border-clay-400 bg-clay-400/10 px-4 py-2 text-sm text-clay-700">
              管理员预览 · 学生要等你打开开关才看得到
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
