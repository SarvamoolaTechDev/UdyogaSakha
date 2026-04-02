'use client';

import { usePendingVerifications, useApproveL1, useRevokeBadge } from '@/hooks/useAdmin';
import { TrustBadge, formatDate } from '@/components/ui';

export default function TrustPage() {
  const { data: verifications, isLoading } = usePendingVerifications();
  const approveMutation = useApproveL1();
  const revokeMutation  = useRevokeBadge();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Trust Management</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">L1 Verification Requests</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Users who have submitted documents for identity verification.
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : !verifications?.length ? (
          <div className="p-8 text-center text-sm text-gray-400">No pending verification requests.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {verifications.map((req: any) => (
              <div key={req.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{req.userId}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {req.documentIds?.length ?? 0} document(s) submitted · {formatDate(req.requestedAt)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approveMutation.mutate(req.userId)}
                    disabled={approveMutation.isPending}
                    className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    Approve L1
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
