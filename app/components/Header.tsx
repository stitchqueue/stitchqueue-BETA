"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Header() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setShowSettingsMenu(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setShowSettingsMenu(false);
    }, 200);
  };

  const handleSettingsNav = (section: string) => {
    setShowSettingsMenu(false);
    router.push(`/settings?section=${section}`);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setShowSettingsMenu(false);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  const settingsMenuItems = [
    { key: "business", label: "Business Info", icon: "🏢" },
    { key: "pricing", label: "Pricing Rates", icon: "💲" },
    { key: "bobbin", label: "Bobbin Options", icon: "🧵" },
    { key: "batting", label: "Batting Options", icon: "🛏️" },
    { key: "data", label: "Reports & Data", icon: "📊" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-plum text-white px-4 py-3">
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
            aria-label="Board"
          >
            <span aria-hidden="true">📊</span>
          </button>
          <button
            onClick={() => router.push("/archive")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="Archive"
          >
            <span aria-hidden="true">🗄️</span>
          </button>
          <button
            onClick={() => router.push("/boc")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="Business Overhead Calculator"
          >
            <span aria-hidden="true">🧮</span>
          </button>

          {/* Settings gear with dropdown */}
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`w-10 h-10 rounded-xl transition-colors flex items-center justify-center ${
                showSettingsMenu
                  ? "bg-white/30"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              aria-label="Settings menu"
              aria-expanded={showSettingsMenu}
              aria-haspopup="menu"
            >
              <span aria-hidden="true">⚙️</span>
            </button>

            {/* Dropdown menu */}
            {showSettingsMenu && (
              <div role="menu" className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-line overflow-hidden">
                {/* Settings sections */}
                {settingsMenuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSettingsNav(item.key)}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-plum/5 hover:text-plum transition-colors flex items-center gap-3"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}

                {/* Divider */}
                <div className="border-t border-line" />

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  <span className="text-base">
                    {loggingOut ? "⏳" : "👋"}
                  </span>
                  <span className="font-medium">
                    {loggingOut ? "Signing out..." : "Sign Out"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}