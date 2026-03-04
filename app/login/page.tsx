"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for password reset success message
    if (searchParams.get("reset") === "success") {
      setSuccessMessage(
        "Password updated successfully! Please sign in with your new password."
      );
    }
  }, [searchParams]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
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
          Welcome Back
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Sign in to StitchQueue
        </p>

        {successMessage && (
          <div
            style={{
              backgroundColor: "#e8f5e9",
              border: "1px solid #c8e6c9",
              color: "#2e7d32",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {successMessage}
          </div>
        )}

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

        <form onSubmit={handleLogin}>
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

          <div style={{ marginBottom: "8px" }}>
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
          </div>

          <div
            style={{
              textAlign: "right",
              marginBottom: "24px",
            }}
          >
            <Link
              href="/forgot-password"
              style={{
                color: "#98823a",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
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
            {loading ? "Signing in..." : "Sign In"}
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
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "#98823a", fontWeight: "bold" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
