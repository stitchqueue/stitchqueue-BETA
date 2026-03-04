"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { validators } from "../lib/validation";

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validate email format
    const emailError = validators.email(email, "Email");
    if (emailError) {
      setError(emailError.message);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // Sign up with email confirmation required
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            business_name: businessName,
          },
        },
      });

      if (authError) throw authError;

      // Check if user already exists (Supabase returns user but no session)
      if (authData.user && !authData.session) {
        // Check if this is a "user already registered" scenario
        // Supabase doesn't always throw an error for existing users
        if (authData.user.identities && authData.user.identities.length === 0) {
          setError(
            "An account with this email already exists. Please sign in instead."
          );
          setLoading(false);
          return;
        }

        // Email confirmation required - show success message
        setEmailSent(true);
      } else if (authData.user && authData.session) {
        // Email confirmation disabled in Supabase - create org immediately
        // This handles cases where email confirmation is turned off
        const { data: org, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: businessName,
            owner_id: authData.user.id,
          })
          .select()
          .single();

        if (orgError) throw orgError;

        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          organization_id: org.id,
          email: email,
          role: "owner",
        });

        if (profileError) throw profileError;

        // New user — send to plan selection
        window.location.href = "/signup-trial";
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Show confirmation message after signup
  if (emailSent) {
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
            ✉️
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#4e283a",
              marginBottom: "12px",
            }}
          >
            Check Your Email
          </h1>
          <p style={{ color: "#666", marginBottom: "16px", lineHeight: "1.5" }}>
            We sent a confirmation link to <strong>{email}</strong>
          </p>
          <p style={{ color: "#666", marginBottom: "24px", lineHeight: "1.5" }}>
            Click the link in the email to activate your account and complete
            setup.
          </p>
          <div
            style={{
              backgroundColor: "#fff8e1",
              border: "1px solid #ffecb3",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "24px",
            }}
          >
            <p style={{ color: "#f57c00", fontSize: "14px", margin: 0 }}>
              <strong>Tip:</strong> Check your spam folder if you don't see the
              email within a few minutes.
            </p>
          </div>
          <Link
            href="/login"
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
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#4e283a",
            marginBottom: "8px",
          }}
        >
          Create Account
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Start your StitchQueue free trial
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              color: "#c00",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#666",
                marginBottom: "6px",
              }}
            >
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              placeholder="Your Business Name"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#666",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#666",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                style={{
                  width: "100%",
                  padding: "12px",
                  paddingRight: "44px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "0",
                  lineHeight: "1",
                }}
              >
                {showPassword ? "\u{1F648}" : "\u{1F441}\uFE0F"}
              </button>
            </div>
            <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
              Must be at least 8 characters
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#666",
                marginBottom: "6px",
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter your password"
                style={{
                  width: "100%",
                  padding: "12px",
                  paddingRight: "44px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "0",
                  lineHeight: "1",
                }}
              >
                {showConfirmPassword ? "\u{1F648}" : "\u{1F441}\uFE0F"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#4e283a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#98823a", fontWeight: "bold" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
