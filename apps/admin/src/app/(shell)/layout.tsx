import Link from 'next/link';

const sections = [
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
      { href: '/trust',      label: 'Trust Levels'     },
      { href: '/trust/verification', label: 'Verification Requests' },
    ],
  },
  {
    heading: 'Governance',
    links: [
      { href: '/governance', label: 'Council Members'  },
      { href: '/governance/sessions', label: 'Screening Sessions' },
    ],
  },
  {
    heading: 'Transparency',
    links: [
      { href: '/audit',      label: 'Audit Log'        },
    ],
  },
];

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col py-6 px-4 shrink-0">
        <div className="mb-8">
          <span className="text-base font-bold text-[#993C1D]">UdyogaSakha</span>
          <span className="ml-2 text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded">ADMIN</span>
        </div>

        <nav className="flex flex-col gap-5">
          {sections.map((s) => (
            <div key={s.heading}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-3">{s.heading}</p>
              {s.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-[#185FA5] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          {/* TODO: AdminUserMenu — name, role, logout */}
          <p className="text-xs text-gray-400 px-3">Admin Portal v0.1</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">{children}</main>
    </div>
  );
}
