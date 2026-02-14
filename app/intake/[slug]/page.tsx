"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

interface OrgInfo {
  id: string;
  name: string;
  intake_form_enabled: boolean;
}

const SERVICE_OPTIONS = [
  "Edge-to-edge",
  "Custom quilting",
  "Other",
];

export default function PublicIntakeForm() {
  const params = useParams();
  const slug = params.slug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientStreet, setClientStreet] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientState, setClientState] = useState("");
  const [clientPostalCode, setClientPostalCode] = useState("");
  const [clientCountry, setClientCountry] = useState("United States");
  const [quiltWidth, setQuiltWidth] = useState("");
  const [quiltLength, setQuiltLength] = useState("");
  const [clientSuppliesBacking, setClientSuppliesBacking] = useState(false);
  const [clientSuppliesBatting, setClientSuppliesBatting] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  // Honeypot
  const [honeypot, setHoneypot] = useState("");

  // Load organization
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, intake_form_enabled")
        .eq("intake_form_slug", slug)
        .single();

      if (error || !data) {
        setError("This intake form was not found.");
      } else if (!data.intake_form_enabled) {
        setError("This intake form is not currently active.");
      } else {
        setOrg(data);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  // Rate limiting via localStorage
  const checkRateLimit = (): boolean => {
    try {
      const key = `intake_submissions_${slug}`;
      const stored = localStorage.getItem(key);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      let submissions: number[] = stored ? JSON.parse(stored) : [];
      submissions = submissions.filter((t) => now - t < oneHour);

      if (submissions.length >= 5) return false;

      submissions.push(now);
      localStorage.setItem(key, JSON.stringify(submissions));
      return true;
    } catch {
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientFirstName.trim() || !clientLastName.trim() || !clientEmail.trim()) {
      setError("Name and email are required.");
      return;
    }

    if (!checkRateLimit()) {
      setError("Too many submissions. Please try again later.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          clientFirstName: clientFirstName.trim(),
          clientLastName: clientLastName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          clientStreet: clientStreet.trim(),
          clientCity: clientCity.trim(),
          clientState: clientState.trim(),
          clientPostalCode: clientPostalCode.trim(),
          clientCountry,
          quiltWidth: quiltWidth || undefined,
          quiltLength: quiltLength || undefined,
          clientSuppliesBacking,
          clientSuppliesBatting,
          serviceType: serviceType || undefined,
          dueDate: dueDate || undefined,
          description: description.trim() || undefined,
          // Honeypot
          website_url: honeypot,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Failed to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Phone formatting
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg font-bold text-plum">Loading...</div>
      </div>
    );
  }

  // Error state (form not found / disabled)
  if (error && !org) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white border border-line rounded-xl p-8 text-center max-w-md">
          <div className="text-3xl mb-3">🚫</div>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-white border border-line rounded-xl p-8 text-center max-w-md">
          <div className="text-3xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-plum mb-2">Request Submitted!</h2>
          <p className="text-sm text-muted">
            Thank you! {org?.name || "The quilter"} will review your request and
            get back to you soon. Check your email for a confirmation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-plum text-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display font-bold text-xl">{org?.name}</h1>
          <p className="text-sm opacity-90 mt-1">Quilting Request Form</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-line rounded-xl p-4 sm:p-6 space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            {/* Honeypot — hidden from users, bots fill it */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label>
                Website
                <input
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            {/* Name */}
            <div>
              <h3 className="text-lg font-bold text-plum mb-4">Your Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientFirstName}
                    onChange={(e) => setClientFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientLastName}
                    onChange={(e) => setClientLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(formatPhone(e.target.value))}
                  placeholder="555-123-4567"
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-bold text-plum mb-4">Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">Street</label>
                  <input
                    type="text"
                    value={clientStreet}
                    onChange={(e) => setClientStreet(e.target.value)}
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-muted mb-2">City</label>
                    <input
                      type="text"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">State</label>
                    <input
                      type="text"
                      value={clientState}
                      onChange={(e) => setClientState(e.target.value)}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={clientPostalCode}
                      onChange={(e) => setClientPostalCode(e.target.value)}
                      className="w-full px-4 py-2 border border-line rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quilt Details */}
            <div>
              <h3 className="text-lg font-bold text-plum mb-4">Quilt Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Quilt Width (inches)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quiltWidth}
                    onChange={(e) => setQuiltWidth(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Quilt Length (inches)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quiltLength}
                    onChange={(e) => setQuiltLength(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full px-4 py-2 border border-line rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Will you provide backing?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="backing"
                        checked={clientSuppliesBacking}
                        onChange={() => setClientSuppliesBacking(true)}
                        className="accent-plum"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="backing"
                        checked={!clientSuppliesBacking}
                        onChange={() => setClientSuppliesBacking(false)}
                        className="accent-plum"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-2">
                    Will you provide batting?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="batting"
                        checked={clientSuppliesBatting}
                        onChange={() => setClientSuppliesBatting(true)}
                        className="accent-plum"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="batting"
                        checked={!clientSuppliesBatting}
                        onChange={() => setClientSuppliesBatting(false)}
                        className="accent-plum"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Service + Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Service Requested
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl bg-white"
                >
                  <option value="">Select...</option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-2">
                  Preferred Completion Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-line rounded-xl"
                />
              </div>
            </div>

            {/* Special requests */}
            <div>
              <label className="block text-sm font-bold text-muted mb-2">
                Special Requests or Notes
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Thread color preferences, design ideas, special instructions..."
                className="w-full px-4 py-2 border border-line rounded-xl resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-plum text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          Powered by{" "}
          <a
            href="https://stitchqueue.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-plum hover:underline"
          >
            StitchQueue
          </a>
        </p>
      </div>
    </div>
  );
}
