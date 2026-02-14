import { useState } from "react";
import { storage } from "../../lib/storage";
import type { Settings, BobbinOption } from "../../types";

export function useBobbinOptions(
  settings: Settings,
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
) {
  const [newBobbinName, setNewBobbinName] = useState("");
  const [newBobbinPrice, setNewBobbinPrice] = useState("");
  const [editingBobbin, setEditingBobbin] = useState<string | null>(null);
  const [editBobbinName, setEditBobbinName] = useState("");
  const [editBobbinPrice, setEditBobbinPrice] = useState("");

  const onAddBobbin = async () => {
    if (!newBobbinName || !newBobbinPrice) {
      alert("Please enter bobbin name and price");
      return;
    }

    const newBobbin: BobbinOption = {
      name: newBobbinName,
      price: parseFloat(newBobbinPrice),
      isDefault: (settings.bobbinOptions || []).length === 0,
    };

    const updated = {
      ...settings,
      bobbinOptions: [...(settings.bobbinOptions || []), newBobbin],
    };

    setSettings(updated);
    await storage.saveSettings(updated);
    setNewBobbinName("");
    setNewBobbinPrice("");
  };

  const onDelete = async (name: string) => {
    if (!confirm(`Delete bobbin option "${name}"?`)) return;

    const updated = {
      ...settings,
      bobbinOptions: (settings.bobbinOptions || []).filter(
        (b) => b.name !== name
      ),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const onSetDefault = async (name: string) => {
    const updated = {
      ...settings,
      bobbinOptions: (settings.bobbinOptions || []).map((b) => ({
        ...b,
        isDefault: b.name === name,
      })),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
  };

  const onStartEdit = (bobbin: BobbinOption) => {
    setEditingBobbin(bobbin.name);
    setEditBobbinName(bobbin.name);
    setEditBobbinPrice(bobbin.price.toString());
  };

  const onSaveEdit = async (originalName: string) => {
    if (!editBobbinName || !editBobbinPrice) {
      alert("Please enter bobbin name and price");
      return;
    }

    const updated = {
      ...settings,
      bobbinOptions: (settings.bobbinOptions || []).map((b) =>
        b.name === originalName
          ? { ...b, name: editBobbinName, price: parseFloat(editBobbinPrice) }
          : b
      ),
    };

    setSettings(updated);
    await storage.saveSettings(updated);
    setEditingBobbin(null);
  };

  const onCancelEdit = () => {
    setEditingBobbin(null);
    setEditBobbinName("");
    setEditBobbinPrice("");
  };

  return {
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
  };
}
