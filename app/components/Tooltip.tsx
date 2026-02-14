"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export default function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = trigger.top - tooltip.height - gap;
        left = trigger.left + trigger.width / 2 - tooltip.width / 2;
        break;
      case "bottom":
        top = trigger.bottom + gap;
        left = trigger.left + trigger.width / 2 - tooltip.width / 2;
        break;
      case "left":
        top = trigger.top + trigger.height / 2 - tooltip.height / 2;
        left = trigger.left - tooltip.width - gap;
        break;
      case "right":
        top = trigger.top + trigger.height / 2 - tooltip.height / 2;
        left = trigger.right + gap;
        break;
    }

    // Keep within viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tooltip.width - 8));
    top = Math.max(8, top);

    setCoords({ top, left });
  }, [visible, position]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-plum/10 text-plum text-xs font-bold hover:bg-plum/20 transition-colors cursor-help"
        aria-label={content}
      >
        {children || "?"}
      </button>
      {visible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-[100] max-w-xs px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
          style={{ top: coords.top, left: coords.left }}
        >
          {content}
        </div>
      )}
    </>
  );
}
