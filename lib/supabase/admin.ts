import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. This client uses the service role key and bypasses Row Level
// Security entirely. Only import this file inside Server Actions / Route
// Handlers -- never inside a "use client" component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
