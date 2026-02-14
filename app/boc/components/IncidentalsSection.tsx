"use client";

import type { IncidentalItem } from "../../types";

interface Props {
  items: IncidentalItem[];
  onChange: (items: IncidentalItem[]) => void;
  total: number;
}

export default function IncidentalsSection({ items, onChange, total }: Props) {
  const updateItem = (index: number, field: "label" | "minutes", value: string) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      if (field === "label") return { ...item, label: value };
      return { ...item, minutes: parseFloat(value) || 0 };
    });
    onChange(updated);
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-plum mb-4">
        Per-Project Incidentals (minutes)
      </h3>
      <p className="text-xs text-muted mb-4">
        Time spent on each project beyond actual quilting — these add up and
        affect your effective rate.
      </p>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2 items-end">
            <div>
              {index === 0 && (
                <label className="block text-sm font-bold text-muted mb-2">
                  Task
                </label>
              )}
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, "label", e.target.value)}
                placeholder="Label"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
            <div>
              {index === 0 && (
                <label className="block text-sm font-bold text-muted mb-2">
                  Minutes
                </label>
              )}
              <input
                type="number"
                min="0"
                step="1"
                value={item.minutes || ""}
                onChange={(e) => updateItem(index, "minutes", e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Auto total */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-bold text-muted">Total Per Project:</span>
        <span className="text-lg font-bold text-plum">
          {total} minutes
        </span>
      </div>
    </div>
  );
}
