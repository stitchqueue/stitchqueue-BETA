import { Suspense } from "react";
import { createAuthenticatedClient } from "../lib/supabase-server";
import { checkBOCAccess } from "../lib/server-boc";
import BOCPageClient from "./BOCPageClient";

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

export default async function BOCPage() {
  // Server-side BOC purchase check
  let serverPurchased = false;

  try {
    const supabase = await createAuthenticatedClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const access = await checkBOCAccess(user.id, user.email);
      serverPurchased = access.hasPurchased;
    }
  } catch {
    // If auth fails, let the client-side SubscriptionGate handle redirect
  }

  return (
    <Suspense fallback={<BOCLoading />}>
      <BOCPageClient serverPurchased={serverPurchased} />
    </Suspense>
  );
}
