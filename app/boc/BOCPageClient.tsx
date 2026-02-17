"use client";

import BOCForm from "./BOCForm";
import SubscriptionGate from "../components/SubscriptionGate";
import ErrorBoundary from "../components/ErrorBoundary";

interface BOCPageClientProps {
  serverPurchased: boolean;
}

export default function BOCPageClient({ serverPurchased }: BOCPageClientProps) {
  return (
    <ErrorBoundary fallbackTitle="BOC error">
      <SubscriptionGate>
        <BOCForm serverPurchased={serverPurchased} />
      </SubscriptionGate>
    </ErrorBoundary>
  );
}
