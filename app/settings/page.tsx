/**
 * Settings Page
 * 
 * Entry point for the /settings route.
 * Wraps SettingsForm in Suspense for Next.js App Router compatibility.
 * 
 * The actual settings logic lives in SettingsForm.tsx.
 * 
 * @module settings/page
 */

"use client";

import { Suspense } from "react";
import SettingsForm from "./SettingsForm";

/**
 * Loading fallback shown while SettingsForm loads
 */
function SettingsLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-bold text-plum">Loading Settings...</div>
        <div className="text-sm text-muted mt-1">Please wait</div>
      </div>
    </div>
  );
}

/**
 * Settings page component.
 * 
 * Uses Suspense boundary because SettingsForm uses useSearchParams(),
 * which requires client-side rendering in Next.js App Router.
 */
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsForm />
    </Suspense>
  );
}
