"use client";

import { Suspense } from "react";
import BOCForm from "./BOCForm";
import SubscriptionGate from "../components/SubscriptionGate";

function BOCLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-bold text-plum">Loading BOC...</div>
        <div className="text-sm text-muted mt-1">Please wait</div>
      </div>
    </div>
  );
}

export default function BOCPage() {
  return (
    <Suspense fallback={<BOCLoading />}>
      <SubscriptionGate>
        <BOCForm />
      </SubscriptionGate>
    </Suspense>
  );
}
