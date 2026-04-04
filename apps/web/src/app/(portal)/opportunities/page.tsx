'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSearch } from '@/hooks/useSearch';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { ApplyModal } from '@/components/ui/ApplyModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ModuleType } from '@udyogasakha/types';
import { moduleTypeLabel } from '@/lib/utils';

const MODULE_FILTERS = [
  { value: '', label: 'All' },
  ...Object.values(ModuleType).map((v) => ({ value: v, label: moduleTypeLabel(v) })),
];

/** Sync search state to/from URL query params so links are shareable */
function useUrlState() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const q          = searchParams.get('q')      ?? '';
  const moduleType = (searchParams.get('module') ?? '') as ModuleType | '';
  const page       = parseInt(searchParams.get('page') ?? '1', 10);

  const setParams = useCallback(
    (updates: { q?: string; module?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.q   !== undefined) updates.q   ? params.set('q', updates.q)         : params.delete('q');
      if (updates.module !== undefined) updates.module ? params.set('module', updates.module) : params.delete('module');
      if (updates.page !== undefined) updates.page > 1 ? params.set('page', String(updates.page)) : params.delete('page');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { q, moduleType, page, setParams };
}

export default function OpportunitiesPage() {
  const { q, moduleType, page, setParams } = useUrlState();
  const [rawQ, setRawQ]                    = useState(q);
  const [applyTarget, setApplyTarget]      = useState<{ id: string; title: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Keep rawQ in sync if URL changes externally (back/forward navigation)
  useEffect(() => { setRawQ(q); }, [q]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParams({ q: val, page: 1 }), 400);
  }, [setParams]);

  const { data, isLoading } = useSearch({
    q:          q     || undefined,
    moduleType: (moduleType as ModuleType) || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Opportunities</h1>
        <Link
          href="/opportunities/new"
          className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64] transition-colors"
        >
          + Post Opportunity
        </Link>
      </div>

      {/* Search */}
      <input
        type="search"
        value={rawQ}
        onChange={handleSearch}
        placeholder="Search opportunities…"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
      />

      {/* Module filter chips */}
      <div className="flex flex-wrap gap-2">
        {MODULE_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setParams({ module: f.value, page: 1 })}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              moduleType === f.value
                ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#1D9E75]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Share URL hint */}
      {(q || moduleType) && (
        <p className="text-xs text-gray-400">
          🔗 This search is shareable — copy the URL to share these results.
        </p>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !data?.hits?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No opportunities found"
            description="Try adjusting your search or filter."
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.hits.map((opp: any) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onApply={(id) => setApplyTarget({ id, title: opp.title })}
              />
            ))}
          </div>

          {(data.totalPages ?? 1) > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                disabled={page === 1}
                onClick={() => setParams({ page: page - 1 })}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {data.totalPages}</span>
              <button
                disabled={page === data.totalPages}
                onClick={() => setParams({ page: page + 1 })}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400 text-right">
            {data.total} result{data.total !== 1 ? 's' : ''} · via {data.source}
          </p>
        </>
      )}

      {applyTarget && (
        <ApplyModal
          opportunityId={applyTarget.id}
          opportunityTitle={applyTarget.title}
          onClose={() => setApplyTarget(null)}
        />
      )}
    </div>
  );
}
