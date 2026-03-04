"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import FeedbackModal from "./FeedbackModal";

export default function FeedbackButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-plum hover:bg-plum/90 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105 print:hidden"
        aria-label="Send feedback"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-[5.5rem] right-6 z-40 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg shadow-lg print:hidden whitespace-nowrap">
          Send Feedback
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}

      {/* Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}