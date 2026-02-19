# CLAUDE.md — Bloom Women's Conference

## What Is This Project

Bloom is a **conference management system** for the Bloom Women's Conference. It handles event registration, speaker management, scheduling, attendee communication, and payments.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + Storage), Stripe, Resend, Vercel
**Package Manager:** pnpm (NOT npm)
**Sister Project:** StitchQueue (same stack, same conventions)

---

## Project Structure

Follow this directory layout. Feature-based organization, not layer-based.

```
app/
├── api/                          # API routes (kebab-case folders)
│   ├── example-route/
│   │   └── route.ts
│   └── webhooks/stripe/
│       └── route.ts
│
├── [feature]/                    # Feature modules (kebab-case folders)
│   ├── page.tsx                  # Page entry point
│   ├── [Feature]Content.tsx      # Main client component (PascalCase)
│   ├── components/               # Feature-specific components
│   │   ├── index.ts              # Barrel exports
│   │   └── SectionName.tsx       # PascalCase files
│   ├── utils/                    # Feature-specific utilities
│   │   └── helpers.ts            # camelCase files
│   └── hooks/                    # Feature-specific hooks
│       └── useSomething.ts       # useXxx pattern
│
├── lib/                          # Shared business logic
│   ├── supabase.ts               # Client-side Supabase singleton (anon key)
│   ├── supabase-server.ts        # Server clients (authenticated + service role)
│   ├── stripe.ts                 # Stripe client singleton
│   ├── auth-context.tsx          # React auth provider + useAuth() hook
│   ├── auth-guard.ts             # API route auth helper (requireAuth)
│   ├── subscription.ts           # Subscription status checking (client)
│   ├── server-subscription.ts    # Subscription status checking (server/middleware)
│   ├── validation.ts             # Input validation schemas
│   ├── sanitize.ts               # HTML escaping for emails
│   ├── featureFlags.ts           # Feature flag system
│   ├── rate-limit.ts             # In-memory rate limiting
│   ├── utils.ts                  # General utilities
│   ├── storage/                  # Database CRUD layer
│   │   ├── storage.ts            # Orchestrator (lazy imports)
│   │   ├── auth.ts               # getCurrentUser(), getOrganizationId()
│   │   ├── [entity].ts           # CRUD per entity (e.g., events.ts, speakers.ts)
│   │   └── mappers.ts            # DB snake_case <-> TS camelCase
│   └── email/                    # Email templates
│       ├── [template]-template.ts # HTML string generators
│       └── shared-styles.ts      # Inline CSS constants
│
├── types/
│   └── index.ts                  # ALL TypeScript types in one file
│
├── components/                   # Global shared components
│   ├── Header.tsx
│   ├── Toast.tsx
│   ├── ErrorBoundary.tsx
│   ├── FormField.tsx
│   ├── SubscriptionGate.tsx
│   └── TrialBanner.tsx
│
├── login/page.tsx                # Auth pages
├── signup/page.tsx
├── forgot-password/page.tsx
├── onboarding/page.tsx
│
├── layout.tsx                    # Root layout with AuthProvider
├── page.tsx                      # Home/landing page
└── not-found.tsx                 # 404

middleware.ts                     # Route protection + session refresh
tailwind.config.ts                # Custom brand colors
next.config.ts                    # Next.js config (TypeScript)
tsconfig.json                     # strict: true, path alias @/*
```

---

## Naming Conventions

| Thing | Convention | Examples |
|-------|-----------|----------|
| Component files | PascalCase `.tsx` | `SpeakerCard.tsx`, `ScheduleSection.tsx` |
| Utility files | camelCase `.ts` | `dateHelpers.ts`, `priceCalculations.ts` |
| Hook files | `use` prefix `.ts` | `useRegistration.ts`, `useSpeakers.ts` |
| API route folders | kebab-case | `create-checkout-session/`, `send-confirmation/` |
| Page folders | kebab-case | `forgot-password/`, `speaker-profile/` |
| TypeScript types/interfaces | PascalCase | `Event`, `Speaker`, `Attendee`, `Registration` |
| Type union literals | lowercase | `'workshop' \| 'keynote' \| 'panel'` |
| Constants | UPPER_SNAKE_CASE | `EVENT_TYPES`, `DEFAULT_SETTINGS` |
| Functions | camelCase | `getEvents()`, `mapSpeakerFromDb()` |
| Props interfaces | `[Component]Props` | `SpeakerCardProps`, `ScheduleSectionProps` |
| DB columns | snake_case | `first_name`, `event_date`, `ticket_type` |
| TS properties | camelCase | `firstName`, `eventDate`, `ticketType` |
| CSS | Tailwind utility classes only | Custom colors defined in tailwind.config.ts |

---

## Tailwind Config

Define brand colors in `tailwind.config.ts`. Reference them as Tailwind classes (`bg-primary`, `text-accent`, etc.).

```ts
// tailwind.config.ts — update with Bloom brand colors
colors: {
  primary: "#______",       // Primary brand color
  accent: "#______",        // Secondary/accent color
  background: "#______",    // Page background
  card: "#ffffff",          // Card background
  muted: "#6c6c6c",        // Muted text
  line: "#e7e2dc",          // Borders/dividers
},
borderRadius: {
  card: "18px",
}
```

---

## Supabase Patterns

### Client Initialization — Dual-Client Approach

**Client-side** (`lib/supabase.ts`) — singleton, anon key, RLS enforced:
```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**Server-side authenticated** (`lib/supabase-server.ts`) — reads session cookies, RLS enforced:
```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createAuthenticatedClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options));
      },
    },
  });
}
```

**Server-side service role** — bypasses RLS, ONLY for webhooks and admin ops:
```ts
export function createServiceRoleClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
```

### Database Queries — Always Scope by Organization

Every query MUST include `.eq("organization_id", orgId)`. RLS is the safety net, not the primary filter.

```ts
const { data, error } = await supabase
  .from("events")
  .select("*")
  .eq("organization_id", orgId)
  .order("created_at", { ascending: false });

if (error) {
  console.error("Error fetching events:", error.message);
  return [];
}
return (data || []).map(mapEventFromDb);
```

### Update Pattern — Verify Ownership First

```ts
// 1. Verify record belongs to this org
const { data: existing } = await supabase
  .from("events").select("organization_id").eq("id", id).single();
if (!existing || existing.organization_id !== orgId) {
  throw new Error("Not found or access denied");
}

// 2. Update with double safety
const { error } = await supabase
  .from("events").update(dbUpdates)
  .eq("id", id).eq("organization_id", orgId)
  .select();
```

### Data Mapping — Centralized in `mappers.ts`

All DB rows pass through mapper functions. This is the ONLY place snake_case <-> camelCase conversion happens.

```ts
export function mapEventFromDb(row: any): Event {
  return {
    id: row.id,
    eventName: row.event_name,
    startDate: row.start_date,
    // ... every field mapped
  };
}

export function mapEventToDb(event: Event, orgId: string): any {
  return {
    id: event.id,
    organization_id: orgId,
    event_name: event.eventName,
    start_date: event.startDate,
    // ... every field mapped
  };
}
```

### Storage Orchestrator — Lazy Imports

```ts
export const storage = {
  getEvents: async () => {
    const { getEvents } = await import("./events");
    return getEvents();
  },
  // ... all operations
};
```

### Row Level Security

Every table gets RLS policies scoped to the user's organization:
```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org events" ON events FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));
-- Repeat for INSERT, UPDATE, DELETE
```

Subscriptions table: only service role can UPDATE (webhooks set status).

### Multi-Tenancy Model

```
auth.users -> profiles (user_id, organization_id) -> organizations -> [all data tables]
```

---

## Component Patterns

### Every Protected Page Follows This Structure

```tsx
"use client";
import { Suspense } from "react";

function PageLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted">Loading...</div>
    </div>
  );
}

export default function SomePage() {
  return (
    <ErrorBoundary fallbackTitle="Page error">
      <Suspense fallback={<PageLoading />}>
        <SubscriptionGate>
          <PageContent />
        </SubscriptionGate>
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Props — Inline Interface Above Component

```tsx
interface SpeakerCardProps {
  speaker: Speaker;
  onClick: () => void;
  showBio?: boolean;
}

export function SpeakerCard({ speaker, onClick, showBio = false }: SpeakerCardProps) {
  // ...
}
```

### State — Plain useState, No Redux

Large orchestrator components hold state and pass props to presentational children.

```tsx
// Orchestrator
const [firstName, setFirstName] = useState("");
<RegistrationSection firstName={firstName} setFirstName={setFirstName} />

// Custom hooks return objects for spreading
const registration = useRegistration(settings);
<RegistrationSection {...registration} />
```

### Server vs Client Components

Nearly all interactive components use `"use client"`. If it uses `useRouter()`, `useSearchParams()`, `useState()`, or `useEffect()`, it must be a client component.

### Collapsible Sections — Set Pattern

```tsx
const [openSections, setOpenSections] = useState<Set<string>>(new Set());
const toggleSection = (key: string) => {
  setOpenSections(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
};
```

### Barrel Exports in Component Folders

```ts
// components/index.ts
export { SpeakerCard } from './SpeakerCard';
export { default as ScheduleView } from './ScheduleView';
```

---

## API Route Patterns

### Standard Route Structure

```ts
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    // 2. Parse + validate input
    const { eventId } = await request.json();
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // 3. Authorize (check ownership, tier, permissions)
    // 4. Execute business logic
    // 5. Return success
    return NextResponse.json({ success: true, message: 'Done' });

  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Auth Guard

```ts
// lib/auth-guard.ts
interface AuthResult {
  userId: string;
  organizationId: string;
  supabase: SupabaseClient;
}

export async function requireAuth(): Promise<AuthResult | NextResponse> { /* ... */ }
export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

// Usage:
const auth = await requireAuth();
if (isAuthError(auth)) return auth;  // Returns 401 or 403
```

### Response Format

```ts
// Success
{ success: true, message: "..." }
{ sessionId: "...", url: "..." }

// Errors — always { error: string } with status code
{ error: "Invalid input" }          // 400
{ error: "Authentication required" } // 401
{ error: "Access denied" }          // 403
{ error: "Not found" }             // 404
{ error: "Internal server error" }  // 500
```

### Rate Limiting

```ts
const rateLimited = checkRateLimit(request, {
  limit: 10, windowMs: 60 * 60 * 1000, prefix: "endpoint-name",
});
if (rateLimited) return rateLimited;
```

---

## Error Handling

| Layer | Pattern |
|-------|---------|
| Page level | `<ErrorBoundary fallbackTitle="...">` wraps every page |
| API routes | `try/catch` -> `console.error` -> `{ error: "..." }` with HTTP status |
| Storage layer | Returns `{ success: boolean; error?: string }` |
| Form validation | `validate*(data)` returns `{ isValid, errors[] }`, inline errors via `<FormField>` |
| User-facing | `<Toast type="error">` for transient, inline red text for field errors |
| Loading states | `disabled={loading}`, button text: `"Saving..." / "Save"` |

### Form Submission Pattern

```tsx
async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const errors = validateForm(data);
    if (!errors.isValid) {
      setValidationErrors(errors.errors);
      scrollToFirstError(errors.errors);
      return;
    }
    await storage.saveEntity(data);
    router.push("/destination");
  } catch (err) {
    setError("An unexpected error occurred.");
  } finally {
    setLoading(false);
  }
}
```

### Inline Field Errors

```tsx
<FormField label="Email" error={getFieldError(errors, "email")} required>
  <ValidatedInput
    type="email"
    hasError={hasFieldError(errors, "email")}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</FormField>
```

---

## Stripe Integration

### Webhook Handler Pattern

```ts
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // 1. Verify signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 2. Handle events (return 500 on failure so Stripe retries)
  try {
    switch (event.type) {
      case 'checkout.session.completed': /* ... */ break;
      case 'customer.subscription.updated': /* ... */ break;
      case 'customer.subscription.deleted': /* ... */ break;
      case 'invoice.payment_failed': /* ... */ break;
    }
  } catch (err) {
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

### Checkout Session — Always Include Metadata

```ts
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  subscription_data: {
    trial_period_days: 14,
    metadata: { user_id: auth.userId, organization_id: auth.organizationId },
  },
  success_url: `${baseUrl}/onboarding?checkout=success`,
  cancel_url: `${baseUrl}/signup?checkout=canceled`,
  metadata: { user_id: auth.userId, organization_id: auth.organizationId },
});
```

---

## Email Patterns (Resend)

Templates are **pure functions returning HTML strings** (not React email components). All user input is escaped with `escapeHtml()`.

```ts
export function generateConfirmationEmail(data: ConfirmationEmailData): string {
  return `<!DOCTYPE html>
    <html><body style="${emailStyles.container}">
      <div style="${emailStyles.header}">
        <h1>${escapeHtml(data.eventName)}</h1>
      </div>
      <p>Hi ${escapeHtml(data.attendeeFirstName)},</p>
      ...
    </body></html>`;
}
```

Shared inline styles in `shared-styles.ts`. Send via Resend SDK:
```ts
await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: attendee.email,
  replyTo: settings.contactEmail,
  subject: 'Registration Confirmed',
  html: emailHtml,
});
```

---

## Auth Flow

### Pipeline

1. **Signup** (`/signup`) — `supabase.auth.signUp()` with email confirmation
2. **Verify** (`/verify-email`) — handles confirmation callback
3. **Onboarding** (`/onboarding`) — creates organization + profile
4. **Plan Selection** (`/signup-trial`) — Stripe checkout with trial
5. **Login** (`/login`) — `supabase.auth.signInWithPassword()`

### Auth Context — Wraps Entire App

```tsx
// layout.tsx
<AuthProvider>
  <TrialBanner />
  {children}
</AuthProvider>

// Any component:
const { user, loading } = useAuth();
```

### Middleware — Session Refresh + Subscription Check

```ts
export async function middleware(request: NextRequest) {
  // 1. Refresh JWT
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Skip exempt paths (auth, legal, webhooks, public)
  // 3. Check subscription, redirect expired users to /signup-trial
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/webhooks).*)'],
};
```

### Access Control Layers

- **Middleware:** Server-side subscription enforcement, redirects expired users
- **SubscriptionGate:** Client-side component wrapper, blocks rendering until verified
- **TrialBanner:** Shows trial days remaining, dismissible via localStorage
- **requireAuth():** API route guard, returns 401/403

---

## Other Conventions

### Data Fetching — useEffect + async (no SWR/React Query)

```tsx
useEffect(() => {
  const init = async () => {
    try {
      const data = await storage.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error loading:", error);
    } finally {
      setLoading(false);
    }
  };
  init();
}, []);
```

### Feature Flags

```ts
export const FEATURE_FLAGS = {
  ENABLE_FEATURE_NAME: false,
} as const;

<FeatureGate flag="ENABLE_FEATURE_NAME">
  <HiddenFeature />
</FeatureGate>
```

### Imports — Always Use @/* Path Alias

```ts
import { storage } from "@/app/lib/storage";
import type { Event, Speaker } from "@/app/types";
import { SpeakerCard } from "@/app/speakers/components";
```

### Toast Notifications

```tsx
<Toast message="Saved successfully" type="success" duration={3000} onClose={() => setToast(null)} />
// Types: 'success' | 'error' | 'info'
```

### URL State for Transient UI

```tsx
const searchParams = useSearchParams();
const view = searchParams.get("view") || "grid";
const tab = searchParams.get("tab") || "upcoming";
```

### Loading Button Pattern

```tsx
<button type="submit" disabled={loading}>
  {loading ? "Saving..." : "Save"}
</button>
```

---

## Development Preferences

- **Complete file replacements** preferred over incremental edits
- **Always run `pnpm run build`** after changes to verify
- **Branch workflow:** Work in `dev`, merge to `main` for production
- **Git commits:** Descriptive messages with context
- **Verify before proceeding** — don't assume changes worked
- **Dave is not a coder** — explain what you're doing in plain English
- **Ask before making big changes** — especially anything touching the database or auth

## Git Workflow

```bash
git checkout dev
# ... make changes ...
git add . && git commit -m "description" && git push origin dev

# Deploy to production
git checkout main && git merge dev && git push origin main && git checkout dev
```
