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
            &larr; Back to App
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#e7e2dc] shadow-sm p-6 md:p-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#4e283a] mb-1">
            Terms of Service
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

          {/* Terms Content */}
          <div className="prose prose-sm max-w-none text-[#1f1f1f]">

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                1. Agreement to Terms
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Welcome to StitchQueue. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of StitchQueue (the &ldquo;Service&rdquo;), our workflow management software for professional longarm quilters, operated by Stitched By Susan (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;).
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                By creating an account or using StitchQueue, you agree to be bound by these Terms and our{" "}
                <Link href="/privacy" className="text-[#4e283a] underline">Privacy Policy</Link>.
                If you do not agree to these Terms, you may not use the Service.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">1.1 Who May Use the Service</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">To use StitchQueue, you must:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Be at least 18 years old (or the age of majority in your jurisdiction)</li>
                <li>Have the legal capacity to enter into a binding contract</li>
                <li>Not be prohibited from using the Service under applicable laws</li>
                <li>Operate a professional longarm quilting business or similar service</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                <strong>Businesses and Organizations:</strong> If you are using the Service on behalf of a business or organization, you represent that you have the authority to bind that entity to these Terms.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">1.2 Definitions</h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>&ldquo;Service&rdquo;</strong> means StitchQueue, including the website, web application, and all related services</li>
                <li><strong>&ldquo;Account&rdquo;</strong> means your user account on StitchQueue</li>
                <li><strong>&ldquo;Content&rdquo;</strong> means data, text, images, and other materials you input into the Service</li>
                <li><strong>&ldquo;FREE Tier&rdquo; / &ldquo;Studio&rdquo;</strong> means the free version of the Service with limited features</li>
                <li><strong>&ldquo;PRO Tier&rdquo;</strong> means the paid subscription version with enhanced features</li>
                <li><strong>&ldquo;Client&rdquo;</strong> means your customer (the person or business commissioning quilting work)</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                2. Account Registration and Security
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">2.1 Creating an Account</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">To use StitchQueue, you must create an account by providing:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>A valid email address</li>
                <li>A secure password</li>
                <li>Acceptance of these Terms and our Privacy Policy</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                <strong>Accuracy:</strong> You agree to provide accurate, current, and complete information. You must update your information promptly if it changes.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">2.2 Account Security</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">You are responsible for:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activity that occurs under your account</li>
                <li>Notifying us immediately of any unauthorized access or security breach</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                We are not liable for losses resulting from unauthorized use of your account if you fail to safeguard your login credentials.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">2.3 Account Ownership</h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Individual Accounts (FREE and Solo PRO):</strong> You own your account and may not transfer it to another person.</li>
                <li><strong>Team Accounts (Team PRO):</strong> The account is owned by the organization. The primary administrator may add or remove users.</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">2.4 Account Termination</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">You may close your account at any time by:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Contacting <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a> with &ldquo;Close Account&rdquo; in the subject line</li>
                <li>Following the account deletion process (when implemented in the app)</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>Upon closure:</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Your data will be deleted within 90 days (see Privacy Policy Section 6)</li>
                <li>Active subscriptions will be canceled (no refunds for unused time unless legally required)</li>
                <li>You may not create a new account to circumvent suspension or termination</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                3. Subscription Plans and Billing
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.1 Service Tiers</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">StitchQueue offers two tiers:</p>

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#e7e2dc]">
                      <th className="text-left py-2 pr-3 text-[#4e283a] font-bold">Feature</th>
                      <th className="text-left py-2 pr-3 text-[#4e283a] font-bold">FREE (Studio)</th>
                      <th className="text-left py-2 text-[#4e283a] font-bold">PRO (Solo/Team)</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#1f1f1f]">
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">Pricing calculator &amp; estimates</td>
                      <td className="py-2 pr-3">Manual entry</td>
                      <td className="py-2">Saved settings</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">7-stage Kanban workflow</td>
                      <td className="py-2 pr-3">Yes</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">Invoice generation</td>
                      <td className="py-2 pr-3">Yes</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">Unlimited projects</td>
                      <td className="py-2 pr-3">Yes</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">Business Overhead Calculator</td>
                      <td className="py-2 pr-3">No</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">Email estimates/invoices</td>
                      <td className="py-2 pr-3">No</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">Embeddable intake form</td>
                      <td className="py-2 pr-3">No</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">Financial reports</td>
                      <td className="py-2 pr-3">No</td>
                      <td className="py-2">Yes</td>
                    </tr>
                    <tr className="border-b border-[#e7e2dc]">
                      <td className="py-2 pr-3">Multi-user access</td>
                      <td className="py-2 pr-3">No</td>
                      <td className="py-2">Yes (up to 5)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.2 PRO Subscription Pricing</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>Current Pricing (subject to change):</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Solo PRO:</strong> $12/month or $120/year</li>
                <li><strong>Team PRO:</strong> $19/month or $190/year</li>
              </ul>

              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>Founder Pricing (Early Adopters):</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Solo PRO (Founder):</strong> $90/year (locked forever)</li>
                <li><strong>Team PRO (Founder):</strong> $140/year (locked forever)</li>
                <li>Available only to beta testers and first 30 days after public launch</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.3 Payment Processing</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Payments are processed by <strong>Stripe</strong>, our third-party payment provider.
              </p>

              <p className="text-[#1f1f1f] font-semibold mb-2">How it works:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>You enter payment information securely on Stripe&apos;s hosted checkout page</li>
                <li>Stripe processes your payment and charges your card</li>
                <li>We receive confirmation of successful payment</li>
                <li>You receive access to StitchQueue services</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">What we store:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Last 4 digits of your card (for display purposes only)</li>
                <li>Card brand (Visa, Mastercard, etc.)</li>
                <li>Expiration date</li>
                <li>Billing ZIP code</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">What we do NOT store:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Full credit card numbers</li>
                <li>CVV/security codes</li>
                <li>Complete card details</li>
              </ul>

              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Your agreement with Stripe:</strong> By subscribing, you agree to Stripe&apos;s Services Agreement and Privacy Policy. Stripe is responsible for processing your payment securely and is PCI DSS compliant.
              </p>

              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                <strong>Our responsibility:</strong> We (Stitched By Susan) are the seller of record. We are responsible for:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>Providing the StitchQueue service</li>
                <li>Customer support</li>
                <li>Billing questions and disputes</li>
                <li>Refunds (as outlined in Section 3.6)</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.4 Billing Cycle</h3>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Monthly subscriptions:</strong> Billed on the same day each month (e.g., if you subscribe on March 15, you&apos;ll be billed on the 15th of each month)</li>
                <li><strong>Annual subscriptions:</strong> Billed once per year on the anniversary of your initial purchase</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.5 Automatic Renewal</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3 font-semibold">
                Your subscription automatically renews unless you cancel before the next billing date.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>To cancel:</strong></p>
              <ol className="list-decimal pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Log into your Stripe customer portal (link available in Settings &gt; Subscription)</li>
                <li>Select &ldquo;Cancel Subscription&rdquo;</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
              </ol>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                You will retain PRO access until the end of your paid period, even after canceling.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.6 Refund Policy</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                <strong>General Policy:</strong> Subscriptions are non-refundable except as required by law or in cases of our error (e.g., double-billing).
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>Exceptions:</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>If you cancel within 7 days of your first subscription payment, we may issue a pro-rated refund at our discretion</li>
                <li>Annual subscriptions canceled within 30 days of purchase may receive a pro-rated refund at our discretion</li>
                <li>Refund requests must be submitted to <a href="mailto:support@stitchqueue.com" className="text-[#4e283a] underline">support@stitchqueue.com</a></li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>No refunds will be issued for:</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>Unused time on canceled subscriptions</li>
                <li>Downgrading from PRO to FREE</li>
                <li>Dissatisfaction with features (try the FREE tier first)</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.7 Price Changes</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We may change subscription prices at any time. <strong>Price changes will not affect your current subscription period.</strong>
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                For monthly subscribers, new prices take effect on your next renewal date. You will receive at least 30 days&apos; notice via email before any price increase.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                <strong>Founder Pricing Guarantee:</strong> If you have Founder Pricing, your rate is locked forever and will never increase, as long as you maintain continuous subscription.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.8 Failed Payments</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">If a payment fails:</p>
              <ol className="list-decimal pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>We will retry the payment automatically (up to 3 times over 10 days)</li>
                <li>You will receive email notifications about failed payments</li>
                <li>If payment is not resolved within 14 days, your account will be downgraded to FREE</li>
              </ol>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                Your data is not deleted during payment failures. You can resubscribe anytime to regain PRO access.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">3.9 Sales Tax and VAT</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>United States:</strong></p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We collect and remit sales tax where required by state law. Stripe automatically calculates applicable sales tax based on your billing address.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>International:</strong></p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                For customers outside the United States, VAT (Value Added Tax) or GST (Goods and Services Tax) may apply based on your location. Stripe calculates and collects these taxes where required.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>Tax rates:</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Tax rates are determined by your billing address</li>
                <li>Taxes are calculated at checkout before payment</li>
                <li>You are responsible for any taxes not collected by Stripe (e.g., use tax, reverse charge VAT)</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Tax exemption:</strong> If you are tax-exempt, please contact{" "}
                <a href="mailto:support@stitchqueue.com" className="text-[#4e283a] underline">support@stitchqueue.com</a>{" "}
                with your exemption certificate before subscribing. We will apply the exemption to future billing.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                4. Acceptable Use
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">4.1 What You May Do</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">You may use StitchQueue to:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>Manage your longarm quilting business</li>
                <li>Create estimates and invoices for your clients</li>
                <li>Track projects and payments</li>
                <li>Store client contact information</li>
                <li>Generate business reports</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">4.2 What You May NOT Do</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">You agree NOT to:</p>

              <p className="text-[#1f1f1f] font-semibold mb-2">Illegal Activity:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Use the Service for any unlawful purpose or in violation of any laws</li>
                <li>Infringe on intellectual property rights</li>
                <li>Engage in fraud, money laundering, or other financial crimes</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Security and Integrity:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Attempt to hack, breach, or circumvent security measures</li>
                <li>Use automated tools (bots, scrapers) to access the Service without permission</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Upload viruses, malware, or malicious code</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Abuse and Misuse:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Create multiple accounts to evade restrictions or gain unauthorized access</li>
                <li>Share your account credentials with unauthorized users</li>
                <li>Use the Service to spam or harass others</li>
                <li>Overload or interfere with our servers</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Data Misuse:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Store or process data that violates others&apos; privacy rights</li>
                <li>Use client data for purposes other than legitimate business operations</li>
                <li>Scrape or extract data from the Service for use in competing products</li>
              </ul>

              <p className="text-[#1f1f1f] leading-relaxed mb-3 font-semibold">
                Violating these terms may result in immediate account suspension or termination without refund.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                5. Your Content and Data
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">5.1 Ownership</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>You own your data.</strong> All Content you input into StitchQueue (client names, project details, business information, etc.) remains your property.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">5.2 License to Us</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                By using the Service, you grant us a limited, non-exclusive, worldwide license to:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Store, process, and display your Content as necessary to operate the Service</li>
                <li>Back up your data for disaster recovery</li>
                <li>Aggregate anonymized usage data for analytics and improvement (no personally identifiable information)</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                We do not own your Content and will not use it for any purpose beyond operating the Service.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">5.3 Your Responsibilities</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">You are responsible for:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Accuracy:</strong> Ensuring your data is accurate (especially client information, pricing, and tax rates)</li>
                <li><strong>Backups:</strong> While we perform automatic backups, you should export your data regularly for your own records</li>
                <li><strong>Legal Compliance:</strong> Complying with all applicable laws regarding client data (e.g., GDPR, CCPA, industry regulations)</li>
                <li><strong>Client Consent:</strong> Obtaining necessary consent from your clients to store their information</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">5.4 Data Deletion</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                When you delete a project or close your account, we will delete your data in accordance with our Privacy Policy (see Section 6).
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3 font-semibold">
                Deleted data cannot be recovered. Make sure you have backups before deleting.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                6. Intellectual Property
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">6.1 Our Intellectual Property</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                StitchQueue, including all software, design, text, graphics, logos, and functionality, is owned by Stitched By Susan and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2"><strong>You may not:</strong></p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li>Copy, modify, or create derivative works of the Service</li>
                <li>Use our trademarks, logos, or branding without written permission</li>
                <li>Remove or alter copyright notices or proprietary markings</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">6.2 Feedback and Suggestions</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If you provide feedback, suggestions, or ideas about StitchQueue, you grant us a perpetual, royalty-free license to use and implement those ideas without compensation.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Example:</strong> If you suggest a new feature and we build it, we are not required to pay you or credit you.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                7. Third-Party Services
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                StitchQueue integrates with third-party services:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Supabase</strong> (database and authentication)</li>
                <li><strong>Vercel</strong> (hosting)</li>
                <li><strong>Stripe</strong> (payment processing)</li>
                <li><strong>Resend</strong> (email delivery)</li>
                <li><strong>ConvertKit</strong> (marketing emails, opt-in only)</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Your use of these services is subject to their respective terms and privacy policies.</strong> We are not responsible for how third parties handle your data (though we vet all providers for security and compliance).
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Links to external websites</strong> (e.g., help documentation, support resources) are provided for convenience. We are not responsible for the content or practices of external sites.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                8. Service Availability and Changes
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">8.1 Uptime and Maintenance</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We strive to provide reliable, uninterrupted service, but <strong>we do not guarantee 100% uptime.</strong>
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">The Service may be unavailable due to:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Scheduled maintenance (we will provide advance notice when possible)</li>
                <li>Unscheduled outages (hardware failures, network issues, security incidents)</li>
                <li>Force majeure events (natural disasters, acts of war, etc.)</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                No refunds or credits will be issued for temporary service interruptions unless legally required.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">8.2 Changes to the Service</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                We may modify, update, or discontinue features at any time. We will notify users of significant changes via:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Email to the address on file</li>
                <li>Announcement on the StitchQueue dashboard</li>
                <li>Update to these Terms (with notice)</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                Continued use after changes constitutes acceptance of the modified Service.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">8.3 Discontinuation of Service</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                If we decide to shut down StitchQueue entirely, we will:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Provide at least 90 days&apos; notice</li>
                <li>Allow you to export all your data</li>
                <li>Issue pro-rated refunds for annual subscriptions (at our discretion)</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                9. Disclaimers and Limitation of Liability
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">9.1 &ldquo;AS IS&rdquo; Disclaimer</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3 font-semibold uppercase">
                StitchQueue is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">We disclaim all warranties, including:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Merchantability:</strong> Fitness for a particular purpose</li>
                <li><strong>Accuracy:</strong> We do not guarantee that calculations, estimates, or reports are error-free</li>
                <li><strong>Non-Infringement:</strong> We do not guarantee that third-party claims will not arise</li>
                <li><strong>Uninterrupted Service:</strong> We do not guarantee 24/7 uptime</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                Your use of StitchQueue is at your own risk.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">9.2 Limitation of Liability</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-2 font-semibold uppercase text-sm">
                To the maximum extent permitted by law, Stitched By Susan shall not be liable for:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Indirect, incidental, special, consequential, or punitive damages</strong> (e.g., lost profits, lost data, business interruption)</li>
                <li><strong>Damages resulting from:</strong> Unauthorized access to your account, data loss, service outages, third-party actions, reliance on pricing calculations or reports</li>
                <li><strong>Damages exceeding the amount you paid us in the 12 months prior to the claim</strong> (or $100 USD if you are on the FREE tier)</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-4 font-semibold">
                This limitation applies even if we were advised of the possibility of such damages.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">9.3 Exceptions</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Some jurisdictions do not allow limitations on implied warranties or exclusions of certain damages. If these laws apply to you, some or all of the above limitations may not apply, and you may have additional rights.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">9.4 Professional Advice Disclaimer</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3 font-semibold">
                StitchQueue is a business management tool, not a substitute for professional advice.
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-2 mb-3">
                <li><strong>Tax and Accounting:</strong> We provide tools to track revenue and expenses, but you should consult a tax professional for compliance.</li>
                <li><strong>Legal:</strong> We do not provide legal advice regarding contracts, liability, or business operations.</li>
                <li><strong>Financial:</strong> Pricing calculations and overhead analysis are for informational purposes only. You are responsible for setting profitable rates.</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-3 font-semibold">
                Always consult qualified professionals for business, legal, and financial decisions.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                10. Indemnification
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                You agree to <strong>indemnify, defend, and hold harmless</strong> Stitched By Susan, its officers, employees, and affiliates from any claims, damages, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Your violation of these Terms</li>
                <li>Your violation of any laws or third-party rights</li>
                <li>Your Content (e.g., infringing images, defamatory statements)</li>
                <li>Unauthorized use of your account by others due to your failure to safeguard credentials</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Example:</strong> If a client sues us because you stored their data without proper consent, you agree to cover our legal costs and any damages.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                11. Dispute Resolution
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.1 Governing Law</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                These Terms are governed by the laws of <strong>Washington State, USA</strong>, without regard to conflict of law principles.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.2 Arbitration Agreement</h3>
              <div className="bg-[#98823a]/10 border border-[#98823a]/30 rounded-xl p-4 mb-4">
                <p className="font-semibold text-[#4e283a] mb-2">
                  PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS.
                </p>
                <p className="text-sm text-[#1f1f1f] leading-relaxed">
                  Any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be resolved by binding arbitration, rather than in court.
                </p>
              </div>

              <p className="text-[#1f1f1f] font-semibold mb-2">Arbitration Process:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Administered by the <strong>American Arbitration Association (AAA)</strong> under its Commercial Arbitration Rules</li>
                <li>Conducted by a single arbitrator</li>
                <li>Location: Remotely via video conference</li>
                <li>Each party pays their own legal fees unless the arbitrator awards fees to the prevailing party</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Exceptions (Small Claims Court):</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li>Either party may bring a claim in Small Claims Court in Spokane County, Washington, if the claim qualifies (claims under $10,000 in Washington)</li>
                <li>Small claims provides an accessible forum for resolving minor disputes without the cost of arbitration</li>
              </ul>

              <p className="text-[#1f1f1f] font-semibold mb-2">Class Action Waiver:</p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                <li><strong>You agree to resolve disputes individually, not as part of a class, collective, or representative action.</strong></li>
                <li>You waive the right to participate in a class action lawsuit or class-wide arbitration</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.3 Opt-Out of Arbitration</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You may opt out of the arbitration agreement within <strong>30 days of account creation</strong> by emailing:
              </p>
              <div className="bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4 mb-4">
                <p className="text-[#1f1f1f] text-sm">
                  <strong>Email:</strong> <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>
                </p>
                <p className="text-[#1f1f1f] text-sm"><strong>Subject:</strong> &ldquo;Arbitration Opt-Out&rdquo;</p>
                <p className="text-[#1f1f1f] text-sm"><strong>Include:</strong> Your name, email, and a statement that you wish to opt out</p>
              </div>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                If you opt out, disputes will be resolved in the courts of Washington State, USA.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">11.4 Injunctive Relief</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Either party may seek injunctive or equitable relief in court to prevent irreparable harm (e.g., preventing unauthorized use of intellectual property).
              </p>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                12. General Provisions
              </h2>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">12.1 Entire Agreement</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                These Terms, together with our <Link href="/privacy" className="text-[#4e283a] underline">Privacy Policy</Link>, constitute the entire agreement between you and Stitched By Susan regarding the Service.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                <strong>Supersedes all prior agreements:</strong> Any previous versions of these Terms or verbal agreements are superseded by this document.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">12.2 Severability</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in full effect.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">12.3 Waiver</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Our failure to enforce any provision does not constitute a waiver of that provision or our right to enforce it in the future.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">12.4 Assignment</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                You may not assign or transfer your rights under these Terms without our written consent.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-4">
                We may assign these Terms or transfer the Service to a successor entity (e.g., in a merger or acquisition) without your consent.
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">12.5 Force Majeure</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                We are not liable for delays or failures caused by events beyond our reasonable control (e.g., natural disasters, pandemics, acts of terrorism, government actions).
              </p>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">12.6 Notice</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>To You:</strong> We may send notices via email to the address on file or by posting on the Service. It is your responsibility to keep your email address current.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                <strong>To Us:</strong> Send legal notices to:
              </p>
              <ul className="list-none text-[#1f1f1f] space-y-1 mb-4">
                <li><a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a></li>
                <li>Mailing Address: 1310 E Cleveland Bay Ln, Spokane, WA 99208, USA</li>
              </ul>

              <h3 className="text-base font-bold text-[#4e283a] mb-2">12.7 Survival</h3>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                Provisions that should reasonably survive termination (e.g., ownership, indemnification, limitation of liability) will continue to apply after these Terms end.
              </p>
            </section>

            {/* Section 13 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                13. Changes to These Terms
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-2">
                We may update these Terms from time to time. Changes will be effective:
              </p>
              <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-3">
                <li><strong>Immediately</strong> for new users</li>
                <li><strong>On the effective date stated</strong> for existing users (you will receive at least 30 days&apos; notice)</li>
              </ul>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Material changes</strong> (e.g., changes to arbitration, liability, or pricing structure) will be communicated via email and a prominent notice on the dashboard.
              </p>
              <p className="text-[#1f1f1f] leading-relaxed mb-3 font-semibold">
                Your continued use of the Service after changes constitutes acceptance. If you do not agree to the updated Terms, you must stop using the Service and close your account.
              </p>
            </section>

            {/* Section 14 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                14. Contact Us
              </h2>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4 mb-3">
                <p className="font-semibold text-[#4e283a] mb-2">For Legal &amp; Terms Questions:</p>
                <p className="text-[#6c6c6c] text-sm">
                  Email: <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>
                </p>
                <p className="text-[#6c6c6c] text-sm">
                  Subject Line: &ldquo;Terms of Service Inquiry - [Your Topic]&rdquo;
                </p>
              </div>
              <div className="bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4 mb-3">
                <p className="font-semibold text-[#4e283a] mb-2">For Billing &amp; Technical Support:</p>
                <p className="text-[#6c6c6c] text-sm">
                  Email: <a href="mailto:support@stitchqueue.com" className="text-[#4e283a] underline">support@stitchqueue.com</a>
                </p>
              </div>
              <p className="text-[#1f1f1f] leading-relaxed mb-3">
                <strong>Mailing Address:</strong> 1310 E Cleveland Bay Ln, Spokane, WA 99208, USA
              </p>
            </section>

            {/* Section 15 */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-[#4e283a] mb-3">
                15. Summary (Plain Language)
              </h2>
              <div className="bg-[#faf7f2] border border-[#e7e2dc] rounded-xl p-4">
                <p className="text-[#1f1f1f] font-semibold mb-2">What you&apos;re agreeing to:</p>
                <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                  <li>You must be 18+ and operate a quilting business</li>
                  <li>You&apos;re responsible for your account security and data accuracy</li>
                  <li>PRO subscriptions auto-renew unless you cancel</li>
                  <li>We can change features, pricing, or these Terms with notice</li>
                  <li>You own your data; we just store it for you</li>
                  <li>We&apos;re not liable for service outages, data loss, or business decisions you make</li>
                  <li>Disputes are resolved by arbitration (unless you opt out)</li>
                </ul>

                <p className="text-[#1f1f1f] font-semibold mb-2">What we promise:</p>
                <ul className="list-disc pl-6 text-[#1f1f1f] space-y-1 mb-4">
                  <li>We&apos;ll protect your data and privacy</li>
                  <li>We&apos;ll provide a useful tool for managing your business</li>
                  <li>We won&apos;t sell your data</li>
                  <li>We&apos;ll give you notice before major changes</li>
                </ul>

                <p className="text-[#1f1f1f] leading-relaxed">
                  <strong>Questions?</strong> Contact{" "}
                  <a href="mailto:legal@stitchqueue.com" className="text-[#4e283a] underline">legal@stitchqueue.com</a>{" "}
                  for legal/terms questions or{" "}
                  <a href="mailto:support@stitchqueue.com" className="text-[#4e283a] underline">support@stitchqueue.com</a>{" "}
                  for billing/technical support.
                </p>
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

          {/* Footer Links */}
          <div className="mt-6 pt-4 border-t border-[#e7e2dc] flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-[#4e283a] hover:underline">
              Privacy Policy
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
