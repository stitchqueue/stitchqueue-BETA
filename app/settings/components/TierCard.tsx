/**
 * TierCard Component
 * 
 * Displays the user's current subscription tier (FREE/PAID) with toggle.
 * Shows upgrade benefits when on FREE tier.
 * 
 * @module settings/components/TierCard
 */

"use client";

interface TierCardProps {
  isPaidTier: boolean;
  onToggleTier: () => void;
}

/**
 * Card showing current tier status and upgrade information.
 * 
 * In beta/demo mode, includes a toggle button to switch tiers.
 * In production, this would link to subscription management.
 */
export default function TierCard({ isPaidTier, onToggleTier }: TierCardProps) {
  return (
    <div className="bg-white border border-line rounded-xl p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-bold text-sm">
            Current Tier: {isPaidTier ? "PAID" : "FREE"}
          </div>
          <div className="text-xs text-muted mt-1">
            {isPaidTier
              ? "All features unlocked"
              : "Upgrade to unlock saved rates and email features"}
          </div>
        </div>
        <button
          onClick={onToggleTier}
          className="px-4 py-2 bg-plum text-white rounded-xl text-sm font-bold self-start sm:self-auto"
        >
          Toggle Tier (Demo)
        </button>
      </div>

      {!isPaidTier && (
        <div className="mt-4 p-3 bg-gold/10 rounded-xl text-xs">
          <div className="font-bold mb-2">PAID Tier Features ($19/mo):</div>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Save pricing rates (auto-populate calculator)</li>
            <li>Save bobbin and batting options</li>
            <li>Email estimates/invoices</li>
            <li>Branded client intake form</li>
            <li>Multi-user access (up to 5 users)</li>
            <li>Advanced reports</li>
          </ul>
        </div>
      )}
    </div>
  );
}
