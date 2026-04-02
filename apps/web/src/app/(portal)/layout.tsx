'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationsBell } from '@/components/ui/NotificationsBell';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard',         label: 'Dashboard'      },
  { href: '/opportunities',     label: 'Opportunities'  },
  { href: '/opportunities/my',  label: 'My Listings'    },
  { href: '/engagements',       label: 'Engagements'    },
  { href: '/profile',           label: 'Profile & Trust'},
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const { data: user } = useProfile();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col py-6 px-3 shrink-0">
        <div className="mb-8 px-3">
          <span className="text-xl font-bold text-[#1D9E75]">UdyogaSakha</span>
        </div>
        <nav className="flex flex-col gap-0.5 flex-1">
          {navLinks.map((l) => {
            const active = pathname === l.href || (l.href !== '/dashboard' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-teal-50 text-[#1D9E75] font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="mt-4 pt-4 border-t border-gray-100 px-3 space-y-2">
          <p className="text-xs font-medium text-gray-700 truncate">
            {user?.profile?.fullName ?? user?.email ?? '—'}
          </p>
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-end gap-3">
          <NotificationsBell />
        </header>
        <main className="flex-1 bg-gray-50 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
