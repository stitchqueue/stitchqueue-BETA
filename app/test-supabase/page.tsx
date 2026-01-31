"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function TestSupabasePage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id")
          .limit(1);

        if (error) {
          setStatus("success");
          setMessage(
            "Connected! RLS is blocking unauthenticated access (expected)."
          );
        } else {
          setStatus("success");
          setMessage("Connected successfully!");
        }
      } catch (err) {
        setStatus("error");
        setMessage(String(err));
      }
    }

    testConnection();
  }, []);

  const bgColor =
    status === "loading"
      ? "yellow"
      : status === "success"
      ? "lightgreen"
      : "lightcoral";

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Supabase Connection Test</h1>
      <div
        style={{
          padding: "20px",
          backgroundColor: bgColor,
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <strong>Status: {status}</strong>
        <p>{message}</p>
      </div>
      <p style={{ marginTop: "20px" }}>
        <a href="/">Back to Home</a>
      </p>
    </div>
  );
}
