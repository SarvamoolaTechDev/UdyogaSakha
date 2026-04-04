'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@udyogasakha/api-client';
import { TrustBadge, ModuleChip, formatDate, truncate } from '../components/ui';

function useOpportunityDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'opportunity', id],
    queryFn: () => apiClient.get(`/opportunities/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

interface OpportunityDetailModalProps {
  opportunityId: string;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function OpportunityDetailModal({
  opportunityId, onClose, onApprove, onReject,
}: OpportunityDetailModalProps) {
  const { data: opp, isLoading } = useOpportunityDetail(opportunityId);

  const handleReject = () => {
    const reason = window.prompt('Reason for rejection (required):');
    if (reason?.trim()) onReject(reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Review Opportunity</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : !opp ? (
          <div className="p-8 text-center text-sm text-gray-400">Not found.</div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Meta */}
            <div className="flex items-start gap-3 flex-wrap">
              <ModuleChip moduleType={opp.moduleType} />
              <TrustBadge level={opp.trustLevelRequired} size="sm" />
              <span className="text-xs text-gray-400 ml-auto">
                Submitted {formatDate(opp.createdAt)}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">{opp.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                By {opp.requester?.profile?.fullName ?? opp.requesterId}
                {opp.requester?.email ? ` · ${opp.requester.email}` : ''}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{opp.description}</p>
            </div>

            {/* Module-specific details */}
            {opp.details && Object.keys(opp.details).filter((k) => k !== 'moduleType').length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Details</p>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(opp.details as Record<string, unknown>)
                    .filter(([k]) => k !== 'moduleType')
                    .map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-lg px-3 py-2">
                        <dt className="text-xs text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</dt>
                        <dd className="font-medium text-gray-800 mt-0.5 text-xs">{String(v ?? '—')}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            )}

            {/* Requester trust level */}
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
              <div>
                <p className="text-xs font-medium text-blue-800">Requester Trust Level</p>
                <TrustBadge
                  level={opp.requester?.trustRecord?.currentLevel ?? 'L0_REGISTERED'}
                  size="sm"
                />
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-blue-600">Reputation</p>
                <p className="font-bold text-blue-800">{opp.requester?.trustRecord?.reputationScore?.toFixed(1) ?? '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleReject} className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
            Reject
          </button>
          <button onClick={onApprove} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Approve & Publish
          </button>
        </div>
      </div>
    </div>
  );
}
