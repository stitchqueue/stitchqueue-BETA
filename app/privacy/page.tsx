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
            &larr; Back to App
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#e7e2dc] shadow-sm p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#4e283a] mb-1">
            Privacy Policy
          </h1>
          <p className="text-[#4e283a] font-semibold mb-1">
            Stitched By Susan
          </p>
          <p className="text-[#6c6c6c] text-xs italic mb-1">
            (StitchQueue Workflow Management Software)
          </p>
          <p className="text-[#6c6c6c] text-sm mb-1">
            <strong>Effective Date:</strong> April 1, 2026
          </p>
          <p className="text-[#6c6c6c] text-sm mb-8">
            <strong>Last Updated:</strong> February 14, 2026
          </p>

          {/* Privacy Notice */}
          <div className="bg-[#98823a]/10 border border-[#98823a]/30 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="font-semibold text-[#4e283a] mb-1">
                  Your Privacy Matters
                </p>
                <p className="text-sm text-[#6c6c6c]">
                  StitchQueue is designed with privacy in mind. We collect only
                  what&apos;s necessary to provide our service and never sell your data.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Content */}
          <div className="prose prose-sm max-w-none text-[#1f1f1f]">

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                1. Introduction
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Welcome to StitchQueue. We are committed to protecting your privacy and handling your data in an open and transparent manner.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                This Privacy Policy explains how Stitched By Susan (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) collects, uses, stores, and protects information when you use StitchQueue (the &ldquo;Service&rdquo;), our workflow management software available at stitchqueue.com and beta.stitchqueue.com.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                By using StitchQueue, you agree to the collection and use of information in accordance with this policy.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">
                1.1 Who We Are
              </h3>
              <ul className="list-none text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Company Name:</strong> Stitched By Susan (a Washington State corporation)</li>
                <li><strong>Product Name:</strong> StitchQueue (workflow management software for professional longarm quilters)</li>
                <li><strong>Website:</strong> stitchqueue.com</li>
                <li><strong>Contact Email:</strong>{" "}
                  <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>
                </li>
                <li><strong>Mailing Address:</strong> 1310 E Cleveland Bay Ln, Spokane, WA 99208, USA</li>
                <li><strong>Data Controller:</strong> Stitched By Susan (for GDPR purposes)</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                2. Information We Collect
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">
                2.1 Information You Provide Directly
              </h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                When you create an account and use StitchQueue, you provide:
              </p>

              <p className="text-[#1f1f1f] font-semibold mb-2">Account Information:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Email address (required for login and communications)</li>
                <li>Password (encrypted and never stored in plain text)</li>
                <li>Account tier selection (FREE or PRO)</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Business Information (in Settings):</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Business name</li>
                <li>Business address (street, city, state/province, postal code, country)</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Tax ID or business registration number (optional)</li>
                <li>Pricing rates and overhead costs</li>
                <li>Batting and thread options</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Client Project Data:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Client names, phone numbers, email addresses, and mailing addresses</li>
                <li>Quilt dimensions, service types, and project details</li>
                <li>Estimate amounts, deposit information, and payment records</li>
                <li>Project status, due dates, and notes</li>
                <li>Invoice details and payment history</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Feedback and Support:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>Feedback submissions (category, description, screenshots)</li>
                <li>Support request details</li>
                <li>Browser information and page URLs (automatically captured with feedback)</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">
                2.2 Information Collected Automatically
              </h3>

              <p className="text-[#1f1f1f] font-semibold mb-2">Usage Data:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Pages visited, features used, time spent in the application</li>
                <li>Device information (browser type, operating system, screen resolution)</li>
                <li>IP address and general location (city/region level, not precise GPS)</li>
                <li>Session duration and interaction patterns</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Technical Data:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>Cookies and session tokens (for authentication and security)</li>
                <li>Error logs and diagnostic information</li>
                <li>Performance metrics</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">
                2.3 Information We Do NOT Collect
              </h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li>
                  <strong>We do not collect or store payment card information.</strong> All subscription payments are processed by our payment provider (Stripe), and we never see or store your full credit card details. We receive only: last 4 digits of card (for display), card brand, expiration date, and billing ZIP code.
                </li>
                <li>
                  <strong>We do not track you across other websites.</strong> We do not use third-party tracking pixels or advertising networks.
                </li>
                <li>
                  <strong>We do not sell your data.</strong> Ever.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                3. How We Use Your Information
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.1 To Provide the Service</h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Create and maintain your account</li>
                <li>Enable you to manage client projects, estimates, and invoices</li>
                <li>Store your business settings and pricing configurations</li>
                <li>Sync data across devices</li>
                <li>Provide customer support</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.2 To Communicate With You</h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Send transactional emails (estimate/invoice delivery, password resets)</li>
                <li>Respond to support requests and feedback</li>
                <li>Send important service updates and security notices</li>
                <li>Send optional product updates and feature announcements (you can opt out)</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.3 To Improve the Service</h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Analyze usage patterns to identify bugs and improve features</li>
                <li>Monitor performance and uptime</li>
                <li>Conduct internal research and development</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.4 To Ensure Security and Compliance</h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Detect and prevent fraud, spam, and abuse</li>
                <li>Enforce our Terms of Service</li>
                <li>Comply with legal obligations (tax reporting, lawful data requests)</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.5 Legal Basis for Processing (GDPR)</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If you are in the European Union, European Economic Area, or United Kingdom, we process your data under the following legal bases:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Contract Performance:</strong> Processing necessary to provide the Service you signed up for (Article 6(1)(b) GDPR)</li>
                <li><strong>Legitimate Interests:</strong> Improving our Service, security monitoring, and analytics (Article 6(1)(f) GDPR)</li>
                <li><strong>Consent:</strong> Marketing communications (you can withdraw consent anytime)</li>
                <li><strong>Legal Obligation:</strong> Compliance with tax, accounting, and data protection laws (Article 6(1)(c) GDPR)</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                4. How We Share Your Information
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">4.1 We Do Not Sell Your Data</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                We do not sell, rent, or trade your personal information to third parties. Period.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">4.2 Service Providers</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We share data with trusted third-party service providers who help us operate StitchQueue:
              </p>

              {/* Service Providers Table */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#e7e2dc]">
                      <th className="text-left py-2 pr-3 text-[#4e283a] font-bold">Provider</th>
                      <th className="text-left py-2 pr-3 text-[#4e283a] font-bold">Purpose</th>
                      <th className="text-left py-2 pr-3 text-[#4e283a] font-bold">Data Shared</th>
                      <th className="text-left py-2 text-[#4e283a] font-bold">Location</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#1f1f1f]">
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3 font-semibold">Supabase</td>
                      <td className="py-2 pr-3">Database hosting, authentication</td>
                      <td className="py-2 pr-3">Account data, project data, business settings</td>
                      <td className="py-2">United States</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3 font-semibold">Vercel</td>
                      <td className="py-2 pr-3">Application hosting, performance monitoring</td>
                      <td className="py-2 pr-3">Usage data, IP addresses, session logs</td>
                      <td className="py-2">United States</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3 font-semibold">Stripe</td>
                      <td className="py-2 pr-3">Subscription payment processing</td>
                      <td className="py-2 pr-3">Email address, name, billing address, last 4 card digits</td>
                      <td className="py-2">United States</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3 font-semibold">Resend</td>
                      <td className="py-2 pr-3">Transactional email delivery</td>
                      <td className="py-2 pr-3">Email address, recipient data for estimates/invoices</td>
                      <td className="py-2">United States</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3 font-semibold">ConvertKit</td>
                      <td className="py-2 pr-3">Marketing email list (opt-in only)</td>
                      <td className="py-2 pr-3">Email address, name (if provided)</td>
                      <td className="py-2">United States</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                All service providers are bound by data processing agreements and required to protect your data in accordance with applicable laws.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">4.3 Legal Requirements</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                We may disclose your information if required by law, such as:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>In response to a valid subpoena, court order, or legal process</li>
                <li>To protect our rights, property, or safety, or that of our users</li>
                <li>To investigate fraud, security breaches, or Terms of Service violations</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">4.4 Business Transfers</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If Stitched By Susan is acquired, merged, or sells assets, your data may be transferred to the acquiring entity. You will be notified via email and/or a prominent notice on our website before any such transfer.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">4.5 With Your Consent</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We may share your data in other circumstances with your explicit consent (e.g., if you choose to integrate with third-party services in the future).
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                5. Data Security
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">5.1 How We Protect Your Data</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We implement industry-standard security measures to protect your information:
              </p>

              <p className="text-[#1f1f1f] font-semibold mb-2">Technical Measures:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>All data transmitted over HTTPS (TLS 1.2+)</li>
                <li>Passwords encrypted using bcrypt hashing</li>
                <li>Database access restricted by role-based permissions (Supabase Row Level Security)</li>
                <li>Session tokens expire after inactivity</li>
                <li>Regular security updates and vulnerability patching</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Organizational Measures:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>Access to production data limited to authorized personnel only</li>
                <li>Data backups performed automatically (Supabase managed)</li>
                <li>Incident response procedures in place</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">5.2 Your Responsibility</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">You are responsible for:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Keeping your password secure (do not share it)</li>
                <li>Logging out of shared or public devices</li>
                <li>Reporting any unauthorized access to your account immediately</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>No system is 100% secure.</strong> While we strive to protect your data, we cannot guarantee absolute security. Use strong, unique passwords and enable two-factor authentication when available.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                6. Data Retention
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">6.1 How Long We Keep Your Data</h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Account and Project Data:</strong> Retained as long as your account is active</li>
                <li><strong>Deleted Projects:</strong> Moved to trash, permanently deleted after 30 days</li>
                <li><strong>Closed Accounts:</strong> Data deleted within 90 days of account closure request</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law (e.g., tax records, fraud investigations)</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">6.2 Automatic Backups</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Supabase performs automatic daily backups. Backup retention depends on our Supabase plan (typically 7–30 days). Backups are used only for disaster recovery, not for restoring individual deleted items.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                7. Your Rights and Choices
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">7.1 Access, Correction, and Deletion</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Access your data:</strong> View and download your information at any time via the Settings page</li>
                <li><strong>Correct your data:</strong> Update inaccurate or incomplete information in Settings</li>
                <li><strong>Delete your data:</strong> Request account deletion by emailing{" "}
                  <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>
                </li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Account Deletion Process:</p>
              <ol className="list-decimal pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>You request deletion via email</li>
                <li>We verify your identity (to prevent unauthorized deletion)</li>
                <li>We delete your account and all associated data within 90 days</li>
                <li>Backups containing your data will expire naturally (within 30 days)</li>
              </ol>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">7.2 Data Portability (GDPR)</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If you are in the EU/EEA/UK, you have the right to receive your data in a structured, machine-readable format (CSV export available in Settings).
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">7.3 Object to Processing (GDPR)</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You can object to processing based on legitimate interests by contacting{" "}
                <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>.
                We will stop processing unless we have compelling legitimate grounds.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">7.4 Withdraw Consent</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                You can withdraw consent for marketing emails at any time by:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Clicking &ldquo;unsubscribe&rdquo; in any marketing email</li>
                <li>Updating your preferences in Settings</li>
                <li>Emailing <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a></li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                <strong>Note:</strong> Transactional emails (password resets, estimate delivery) cannot be unsubscribed from while you have an active account.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">7.5 Restrict Processing (GDPR)</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You can request restricted processing (data stored but not actively used) in certain circumstances, such as while a data accuracy dispute is resolved.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">7.6 Lodge a Complaint (GDPR)</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                If you believe we have mishandled your data, you have the right to lodge a complaint with your local data protection authority:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>EU/EEA:</strong> Your national Data Protection Authority</li>
                <li><strong>UK:</strong> Information Commissioner&apos;s Office (ICO)</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                8. Cookies and Tracking
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">8.1 What Cookies We Use</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                StitchQueue uses minimal cookies:
              </p>

              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#e7e2dc]">
                      <th className="text-left py-2 pr-3 text-[#4e283a] font-bold">Cookie</th>
                      <th className="text-left py-2 pr-3 text-[#4e283a] font-bold">Purpose</th>
                      <th className="text-left py-2 text-[#4e283a] font-bold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#1f1f1f]">
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3 font-mono text-xs">sb-access-token</td>
                      <td className="py-2 pr-3">Supabase authentication session</td>
                      <td className="py-2">1 hour (sliding)</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3 font-mono text-xs">sb-refresh-token</td>
                      <td className="py-2 pr-3">Supabase session refresh</td>
                      <td className="py-2">30 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>We do not use:</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>Third-party advertising cookies</li>
                <li>Social media tracking pixels</li>
                <li>Cross-site tracking cookies</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">8.2 Analytics</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We use basic usage statistics (page views, feature usage) for analytics. This data is anonymized and aggregated. No personal identifiers are tracked.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">8.3 Your Cookie Choices</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Most browsers allow you to control cookies via settings. Note that disabling authentication cookies will prevent you from logging in.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>For EU/UK users:</strong> We will implement a cookie consent banner before accepting users from those regions.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                9. International Data Transfers
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">9.1 Where Your Data Is Stored</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                StitchQueue is operated from the United States. If you are accessing the Service from outside the US, your data will be transferred to and stored in the United States.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>For EU/EEA/UK users:</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>We rely on Standard Contractual Clauses (SCCs) for GDPR-compliant data transfers</li>
                <li>Our service providers (Supabase, Vercel, Resend) implement appropriate safeguards</li>
                <li>You have the same rights regardless of where data is processed</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                10. Children&apos;s Privacy
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                StitchQueue is not intended for users under the age of 18. We do not knowingly collect personal information from children.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If we discover that we have collected data from a child under 18, we will delete it immediately. If you believe a child has provided us with personal information, please contact{" "}
                <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                11. California Privacy Rights (CCPA)
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.1 Right to Know</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You can request details about the personal information we have collected, used, disclosed, and sold (though we do not sell data) in the past 12 months.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.2 Right to Delete</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You can request deletion of your personal information (with certain legal exceptions).
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.3 Right to Opt-Out</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You have the right to opt out of the &ldquo;sale&rdquo; of personal information. <strong>We do not sell your data</strong>, so this does not apply.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.4 Right to Non-Discrimination</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We will not discriminate against you for exercising your CCPA rights.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.5 How to Exercise Your Rights</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Email <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>{" "}
                with &ldquo;CCPA Request&rdquo; in the subject line. We will verify your identity and respond within 45 days.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Authorized Agents:</strong> You may designate an authorized agent to make requests on your behalf. The agent must provide proof of authorization.
              </p>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                <strong>Material changes</strong> (e.g., changes to how we share data) will be communicated via:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Email notification to all users</li>
                <li>Prominent notice on the StitchQueue dashboard</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Your continued use of the Service after changes constitutes acceptance of the updated policy.</strong>
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You can view previous versions of this policy by contacting{" "}
                <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>.
              </p>
            </section>

            {/* Section 13 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                13. Contact Us
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact us:
              </p>
              <div className="bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4 mb-3">
                <p className="font-semibold text-[#4e283a] mb-2">For Privacy, Legal &amp; Compliance Matters:</p>
                <p className="text-[#6c6c6c] text-sm">
                  Email: <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>
                </p>
                <p className="text-[#6c6c6c] text-sm">
                  Subject Line: &ldquo;Privacy Inquiry - [Your Topic]&rdquo;
                </p>
              </div>
              <div className="bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4 mb-3">
                <p className="font-semibold text-[#4e283a] mb-2">For Technical Support &amp; Billing:</p>
                <p className="text-[#6c6c6c] text-sm">
                  Email: <a href="mailto:support@stitchqueue.com" className="text-[#4e283a] underline">support@stitchqueue.com</a>
                </p>
              </div>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Mailing Address:</strong> 1310 E Cleveland Bay Ln, Spokane, WA 99208, USA
              </p>
              <p className="text-[#1f1f1f] leading-relaxed">
                <strong>Response Time:</strong> We will respond to privacy inquiries within 5 business days and resolve requests within 30 days (or 45 days for CCPA requests).
              </p>
            </section>

            {/* Section 14 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                14. Appendix: Legal Definitions
              </h2>
              <ul className="list-none text-[#1f1f1f] space-y-3">
                <li>
                  <strong>Personal Information / Personal Data:</strong> Information that identifies, relates to, or could reasonably be linked to you (e.g., name, email, IP address).
                </li>
                <li>
                  <strong>Processing:</strong> Any operation performed on personal data (collection, storage, use, disclosure, deletion).
                </li>
                <li>
                  <strong>Data Controller:</strong> The entity that determines the purposes and means of processing personal data (Stitched By Susan).
                </li>
                <li>
                  <strong>Data Processor:</strong> A third party that processes data on behalf of the controller (e.g., Supabase).
                </li>
                <li>
                  <strong>EU/EEA:</strong> European Union and European Economic Area (includes Iceland, Liechtenstein, Norway).
                </li>
              </ul>
            </section>

            {/* Section 15 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                15. Summary (Plain Language)
              </h2>
              <div className="bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4">
                <ul className="list-none text-[#1f1f1f] space-y-3">
                  <li>
                    <strong>What we collect:</strong> Your email, business info, client project data, and usage stats.
                  </li>
                  <li>
                    <strong>Why we collect it:</strong> To run your account, save your work, and improve the app.
                  </li>
                  <li>
                    <strong>Who we share it with:</strong> Hosting providers (Supabase, Vercel), payment processor (Stripe), and email service (Resend). We do not sell your data.
                  </li>
                  <li>
                    <strong>Your rights:</strong> You can view, edit, download, and delete your data anytime. EU/UK users have additional GDPR rights.
                  </li>
                  <li>
                    <strong>Security:</strong> We encrypt data in transit and at rest, use secure authentication, and limit access.
                  </li>
                  <li>
                    <strong>Contact:</strong>{" "}
                    <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>{" "}
                    for privacy/legal matters,{" "}
                    <a href="mailto:support@stitchqueue.com" className="text-[#4e283a] underline">support@stitchqueue.com</a>{" "}
                    for technical support.
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-[#e7e2dc] flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="text-[#4e283a] hover:underline">
              Terms of Service
            </Link>
            <a href="mailto:support@stitchqueue.com" className="text-[#4e283a] hover:underline">
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-[#6c6c6c] text-sm">
          <p>&copy; 2026 Stitched By Susan. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
