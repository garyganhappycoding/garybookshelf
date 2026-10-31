import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // refreshes the session cookie if it's expired -- required for Server Components.
  // getSession() reads the cookie locally (no network call unless a refresh is
  // needed); pages and actions still verify with getUser() where it matters.
  await supabase.auth.getSession();

  return response;
}

// The proxy runs a serverless function on every request it matches, so it only matches pages and APIs where the server reads the
// logged-in user. Public pages (home, shop, /hi, resources, privacy...) are served from the cache with no function call.
// Everywhere else the browser keeps the session fresh by itself.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/speaking/:path*",
    "/admin/:path*",
    "/track/:path*",
    "/feedback",
    "/question",
    "/replies",
    "/ask-gary/:path*",
    "/api/speaking/:path*",
    "/api/ask-gary/:path*",
  ],
};
