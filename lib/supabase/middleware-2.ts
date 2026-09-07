// =============================================================================
// MIDDLEMAN.COM — SUPABASE MIDDLEWARE SESSION REFRESH
// Path: @/lib/supabase/middleware.ts
//
// Called from the root middleware.ts on every request. Refreshes the
// Supabase auth session cookie so Server Components always see a valid,
// non-expired session — without this, sessions can silently expire between
// requests even though the user never explicitly logged out.
// =============================================================================

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: this call is what actually refreshes the session — do not
  // remove it, even though the returned value isn't used directly here.
  await supabase.auth.getUser();

  return supabaseResponse;
}
