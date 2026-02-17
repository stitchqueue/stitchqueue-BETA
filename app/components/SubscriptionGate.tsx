"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { getSubscriptionInfo, SubscriptionInfo } from "../lib/subscription";

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * Wraps protected page content. Checks subscription status after auth
 * resolves. Redirects to /signup-trial if no active subscription and
 * grace period has expired. Renders children otherwise.
 *
 * Does NOT block rendering while auth is loading — lets the page's
 * own auth logic handle unauthenticated redirects.
 */
export default function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    getSubscriptionInfo(user.id, user.email ?? undefined).then((info) => {
      if (!info.hasAccess) {
        router.push("/signup-trial?reason=expired");
      } else {
        setHasAccess(true);
      }
      setChecked(true);
    });
  }, [user, authLoading, router]);

  // While auth is loading or user isn't set, render children
  // (the page's own auth check will handle redirect to /login)
  if (authLoading || !user) {
    return <>{children}</>;
  }

  // While checking subscription, render nothing to avoid flash
  if (!checked) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook for components that need subscription info (e.g. TrialBanner)
 * without blocking rendering.
 */
export function useSubscriptionInfo() {
  const { user, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    getSubscriptionInfo(user.id, user.email ?? undefined).then(setInfo);
  }, [user, authLoading]);

  return info;
}
