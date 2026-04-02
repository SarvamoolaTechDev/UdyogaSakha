'use client';

import { usePendingOpportunities, usePendingReports, useResolveReport } from '@/hooks/useAdmin';
import { OpportunityModerationTable } from '@/components/OpportunityModerationTable';
import { formatDate } from '@/components/ui';
import { useState } from 'react';

const TABS = ['Opportunities', 'Reports'] as const;

export default function ModerationPage() {
  const [tab, setTab] = useState<'Opportunities' | 'Reports'>('Opportunities');
  const { data: opps, isLoading: oppsLoading } = usePendingOpportunities();
  const { data: reports, isLoading: reportsLoading } = usePendingReports();
  const resolveMutation = useResolveReport();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Moderation Queue</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Auto-refreshes every 30s
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-amber-600 uppercase">Opportunities Pending</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{opps?.length ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-red-600 uppercase">Open Reports</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{reports?.length ?? '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-[#185FA5] text-[#185FA5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Opportunities' && (
          <OpportunityModerationTable opportunities={opps ?? []} isLoading={oppsLoading} />
        )}

        {tab === 'Reports' && (
          <div className="divide-y divide-gray-50">
            {reportsLoading ? (
              <p className="p-8 text-center text-sm text-gray-400">Loading…</p>
            ) : !reports?.length ? (
              <p className="p-8 text-center text-sm text-gray-400">No pending reports.</p>
            ) : (
              reports.map((r: any) => (
                <div key={r.id} className="px-6 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{r.subjectType}</span>
                      <span className="text-xs text-gray-400">ID: {r.subjectId}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1">{r.reason}</p>
                    {r.detail && <p className="text-sm text-gray-500 mt-0.5">{r.detail}</p>}
                    <p className="text-xs text-gray-400 mt-1">Reported by {r.reporter?.profile?.fullName ?? r.reporterId} · {formatDate(r.submittedAt)}</p>
                  </div>
                  <button
                    onClick={() => resolveMutation.mutate({ id: r.id, resolution: 'Reviewed and actioned' })}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
