'use client'

import { useState } from 'react'

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false)

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
              <a href="#pricing" className="text-gray-700 hover:text-[#4e283a] transition-colors">Pricing</a>
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
            <span className="text-[#4e283a] font-semibold">Launching April 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Run your longarm business<br />like a <span className="text-[#4e283a]">pro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The only business management platform built exclusively for professional longarm quilters. 
            From estimate to delivery, StitchQueue keeps you organized and profitable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#waitlist"
              className="bg-[#4e283a] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#3d1f2e] transition-colors"
            >
              Join the Waitlist
            </a>
            <a
              href="mailto:support@stitchqueue.com"
              className="border-2 border-[#4e283a] text-[#4e283a] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#4e283a] hover:text-white transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your complete workflow</h2>
            <p className="text-xl text-gray-600">From inquiry to delivery, manage every stage with ease</p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { stage: '1', name: 'Intake', desc: 'Collect client details' },
              { stage: '2', name: 'Estimate', desc: 'Generate pricing' },
              { stage: '3', name: 'In Progress', desc: 'Track work' },
              { stage: '4', name: 'Invoiced', desc: 'Send invoice' },
              { stage: '5', name: 'Paid/Shipped', desc: 'Complete project' },
              { stage: '6', name: 'Archived', desc: 'Searchable history' }
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for quilters, by a quilter</h2>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The problem</h3>
              <p className="text-gray-600 leading-relaxed">
                You're juggling spreadsheets, paper notebooks, and sticky notes. Calculating prices by hand. 
                Wondering if you charged enough. Losing track of deposits. Unable to see your true profit.
              </p>
            </div>
            
            <div className="bg-[#4e283a] text-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-4">The solution</h3>
              <p className="leading-relaxed opacity-90">
                StitchQueue's pricing calculator is your business engine. It doesn't just calculate estimates—it 
                drives your entire workflow from inquiry through delivery. Track every project, know your true costs, 
                and finally see if you're making money.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business calculator Spotlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#4e283a] to-[#3d1f2e] rounded-2xl p-12 text-white">
            <div className="text-center mb-8">
              <div className="inline-block px-4 py-2 bg-white/20 rounded-full mb-4">
                <span className="text-sm font-semibold">PRO TIER EXCLUSIVE</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">Business calculator</h2>
              <p className="text-xl opacity-90">Stop guessing. Know exactly what you need to charge.</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">📊 Rate calculator</h3>
                <p className="opacity-90">Work backwards from your desired hourly wage. Factor in experience level, monthly overhead, and per-project incidentals. Get your minimum $/sq inch needed to hit your target.</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">📈 Performance dashboard</h3>
                <p className="opacity-90">See your actual hourly rate from completed projects. Compare against your goal. Discover which services are most profitable.</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">💰 Reality check</h3>
                <p className="opacity-90">Compare what you <em>should</em> charge vs. what you <em>do</em> charge. Stop leaving money on the table.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need</h2>
            <p className="text-xl text-gray-600">Powerful features that save you time and make you money</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Smart pricing', desc: 'Calculate accurate estimates in seconds. Your pricing calculator becomes your business engine.' },
              { title: 'Client management', desc: 'Track every project from inquiry to delivery. Never lose track of a deposit again.' },
              { title: 'Business analytics', desc: 'See your true costs. Know your actual hourly rate. Make informed pricing decisions.' },
              { title: 'Payment tracking', desc: 'Record deposits and final payments. Know exactly who owes what at a glance.' },
              { title: 'Repeat clients', desc: 'Automatically recognize returning customers. Pre-fill their information with one click.' },
              { title: 'Professional invoices', desc: 'Generate polished invoices instantly. Pre-filled from your original estimate.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">What quilters are saying</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Susan S.', text: 'Finally, software that understands longarm quilting!' },
              { name: 'Jennifer M.', text: 'The pricing calculator alone is worth it.' },
              { name: 'Lisa K.', text: 'I can see my profit for the first time ever.' }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600 mb-8">Choose the plan that fits your business</p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`font-semibold ${!isAnnual ? 'text-[#4e283a]' : 'text-gray-500'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#4e283a]"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`font-semibold ${isAnnual ? 'text-[#4e283a]' : 'text-gray-500'}`}>Annual</span>
              <span className="text-sm text-green-600 font-semibold">Save 25%</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* FREE */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Studio</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600">Complete 6-stage workflow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600">Pricing calculator with manual entry</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600">Record deposits & payments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600">Generate invoices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600">Unlimited projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600">Single user</span>
                </li>
              </ul>
              <a href="#waitlist" className="block w-full text-center bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Join Waitlist
              </a>
            </div>

            {/* SOLO PRO */}
            <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-[#4e283a] relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-[#98823a] text-white px-4 py-1 rounded-full text-sm font-semibold">MOST POPULAR</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Solo Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${isAnnual ? '9' : '12'}</span>
                <span className="text-gray-600">/month</span>
                {isAnnual && <div className="text-sm text-green-600 font-semibold">$90/year (save $54)</div>}
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600"><strong>Everything in Studio, plus:</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4e283a] mr-2">★</span>
                  <span className="text-gray-600">Saved pricing rates & settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4e283a] mr-2">★</span>
                  <span className="text-gray-600">Business calculator</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4e283a] mr-2">★</span>
                  <span className="text-gray-600">Email estimates & invoices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4e283a] mr-2">★</span>
                  <span className="text-gray-600">Client intake form</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4e283a] mr-2">★</span>
                  <span className="text-gray-600">Financial reports & analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600">Single user</span>
                </li>
              </ul>
              <a href="#waitlist" className="block w-full text-center bg-[#4e283a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3d1f2e] transition-colors">
                Join Waitlist
              </a>
            </div>

            {/* TEAM PRO */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Team Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${isAnnual ? '14.25' : '19'}</span>
                <span className="text-gray-600">/month</span>
                {isAnnual && <div className="text-sm text-green-600 font-semibold">$140/year (save $88)</div>}
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-600"><strong>Everything in Solo Pro, plus:</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4e283a] mr-2">★</span>
                  <span className="text-gray-600">Up to 5 users</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4e283a] mr-2">★</span>
                  <span className="text-gray-600">Team collaboration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#4e283a] mr-2">★</span>
                  <span className="text-gray-600">Shared project access</span>
                </li>
              </ul>
              <a href="#waitlist" className="block w-full text-center bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Join Waitlist
              </a>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              <strong>Limited Time:</strong> Join the waitlist and lock in Founder pricing — 25% off for life!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              { q: 'When does StitchQueue launch?', a: 'April 2026. Join the waitlist to be notified when we go live.' },
              { q: 'Can I try it before I buy?', a: 'Yes! The Studio (FREE) tier gives you full access to the core workflow. Upgrade to Pro anytime.' },
              { q: 'What if I only have one or two clients per month?', a: 'The Studio tier is perfect for you and always free. Upgrade when you need saved settings and reports.' },
              { q: 'Do you offer refunds?', a: 'Yes. If Pro isn\'t right for you within the first 30 days, we\'ll refund your money.' },
              { q: 'Can I switch between monthly and annual?', a: 'Absolutely. Upgrade or downgrade anytime from your account settings.' },
              { q: 'What about Founder pricing?', a: 'Join the waitlist to lock in 25% off for life. This offer expires at launch.' },
              { q: 'Is my data safe?', a: 'Your data is encrypted and backed up daily. We never share your information with third parties.' },
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
          <h2 className="text-4xl font-bold mb-4">Be first to know when we launch</h2>
          <p className="text-xl mb-8 opacity-90">Join the waitlist to get early access, exclusive Founder pricing, and launch updates.</p>
          
          <div className="bg-white text-gray-900 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Join the waitlist</h3>
            <p className="text-gray-600 mb-6">We'll notify you when StitchQueue launches in April 2026</p>
            
            <a
              href="https://stitchedbysusan.myflodesk.com/stitchqueue"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#4e283a] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3d1f2e] transition-colors"
            >
              Join the Waitlist
            </a>

            <p className="text-sm text-gray-500 mt-6">We respect your privacy. Unsubscribe at any time.</p>
          </div>

          <div className="mt-12">
            <p className="text-lg opacity-90 mb-4">Questions about StitchQueue?</p>
            <a
              href="mailto:support@stitchqueue.com"
              className="text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#4e283a] transition-colors inline-block"
            >
              Contact Us
            </a>
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
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#waitlist" className="hover:text-white transition-colors">Waitlist</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="mailto:support@stitchqueue.com" className="hover:text-white transition-colors">Contact</a></li>
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
    </>
  )
}
