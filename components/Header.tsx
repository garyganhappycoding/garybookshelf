import Link from "next/link";
import HeaderAccount from "@/components/HeaderAccount";

// Plain server component with no cookies, so pages can be cached. Login state lives in HeaderAccount.
export default function Header() {
  return (
    <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sm:sticky sm:top-0 z-30">
      {/* Phone: row 1 = logo + account buttons, row 2 = the page links (scroll sideways if needed). Wide screens: one row. */}
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-2 sm:py-0 sm:h-16 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dolphin-icon.png" alt="" className="w-8 h-8 rounded-full" />
          <span className="font-hand text-xl sm:text-2xl text-clay-700 whitespace-nowrap">gary's bookshelf</span>
        </Link>

        <nav aria-label="Account" className="order-2 sm:order-3 flex items-center gap-3 text-sm">
          <HeaderAccount />
        </nav>

        <nav
          aria-label="Main"
          className="order-3 sm:order-2 basis-full sm:basis-auto sm:ml-auto sm:mr-6 flex items-center gap-4 sm:gap-6 text-[13px] sm:text-sm overflow-x-auto whitespace-nowrap pb-1 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link href="/#resources" className="hover:text-clay-600">
            Free resources
          </Link>
          <Link href="/speaking" className="hover:text-clay-600">
            Speaking
          </Link>
          <Link href="/ask-gary" className="hover:text-clay-600">
            Ask Gary
          </Link>
          <Link href="/shop" className="hover:text-clay-600">
            Shop
          </Link>
        </nav>
      </div>
    </header>
  );
}
