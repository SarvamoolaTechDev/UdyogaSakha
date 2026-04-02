'use client';

import { useState } from 'react';
import { usePublishOpportunity, useRejectOpportunity } from '@/hooks/useAdmin';
import { TrustBadge } from './TrustBadge';
import { ModuleChip } from './ModuleChip';
import { formatDate, truncate } from '@/lib/utils';

interface OpportunityModerationTableProps {
  opportunities: any[];
  isLoading: boolean;
}

export function OpportunityModerationTable({ opportunities, isLoading }: OpportunityModerationTableProps) {
  const publishMutation = usePublishOpportunity();
  const rejectMutation  = useRejectOpportunity();
  const [rejectModal, setRejectModal] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (!rejectModal || !rejectReason.trim()) return;
    rejectMutation.mutate(
      { id: rejectModal.id, reason: rejectReason },
      { onSuccess: () => { setRejectModal(null); setRejectReason(''); } },
    );
  };

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-50">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-6 py-4 animate-pulse flex gap-4">
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!opportunities?.length) {
    return (
      <div className="px-6 py-12 text-center text-sm text-gray-400">
        Queue is empty — no opportunities awaiting review.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-50">
        {opportunities.map((opp: any) => (
          <div key={opp.id} className="px-6 py-4 flex items-start gap-4">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <ModuleChip moduleType={opp.moduleType} />
                <TrustBadge level={opp.trustLevelRequired} size="sm" />
              </div>
              <p className="font-medium text-gray-800">{opp.title}</p>
              <p className="text-sm text-gray-500">{truncate(opp.description, 120)}</p>
              <p className="text-xs text-gray-400">
                By {opp.requester?.profile?.fullName ?? 'Unknown'} · Submitted {formatDate(opp.createdAt)}
              </p>
            </div>
            <div className="flex gap-2 shrink-0 pt-1">
              <button
                onClick={() => publishMutation.mutate(opp.id)}
                disabled={publishMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => setRejectModal({ id: opp.id, title: opp.title })}
                className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Reject Listing</h3>
            <p className="text-sm text-gray-500">
              Rejecting: <span className="font-medium text-gray-700">"{rejectModal.title}"</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Explain why this listing cannot be approved…"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
