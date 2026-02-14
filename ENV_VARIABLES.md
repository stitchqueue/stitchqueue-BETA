# Environment Variables — StitchQueue

All environment variables required for production deployment on Vercel.

## Supabase

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL (e.g. `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase service role key (bypasses RLS) |

**Where to find:** Supabase Dashboard > Project Settings > API

## Stripe

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe publishable key (starts with `pk_`) |
| `STRIPE_SECRET_KEY` | Server only | Stripe secret key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Server only | Stripe webhook signing secret (starts with `whsec_`) |
| `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` | Client | Stripe Price ID for $19/month plan |
| `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID` | Client | Stripe Price ID for $190/year plan |
| `NEXT_PUBLIC_STRIPE_BOC_SUBSCRIBER_PRICE_ID` | Client | Stripe Price ID for BOC ($49 subscriber) |
| `NEXT_PUBLIC_STRIPE_BOC_STANDALONE_PRICE_ID` | Client | Stripe Price ID for BOC ($79 standalone) |

**Where to find:** Stripe Dashboard > Developers > API Keys (keys), Products > Prices (price IDs)

**Webhook setup:** Stripe Dashboard > Developers > Webhooks
- Endpoint URL: `https://beta.stitchqueue.com/api/webhooks/stripe`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

## Resend (Email)

| Variable | Where | Description |
|----------|-------|-------------|
| `RESEND_API_KEY` | Server only | Resend API key for transactional emails |

**Where to find:** Resend Dashboard > API Keys

**Domain verification:** Verify `stitchqueue.com` in Resend Dashboard > Domains

## Next.js

| Variable | Where | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | Client + Server | Full app URL (e.g. `https://beta.stitchqueue.com`) |

## Vercel Deployment

1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add each variable above
3. Set `NEXT_PUBLIC_*` variables for all environments (Production, Preview, Development)
4. Set server-only variables (no `NEXT_PUBLIC_` prefix) for all environments
5. Redeploy after adding/changing variables

## Switching from Test to Live (Stripe)

1. In Stripe Dashboard, toggle from "Test mode" to live
2. Copy new live API keys (publishable + secret)
3. Create new webhook endpoint for live mode
4. Create new Products and Prices in live mode
5. Update all Stripe environment variables in Vercel with live values
6. Redeploy

## Local Development (.env.local)

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BOC_SUBSCRIBER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_BOC_STANDALONE_PRICE_ID=price_...

RESEND_API_KEY=re_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Never commit `.env.local` to git.** It is already in `.gitignore`.
