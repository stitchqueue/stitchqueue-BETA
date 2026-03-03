import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkSubscriptionAccess } from '@/app/lib/server-subscription';

/**
 * Routes that authenticated users can access WITHOUT a subscription.
 * Everything else requires an active/trialing subscription or grace period.
 */
const SUBSCRIPTION_EXEMPT_PATHS = [
  '/signup',
  '/signup-trial',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/onboarding',
  '/privacy',
  '/terms',
  '/approve',
  '/intake',
];

function isSubscriptionExempt(pathname: string): boolean {
  return SUBSCRIPTION_EXEMPT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

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
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // No user = not authenticated. Let the page/route handle its own auth redirect.
  // Don't block public pages or auth pages.
  if (!user) {
    return supabaseResponse;
  }

  // Skip subscription check for exempt paths (signup, legal, etc.)
  if (isSubscriptionExempt(pathname)) {
    return supabaseResponse;
  }

  // Skip subscription check for API routes — they handle their own auth
  if (pathname.startsWith('/api/')) {
    return supabaseResponse;
  }

  // Skip subscription check for the home page (marketing/landing)
  if (pathname === '/') {
    return supabaseResponse;
  }

  // Server-side subscription enforcement
  const access = await checkSubscriptionAccess(supabase, user.id, user.email);

  if (!access.hasAccess) {
    const redirectUrl = new URL('/signup-trial', request.url);
    redirectUrl.searchParams.set('reason', 'expired');
    return NextResponse.redirect(redirectUrl);
  }

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
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.|apple-icon\\.|api/webhooks|api/intake|api/approve-estimate|api/feedback|intake).*)',
  ],
};
