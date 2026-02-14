# Security Checklist — StitchQueue v4.0

Pre-launch security verification.

## Authentication & Authorization

- [x] All app routes check authentication (redirect to /login if not logged in)
- [x] API routes use Supabase service role key for server-side operations
- [x] SubscriptionGate wraps paid features (Board, Calculator, BOC)
- [x] Stripe webhook verifies signature before processing events
- [ ] Verify all API routes reject unauthenticated requests in production

## Row-Level Security (RLS)

- [x] `projects` table — RLS enabled, users see only their org's projects
- [x] `organizations` table — RLS enabled, users see only their org
- [x] `profiles` table — RLS enabled, users see only their own profile
- [x] `subscriptions` table — RLS enabled, SELECT for own user, INSERT/UPDATE for service_role
- [x] `boc_settings` table — RLS enabled, CRUD for own user_id
- [x] `boc_manual_projects` table — RLS enabled, CRUD for own user_id
- [x] `boc_purchases` table — RLS enabled, SELECT for own user, INSERT for service_role
- [ ] Verify RLS policies in Supabase Dashboard after running all migrations

## Environment Variables

- [x] `.env.local` is in `.gitignore`
- [x] No secrets committed to git (SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, etc.)
- [x] `NEXT_PUBLIC_` prefix only on variables safe for client-side exposure
- [ ] Verify all environment variables are set in Vercel production

## Public Routes

- [x] `/intake/[slug]` — public form with honeypot spam protection
- [x] `/intake/[slug]` — client-side rate limiting (5 submissions per hour per slug)
- [x] `/api/intake/submit` — server-side validation of required fields
- [x] `/api/intake/submit` — honeypot check silently rejects bots
- [x] `/approve/[projectId]` — read-only approval page, no auth required by design
- [ ] Verify intake form cannot be abused at scale

## Stripe

- [x] Webhook endpoint verifies `stripe-signature` header
- [x] Checkout sessions use server-side API (secret key never exposed to client)
- [x] Price IDs validated before creating checkout sessions
- [x] BOC duplicate purchase prevention (checks existing purchases)
- [ ] Switch from test to live keys before launch

## Data Protection

- [x] React auto-escapes output (XSS protection)
- [x] Supabase parameterized queries (SQL injection protection)
- [x] Passwords hashed by Supabase Auth (bcrypt)
- [x] HTTPS enforced by Vercel
- [x] No sensitive data in client-side localStorage (only rate-limit timestamps)

## Email

- [x] Transactional emails sent via Resend (not raw SMTP)
- [x] From address uses verified domain (notifications@stitchqueue.com)
- [ ] Verify Resend domain DNS records in production

## CORS & Headers

- [x] Next.js default CORS handling (same-origin)
- [x] No custom CORS headers exposing API to other origins
- [ ] Consider adding Content-Security-Policy header post-launch

## Monitoring

- [ ] Set up error alerting (Vercel logs or external service)
- [ ] Monitor Stripe webhook failures in Stripe Dashboard
- [ ] Monitor Supabase for unusual query patterns
