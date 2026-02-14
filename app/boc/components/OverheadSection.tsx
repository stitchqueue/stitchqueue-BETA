"use client";

import type { OverheadItem } from "../../types";
import Tooltip from "../../components/Tooltip";

interface Props {
  items: OverheadItem[];
  onChange: (items: OverheadItem[]) => void;
  total: number;
}

export default function OverheadSection({ items, onChange, total }: Props) {
  const updateItem = (index: number, field: "label" | "amount", value: string) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      if (field === "label") return { ...item, label: value };
      return { ...item, amount: parseFloat(value) || 0 };
    });
    onChange(updated);
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-plum mb-4">
        Monthly Overhead ($){" "}
        <Tooltip content="Fixed costs you pay every month whether you quilt or not — machine payments, insurance, rent, software, etc." position="right" />
      </h3>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2 items-end">
            <div>
              {index === 0 && (
                <label className="block text-sm font-bold text-muted mb-2">
                  Item
                </label>
              )}
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, "label", e.target.value)}
                placeholder="Add your own..."
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div>
              {index === 0 && (
                <label className="block text-sm font-bold text-muted mb-2">
                  $/month
                </label>
              )}
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.amount || ""}
                onChange={(e) => updateItem(index, "amount", e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Auto total */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-bold text-muted">Monthly Total:</span>
        <span className="text-lg font-bold text-plum">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted mt-3 italic">
        Tip: Enter your actual monthly payment for financed equipment. For
        paid-off items, you can spread the cost over time (e.g., $20,000
        machine &divide; 240 months = $83/month)
      </p>
    </div>
  );
}
