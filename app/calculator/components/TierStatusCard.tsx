/**
 * TierStatusCard Component
 * 
 * Displays the user's current tier (FREE/PRO) and rate status.
 * Shows helpful messages based on tier and whether rates are configured.
 * 
 * @module calculator/components/TierStatusCard
 */

"use client";

import { useRouter } from "next/navigation";

interface TierStatusCardProps {
  /** Whether user is on the paid tier */
  isPaidTier: boolean;
  /** Whether user has configured quilting rates in settings */
  hasQuiltingRates: boolean;
}

/**
 * Card showing tier status and prompting users to configure settings.
 * 
 * Display states:
 * - FREE tier: Shows manual entry mode message
 * - PRO tier with rates: Shows "Using saved rates" message
 * - PRO tier without rates: Prompts user to set up rates
 */
export default function TierStatusCard({
  isPaidTier,
  hasQuiltingRates,
}: TierStatusCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white border border-line rounded-card p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-sm">
            Tier: {isPaidTier ? "PRO" : "FREE"}
          </div>
          <div className="text-xs text-muted mt-1">
            {isPaidTier
              ? hasQuiltingRates
                ? "Using saved rates from Settings"
                : "Set up rates in Settings to auto-populate"
              : "Manual entry mode"}
          </div>
        </div>
        <button
          onClick={() => router.push("/settings")}
          className="px-4 py-2 bg-plum text-white rounded-xl text-sm font-bold"
        >
          {isPaidTier ? "Edit Settings" : "Upgrade in Settings"}
        </button>
      </div>
      
      {/* FREE tier explanation */}
      {!isPaidTier && (
        <div className="mt-3 p-3 bg-gold/10 rounded-xl text-xs">
          <div className="font-bold mb-1">FREE Tier Mode:</div>
          <div>
            You&apos;ll manually enter pricing for each estimate. Go to
            Settings and enable PRO tier to save rates and auto-populate.
          </div>
        </div>
      )}
      
      {/* PRO tier without rates explanation */}
      {isPaidTier && !hasQuiltingRates && (
        <div className="mt-3 p-3 bg-gold/10 rounded-xl text-xs">
          <div className="font-bold mb-1">Setup Needed:</div>
          <div>
            Go to Settings → Pricing Rates to set up your quilting rates.
            Until then, you can enter rates manually below.
          </div>
        </div>
      )}
    </div>
  );
}
