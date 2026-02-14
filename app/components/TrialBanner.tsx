"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSubscriptionInfo } from "./SubscriptionGate";

const DISMISS_KEY = "sq_trial_banner_dismissed";

/**
 * Shows a banner when user is in trial or grace period.
 * Dismissible via localStorage (resets each session for grace period warnings).
 */
export default function TrialBanner() {
  const info = useSubscriptionInfo();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only allow dismissal of trial banners, not grace period warnings
    if (info && !info.isGracePeriod) {
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored === "true") {
        setDismissed(true);
      }
    }
  }, [info]);

  if (!info || dismissed) return null;

  // Trial active
  if (info.status === "trialing" && info.trialDaysRemaining !== null) {
    return (
      <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-plum">
          <span className="font-bold">Trial Active:</span>{" "}
          {info.trialDaysRemaining} day{info.trialDaysRemaining !== 1 ? "s" : ""}{" "}
          remaining.{" "}
          <Link
            href="/settings?section=subscription"
            className="text-gold font-bold hover:underline"
          >
            Manage subscription
          </Link>
        </p>
        <button
          onClick={() => {
            setDismissed(true);
            localStorage.setItem(DISMISS_KEY, "true");
          }}
          className="text-muted hover:text-plum text-lg leading-none px-1"
          aria-label="Dismiss trial banner"
        >
          ✕
        </button>
      </div>
    );
  }

  // Grace period warning (not dismissible)
  if (info.isGracePeriod && info.graceDaysRemaining !== null) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 mb-4">
        <p className="text-sm text-red-700">
          <span className="font-bold">Subscription expired.</span>{" "}
          You have {info.graceDaysRemaining} day{info.graceDaysRemaining !== 1 ? "s" : ""}{" "}
          remaining before access is restricted.{" "}
          <Link
            href="/settings?section=subscription"
            className="font-bold underline"
          >
            Subscribe now
          </Link>
        </p>
      </div>
    );
  }

  return null;
}
