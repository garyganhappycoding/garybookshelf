import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Anonymous, cookie-free client for public data (products, resources). Because it never reads
// cookies, pages that use it can be cached (static / ISR) instead of running a function per visit.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
