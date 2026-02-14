-- ============================================================================
-- BOC Purchases — tracks one-time BOC purchases via Stripe
-- Run in Supabase SQL Editor
-- ============================================================================

CREATE TABLE boc_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  stripe_payment_intent_id text,
  stripe_session_id text,
  amount numeric NOT NULL,
  purchase_date timestamptz DEFAULT now(),

  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE boc_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own BOC purchases"
ON boc_purchases FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only service role can insert (webhooks)
CREATE POLICY "Service role can insert BOC purchases"
ON boc_purchases FOR INSERT
TO service_role
WITH CHECK (true);

-- Index
CREATE INDEX idx_boc_purchases_user_id ON boc_purchases(user_id);
