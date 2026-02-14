import { useState } from "react";
import { storage } from "../../lib/storage";
import type { Settings, BattingOption } from "../../types";

export function useBattingOptions(
  settings: Settings,
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
) {
  const [newBattingName, setNewBattingName] = useState("");
  const [newBattingWidth, setNewBattingWidth] = useState("");
  const [newBattingPrice, setNewBattingPrice] = useState("");
  const [editingBatting, setEditingBatting] = useState<string | null>(null);
  const [editBattingName, setEditBattingName] = useState("");
  const [editBattingWidth, setEditBattingWidth] = useState("");
  const [editBattingPrice, setEditBattingPrice] = useState("");

  const onAddBatting = async () => {
    if (!newBattingName || !newBattingWidth || !newBattingPrice) {
      alert("Please enter batting name, width, and price per inch");
      return;
    }

    const newBatting: BattingOption = {
      name: newBattingName,
      widthInches: parseFloat(newBattingWidth),
      pricePerInch: parseFloat(newBattingPrice),
      isDefault: settings.battingOptions.length === 0,
    };

    const updated = {
      ...settings,
      battingOptions: [...settings.battingOptions, newBatting],
    };

    setSettings(updated);
    await storage.saveSettings(updated);
    setNewBattingName("");
    setNewBattingWidth("");
    setNewBattingPrice("");
  };

  const onDelete = async (name: string, width: number) => {
    if (!confirm(`Delete batting option "${name}" (${width}")?`)) return;

    const updated = {
      ...settings,
      battingOptions: settings.battingOptions.filter(
        (b) => !(b.name === name && b.widthInches === width)
      ),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const onSetDefault = async (name: string, width: number) => {
    const updated = {
      ...settings,
      battingOptions: settings.battingOptions.map((b) => ({
        ...b,
        isDefault: b.name === name && b.widthInches === width,
      })),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const onStartEdit = (batting: BattingOption) => {
    const key = `${batting.name}-${batting.widthInches}`;
    setEditingBatting(key);
    setEditBattingName(batting.name);
    setEditBattingWidth(batting.widthInches.toString());
    setEditBattingPrice(batting.pricePerInch.toString());
  };

  const onSaveEdit = async (
    originalName: string,
    originalWidth: number
  ) => {
    if (!editBattingName || !editBattingWidth || !editBattingPrice) {
      alert("Please enter batting name, width, and price");
      return;
    }

    const updated = {
      ...settings,
      battingOptions: settings.battingOptions.map((b) =>
        b.name === originalName && b.widthInches === originalWidth
          ? {
              ...b,
              name: editBattingName,
              widthInches: parseFloat(editBattingWidth),
              pricePerInch: parseFloat(editBattingPrice),
            }
          : b
      ),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
    setEditingBatting(null);
  };

  const onCancelEdit = () => {
    setEditingBatting(null);
    setEditBattingName("");
    setEditBattingWidth("");
    setEditBattingPrice("");
  };

  return {
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
  };
}
