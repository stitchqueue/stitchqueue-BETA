/**
 * Board Page
 * 
 * Entry point for the /board route.
 * Wraps BoardContent in Suspense for Next.js App Router compatibility.
 * 
 * The actual board logic lives in BoardContent.tsx.
 * 
 * @module board/page
 */

"use client";

import { Suspense } from "react";
import BoardContent from "./BoardContent";
import SubscriptionGate from "../components/SubscriptionGate";

/**
 * Loading fallback shown while BoardContent loads
 */
function BoardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted">Loading board...</div>
    </div>
  );
}

/**
 * Board page component.
 * 
 * Uses Suspense boundary because BoardContent uses useSearchParams(),
 * which requires client-side rendering in Next.js App Router.
 */
export default function BoardPage() {
  return (
    <Suspense fallback={<BoardLoading />}>
      <SubscriptionGate>
        <BoardContent />
      </SubscriptionGate>
    </Suspense>
  );
}
