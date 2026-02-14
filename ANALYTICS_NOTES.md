# Analytics Notes — StitchQueue

Vercel Analytics is already enabled for page-level metrics. This document outlines where to add custom event tracking post-launch.

## Recommended Events to Track

### Signup & Onboarding
- **Trial started** — after Stripe checkout success
  - Where: `app/onboarding/page.tsx` (on mount, after checkout param detected)
- **Onboarding completed** — when user clicks "Start Using StitchQueue"
  - Where: `app/onboarding/page.tsx` (handleComplete function)
- **Trial converted** — when subscription goes from trialing to active
  - Where: `app/api/webhooks/stripe/route.ts` (subscription.updated event)

### Core Feature Usage
- **Estimate created** — when calculator saves a new project
  - Where: `app/calculator/CalculatorForm.tsx` (save handler)
- **Project stage changed** — when drag-and-drop moves a card
  - Where: `app/board/BoardContent.tsx` (handleDragEnd)
- **Photo uploaded** — when a photo is added to a project
  - Where: Photo upload component (success callback)

### Revenue Events
- **BOC purchased** — after successful BOC checkout
  - Where: `app/api/webhooks/stripe/route.ts` (handleBOCPurchase)
- **Subscription plan changed** — monthly to annual or vice versa
  - Where: `app/api/webhooks/stripe/route.ts` (subscription.updated)

### Intake Form
- **Intake form submitted** — public form submission
  - Where: `app/api/intake/submit/route.ts` (after successful insert)
- **Intake form enabled** — quilter enables their intake form
  - Where: `app/settings/components/IntakeFormSection.tsx` (handleSave)

## Implementation Approach

When ready to add tracking, consider:

1. **Vercel Analytics Custom Events** — simplest, already integrated
   ```ts
   import { track } from '@vercel/analytics';
   track('estimate_created', { quiltSize: '60x80' });
   ```

2. **PostHog** — open-source, self-hostable, feature flags
3. **Mixpanel** — event-focused analytics with funnels

Start with Vercel Analytics custom events for simplicity. Add a dedicated analytics tool only if deeper funnel analysis is needed.
