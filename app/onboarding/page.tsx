"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { getOrganizationId } from "../lib/storage/auth";

const SERVICE_OPTIONS = [
  { key: "e2e", label: "Edge-to-edge quilting" },
  { key: "custom", label: "Custom quilting" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [triedSubmit, setTriedSubmit] = useState(false);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const orgId = await getOrganizationId();
      if (!orgId) {
        router.push("/login");
        return;
      }

      // Check if already completed onboarding
      const { data: org } = await supabase
        .from("organizations")
        .select("name, onboarding_completed")
        .eq("id", orgId)
        .single();

      if (org?.onboarding_completed) {
        router.push("/board");
        return;
      }

      // Pre-fill business name
      if (org?.name && org.name !== "My Business") {
        setBusinessName(org.name);
      }

      setLoading(false);
    }
    init();
  }, [router]);

  const handleServiceToggle = (key: string) => {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const orgId = await getOrganizationId();
      if (!orgId) return;

      const updates: Record<string, unknown> = {
        onboarding_completed: true,
      };

      if (businessName.trim()) {
        updates.name = businessName.trim();
      }

      await supabase.from("organizations").update(updates).eq("id", orgId);

      router.push("/board");
    } catch (err) {
      console.error("Onboarding error:", err);
      // Still redirect — onboarding is optional
      router.push("/board");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plum" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-plum text-white px-4 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display font-bold text-2xl tracking-wide">
            StitchQueue
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-line rounded-xl p-6 sm:p-8">
          {/* Welcome */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🧵</div>
            <h2 className="text-2xl font-bold text-plum mb-2">
              Welcome to StitchQueue!
            </h2>
            <p className="text-muted">
              Let&apos;s get you set up. This only takes a minute.
            </p>
          </div>

          {/* Business Name */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-muted mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Mountain View Quilting"
              className="w-full px-4 py-3 border border-line rounded-xl text-lg"
            />
          </div>

          {/* Services */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-muted mb-3">
              What services do you offer?
            </label>
            <div className="space-y-3">
              {SERVICE_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedServices.includes(opt.key)
                      ? "border-plum bg-plum/5"
                      : "border-line hover:border-plum/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(opt.key)}
                    onChange={() => handleServiceToggle(opt.key)}
                    className="accent-plum w-4 h-4"
                  />
                  <span className="font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
            {triedSubmit && selectedServices.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                Please select at least one option to continue
              </p>
            )}
          </div>

          {/* Quick tip */}
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-8">
            <p className="text-sm font-bold text-plum mb-1">Quick tip</p>
            <p className="text-sm text-muted">
              Head to the{" "}
              <span className="font-bold text-plum">Calculator</span> to set up
              your pricing rates and create your first estimate. You can also
              configure everything in{" "}
              <span className="font-bold text-plum">Settings</span> later.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              if (selectedServices.length === 0) {
                setTriedSubmit(true);
                return;
              }
              handleComplete();
            }}
            disabled={saving}
            className={`w-full bg-plum text-white py-3 rounded-xl font-bold text-lg transition-opacity disabled:opacity-50 ${
              selectedServices.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {saving ? "Setting up..." : "Start Using StitchQueue"}
          </button>

          {/* Skip */}
          <button
            onClick={handleComplete}
            className="w-full text-muted text-sm mt-3 hover:text-plum transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
