'use client'

import { useState } from 'react'
import Script from 'next/script'

export default function Home() {
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setContactSubmitted(true)
    setTimeout(() => {
      setShowContactModal(false)
      setContactSubmitted(false)
      setContactForm({ name: '', email: '', message: '' })
    }, 2000)
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#4e283a] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-[#4e283a]">StitchQueue</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-[#4e283a] transition-colors">Features</a>
              <a href="#faq" className="text-gray-700 hover:text-[#4e283a] transition-colors">FAQ</a>
              <a href="#waitlist" className="text-gray-700 hover:text-[#4e283a] transition-colors">Waitlist</a>
            </nav>
            <a
              href="#waitlist"
              className="bg-[#4e283a] text-white px-6 py-2 rounded-lg hover:bg-[#3d1f2e] transition-colors"
            >
              Join Waitlist
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-[#4e283a]/10 rounded-full">
            <span className="text-[#4e283a] font-semibold">Coming Soon</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Run Your Longarm Business<br />Like a <span className="text-[#4e283a]">Pro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            StitchQueue is a workflow management system for professional longarm quilters.
            Track every project from estimate to delivery — and finally know if you're making money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#waitlist"
              className="bg-[#4e283a] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#3d1f2e] transition-colors"
            >
              Join the Waitlist
            </a>
            <button
              onClick={() => setShowContactModal(true)}
              className="border-2 border-[#4e283a] text-[#4e283a] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#4e283a] hover:text-white transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Complete Workflow</h2>
            <p className="text-xl text-gray-600">From inquiry to delivery, manage every stage with ease</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { stage: '1', name: 'Estimates', desc: 'Collect client info, generate accurate pricing, send estimates for approval' },
              { stage: '2', name: 'In Progress', desc: 'Track active projects, upload photos, add notes' },
              { stage: '3', name: 'Completed', desc: 'Invoice, record payment, mark as delivered — then auto-archives' }
            ].map((item) => (
              <div key={item.stage} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#4e283a] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.stage}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Quilters, By a Quilter</h2>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The Problem</h3>
              <p className="text-gray-600 leading-relaxed">
                You're juggling spreadsheets, paper notebooks, and sticky notes. Calculating prices by hand.
                Wondering if you charged enough. Losing track of deposits. Unable to see your true profit.
              </p>
            </div>

            <div className="bg-[#4e283a] text-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">The Solution</h3>
              <p className="leading-relaxed opacity-90">
                StitchQueue's pricing calculator is your business engine. It doesn't just calculate estimates—it
                drives your entire workflow from inquiry through delivery. Track every project, know your true costs,
                and finally see if you're making money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Overhead Calculator Spotlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#4e283a] to-[#3d1f2e] rounded-2xl p-12 text-white">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full mb-4">
                <span className="text-sm font-semibold">OPTIONAL ADD-ON</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">Know Exactly What You Need to Charge</h2>
              <p className="text-xl opacity-90">The Business Overhead Calculator is an optional add-on for quilters who want to dig into their profitability.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">Rate Calculator</h3>
                <p className="opacity-90">Work backwards from your target hourly wage. Factor in overhead, experience level, and incidentals. Get your minimum $/sq inch.</p>
              </div>

              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">Real-Time Warning</h3>
                <p className="opacity-90">While building an estimate, StitchQueue warns you in real time if you're pricing below your target rate.</p>
              </div>

              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">Revenue Insights</h3>
                <p className="opacity-90">See what you earned this month, what's in your pipeline, and whether you're leaving money on the table.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Powerful features that save you time and make you money</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Smart Pricing', desc: 'Calculate accurate estimates in seconds. Your pricing calculator becomes your business engine.' },
              { title: 'Client Management', desc: 'Track every project from inquiry to delivery. Never lose track of a deposit again.' },
              { title: 'Business Analytics', desc: 'See your true costs. Know your actual hourly rate. Make informed pricing decisions.' },
              { title: 'Payment Tracking', desc: 'Record deposits and final payments. Know exactly who owes what at a glance.' },
              { title: 'Repeat Clients', desc: 'Automatically recognize returning customers. Pre-fill their information with one click.' },
              { title: 'Professional Invoices', desc: 'Generate polished invoices instantly. Pre-filled from your original estimate.' },
              { title: 'Charitable & Gift Project Tracking', desc: 'Track donated quilts separately from paid work. StitchQueue generates IRS-compliant documentation for charitable donations — making tax time a lot easier.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Pricing</h2>
          <p className="text-xl text-gray-600">Pricing announced at launch — join the waitlist to be first to know.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'When does StitchQueue launch?', a: 'We\'re putting the finishing touches on StitchQueue now. Join the waitlist to be notified the moment we go live.' },
              { q: 'Can I try it before I buy?', a: 'Yes, there will be a free trial. Details announced at launch.' },
              { q: 'Can I switch between monthly and annual?', a: 'Absolutely. Upgrade or downgrade anytime from your account settings.' },
              { q: 'Is my data safe?', a: 'Yes. StitchQueue has completed a comprehensive security audit and achieved an A+ security grade. Your data is protected with enterprise-grade security.' },
              { q: 'Can I export my data?', a: 'Yes. You own your data and can export it anytime as CSV or PDF.' }
            ].map((item, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#4e283a] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Be First to Know When We Launch</h2>
          <p className="text-xl mb-8 opacity-90">We'll notify you when StitchQueue launches. Be first in line.</p>

          <div className="bg-white text-gray-900 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Join the Waitlist</h3>
            <p className="text-gray-600 mb-6">We'll notify you when StitchQueue launches. Be first in line.</p>

            {/* Custom Form - Posts to ConvertKit */}
            <div className="max-w-md mx-auto">
              <form
                action="https://app.kit.com/forms/9063614/subscriptions"
                method="post"
                target="_blank"
                className="space-y-4"
              >
                {/* Hidden field that ConvertKit expects */}
                <input type="hidden" name="fields[null]" value="" />

                <div>
                  <input
                    type="email"
                    name="email_address"
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:border-[#4e283a] text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#4e283a] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3d1f2e] transition-colors"
                >
                  Join The Waitlist
                </button>
              </form>
            </div>

            <p className="text-sm text-gray-500 mt-6">We respect your privacy. Unsubscribe at any time.</p>
          </div>

          <div className="mt-12">
            <p className="text-lg opacity-90 mb-4">Questions about StitchQueue?</p>
            <button
              onClick={() => setShowContactModal(true)}
              className="text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#4e283a] transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[#4e283a] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold">StitchQueue</span>
              </div>
              <p className="text-gray-400">Business management for professional longarm quilters</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#waitlist" className="hover:text-white transition-colors">Waitlist</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><button onClick={() => setShowContactModal(true)} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 StitchQueue. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {contactSubmitted ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-5xl mb-4">&#10003;</div>
                <p className="text-lg font-semibold text-gray-900">Message sent!</p>
                <p className="text-gray-600 mt-2">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4e283a]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4e283a]"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your Message"
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#4e283a]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#4e283a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3d1f2e] transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
