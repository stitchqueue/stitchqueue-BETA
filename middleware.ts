import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this keeps JWTs alive
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, icon.*, apple-icon.* (browser metadata)
     * - /api/webhooks/* (Stripe signature auth — no cookies)
     * - /api/intake/* (public client intake form)
     * - /api/approve-estimate (public HMAC-protected endpoint)
     * - /api/feedback (public feedback endpoint)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.|apple-icon\\.|api/webhooks|api/intake|api/approve-estimate|api/feedback).*)',
  ],
};
