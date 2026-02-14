/**
 * BobbinOptionsSection Component
 * 
 * Manages bobbin options (PRO tier only).
 * Supports add, edit, delete, and set default.
 * 
 * @module settings/components/BobbinOptionsSection
 */

"use client";

import type { Settings, BobbinOption } from "../../types";
import { AccordionHeader, AccordionBody, SectionKey } from "./Accordion";

interface BobbinOptionsSectionProps {
  settings: Settings;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;

  // New bobbin form state
  newBobbinName: string;
  setNewBobbinName: (value: string) => void;
  newBobbinPrice: string;
  setNewBobbinPrice: (value: string) => void;
  onAddBobbin: () => void;
  
  // Edit state
  editingBobbin: string | null;
  editBobbinName: string;
  setEditBobbinName: (value: string) => void;
  editBobbinPrice: string;
  setEditBobbinPrice: (value: string) => void;
  onStartEdit: (bobbin: BobbinOption) => void;
  onSaveEdit: (originalName: string) => void;
  onCancelEdit: () => void;
  
  // Actions
  onDelete: (name: string) => void;
  onSetDefault: (name: string) => void;
}

/**
 * Bobbin options settings section.
 *
 * Features:
 * - Add new bobbin options with name and price
 * - Edit existing options inline
 * - Delete options (with confirmation)
 * - Set default option
 */
export default function BobbinOptionsSection({
  settings,
  isOpen,
  onToggle,
  newBobbinName,
  setNewBobbinName,
  newBobbinPrice,
  setNewBobbinPrice,
  onAddBobbin,
  editingBobbin,
  editBobbinName,
  setEditBobbinName,
  editBobbinPrice,
  setEditBobbinPrice,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onSetDefault,
}: BobbinOptionsSectionProps) {
  const bobbinOptions = settings.bobbinOptions || [];

  return (
    <div>
      <AccordionHeader
        sectionKey="bobbin"
        label="Bobbin Options"
        icon="🧵"
        subtitle={`${bobbinOptions.length} option${bobbinOptions.length !== 1 ? "s" : ""} saved`}
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
            {/* Add New Bobbin Form */}
            <div className="p-4 bg-background rounded-xl">
              <h3 className="text-sm font-bold text-plum mb-3">
                Add Bobbin Option
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Bobbin name (e.g., Prewound White)"
                  value={newBobbinName}
                  onChange={(e) => setNewBobbinName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-line rounded-xl"
                />
                <div className="flex gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Price"
                      value={newBobbinPrice}
                      onChange={(e) => setNewBobbinPrice(e.target.value)}
                      className="w-24 sm:w-32 pl-7 pr-3 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <button
                    onClick={onAddBobbin}
                    className="px-6 py-2 bg-plum text-white rounded-xl font-bold whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Bobbin Options List */}
            <div className="space-y-2">
              {bobbinOptions.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">
                  No bobbin options yet. Add one above!
                </p>
              ) : (
                bobbinOptions.map((bobbin) => (
                  <div
                    key={bobbin.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-line rounded-xl"
                  >
                    {editingBobbin === bobbin.name ? (
                      /* Edit Mode */
                      <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={editBobbinName}
                          onChange={(e) => setEditBobbinName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-line rounded-lg"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                            $
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editBobbinPrice}
                            onChange={(e) => setEditBobbinPrice(e.target.value)}
                            className="w-24 pl-7 pr-3 py-2 border border-line rounded-lg"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onSaveEdit(bobbin.name)}
                            className="px-3 py-1 text-xs bg-plum text-white rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={onCancelEdit}
                            className="px-3 py-1 text-xs border border-line rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{bobbin.name}</div>
                          <div className="text-xs text-muted mt-1">
                            ${bobbin.price.toFixed(2)} each
                            {bobbin.isDefault && (
                              <span className="ml-2 px-2 py-0.5 bg-gold/20 text-gold rounded text-xs font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onStartEdit(bobbin)}
                            className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                          >
                            Edit
                          </button>
                          {!bobbin.isDefault && (
                            <button
                              onClick={() => onSetDefault(bobbin.name)}
                              className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(bobbin.name)}
                            className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
      </AccordionBody>
    </div>
  );
}
