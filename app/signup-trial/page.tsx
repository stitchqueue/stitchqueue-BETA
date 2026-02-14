"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { getOrganizationId } from "../lib/storage/auth";

const MONTHLY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!;
const ANNUAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!;

export default function SignupTrialPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signup");
      return;
    }
    if (user) {
      getOrganizationId().then(setOrganizationId);
    }
  }, [user, authLoading, router]);

  const handleSelectPlan = async (priceId: string) => {
    if (!user) return;
    if (!organizationId) {
      setError("Account setup incomplete — please contact support.");
      return;
    }
    if (!priceId) {
      setError("Plan configuration missing — please contact support.");
      return;
    }

    setLoading(priceId);
    setError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          organizationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setLoading(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f0f0f0",
            borderTopColor: "#4e283a",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 16px",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#4e283a",
              marginBottom: "8px",
            }}
          >
            Choose Your Plan
          </h1>
          <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5" }}>
            Start your <strong>14-day free trial</strong> — no charge until the trial ends.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              color: "#c00",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "24px",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Plan Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Monthly Plan */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px 24px",
              boxShadow: "0 4px 16px rgba(78,40,58,0.15)",
              border: "2px solid #98823a",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Badge */}
            <div
              style={{
                position: "absolute",
                top: "-12px",
                right: "20px",
                backgroundColor: "#98823a",
                color: "white",
                padding: "4px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              MOST POPULAR
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#4e283a",
                marginBottom: "4px",
              }}
            >
              Monthly
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
              Pay as you go, cancel anytime
            </p>
            <div style={{ marginBottom: "24px" }}>
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: "bold",
                  color: "#4e283a",
                }}
              >
                $19
              </span>
              <span style={{ color: "#666", fontSize: "16px" }}>/month</span>
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 24px 0",
                flex: 1,
              }}
            >
              {[
                "Full workflow management",
                "Pricing calculator",
                "Client communication",
                "Photo uploads",
                "Unlimited projects",
              ].map((feature) => (
                <li
                  key={feature}
                  style={{
                    padding: "6px 0",
                    fontSize: "14px",
                    color: "#444",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: "#98823a", fontWeight: "bold" }}>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectPlan(MONTHLY_PRICE_ID)}
              disabled={loading !== null}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#4e283a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: loading !== null ? "not-allowed" : "pointer",
                opacity: loading !== null ? 0.6 : 1,
              }}
            >
              {loading === MONTHLY_PRICE_ID
                ? "Redirecting..."
                : "Start 14-Day Trial"}
            </button>
          </div>

          {/* Annual Plan */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px 24px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              border: "2px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#4e283a",
                marginBottom: "4px",
              }}
            >
              Annual
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
              Best value — save $38/year
            </p>
            <div style={{ marginBottom: "24px" }}>
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: "bold",
                  color: "#4e283a",
                }}
              >
                $190
              </span>
              <span style={{ color: "#666", fontSize: "16px" }}>/year</span>
              <div
                style={{
                  fontSize: "13px",
                  color: "#98823a",
                  fontWeight: "600",
                  marginTop: "4px",
                }}
              >
                That&apos;s $15.83/month
              </div>
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 24px 0",
                flex: 1,
              }}
            >
              {[
                "Everything in Monthly",
                "Save $38 per year",
                "Priority support",
                "Early access to new features",
                "Lock in your rate",
              ].map((feature) => (
                <li
                  key={feature}
                  style={{
                    padding: "6px 0",
                    fontSize: "14px",
                    color: "#444",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: "#98823a", fontWeight: "bold" }}>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectPlan(ANNUAL_PRICE_ID)}
              disabled={loading !== null}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "white",
                color: "#4e283a",
                border: "2px solid #4e283a",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: loading !== null ? "not-allowed" : "pointer",
                opacity: loading !== null ? 0.6 : 1,
              }}
            >
              {loading === ANNUAL_PRICE_ID
                ? "Redirecting..."
                : "Start 14-Day Trial"}
            </button>
          </div>
        </div>

        {/* Trust messaging */}
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            <strong style={{ color: "#4e283a" }}>How the trial works:</strong>{" "}
            A credit card is required to start your trial, but you won&apos;t be
            charged until the 14-day trial ends. Cancel anytime before the trial
            is over and you won&apos;t pay a thing.
          </p>
        </div>
      </div>
    </div>
  );
}
