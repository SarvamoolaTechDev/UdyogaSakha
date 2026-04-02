'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    heading: 'Overview',
    links: [{ href: '/analytics', label: 'Analytics' }],
  },
  {
    heading: 'Operations',
    links: [
      { href: '/moderation', label: 'Moderation Queue' },
      { href: '/users',      label: 'User Management'  },
    ],
  },
  {
    heading: 'Trust',
    links: [
      { href: '/trust',                label: 'Verification Requests' },
    ],
  },
  {
    heading: 'Governance',
    links: [
      { href: '/governance',          label: 'Council Members'   },
      { href: '/governance/sessions', label: 'Screening Sessions'},
      { href: '/governance/conflicts', label: 'Conflict Declarations'},
    ],
  },
  {
    heading: 'Transparency',
    links: [{ href: '/audit', label: 'Audit Log' }],
  },
];

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col py-6 px-3 shrink-0">
        <div className="mb-8 px-3">
          <span className="text-base font-bold text-[#993C1D]">UdyogaSakha</span>
          <span className="ml-2 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded">ADMIN</span>
        </div>

        <nav className="flex flex-col gap-5 flex-1">
          {sections.map((s) => (
            <div key={s.heading}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">{s.heading}</p>
              {s.links.map((l) => {
                const active = pathname === l.href || pathname.startsWith(l.href + '/');
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      active ? 'bg-red-50 text-[#993C1D] font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-[#185FA5]'
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-100 px-3">
          <p className="text-xs text-gray-400">Admin Portal v0.1</p>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 p-8 overflow-auto">{children}</main>
    </div>
  );
}
