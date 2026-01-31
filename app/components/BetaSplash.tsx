"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function BetaSplash({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const pathname = usePathname();

  // Pages that bypass the splash screen
  const bypassRoutes = ["/terms"];
  const shouldBypass = bypassRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  useEffect(() => {
    // If on a bypass route, skip the splash check
    if (shouldBypass) {
      setAccepted(true);
      return;
    }

    // Check if user has already accepted terms
    const hasAccepted = localStorage.getItem("stitchqueue_beta_accepted");
    if (hasAccepted === "true") {
      setAccepted(true);
    } else {
      setAccepted(false);
    }
  }, [shouldBypass]);

  const handleAccept = () => {
    localStorage.setItem("stitchqueue_beta_accepted", "true");
    localStorage.setItem(
      "stitchqueue_beta_accepted_date",
      new Date().toISOString()
    );
    setAccepted(true);
  };

  // Still loading - show nothing to prevent flash
  if (accepted === null) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">
        <div className="text-[#4e283a] text-lg">Loading...</div>
      </div>
    );
  }

  // User has accepted - show the app
  if (accepted) {
    return <>{children}</>;
  }

  // Show splash screen
  return (
    <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-[#e7e2dc] overflow-hidden">
        {/* Header */}
        <div className="bg-[#4e283a] px-6 py-8 text-center">
          <div className="text-4xl font-bold text-white font-serif mb-2">
            StitchQueue
          </div>
          <div className="text-[#d4c5a9] text-sm">
            Project Tracking for Professional Quilters
          </div>
        </div>

        {/* Beta Badge */}
        <div className="flex justify-center -mt-4">
          <div className="bg-[#98823a] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">
            PRIVATE BETA
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-[#1f1f1f] font-medium mb-2">
              Welcome, Beta Tester!
            </p>
            <p className="text-[#6c6c6c] text-sm leading-relaxed">
              Thank you for helping us build StitchQueue. This is a private beta
              version and your feedback is invaluable.
            </p>
          </div>

          {/* Important Notice Box */}
          <div className="bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-[#98823a] text-xl">⚠️</div>
              <div>
                <p className="text-[#1f1f1f] font-semibold text-sm mb-1">
                  Important Notice
                </p>
                <p className="text-[#6c6c6c] text-xs leading-relaxed">
                  This software is proprietary and confidential. All content,
                  features, and code are the exclusive property of{" "}
                  <span className="font-semibold text-[#4e283a]">
                    Stitched By Susan
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkbox1}
                onChange={(e) => setCheckbox1(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-[#e7e2dc] text-[#4e283a] focus:ring-[#4e283a]"
              />
              <span className="text-sm text-[#1f1f1f] leading-relaxed">
                I understand this is beta software and my data may be reset
                during development. I will export important data regularly.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkbox2}
                onChange={(e) => setCheckbox2(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-[#e7e2dc] text-[#4e283a] focus:ring-[#4e283a]"
              />
              <span className="text-sm text-[#1f1f1f] leading-relaxed">
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-[#4e283a] underline hover:text-[#98823a]"
                >
                  Terms of Service
                </Link>{" "}
                and will not copy, share, or distribute this software.
              </span>
            </label>
          </div>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={!checkbox1 || !checkbox2}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all ${
              checkbox1 && checkbox2
                ? "bg-[#4e283a] hover:bg-[#3a1e2b] cursor-pointer shadow-md hover:shadow-lg"
                : "bg-[#c9c0b8] cursor-not-allowed"
            }`}
          >
            Enter Beta
          </button>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#e7e2dc] text-center">
            <p className="text-[#6c6c6c] text-xs">
              © 2026 Stitched By Susan. All rights reserved.
            </p>
            <p className="text-[#98823a] text-xs mt-1">
              Questions? Contact David Smith at beta@stitchqueue.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
