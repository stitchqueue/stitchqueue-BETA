-- 011_stripe_events.sql
-- Idempotency table for Stripe webhook events.
-- Prevents duplicate processing when Stripe retries deliveries.

CREATE TABLE IF NOT EXISTS stripe_events (
  event_id   TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (no user-facing policies needed; accessed only via service role)
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
