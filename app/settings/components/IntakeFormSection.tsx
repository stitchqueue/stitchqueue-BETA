"use client";

import { useState, useEffect } from "react";
import { AccordionHeader, AccordionBody, type SectionKey } from "./Accordion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth-context";
import { getOrganizationId } from "../../lib/storage/auth";

interface Props {
  isOpen: boolean;
  onToggle: (key: SectionKey) => void;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://beta.stitchqueue.com";

export default function IntakeFormSection({ isOpen, onToggle }: Props) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [slug, setSlug] = useState("");
  const [autoResponse, setAutoResponse] = useState(
    "Hi {client_name}, thank you for your quilting request! We've received your information and will be in touch soon."
  );
  const [notificationEmail, setNotificationEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [slugError, setSlugError] = useState("");

  // Load current settings
  useEffect(() => {
    async function load() {
      const orgId = await getOrganizationId();
      if (!orgId) return;

      const { data } = await supabase
        .from("organizations")
        .select(
          "intake_form_enabled, intake_form_slug, intake_auto_response, intake_notification_email"
        )
        .eq("id", orgId)
        .single();

      if (data) {
        setEnabled(data.intake_form_enabled ?? false);
        setSlug(data.intake_form_slug ?? "");
        if (data.intake_auto_response) setAutoResponse(data.intake_auto_response);
        setNotificationEmail(data.intake_notification_email ?? "");
      }
      setLoading(false);
    }
    load();
  }, []);

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSave = async () => {
    const cleanSlug = slugify(slug);

    if (enabled && !cleanSlug) {
      setSlugError("A URL slug is required when the form is enabled.");
      return;
    }

    setSlugError("");
    setSaving(true);

    try {
      const orgId = await getOrganizationId();
      if (!orgId) return;

      const { error } = await supabase
        .from("organizations")
        .update({
          intake_form_enabled: enabled,
          intake_form_slug: cleanSlug || null,
          intake_auto_response: autoResponse,
          intake_notification_email: notificationEmail || null,
        })
        .eq("id", orgId);

      if (error) {
        if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
          setSlugError("This URL slug is already taken. Try a different one.");
        } else {
          console.error("Error saving intake settings:", error);
        }
      } else {
        setSlug(cleanSlug);
      }
    } finally {
      setSaving(false);
    }
  };

  const formUrl = slug ? `${APP_URL}/intake/${slug}` : "";
  const embedCode = slug
    ? `<iframe src="${formUrl}" width="100%" height="800" frameborder="0" style="border: none;"></iframe>`
    : "";

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <>
      <AccordionHeader
        sectionKey={"intake" as SectionKey}
        label="Client Intake Form"
        icon="📋"
        subtitle="Public form for new client requests"
        isOpen={isOpen}
        onToggle={onToggle}
      />
      <AccordionBody isOpen={isOpen}>
        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Enable toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="accent-plum w-4 h-4"
                />
                <span className="text-sm font-bold text-plum">
                  Enable Intake Form
                </span>
              </label>
            </div>

            {/* URL Slug */}
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted whitespace-nowrap">
                  {APP_URL}/intake/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugError("");
                  }}
                  placeholder="your-business-name"
                  className="flex-1 px-4 py-2 border border-line rounded-xl"
                />
              </div>
              {slugError && (
                <p className="text-red-500 text-xs mt-1">{slugError}</p>
              )}
              <p className="text-xs text-muted mt-1">
                Letters, numbers, and hyphens only. This is the link you share
                with clients.
              </p>
            </div>

            {/* Notification email */}
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Notification Email
              </label>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-line rounded-xl"
              />
              <p className="text-xs text-muted mt-1">
                Where to send new request notifications. Defaults to your
                account email if blank.
              </p>
            </div>

            {/* Auto-response template */}
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Auto-Response Email
              </label>
              <textarea
                rows={4}
                value={autoResponse}
                onChange={(e) => setAutoResponse(e.target.value)}
                className="w-full px-4 py-2 border border-line rounded-xl resize-none"
              />
              <p className="text-xs text-muted mt-1">
                Sent to clients after they submit. Use{" "}
                <code className="bg-background px-1 rounded">{"{client_name}"}</code>{" "}
                and{" "}
                <code className="bg-background px-1 rounded">{"{business_name}"}</code>{" "}
                as placeholders.
              </p>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-plum text-white px-6 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Intake Settings"}
            </button>

            {/* Generated URLs + embed code */}
            {slug && (
              <div className="border-t border-line pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Direct Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={formUrl}
                      className="flex-1 px-4 py-2 border border-line rounded-xl bg-background text-sm"
                    />
                    <button
                      onClick={() => handleCopy(formUrl)}
                      className="px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors text-sm"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Embed Code
                  </label>
                  <textarea
                    readOnly
                    rows={3}
                    value={embedCode}
                    className="w-full px-4 py-2 border border-line rounded-xl bg-background text-xs font-mono resize-none"
                  />
                  <button
                    onClick={() => handleCopy(embedCode)}
                    className="mt-2 px-4 py-2 border border-line rounded-xl hover:bg-white transition-colors text-sm"
                  >
                    Copy Embed Code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AccordionBody>
    </>
  );
}
