import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WritingMarker from "@/components/WritingMarker";
import WritingComingSoon from "@/components/WritingComingSoon";
import { FREE_TOTAL, noAccess, writingAccess } from "@/lib/writing/config";

export const metadata = { title: "Essay marking · Gary's Bookshelf" };
export const dynamic = "force-dynamic";

export default async function WritingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // closed for students until WRITING_OPEN=true (admins can always test)
  const access = user ? await writingAccess(supabase, user) : noAccess;
  if (!access.allowed) return <WritingComingSoon />;

  let attemptsLeft = FREE_TOTAL;
  let packLeft = 0;
  let packHref = "/shop";
  if (user) {
    // the biggest plain ESSAY pack's page, so students land on what they need instead of the whole shop
    const { data: packProduct } = await supabase
      .from("products")
      .select("id")
      .not("writing_pack_attempts", "is", null)
      .is("external_link", null)
      .is("file_path", null)
      .is("speaking_pack_attempts", null)
      .eq("is_published", true)
      .order("writing_pack_attempts", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (packProduct) packHref = `/shop/${packProduct.id}`;
    const [{ data: left }, { data: pack }] = await Promise.all([supabase.rpc("writing_attempts_left", { p_limit: access.freeTotal }), supabase.rpc("writing_pack_status")]);
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
        <WritingMarker initialAttemptsLeft={attemptsLeft} initialPackLeft={packLeft} packHref={packHref} isAdmin={access.canTest} />
      ) : (
        <div className="card text-center max-w-md mx-auto">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-medium mb-1">Log in to mark your essay</p>
          <p className="text-sm text-ink/70 mb-3">Only members can use essay marking. A free account gets you <b>10 free essays</b>.</p>
          <ul className="text-sm text-ink/70 text-left space-y-1 mb-4 mx-auto max-w-xs">
            <li>✓ An estimated mark out of 20 on the four SPM criteria</li>
            <li>✓ The reason for every mark</li>
            <li>✓ A check that you answered every point of the question</li>
            <li>🔒 With an essay pack: how to reach the next mark, and your essay with the words that earned and lost marks highlighted</li>
          </ul>
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
