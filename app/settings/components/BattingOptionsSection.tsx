/**
 * BattingOptionsSection Component
 * 
 * Manages batting options (PRO tier only).
 * Supports add, edit, delete, and set default.
 * 
 * @module settings/components/BattingOptionsSection
 */

"use client";

import type { Settings, BattingOption } from "../../types";
import { AccordionHeader, AccordionBody, SectionKey } from "./Accordion";

interface BattingOptionsSectionProps {
  settings: Settings;
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
  onEnablePaidTier: () => void;
  
  // New batting form state
  newBattingName: string;
  setNewBattingName: (value: string) => void;
  newBattingWidth: string;
  setNewBattingWidth: (value: string) => void;
  newBattingPrice: string;
  setNewBattingPrice: (value: string) => void;
  onAddBatting: () => void;
  
  // Edit state
  editingBatting: string | null;
  editBattingName: string;
  setEditBattingName: (value: string) => void;
  editBattingWidth: string;
  setEditBattingWidth: (value: string) => void;
  editBattingPrice: string;
  setEditBattingPrice: (value: string) => void;
  onStartEdit: (batting: BattingOption) => void;
  onSaveEdit: (originalName: string, originalWidth: number) => void;
  onCancelEdit: () => void;
  
  // Actions
  onDelete: (name: string, width: number) => void;
  onSetDefault: (name: string, width: number) => void;
}

/**
 * Batting options settings section.
 * 
 * PRO tier only - shows upgrade prompt for FREE tier users.
 * 
 * Features:
 * - Add new batting options with name, width, and price per inch
 * - Edit existing options inline
 * - Delete options (with confirmation)
 * - Set default option
 */
export default function BattingOptionsSection({
  settings,
  isOpen,
  onToggle,
  onEnablePaidTier,
  newBattingName,
  setNewBattingName,
  newBattingWidth,
  setNewBattingWidth,
  newBattingPrice,
  setNewBattingPrice,
  onAddBatting,
  editingBatting,
  editBattingName,
  setEditBattingName,
  editBattingWidth,
  setEditBattingWidth,
  editBattingPrice,
  setEditBattingPrice,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onSetDefault,
}: BattingOptionsSectionProps) {
  const isPaidTier = settings.isPaidTier || false;
  const battingOptions = settings.battingOptions || [];

  return (
    <div>
      <AccordionHeader
        sectionKey="batting"
        label="Batting Options"
        icon="🛏️"
        subtitle={
          isPaidTier
            ? `${battingOptions.length} option${battingOptions.length !== 1 ? "s" : ""} saved`
            : "Available in PAID tier"
        }
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
        {!isPaidTier ? (
          <div className="p-6 bg-gold/10 rounded-xl text-center">
            <p className="text-sm text-muted mb-4">
              Upgrade to PAID tier to save batting options
            </p>
            <button
              onClick={onEnablePaidTier}
              className="px-6 py-3 bg-plum text-white rounded-xl font-bold"
            >
              Enable PAID Tier (Demo)
            </button>
          </div>
        ) : (
          <>
            {/* Add New Batting Form */}
            <div className="p-4 bg-background rounded-xl">
              <h3 className="text-sm font-bold text-plum mb-3">
                Add Batting Option
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Batting name (e.g., Warm & Natural)"
                  value={newBattingName}
                  onChange={(e) => setNewBattingName(e.target.value)}
                  className="sm:col-span-2 px-4 py-2 border border-line rounded-xl"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Width (in)"
                  value={newBattingWidth}
                  onChange={(e) => setNewBattingWidth(e.target.value)}
                  className="px-4 py-2 border border-line rounded-xl"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="$/inch"
                  value={newBattingPrice}
                  onChange={(e) => setNewBattingPrice(e.target.value)}
                  className="px-4 py-2 border border-line rounded-xl"
                />
                <button
                  onClick={onAddBatting}
                  className="sm:col-span-2 px-6 py-2 bg-plum text-white rounded-xl font-bold"
                >
                  Add Batting Option
                </button>
              </div>
            </div>

            {/* Batting Options List */}
            <div className="space-y-2">
              {battingOptions.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">
                  No batting options yet. Add one above!
                </p>
              ) : (
                battingOptions.map((batting) => {
                  const key = `${batting.name}-${batting.widthInches}`;
                  return (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-line rounded-xl"
                    >
                      {editingBatting === key ? (
                        /* Edit Mode */
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <input
                            type="text"
                            value={editBattingName}
                            onChange={(e) => setEditBattingName(e.target.value)}
                            className="sm:col-span-2 px-3 py-2 border border-line rounded-lg"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editBattingWidth}
                            onChange={(e) => setEditBattingWidth(e.target.value)}
                            className="px-3 py-2 border border-line rounded-lg"
                            placeholder="Width"
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            value={editBattingPrice}
                            onChange={(e) => setEditBattingPrice(e.target.value)}
                            className="px-3 py-2 border border-line rounded-lg"
                            placeholder="$/in"
                          />
                          <div className="sm:col-span-4 flex gap-2">
                            <button
                              onClick={() =>
                                onSaveEdit(batting.name, batting.widthInches)
                              }
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
                            <div className="font-bold text-sm">
                              {batting.name} - {batting.widthInches}&quot; wide
                            </div>
                            <div className="text-xs text-muted mt-1">
                              ${batting.pricePerInch.toFixed(4)}/inch
                              {batting.isDefault && (
                                <span className="ml-2 px-2 py-0.5 bg-gold/20 text-gold rounded text-xs font-bold">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onStartEdit(batting)}
                              className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                            >
                              Edit
                            </button>
                            {!batting.isDefault && (
                              <button
                                onClick={() =>
                                  onSetDefault(batting.name, batting.widthInches)
                                }
                                className="px-3 py-1 text-xs border border-line rounded-lg hover:bg-background"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() =>
                                onDelete(batting.name, batting.widthInches)
                              }
                              className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </AccordionBody>
    </div>
  );
}
