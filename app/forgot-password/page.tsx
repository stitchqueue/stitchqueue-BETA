"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
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
          <p style={{ color: "#666", marginBottom: "24px", lineHeight: "1.5" }}>
            We sent a password reset link to <strong>{email}</strong>. Click the
            link in the email to reset your password.
          </p>
          <p style={{ color: "#999", fontSize: "14px", marginBottom: "24px" }}>
            Didn't receive the email? Check your spam folder or try again.
          </p>
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
            Back to Sign In
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
          Forgot Password?
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Enter your email and we'll send you a reset link.
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

        <form onSubmit={handleSubmit}>
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
            {loading ? "Sending..." : "Send Reset Link"}
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
          Remember your password?{" "}
          <Link href="/login" style={{ color: "#98823a", fontWeight: "bold" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
