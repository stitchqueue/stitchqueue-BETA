/**
 * EmptyState Component
 * 
 * Reusable empty state display with icon, title, message, and optional CTA.
 * Used across Board, Archive, and other pages when no content exists.
 * 
 * @module components/EmptyState
 */

"use client";

import { useRouter } from "next/navigation";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryAction?: () => void;
}

/**
 * Friendly empty state component with consistent styling.
 * Supports one or two action buttons.
 */
export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  onSecondaryAction,
}: EmptyStateProps) {
  const router = useRouter();

  const handlePrimaryClick = () => {
    if (onAction) {
      onAction();
    } else if (actionHref) {
      router.push(actionHref);
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else if (secondaryHref) {
      router.push(secondaryHref);
    }
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-plum mb-2">{title}</h2>
      <p className="text-muted mb-6 max-w-md mx-auto">{message}</p>
      
      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actionLabel && (
            <button
              onClick={handlePrimaryClick}
              className="px-6 py-3 bg-plum text-white rounded-xl font-bold hover:bg-plum/90 transition-colors"
            >
              {actionLabel}
            </button>
          )}
          {secondaryLabel && (
            <button
              onClick={handleSecondaryClick}
              className="px-6 py-3 border border-line rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}