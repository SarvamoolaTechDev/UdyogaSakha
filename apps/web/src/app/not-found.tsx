import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page Not Found' };

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-5">
        <p className="text-7xl font-bold text-gray-100">404</p>
        <h1 className="text-2xl font-semibold text-gray-800">Page not found</h1>
        <p className="text-gray-500 text-sm">
          The page you are looking for doesn't exist or may have been moved.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/dashboard"
            className="px-5 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64] transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/opportunities"
            className="px-5 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse Opportunities
          </Link>
        </div>
      </div>
    </main>
  );
}
