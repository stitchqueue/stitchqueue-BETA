-- Subscriptions table for tracking trial and paid subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Subscription status
  status text NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),

  -- Trial tracking
  trial_start timestamptz,
  trial_end timestamptz,

  -- Stripe IDs
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,

  -- Subscription details
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  UNIQUE(user_id, organization_id)
);

-- RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own subscription (during trial signup)
CREATE POLICY "Users can create own subscription"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Only service role can update (webhooks)
CREATE POLICY "Service role can update subscriptions"
ON subscriptions FOR UPDATE
TO service_role
USING (true);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
