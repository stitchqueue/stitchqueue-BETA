"use client";

import { useEffect, useRef, useState } from "react";

export default function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [pulling, setPulling] = useState(false);
  const touchStartY = useRef(0);
  const isActive = useRef(false);

  useEffect(() => {
    // Only activate on touch devices
    if (!("ontouchstart" in window)) return;

    const THRESHOLD = 80;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger when scrolled to the top
      if (window.scrollY !== 0) return;

      // Don't activate inside dnd-kit drag handles
      const target = e.target as HTMLElement;
      if (target.closest("[data-dnd-kit-drag-handle]") || target.closest("[style*='touch-action: none']")) {
        return;
      }

      touchStartY.current = e.touches[0].clientY;
      isActive.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isActive.current) return;

      // Deactivate if page has scrolled (user scrolled up into content)
      if (window.scrollY !== 0) {
        isActive.current = false;
        setPulling(false);
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;

      if (distance > 0) {
        // Apply diminishing pull effect
        const dampened = Math.min(distance * 0.4, 120);
        setPullDistance(dampened);
        setPulling(true);

        if (distance > 20) {
          e.preventDefault();
        }
      } else {
        setPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isActive.current) return;

      if (pullDistance >= THRESHOLD * 0.4) {
        // Threshold reached — reload
        window.location.reload();
      }

      isActive.current = false;
      setPulling(false);
      setPullDistance(0);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance]);

  if (!pulling) return null;

  const ready = pullDistance >= 80 * 0.4;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center transition-transform duration-150"
      style={{ transform: `translateY(${pullDistance - 32}px)` }}
    >
      <div className={`px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium ${
        ready ? "bg-plum text-white" : "bg-white text-plum border border-plum/20"
      }`}>
        <svg
          className={`w-4 h-4 ${ready ? "animate-spin" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
        <span>{ready ? "Release to refresh..." : "Pull to refresh..."}</span>
      </div>
    </div>
  );
}
