# Deployment Checklist — StitchQueue v4.0

Steps for going live.

## Pre-Launch

### Database Migrations
- [ ] Run `001_v4_stage_refactor_fixed.sql` in Supabase SQL Editor
- [ ] Run `002_project_photos.sql`
- [ ] Run `003_subscriptions.sql`
- [ ] Run `004_boc.sql`
- [ ] Run `004b_boc_update.sql`
- [ ] Run `005_boc_purchases.sql`
- [ ] Run `006_intake_forms.sql`
- [ ] Run `007_onboarding.sql`
- [ ] Verify all tables exist: projects, organizations, profiles, subscriptions, boc_settings, boc_manual_projects, boc_purchases
- [ ] Verify RLS is enabled on all tables

### Stripe (Switch to Live Mode)
- [ ] Create products and prices in Stripe Live Mode:
  - Monthly subscription: $19/month
  - Annual subscription: $190/year
  - BOC Subscriber: $49 one-time
  - BOC Standalone: $79 one-time
- [ ] Copy live publishable key and secret key
- [ ] Create live webhook endpoint: `https://beta.stitchqueue.com/api/webhooks/stripe`
- [ ] Subscribe to events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
- [ ] Copy live webhook signing secret
- [ ] Update all Stripe environment variables in Vercel

### Environment Variables (Vercel)
- [ ] All variables from ENV_VARIABLES.md are set
- [ ] `NEXT_PUBLIC_APP_URL` = `https://beta.stitchqueue.com`
- [ ] Stripe variables point to live keys and prices
- [ ] Supabase variables point to production project
- [ ] Resend API key is set

### Email (Resend)
- [ ] Verify `stitchqueue.com` domain in Resend Dashboard
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Test sending from `notifications@stitchqueue.com`

### Domain
- [ ] `beta.stitchqueue.com` DNS pointing to Vercel
- [ ] SSL certificate active (Vercel handles this automatically)

## Launch Testing

### Trial Signup Flow
- [ ] Visit `/signup` — create new account
- [ ] Verify email arrives and verification link works
- [ ] `/signup-trial` — select a plan
- [ ] Stripe checkout loads with 14-day trial
- [ ] After checkout, redirected to `/onboarding`
- [ ] Complete onboarding, arrive at `/board`
- [ ] Verify subscription shows as "trialing" in Stripe Dashboard

### Core Features
- [ ] Create an estimate in Calculator
- [ ] Estimate appears in Board (Estimates column)
- [ ] Move project through stages (drag-and-drop)
- [ ] Upload a photo to a project
- [ ] Complete all checklist items, project auto-archives
- [ ] Verify archived project appears in Archive

### BOC Purchase
- [ ] Navigate to `/boc`
- [ ] Click purchase button ($49 or $79)
- [ ] Complete Stripe checkout
- [ ] Verify BOC unlocks after purchase
- [ ] Save BOC settings and verify they persist

### Intake Form
- [ ] Enable intake form in Settings
- [ ] Set a URL slug
- [ ] Visit the public intake form URL
- [ ] Submit a test request
- [ ] Verify project appears in Estimates column
- [ ] Verify notification email sent to quilter
- [ ] Verify auto-response email sent to client

### Email Notifications
- [ ] Estimate email sends correctly
- [ ] Invoice email sends correctly
- [ ] Intake notification email sends correctly
- [ ] Intake auto-response email sends correctly

### Mobile
- [ ] Run through MOBILE_TEST_CHECKLIST.md on at least one real device

## Post-Launch

- [ ] Monitor Vercel deployment logs for errors
- [ ] Monitor Stripe webhook delivery success rate
- [ ] Check Supabase for any RLS policy failures
- [ ] Verify first real user signup works end-to-end
- [ ] Remove beta notice from Footer once out of beta
- [ ] Update Terms of Service (remove beta tester language)
