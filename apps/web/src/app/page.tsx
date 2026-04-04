import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UdyogaSakha — Trusted Udyoga Ecosystem',
  description: 'UdyogaSakha is a Foundation-governed platform connecting opportunity seekers and providers under a transparent trust framework across employment, projects, consultancy, training, and more.',
};

const modules = [
  { label: 'Employment',  desc: 'Full-time, part-time, contract, advisory roles across all industries.' },
  { label: 'Projects',    desc: 'RFPs, tender bids, project announcements and structured proposals.' },
  { label: 'Consultancy', desc: 'Professional, legal, financial, and domain-specific advisory.' },
  { label: 'Training',    desc: 'Skill development programmes, certifications, apprenticeships.' },
  { label: 'Service Roles', desc: 'Cultural, traditional, and community service engagements.' },
  { label: 'Vendor',      desc: 'Artisans, farmers, home-based producers, micro-enterprises.' },
  { label: 'Startup',     desc: 'Ideas, innovation challenges, co-founder and mentor connect.' },
  { label: 'Volunteer',   desc: 'Structured social impact and skill-based volunteer initiatives.' },
];

const trust = [
  { level: 'L0', name: 'Registered',       desc: 'Create an account to get started.' },
  { level: 'L1', name: 'Doc Verified',     desc: 'Submit identity documents for verification.' },
  { level: 'L2', name: 'Foundation Screened', desc: 'Structured interview by the Foundation panel.' },
  { level: 'L3', name: 'Expert Certified', desc: 'Assessment by a Domain Expert Panel.' },
  { level: 'L4', name: 'Community Endorsed', desc: 'Earned through consistent positive engagement.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-[#1D9E75]">UdyogaSakha</span>
          <div className="flex items-center gap-3">
            <Link href="/browse" className="text-sm text-gray-600 hover:text-gray-900">Browse Opportunities</Link>
            <Link href="/login" className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Sign In</Link>
            <Link href="/register" className="px-4 py-1.5 text-sm bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a64]">Join</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full border border-teal-100">
          Foundation-governed · Trust-first · Community-driven
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          A trusted ecosystem for<br />dignified Udyoga participation
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          UdyogaSakha connects opportunity seekers and providers across nine categories of work
          under a transparent verification and trust framework, governed by the Foundation.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <Link href="/register" className="px-7 py-3 bg-[#1D9E75] text-white font-medium rounded-xl hover:bg-[#178a64] transition-colors">
            Create Account
          </Link>
          <Link href="/browse" className="px-7 py-3 border border-gray-200 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Browse Opportunities
          </Link>
        </div>
      </section>

      {/* Modules */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center">9 categories of Udyoga</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((m) => (
              <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-5 space-y-2">
                <p className="font-semibold text-gray-800">{m.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust framework */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Trust Framework — L0 to L4</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Every participant earns trust progressively. Opportunities specify the minimum level
              required, ensuring quality engagement at every tier.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            {trust.map((t, i) => (
              <div key={t.level} className="flex-1 bg-white border border-gray-100 rounded-xl p-4 space-y-1 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-200 to-teal-500" style={{ opacity: 0.3 + i * 0.15 }} />
                <span className="text-xs font-bold text-teal-600 pl-3">{t.level}</span>
                <p className="font-medium text-gray-800 text-sm pl-3">{t.name}</p>
                <p className="text-xs text-gray-400 pl-3 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#1D9E75] py-14">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-white">Ready to participate?</h2>
          <p className="text-teal-100 text-sm max-w-md mx-auto">
            Join the ecosystem and start building your verified presence in the community Udyoga network.
          </p>
          <Link href="/register" className="inline-block px-7 py-3 bg-white text-[#1D9E75] font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} UdyogaSakha · Foundation-governed · All rights reserved
      </footer>
    </main>
  );
}
