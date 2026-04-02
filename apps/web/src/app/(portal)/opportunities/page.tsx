'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearch } from '@/hooks/useSearch';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { ApplyModal } from '@/components/ui/ApplyModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ModuleType } from '@udyogasakha/types';
import { moduleTypeLabel } from '@/lib/utils';

const MODULE_FILTERS = [
  { value: undefined, label: 'All' },
  ...Object.values(ModuleType).map((v) => ({ value: v, label: moduleTypeLabel(v) })),
];

export default function OpportunitiesPage() {
  const [rawQ, setRawQ] = useState('');
  const [q, setQ] = useState('');
  const [moduleType, setModuleType] = useState<ModuleType | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [applyTarget, setApplyTarget] = useState<{ id: string; title: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRawQ(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQ(e.target.value);
      setPage(1);
    }, 400);
  }, []);

  const { data, isLoading } = useSearch({ q, moduleType, page, limit: 20 });

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

      <input
        type="search"
        value={rawQ}
        onChange={handleSearch}
        placeholder="Search opportunities…"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
      />

      <div className="flex flex-wrap gap-2">
        {MODULE_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => { setModuleType(f.value as ModuleType | undefined); setPage(1); }}
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !data?.hits?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No opportunities found"
            description="Try adjusting your search or filter, or check back later."
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
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {data.totalPages}</span>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
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
