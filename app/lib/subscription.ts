import { supabase } from "./supabase";
import { BETA_TESTER_EMAILS } from "./server-subscription";

const GRACE_PERIOD_DAYS = 3;

export interface SubscriptionInfo {
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "none";
  trialDaysRemaining: number | null;
  hasAccess: boolean;
  isGracePeriod: boolean;
  graceDaysRemaining: number | null;
}

/**
 * Get full subscription info for a user.
 * Returns access status, trial info, and grace period state.
 */
export async function getSubscriptionInfo(userId: string, email?: string): Promise<SubscriptionInfo> {
  // Beta tester whitelist — full access without a subscription record
  if (email && BETA_TESTER_EMAILS.includes(email)) {
    return {
      status: "active",
      trialDaysRemaining: null,
      hasAccess: true,
      isGracePeriod: false,
      graceDaysRemaining: null,
    };
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, trial_end, current_period_end")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // No subscription record = no access.
    // Beta testers bypass via the server-side middleware whitelist
    // (BETA_TESTER_EMAILS in server-subscription.ts), not here.
    return {
      status: "none",
      trialDaysRemaining: null,
      hasAccess: false,
      isGracePeriod: false,
      graceDaysRemaining: null,
    };
  }

  const now = Date.now();

  // Trial days remaining
  let trialDaysRemaining: number | null = null;
  if (data.status === "trialing" && data.trial_end) {
    const days = Math.ceil((new Date(data.trial_end).getTime() - now) / (1000 * 60 * 60 * 24));
    trialDaysRemaining = Math.max(0, days);
  }

  // Active subscriptions have full access
  if (data.status === "trialing" || data.status === "active") {
    return {
      status: data.status,
      trialDaysRemaining,
      hasAccess: true,
      isGracePeriod: false,
      graceDaysRemaining: null,
    };
  }

  // Grace period: check if within GRACE_PERIOD_DAYS of expiry
  const expiryDate = data.trial_end || data.current_period_end;
  let isGracePeriod = false;
  let graceDaysRemaining: number | null = null;

  if (expiryDate) {
    const expiry = new Date(expiryDate).getTime();
    const graceEnd = expiry + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
    if (now < graceEnd) {
      isGracePeriod = true;
      graceDaysRemaining = Math.ceil((graceEnd - now) / (1000 * 60 * 60 * 24));
    }
  }

  return {
    status: data.status,
    trialDaysRemaining,
    hasAccess: isGracePeriod,
    isGracePeriod,
    graceDaysRemaining,
  };
}
