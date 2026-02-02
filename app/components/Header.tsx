"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Header() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return; // Prevent double-clicks

    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-plum text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-end justify-between gap-4">
        <button onClick={() => router.push("/")} className="text-left">
          <h1 className="font-display font-bold text-2xl tracking-wide">
            StitchQueue
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Project tracking for professional quilters
          </p>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/board")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            title="Board"
          >
            📊
          </button>
          <button
            onClick={() => router.push("/archive")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            title="Archive"
          >
            🗄️
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            title="Settings"
          >
            ⚙️
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20 mx-1"></div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-red-500/80 transition-colors flex items-center justify-center disabled:opacity-50"
            title="Log Out"
          >
            {loggingOut ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>🚪</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
