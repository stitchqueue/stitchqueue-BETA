/**
 * Server-side subscription access check.
 *
 * Used by middleware to enforce subscription status BEFORE pages or
 * API routes run. This is the authoritative check — client-side
 * SubscriptionGate is a UX convenience only.
 *
 * @module lib/server-subscription
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const GRACE_PERIOD_DAYS = 3;

/**
 * Beta tester emails that bypass subscription checks.
 * These users get full access without a subscription record.
 * Remove entries as testers convert to paid subscriptions.
 */
export const BETA_TESTER_EMAILS: string[] = [
  'grfdave@gmail.com',
  'susan@stitchedbysusan.com',
  'quiltingcurvestudio@outlook.com',
  'enjoli@doodlequiltingstudio.com',
  'meganandchad2012@gmail.com',
  'reimerem@gmail.com',
];

export interface ServerSubscriptionResult {
  hasAccess: boolean;
  status: 'beta' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'none';
  inGracePeriod?: boolean;
}

/**
 * Check whether a user has subscription access.
 *
 * @param supabase - An authenticated Supabase client (from middleware)
 * @param userId   - The authenticated user's ID
 * @param email    - The authenticated user's email (for beta whitelist)
 */
export async function checkSubscriptionAccess(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined
): Promise<ServerSubscriptionResult> {
  // Beta tester whitelist bypass
  if (email && BETA_TESTER_EMAILS.includes(email)) {
    return { hasAccess: true, status: 'beta' };
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, trial_end, current_period_end')
    .eq('user_id', userId)
    .single();

  // No subscription record = no access
  if (error || !data) {
    return { hasAccess: false, status: 'none' };
  }

  // Active or trialing = full access
  if (data.status === 'trialing' || data.status === 'active') {
    return { hasAccess: true, status: data.status };
  }

  // Grace period: allow access for GRACE_PERIOD_DAYS after expiry
  const expiryDate = data.trial_end || data.current_period_end;
  if (expiryDate) {
    const now = Date.now();
    const expiry = new Date(expiryDate).getTime();
    const graceEnd = expiry + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
    if (now < graceEnd) {
      return { hasAccess: true, status: data.status, inGracePeriod: true };
    }
  }

  // Expired / canceled / past_due beyond grace = no access
  return { hasAccess: false, status: data.status };
}
