"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      {/* Header */}
      <header className="bg-[#4e283a] text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold font-serif">
            StitchQueue
          </Link>
          <Link
            href="/"
            className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#e7e2dc] shadow-sm p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#4e283a] mb-2">
            Privacy Policy
          </h1>
          <p className="text-[#6c6c6c] text-sm mb-8">
            Last updated: February 6, 2026
          </p>

          {/* Beta Notice */}
          <div className="bg-[#98823a]/10 border border-[#98823a]/30 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="font-semibold text-[#4e283a] mb-1">
                  Your Privacy Matters
                </p>
                <p className="text-sm text-[#6c6c6c]">
                  StitchQueue is designed with privacy in mind. We collect only
                  what's necessary to provide our service and never sell your data.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Content */}
          <div className="prose prose-sm max-w-none text-[#1f1f1f]">
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                1. Information We Collect
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We collect information you provide directly to us when using StitchQueue:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Account Information:</strong> Email address and password when you create an account</li>
                <li><strong>Business Information:</strong> Business name, address, and contact details you enter in Settings</li>
                <li><strong>Project Data:</strong> Client information, quilt details, pricing, and payment records you create</li>
                <li><strong>Usage Data:</strong> How you interact with the application (pages visited, features used)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                2. How We Use Your Information
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li>Provide, maintain, and improve StitchQueue</li>
                <li>Process your projects, estimates, and invoices</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage patterns to improve the user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                3. Data Storage & Security
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Your data is stored securely using industry-standard practices:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Database:</strong> Supabase (PostgreSQL) with row-level security</li>
                <li><strong>Hosting:</strong> Vercel with HTTPS encryption</li>
                <li><strong>Authentication:</strong> Secure password hashing and session management</li>
                <li><strong>Location:</strong> Data is stored in the United States</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                4. Data Sharing
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties.
                We may share data only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Service Providers:</strong> Third-party services that help us operate (Supabase, Vercel)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfer:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                5. Your Rights
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Export:</strong> Download your project data as CSV from Settings</li>
                <li><strong>Delete:</strong> Request deletion of your account and data</li>
                <li><strong>Correct:</strong> Update inaccurate information in your account</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@stitchqueue.com" className="text-[#4e283a] underline">
                  privacy@stitchqueue.com
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                6. Cookies & Tracking
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                StitchQueue uses essential cookies for:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Authentication:</strong> Keeping you logged in</li>
                <li><strong>Preferences:</strong> Remembering your settings</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed">
                We do not use advertising cookies or tracking pixels.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                7. Children's Privacy
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed">
                StitchQueue is designed for professional quilters and business use.
                We do not knowingly collect information from children under 13.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                8. Changes to This Policy
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify
                you of any changes by posting the new policy on this page and updating
                the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                9. Contact Us
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none text-[#1f1f1f] space-y-1">
                <li><strong>Email:</strong>{" "}
                  <a href="mailto:privacy@stitchqueue.com" className="text-[#4e283a] underline">
                    privacy@stitchqueue.com
                  </a>
                </li>
                <li><strong>Company:</strong> Stitched By Susan</li>
              </ul>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-[#e7e2dc] flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="text-[#4e283a] hover:underline">
              Terms of Service
            </Link>
            <a href="mailto:beta@stitchqueue.com" className="text-[#4e283a] hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}