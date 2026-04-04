'use client';

import { useState } from 'react';
import {
  usePendingOpportunities, usePendingReports,
  usePublishOpportunity, useRejectOpportunity, useResolveReport,
} from '@/hooks/useAdmin';
import { OpportunityDetailModal } from '@/components/OpportunityDetailModal';
import { formatDate } from '@/components/ui';

const TABS = ['Opportunities', 'Reports'] as const;

export default function ModerationPage() {
  const [tab, setTab] = useState<'Opportunities' | 'Reports'>('Opportunities');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data: opps,    isLoading: oppsLoading    } = usePendingOpportunities();
  const { data: reports, isLoading: reportsLoading } = usePendingReports();
  const publishMutation = usePublishOpportunity();
  const rejectMutation  = useRejectOpportunity();
  const resolveMutation = useResolveReport();

  const handleApprove = (id: string) => {
    publishMutation.mutate(id, { onSuccess: () => setPreviewId(null) });
  };

  const handleReject = (id: string, reason: string) => {
    rejectMutation.mutate({ id, reason }, { onSuccess: () => setPreviewId(null) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Moderation Queue</h1>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Auto-refreshes every 30s
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Opportunities Pending</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{opps?.length ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Open Reports</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{reports?.length ?? '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? 'border-[#185FA5] text-[#185FA5]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
              {t === 'Opportunities' && opps?.length
                ? ` (${opps.length})`
                : t === 'Reports' && reports?.length
                ? ` (${reports.length})`
                : ''}
            </button>
          ))}
        </div>

        {/* Opportunities tab */}
        {tab === 'Opportunities' && (
          <div>
            {oppsLoading ? (
              <div className="divide-y divide-gray-50">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="px-6 py-4 animate-pulse flex gap-4">
                    <div className="h-4 bg-gray-100 rounded flex-1" />
                    <div className="h-4 bg-gray-100 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : !opps?.length ? (
              <p className="px-6 py-12 text-center text-sm text-gray-400">
                Queue is empty — no opportunities awaiting review.
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {opps.map((opp: any) => (
                  <div key={opp.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-medium text-gray-800 truncate">{opp.title}</p>
                      <p className="text-xs text-gray-400">
                        {opp.moduleType?.replace(/_/g, ' ')} ·{' '}
                        By {opp.requester?.profile?.fullName ?? 'Unknown'} ·{' '}
                        Submitted {formatDate(opp.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 pt-0.5">
                      <button
                        onClick={() => setPreviewId(opp.id)}
                        className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleApprove(opp.id)}
                        disabled={publishMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt('Reason for rejection:');
                          if (reason?.trim()) handleReject(opp.id, reason.trim());
                        }}
                        className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports tab */}
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {r.subjectType}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{r.reason}</p>
                    {r.detail && <p className="text-sm text-gray-500 mt-0.5">{r.detail}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      By {r.reporter?.profile?.fullName ?? r.reporterId} · {formatDate(r.submittedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => resolveMutation.mutate({ id: r.id, resolution: 'Reviewed and actioned' })}
                    disabled={resolveMutation.isPending}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Resolve
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Opportunity detail modal */}
      {previewId && (
        <OpportunityDetailModal
          opportunityId={previewId}
          onClose={() => setPreviewId(null)}
          onApprove={() => handleApprove(previewId)}
          onReject={(reason) => handleReject(previewId, reason)}
        />
      )}
    </div>
  );
}
