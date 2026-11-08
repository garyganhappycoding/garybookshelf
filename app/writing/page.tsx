import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WritingMarker from "@/components/WritingMarker";
import WritingComingSoon from "@/components/WritingComingSoon";
import { ADMIN_PER_DAY, FREE_PER_DAY, WRITING_OPEN, writingAccess } from "@/lib/writing/config";

export const metadata = { title: "Essay marking · Gary's Bookshelf" };
export const dynamic = "force-dynamic";

export default async function WritingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // closed for students until WRITING_OPEN=true (admins can always test)
  const access = user ? await writingAccess(supabase, user.id) : { isAdmin: false, allowed: WRITING_OPEN };
  if (!access.allowed) return <WritingComingSoon />;

  let attemptsLeft = FREE_PER_DAY;
  let packLeft = 0;
  let packHref = "/shop";
  if (user) {
    // the biggest plain pack's page, so students land on what they need instead of the whole shop
    const { data: packProduct } = await supabase
      .from("products")
      .select("id")
      .not("speaking_pack_attempts", "is", null)
      .is("external_link", null)
      .is("file_path", null)
      .eq("is_published", true)
      .order("speaking_pack_attempts", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (packProduct) packHref = `/shop/${packProduct.id}`;
    const [{ data: left }, { data: pack }] = await Promise.all([supabase.rpc("writing_attempts_left", { p_limit: access.isAdmin ? ADMIN_PER_DAY : FREE_PER_DAY }), supabase.rpc("speaking_pack_status")]);
    if (typeof left === "number") attemptsLeft = left;
    const p = Array.isArray(pack) ? pack[0] : pack;
    if (p?.pack_left) packLeft = p.pack_left;
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-hand text-4xl text-clay-700 mb-1">Essay marking</h1>
        {user && (
          <Link prefetch={false} href="/writing/history" className="btn-secondary !py-1.5 shrink-0">
            My essays
          </Link>
        )}
      </div>
      <p className="text-ink/70 mb-8">
        Type or paste your English Paper 2 essay and get an estimated mark out of 20, with the reason for every mark, marked on the same four criteria the SPM examiners use.
      </p>

      {user ? (
        <WritingMarker initialAttemptsLeft={attemptsLeft} initialPackLeft={packLeft} packHref={packHref} isAdmin={access.isAdmin} />
      ) : (
        <div className="card text-center max-w-md mx-auto">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-medium mb-1">Members only</p>
          <p className="text-sm text-ink/70 mb-4">Log in or create a free account to get an essay marked (1 free essay every day).</p>
          <div className="flex justify-center gap-3">
            <Link prefetch={false} href="/login" className="btn-primary">
              Log in
            </Link>
            <Link prefetch={false} href="/signup" className="btn-secondary">
              Sign up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
