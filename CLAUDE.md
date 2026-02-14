# CLAUDE.md — StitchQueue Project Context

## What Is This Project

StitchQueue is a **workflow management system** for professional longarm quilters. The pricing calculator is the engine that drives a **3-stage workflow** from estimate to delivery. QuickBooks/Xero handles accounting — StitchQueue handles project workflow, client communication, and profitability insights.

**Live Beta:** beta.stitchqueue.com  
**Marketing Site:** stitchqueue.com  
**Current Code:** v3.6.2 → Building toward v4.0  
**Target Launch:** Early May 2026  

## Business Model

- **StitchQueue:** $19/month or $190/year (14-day trial, CC required, NO free tier)
- **BOC (Business Overhead Calculator):** $49 with subscription, $79 standalone
- This is NOT accounting software. It complements QuickBooks/Xero.

## Tech Stack

- **Framework:** Next.js 15, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Email:** Resend
- **Payments:** Stripe (+ Stripe Tax for international sales tax)
- **Hosting:** Vercel (auto-deploys from `main`)
- **Package Manager:** pnpm (NOT npm)

## The 3-Stage Workflow

| Stage | Name | Purpose | Advances When |
|-------|------|---------|---------------|
| 1 | Estimates | Quote + client info + approval | "Approved" checkbox checked (auto) |
| 2 | In Progress | Active quilting work | Manual move by quilter |
| 3 | Completed | Business wrap-up checklist | All checklist items checked (auto) |
| — | Archive | Searchable history (read-only) | — |

### Stage 3 Checklist (Regular Projects)
- ☐ Invoiced (amount + date)
- ☐ Paid (amount + date, balance = invoiced - deposit - paid)
- ☐ Delivered (method: pickup/shipped/mailed + date)

### Project Types
- **Regular:** Full checklist (Invoiced/Paid/Delivered)
- **Gift:** Gift Invoice + Delivered only
- **Charitable:** Donation Invoice + Delivered + materials/mileage/service tracking for BOC tax docs

### Color Coding (Stage 3)
- Red: 0 boxes checked
- Amber: 1-2 boxes checked
- Green: All checked (about to auto-archive)

## Brand Colors

- Plum: #4e283a
- Gold: #98823a
- Due-soon orange: #f2a65a

## Current File Structure (v3.6.2)

```
app/
├── calculator/           # Pricing calculator (THE ENGINE)
│   ├── page.tsx
│   ├── CalculatorForm.tsx (~750 lines)
│   ├── components/
│   │   ├── ClientInfoSection.tsx (~320)
│   │   ├── ProjectDetailsSection.tsx (170)
│   │   ├── PricingSection.tsx (~390)
│   │   ├── DepositSection.tsx (186)
│   │   ├── ExtraChargesSection.tsx (136)
│   │   └── EstimateSummary.tsx (~240)
│   └── utils/
│       ├── calculations.ts (~260)
│       └── estimateNumber.ts (66)
│
├── board/                # Kanban board — MAJOR REFACTOR TARGET
│   ├── page.tsx
│   ├── BoardContent.tsx (619) — REBUILDING for 3 stages
│   ├── components/
│   │   ├── ProjectCard.tsx (350) — REBUILDING for checklist UI
│   │   ├── DroppableColumn.tsx (73)
│   │   ├── ListView.tsx (198)
│   │   └── CalendarView.tsx (191)
│   └── utils/
│       └── projectHelpers.ts (162)
│
├── settings/             # Settings page
│   ├── page.tsx
│   ├── SettingsForm.tsx (668)
│   ├── components/
│   │   ├── BusinessInfoSection.tsx (384)
│   │   ├── PricingRatesSection.tsx (217)
│   │   ├── BattingOptionsSection.tsx (264)
│   │   ├── BobbinOptionsSection.tsx (239)
│   │   ├── DataSection.tsx (89)
│   │   └── reports/ (~2,100 total) — BEING REPLACED
│
├── lib/
│   ├── supabase.ts
│   ├── auth-context.tsx
│   ├── validation.ts
│   └── storage/
│       ├── storage.ts (120) — orchestrator
│       ├── auth.ts (50)
│       ├── projects.ts (200)
│       ├── settings.ts (155)
│       ├── mappers.ts (350) — UPDATE FOR NEW COLUMNS
│       └── reports/ (~565) — REPLACING
│
├── types/
│   └── index.ts — STAGES, Project type, DEFAULT_SETTINGS — UPDATE
│
├── components/
│   ├── Header.tsx
│   ├── Toast.tsx
│   └── FeedbackButton.tsx
│
├── estimate/[id]/page.tsx
├── invoice/[id]/page.tsx
└── home/page.tsx
```

## Database Schema (Current v3.6.2 → v4.0 Changes)

### Stage Enum Change
```sql
-- OLD: intake, estimate, in_progress, invoiced, paid_shipped, archived
-- NEW: estimates, in_progress, completed, archived
```

### New Project Columns (v4.0)
```sql
approval_status boolean DEFAULT false
approval_date date
invoiced boolean DEFAULT false
invoiced_amount numeric
invoiced_date date
paid boolean DEFAULT false
paid_amount numeric
paid_date date
delivered boolean DEFAULT false
delivery_method text  -- 'pickup' | 'shipped' | 'mailed'
delivery_date date
balance_remaining numeric  -- invoiced - deposit - paid
donated_value numeric
project_type text DEFAULT 'regular'  -- 'regular' | 'gift' | 'charitable'
```

### Deprecated Columns (keep in DB, hide in UI)
```sql
tax_rate, tax_amount, tax_primary_rate, tax_secondary_rate
final_payment_amount, final_payment_date
```

### Migration Script
```sql
UPDATE projects SET stage =
  CASE
    WHEN stage IN ('intake', 'estimate') THEN 'estimates'
    WHEN stage = 'in_progress' THEN 'in_progress'
    WHEN stage IN ('invoiced', 'paid_shipped') THEN 'completed'
    WHEN stage = 'archived' THEN 'archived'
  END;
```

## Development Phases (v4.0)

| Phase | Work | Effort | Status |
|-------|------|--------|--------|
| 1 | 3-stage Kanban + DB migration | 5-7 days | Not started |
| 2 | UI/UX polish (checklist, colors) | 4-6 days | Not started |
| 3 | Deprecate accounting features | 2-3 days | Not started |
| 4 | Photo uploads (Supabase Storage) | 3-4 days | Not started |
| 5 | Trial + subscriptions (Stripe) | 5-6 days | ~15% |
| 6 | Business Overhead Calculator | 10-12 days | Not started |
| 7 | Client intake form (embeddable) | 4-5 days | Not started |
| 8 | Multi-user (Admin/Operator) | 5-6 days | Not started |
| 9 | Polish + testing | 5-7 days | Not started |
| 10 | Legal + marketing + launch | 3-4 days | ~10% |

## Features Being Deprecated (v4.0)

Hide with feature flags, keep code/data intact:
- **Tax system** (dual GST+PST) — QuickBooks handles this
- **Complex payment tracking** — simplify to deposit + paid checkboxes
- **Financial reports** (Revenue, Payments, Cash Flow) — replacing with BOC

## Known Bugs

| # | Issue | Priority |
|---|-------|----------|
| 5 | Board error on first login with no projects (mobile) | High |
| 8 | User state uses `any` instead of `User \| null` | Low |

## Development Preferences

- **Complete file replacements** preferred over incremental edits
- **Always run `pnpm run build`** after changes to verify
- **Branch workflow:** Work in `dev`, merge to `main` for production
- **Git commits:** Descriptive messages with version prefix: `v4.0: description`
- **Verify before proceeding** — don't assume changes worked
- **Dave is not a coder** — explain what you're doing in plain English
- **Ask before making big changes** — especially anything touching the database or auth

## Git Workflow

```bash
# Work in dev
git checkout dev
# ... make changes ...
git add . && git commit -m "v4.0: description" && git push origin dev

# Deploy to production
git checkout main && git merge dev && git push origin main && git checkout dev
```

## Key People

- **Dave Smith** — Developer/owner (talks to Claude Chat for planning, Claude Code for building)
- **Susan Smith** — Business partner, beta tester, marketing (150K audience)
- **Sam Alberts** — Beta tester
