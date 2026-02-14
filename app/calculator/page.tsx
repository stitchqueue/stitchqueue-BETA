/**
 * Calculator Page
 * 
 * Entry point for the /calculator route.
 * Wraps CalculatorForm in Suspense for Next.js App Router compatibility.
 * 
 * The actual calculator logic lives in CalculatorForm.tsx.
 * 
 * @module calculator/page
 */

"use client";

import { Suspense } from "react";
import CalculatorForm from "./CalculatorForm";
import SubscriptionGate from "../components/SubscriptionGate";

/**
 * Loading fallback shown while CalculatorForm loads
 */
function CalculatorLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-bold text-plum">Loading Calculator...</div>
        <div className="text-sm text-muted mt-1">Please wait</div>
      </div>
    </div>
  );
}

/**
 * Calculator page component.
 * 
 * Uses Suspense boundary because CalculatorForm uses useSearchParams(),
 * which requires client-side rendering in Next.js App Router.
 */
export default function CalculatorPage() {
  return (
    <Suspense fallback={<CalculatorLoading />}>
      <SubscriptionGate>
        <CalculatorForm />
      </SubscriptionGate>
    </Suspense>
  );
}
