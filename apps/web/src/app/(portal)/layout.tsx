import Link from 'next/link';

const navLinks = [
  { href: '/dashboard',     label: 'Dashboard'     },
  { href: '/opportunities', label: 'Opportunities'  },
  { href: '/engagements',   label: 'Engagements'   },
  { href: '/profile',       label: 'Profile & Trust'},
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
        <div className="mb-8">
          <span className="text-xl font-bold text-[#1D9E75]">UdyogaSakha</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1D9E75] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          {/* TODO: UserAvatarMenu — name, trust badge, logout */}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
