"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { getSubscriptionInfo } from "../lib/subscription";
import type { SubscriptionInfo } from "../lib/subscription";

export default function Header() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const info = await getSubscriptionInfo(user.id, user.email ?? "");
      setSubscription(info);
    }
    loadSubscription();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  const handleSettingsNav = (section: string) => {
    setMenuOpen(false);
    router.push(`/settings?section=${section}`);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setMenuOpen(false);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
      setLoggingOut(false);
    }
  };

  const settingsItems = [
    { key: "business", label: "Business Info", icon: "🏢" },
    { key: "pricing", label: "Pricing Rates", icon: "💲" },
    { key: "bobbin", label: "Bobbin Options", icon: "🧵" },
    { key: "batting", label: "Batting Options", icon: "🛏️" },
  ];

  const hasFullAccess = subscription?.hasAccess ?? false;

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

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-10 h-10 rounded-xl transition-colors flex items-center justify-center text-xl font-bold ${
              menuOpen ? "bg-white/30" : "bg-white/10 hover:bg-white/20"
            }`}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-line overflow-hidden"
            >
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Business Tools
              </div>

              {hasFullAccess ? (
                <>
                  <button
                    onClick={() => navigate("/boc")}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-plum/5 hover:text-plum transition-colors flex items-center gap-3"
                  >
                    <span className="text-base">🧮</span>
                    <span className="font-medium">Business Calculator</span>
                  </button>
                  <button
                    onClick={() => handleSettingsNav("data")}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-plum/5 hover:text-plum transition-colors flex items-center gap-3"
                  >
                    <span className="text-base">📊</span>
                    <span className="font-medium">Reports & Data</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/signup-trial")}
                  className="w-full px-4 py-3 text-left text-sm text-plum hover:bg-plum/5 transition-colors flex items-center gap-3"
                >
                  <span className="text-base">⭐</span>
                  <div>
                    <div className="font-medium">Unlock Full Access</div>
                    <div className="text-xs text-gray-400">14-day free trial</div>
                  </div>
                </button>
              )}

              <div className="border-t border-line" />

              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Settings
              </div>
              {settingsItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleSettingsNav(item.key)}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-plum/5 hover:text-plum transition-colors flex items-center gap-3"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}

              <div className="border-t border-line" />

              <a
                href="mailto:support@stitchqueue.com"
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-plum/5 hover:text-plum transition-colors flex items-center gap-3"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-base">📧</span>
                <span className="font-medium">Contact Support</span>
              </a>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.location.reload();
                }}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-plum/5 hover:text-plum transition-colors flex items-center gap-3 md:hidden"
              >
                <span className="text-base">🔄</span>
                <span className="font-medium">Refresh App</span>
              </button>

              <div className="border-t border-line" />

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 disabled:opacity-50"
              >
                <span className="text-base">{loggingOut ? "⏳" : "👋"}</span>
                <span className="font-medium">
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
