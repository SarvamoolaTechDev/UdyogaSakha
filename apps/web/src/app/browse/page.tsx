import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Browse Opportunities — UdyogaSakha',
  description: 'Browse verified opportunities across employment, projects, consultancy, training, vendor services and more on UdyogaSakha.',
};

// Server component — data fetched on server, SEO-friendly
async function fetchPublicOpportunities(query?: string, moduleType?: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (moduleType) params.set('moduleType', moduleType);

  try {
    // Note: public search doesn't require auth token
    const res = await fetch(`${apiUrl}/search/opportunities?${params}`, {
      next: { revalidate: 60 }, // revalidate every 60s
    });
    if (!res.ok) return { hits: [], total: 0 };
    const json = await res.json();
    // Unwrap TransformInterceptor envelope
    return json.data ?? json;
  } catch {
    return { hits: [], total: 0 };
  }
}

const MODULE_TYPES = [
  { value: '', label: 'All' },
  { value: 'EMPLOYMENT_EXCHANGE', label: 'Employment' },
  { value: 'PROJECT_TENDER', label: 'Projects & Tenders' },
  { value: 'CONSULTANCY_ADVISORY', label: 'Consultancy' },
  { value: 'SERVICE_ENGAGEMENT', label: 'Service Roles' },
  { value: 'TRAINING_SKILL_DEV', label: 'Training' },
  { value: 'VENDOR_MARKETPLACE', label: 'Vendor' },
  { value: 'STARTUP_INNOVATION', label: 'Startup' },
  { value: 'VOLUNTEER_SOCIAL', label: 'Volunteer' },
];

const MODULE_COLORS: Record<string, string> = {
  EMPLOYMENT_EXCHANGE: 'bg-blue-50 text-blue-700',
  PROJECT_TENDER: 'bg-violet-50 text-violet-700',
  CONSULTANCY_ADVISORY: 'bg-purple-50 text-purple-700',
  SERVICE_ENGAGEMENT: 'bg-teal-50 text-teal-700',
  TRAINING_SKILL_DEV: 'bg-cyan-50 text-cyan-700',
  VENDOR_MARKETPLACE: 'bg-green-50 text-green-700',
  STARTUP_INNOVATION: 'bg-orange-50 text-orange-700',
  VOLUNTEER_SOCIAL: 'bg-rose-50 text-rose-700',
};

export default async function PublicBrowsePage({
  searchParams,
}: {
  searchParams: { q?: string; module?: string };
}) {
  const q = searchParams.q ?? '';
  const moduleType = searchParams.module ?? '';
  const results = await fetchPublicOpportunities(q || undefined, moduleType || undefined);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#1D9E75]">UdyogaSakha</Link>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-1.5 text-sm bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a64]">
              Join
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Browse Opportunities</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verified opportunities across the community — governed by the Foundation's trust framework.
          </p>
        </div>

        {/* Search — uses URL params for SSR / shareability */}
        <form method="GET" className="flex gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search opportunities…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
          />
          <button type="submit" className="px-4 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-xl hover:bg-[#178a64]">
            Search
          </button>
        </form>

        {/* Module filter — also form-based for SSR */}
        <form method="GET" className="flex flex-wrap gap-2">
          {q && <input type="hidden" name="q" value={q} />}
          {MODULE_TYPES.map((m) => (
            <button
              key={m.value}
              name="module"
              value={m.value}
              type="submit"
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                moduleType === m.value
                  ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1D9E75]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </form>

        {/* Results */}
        {!results.hits?.length ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-sm">No opportunities found. Try a different search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.hits.map((opp: any) => (
                <div key={opp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${MODULE_COLORS[opp.moduleType] ?? 'bg-gray-100 text-gray-600'}`}>
                        {MODULE_TYPES.find((m) => m.value === opp.moduleType)?.label ?? opp.moduleType}
                      </span>
                      <h3 className="font-semibold text-gray-900 leading-snug">{opp.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{opp.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="text-xs text-gray-400">{opp.requesterName || 'UdyogaSakha member'}</span>
                    <Link
                      href={`/login?from=/opportunities/${opp.id}`}
                      className="text-sm font-medium text-[#1D9E75] hover:text-[#178a64]"
                    >
                      Sign in to apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-right">{results.total} result{results.total !== 1 ? 's' : ''}</p>
          </>
        )}

        {/* CTA */}
        <div className="bg-teal-50 rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-teal-800">Ready to participate?</p>
            <p className="text-sm text-teal-600 mt-0.5">Join UdyogaSakha to apply, post opportunities, and build your trust profile.</p>
          </div>
          <Link
            href="/register"
            className="shrink-0 px-5 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
