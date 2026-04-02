'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearch } from '@/hooks/useSearch';
import { useApply } from '@/hooks/useEngagements';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { ModuleChip } from '@/components/ui/ModuleChip';
import { ModuleType } from '@udyogasakha/types';
import { moduleTypeLabel } from '@/lib/utils';

const MODULE_FILTERS = [{ value: undefined, label: 'All' }, ...Object.values(ModuleType).map((v) => ({ value: v, label: moduleTypeLabel(v) }))];

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  const timer = useState<ReturnType<typeof setTimeout>>();
  const set = useCallback((v: string) => {
    clearTimeout(timer[0] as any);
    (timer as any)[0] = setTimeout(() => setDebounced(v), delay);
  }, [delay, timer]);
  return [debounced, set] as const;
}

export default function OpportunitiesPage() {
  const [q, setQ] = useDebounce('', 400);
  const [rawQ, setRawQ] = useState('');
  const [moduleType, setModuleType] = useState<ModuleType | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSearch({ q, moduleType, page, limit: 20 });
  const applyMutation = useApply();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawQ(e.target.value);
    setQ(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Opportunities</h1>
        <Link
          href="/opportunities/new"
          className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64] transition-colors"
        >
          + Post Opportunity
        </Link>
      </div>

      {/* Search bar */}
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

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-44" />
          ))}
        </div>
      ) : data?.hits?.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">No opportunities found. Try a different search or filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.hits?.map((opp: any) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onApply={(id) => applyMutation.mutate({ opportunityId: id })}
              />
            ))}
          </div>

          {/* Pagination */}
          {(data?.totalPages ?? 1) > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {page} / {data?.totalPages}
              </span>
              <button
                disabled={page === data?.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400 text-right">
            {data?.total} result{data?.total !== 1 ? 's' : ''} · via {data?.source}
          </p>
        </>
      )}
    </div>
  );
}
