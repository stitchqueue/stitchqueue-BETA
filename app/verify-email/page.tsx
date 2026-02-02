"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "verifying" | "success" | "error" | "creating"
  >("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the current session - Supabase should have set it from the email link
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          // No session - invalid or expired link
          setStatus("error");
          setError(
            "Verification link is invalid or has expired. Please try signing up again."
          );
          return;
        }

        // Check if user already has a profile (already verified before)
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (existingProfile) {
          // Already set up - just redirect
          setStatus("success");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Email verified - now create the organization and profile
        setStatus("creating");

        // Get business name from user metadata (stored during signup)
        const businessName =
          session.user.user_metadata?.business_name || "My Business";

        // Create organization
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: businessName,
            owner_id: session.user.id,
          })
          .select()
          .single();

        if (orgError) {
          throw orgError;
        }

        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: session.user.id,
          organization_id: org.id,
          email: session.user.email,
          role: "owner",
        });

        if (profileError) {
          throw profileError;
        }

        // Success!
        setStatus("success");
        setTimeout(() => router.push("/"), 2000);
      } catch (err: unknown) {
        console.error("Verification error:", err);
        setStatus("error");
        const errorMessage =
          err instanceof Error ? err.message : "Verification failed";
        setError(errorMessage);
      }
    };

    handleEmailVerification();
  }, [router]);

  if (status === "verifying") {
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
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 20px",
              border: "4px solid #f0f0f0",
              borderTopColor: "#4e283a",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#4e283a",
              marginBottom: "12px",
            }}
          >
            Verifying Email...
          </h1>
          <p style={{ color: "#666" }}>
            Please wait while we verify your email.
          </p>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (status === "creating") {
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
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 20px",
              border: "4px solid #f0f0f0",
              borderTopColor: "#4e283a",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#4e283a",
              marginBottom: "12px",
            }}
          >
            Setting Up Your Account...
          </h1>
          <p style={{ color: "#666" }}>
            Creating your workspace. This will only take a moment.
          </p>
          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (status === "success") {
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
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "400px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#e8f5e9",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "28px",
            }}
          >
            ✓
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#4e283a",
              marginBottom: "12px",
            }}
          >
            Email Verified!
          </h1>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            Your account is ready. Redirecting you to StitchQueue...
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#4e283a",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Error state
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
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "#ffebee",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "28px",
          }}
        >
          ✕
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#4e283a",
            marginBottom: "12px",
          }}
        >
          Verification Failed
        </h1>
        <p style={{ color: "#666", marginBottom: "24px", lineHeight: "1.5" }}>
          {error ||
            "We couldn't verify your email. The link may have expired or already been used."}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/signup"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#4e283a",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Try Again
          </Link>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "white",
              color: "#4e283a",
              border: "2px solid #4e283a",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
