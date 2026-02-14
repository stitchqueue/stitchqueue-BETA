"use client";

import { useState, useEffect } from "react";
import { AccordionHeader, AccordionBody, SectionKey } from "./Accordion";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";

interface Subscription {
  status: string;
  trial_start: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface SubscriptionSectionProps {
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
}

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;

function getPlanName(priceId: string | null): string {
  if (priceId === MONTHLY_PRICE_ID) return "Monthly ($19/mo)";
  if (priceId === ANNUAL_PRICE_ID) return "Annual ($190/yr)";
  return "Unknown plan";
}

function getStatusLabel(status: string): { text: string; color: string } {
  switch (status) {
    case "trialing":
      return { text: "Trial", color: "#98823a" };
    case "active":
      return { text: "Active", color: "#2e7d32" };
    case "past_due":
      return { text: "Past Due", color: "#c62828" };
    case "canceled":
      return { text: "Canceled", color: "#666" };
    case "incomplete":
      return { text: "Incomplete", color: "#f57c00" };
    default:
      return { text: status, color: "#666" };
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const end = new Date(dateStr).getTime();
  const now = Date.now();
  const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

export default function SubscriptionSection({
  isOpen,
  onToggle,
}: SubscriptionSectionProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSubscription(data);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customer_id) return;

    setPortalLoading(true);
    try {
      const res = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal session error:", err);
      alert("Could not open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  const subtitle = subscription
    ? `${getStatusLabel(subscription.status).text} — ${getPlanName(subscription.stripe_price_id)}`
    : undefined;

  return (
    <>
      <AccordionHeader
        sectionKey="subscription"
        label="Subscription"
        icon="💳"
        subtitle={subtitle}
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-plum"></div>
            <span className="text-sm text-muted">Loading subscription...</span>
          </div>
        ) : !subscription ? (
          <div className="text-center py-6">
            <p className="text-muted text-sm mb-4">
              No active subscription found.
            </p>
            <a
              href="/signup-trial"
              className="inline-block px-6 py-2 bg-plum text-white rounded-xl font-bold text-sm hover:bg-plum/90 transition-colors"
            >
              Start Your 14-Day Trial
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status + Plan row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-line rounded-xl">
                <p className="text-xs text-muted font-bold uppercase tracking-wide mb-1">
                  Status
                </p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{
                    backgroundColor: getStatusLabel(subscription.status).color,
                  }}
                >
                  {getStatusLabel(subscription.status).text}
                </span>
              </div>
              <div className="p-4 border border-line rounded-xl">
                <p className="text-xs text-muted font-bold uppercase tracking-wide mb-1">
                  Plan
                </p>
                <p className="text-sm font-bold text-plum">
                  {getPlanName(subscription.stripe_price_id)}
                </p>
              </div>
            </div>

            {/* Trial info */}
            {subscription.status === "trialing" && subscription.trial_end && (
              <div className="p-4 border border-gold/30 rounded-xl bg-gold/5">
                <p className="text-sm font-bold text-plum mb-1">
                  Trial ends {formatDate(subscription.trial_end)}
                </p>
                <p className="text-xs text-muted">
                  {getDaysRemaining(subscription.trial_end)} days remaining — you
                  won&apos;t be charged until the trial ends.
                </p>
              </div>
            )}

            {/* Billing period */}
            {subscription.status === "active" &&
              subscription.current_period_end && (
                <div className="p-4 border border-line rounded-xl">
                  <p className="text-xs text-muted font-bold uppercase tracking-wide mb-1">
                    Next billing date
                  </p>
                  <p className="text-sm font-bold text-plum">
                    {formatDate(subscription.current_period_end)}
                  </p>
                  {subscription.cancel_at_period_end && (
                    <p className="text-xs text-orange-600 mt-1 font-semibold">
                      Cancels at end of billing period
                    </p>
                  )}
                </div>
              )}

            {/* Past due warning */}
            {subscription.status === "past_due" && (
              <div className="p-4 border border-red-300 rounded-xl bg-red-50">
                <p className="text-sm font-bold text-red-700 mb-1">
                  Payment failed
                </p>
                <p className="text-xs text-red-600">
                  Please update your payment method to keep your account active.
                </p>
              </div>
            )}

            {/* Manage button */}
            {subscription.stripe_customer_id && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full sm:w-auto px-6 py-3 bg-plum text-white rounded-xl font-bold text-sm hover:bg-plum/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {portalLoading
                  ? "Opening portal..."
                  : "Manage Subscription"}
              </button>
            )}

            <p className="text-xs text-muted">
              Update your payment method, change plans, view invoices, or cancel
              your subscription through the Stripe billing portal.
            </p>
          </div>
        )}
      </AccordionBody>
    </>
  );
}
