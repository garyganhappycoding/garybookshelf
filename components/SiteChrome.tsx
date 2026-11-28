"use client";

import { usePathname } from "next/navigation";

// The site's top banner, header and footer are hidden inside the 陪你读书 programme, which has its own left sidebar instead.
export default function SiteChrome({ top, bottom, children }: { top: React.ReactNode; bottom: React.ReactNode; children: React.ReactNode }) {
  const inProgramme = (usePathname() ?? "").startsWith("/programme");
  return (
    <>
      {!inProgramme && top}
      <main className="min-h-screen">{children}</main>
      {!inProgramme && bottom}
    </>
  );
}
