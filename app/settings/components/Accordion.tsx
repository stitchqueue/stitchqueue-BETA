/**
 * Accordion Components
 * 
 * Reusable accordion header and body for collapsible sections.
 * 
 * @module settings/components/Accordion
 */

"use client";

export type SectionKey = "business" | "tax" | "pricing" | "bobbin" | "batting" | "data" | "subscription" | "intake";

interface AccordionHeaderProps {
  sectionKey: SectionKey;
  label: string;
  icon: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
}

/**
 * Clickable header for an accordion section.
 * Shows icon, label, optional subtitle, and expand/collapse indicator.
 */
export function AccordionHeader({
  sectionKey,
  label,
  icon,
  subtitle,
  isOpen,
  onToggle,
}: AccordionHeaderProps) {
  return (
    <button
      onClick={() => onToggle(sectionKey)}
      className={`w-full flex items-center justify-between px-5 py-4 bg-white border border-line rounded-xl hover:bg-plum/5 transition-colors ${
        isOpen ? "rounded-b-none border-b-0" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div className="text-left">
          <span className="font-bold text-sm text-plum">{label}</span>
          {subtitle && (
            <p className="text-xs text-muted mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <span
        className={`text-muted text-sm transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        ▼
      </span>
    </button>
  );
}

interface AccordionBodyProps {
  isOpen: boolean;
  children: React.ReactNode;
}

/**
 * Collapsible body for accordion content.
 * Only renders children when isOpen is true.
 */
export function AccordionBody({ isOpen, children }: AccordionBodyProps) {
  if (!isOpen) return null;
  return (
    <div className="bg-white border border-line border-t-0 rounded-b-xl px-5 py-6 space-y-6">
      {children}
    </div>
  );
}
