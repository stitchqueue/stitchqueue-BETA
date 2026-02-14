"use client";

import Link from "next/link";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-[#6c6c6c] text-sm mb-8">
            Last updated: January 30, 2026
          </p>

          {/* Beta Notice */}
          <div className="bg-[#98823a]/10 border border-[#98823a]/30 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-xl">🧪</span>
              <div>
                <p className="font-semibold text-[#4e283a] mb-1">
                  Beta Software Notice
                </p>
                <p className="text-sm text-[#6c6c6c]">
                  StitchQueue is currently in private beta. Features may change,
                  and data may be reset during development. Please export your
                  data regularly.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="prose prose-sm max-w-none text-[#1f1f1f]">
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                1. Ownership & Intellectual Property
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                StitchQueue, including all source code, design, features,
                documentation, and related materials, is the exclusive property
                of <strong>Stitched By Susan</strong>
                ("Company", "we", "us", or "our").
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                All rights, title, and interest in and to StitchQueue, including
                but not limited to:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li>Software code and architecture</li>
                <li>User interface design and layouts</li>
                <li>Business logic and algorithms</li>
                <li>Pricing calculation methodologies</li>
                <li>Workflow and process designs</li>
                <li>Trademarks, logos, and branding</li>
                <li>Documentation and training materials</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed">
                are and shall remain the sole property of Stitched By Susan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                2. Beta Tester Agreement
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                By accessing StitchQueue during the beta period, you ("Beta
                Tester", "you", or "your") agree to:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2">
                <li>
                  Use the software only for its intended purpose of evaluating
                  and testing
                </li>
                <li>Provide honest feedback to help improve the product</li>
                <li>Report any bugs, errors, or issues you encounter</li>
                <li>
                  Keep all features, designs, and capabilities confidential
                </li>
                <li>Not share access credentials with any third party</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                3. Prohibited Activities
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You expressly agree NOT to:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2">
                <li>
                  <strong>Copy or reproduce</strong> any part of the software,
                  code, or design
                </li>
                <li>
                  <strong>Reverse engineer</strong> or attempt to extract source
                  code
                </li>
                <li>
                  <strong>Create derivative works</strong> based on StitchQueue
                </li>
                <li>
                  <strong>Share, distribute, or sublicense</strong> the software
                  to others
                </li>
                <li>
                  <strong>Use for commercial purposes</strong> beyond your own
                  quilting business
                </li>
                <li>
                  <strong>Screenshot or record</strong> the interface for
                  distribution
                </li>
                <li>
                  <strong>Discuss features publicly</strong> on social media or
                  forums without permission
                </li>
                <li>
                  <strong>Assist competitors</strong> in developing similar
                  products
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                4. Confidentiality
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                All information about StitchQueue, including but not limited to
                features, pricing, business model, and technical implementation,
                is confidential information.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed">
                You agree to maintain the confidentiality of all such
                information and not disclose it to any third party without prior
                written consent from Stitched By Susan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                5. Data & Privacy
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                During the beta period:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2">
                <li>
                  Your data is stored locally in your browser (localStorage)
                </li>
                <li>
                  We do not collect or transmit your business data to our
                  servers
                </li>
                <li>
                  Data may be lost if you clear browser data or switch devices
                </li>
                <li>
                  You are responsible for exporting and backing up your data
                </li>
                <li>We may reset data during development updates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                6. No Warranty
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                STITCHQUEUE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
                EXPRESS OR IMPLIED. We do not guarantee that the software will
                be:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2">
                <li>Error-free or uninterrupted</li>
                <li>Suitable for any particular purpose</li>
                <li>Secure or free from vulnerabilities</li>
                <li>Compatible with all devices or browsers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                7. Limitation of Liability
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed">
                In no event shall Stitched By Susan be liable for any indirect,
                incidental, special, consequential, or punitive damages,
                including but not limited to loss of profits, data, or business
                opportunities, arising out of or related to your use of
                StitchQueue.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                8. Termination
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We reserve the right to terminate your access to StitchQueue at
                any time, for any reason, without notice. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2">
                <li>You must cease all use of the software</li>
                <li>
                  You must delete any copies or screenshots in your possession
                </li>
                <li>Confidentiality obligations continue indefinitely</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                9. Legal Remedies
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed">
                Any violation of these Terms, particularly regarding
                intellectual property and confidentiality, may result in legal
                action. You acknowledge that monetary damages may be
                insufficient and that we may seek injunctive relief to prevent
                unauthorized use or disclosure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                10. Governing Law
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of the State of Washington, United States, without
                regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                11. Changes to Terms
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed">
                We reserve the right to modify these Terms at any time.
                Continued use of StitchQueue after changes constitutes
                acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                12. Contact
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed">
                For questions about these Terms or to report violations,
                contact:
              </p>
              <div className="mt-3 bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4">
                <p className="font-semibold text-[#4e283a]">StitchQueue</p>
                <p className="text-[#6c6c6c] text-sm mt-1">David Smith</p>
                <p className="text-[#6c6c6c] text-sm">support@stitchqueue.com</p>
              </div>
            </section>
          </div>

          {/* Agreement Acknowledgment */}
          <div className="mt-8 pt-6 border-t border-[#e7e2dc]">
            <p className="text-center text-[#6c6c6c] text-sm">
              By using StitchQueue, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-[#6c6c6c] text-sm">
          <p>© 2026 Stitched By Susan. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
