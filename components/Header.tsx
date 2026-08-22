import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/actions/auth";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/dolphin-icon.png" alt="" className="w-8 h-8 rounded-full" />
          <span className="font-hand text-2xl text-clay-700">gary's bookshelf</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#resources" className="hover:text-clay-600">
            Free resources
          </Link>
          <Link href="/shop" className="hover:text-clay-600">
            Shop
          </Link>
          <Link href="/#built-by-me" className="hover:text-clay-600">
            Built by me
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="hover:text-clay-600">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn-secondary !py-1.5">
                My orders
              </Link>
              <form action={logout}>
                <button type="submit" className="text-ink/60 hover:text-clay-600 text-sm">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="btn-primary !py-1.5">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
