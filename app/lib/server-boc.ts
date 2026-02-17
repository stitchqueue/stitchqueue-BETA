/**
 * Server-side BOC purchase check.
 *
 * Used by the BOC page (server component) to verify purchase status
 * before rendering the full BOC form. Client-side checks in BOCForm
 * are a UX convenience only — this is the authoritative check.
 *
 * @module lib/server-boc
 */

import { BETA_TESTER_EMAILS } from './server-subscription';
import { createServiceRoleClient } from './supabase-server';

export interface BOCAccessResult {
  hasPurchased: boolean;
  isBetaTester: boolean;
}

/**
 * Check if a user has purchased BOC or is a beta tester.
 *
 * @param userId - The authenticated user's ID
 * @param email  - The authenticated user's email (for beta whitelist)
 */
export async function checkBOCAccess(
  userId: string,
  email: string | undefined
): Promise<BOCAccessResult> {
  // Beta tester whitelist bypass
  if (email && BETA_TESTER_EMAILS.includes(email)) {
    return { hasPurchased: true, isBetaTester: true };
  }

  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('boc_purchases')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error || !data) {
    return { hasPurchased: false, isBetaTester: false };
  }

  return { hasPurchased: true, isBetaTester: false };
}
