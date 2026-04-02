'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@udyogasakha/api-client';
import { formatDate } from '@/components/ui';

function useConflictDeclarations(memberId: string) {
  return useQuery({
    queryKey: ['admin', 'governance', 'conflicts', memberId],
    queryFn: () => apiClient.get(`/governance/members/${memberId}/conflicts`).then((r) => (r.data as any).data),
    enabled: !!memberId,
  });
}

export default function ConflictsPage() {
  const [memberId, setMemberId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { data, isLoading } = useConflictDeclarations(submitted ? memberId : '');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Conflict Declarations</h1>
        <p className="text-sm text-gray-500 mt-1">
          View conflict-of-interest declarations made by governance members. These are logged in the audit trail.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex gap-3">
          <input
            value={memberId}
            onChange={(e) => { setMemberId(e.target.value); setSubmitted(false); }}
            placeholder="Governance member User ID (UUID)"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
          />
          <button
            onClick={() => setSubmitted(true)}
            disabled={!memberId.trim()}
            className="px-4 py-2 bg-[#185FA5] text-white text-sm rounded-lg disabled:opacity-50 hover:bg-[#144e8a] transition-colors"
          >
            Search
          </button>
        </div>

        {submitted && (
          <>
            {isLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
            ) : !data?.length ? (
              <p className="text-sm text-gray-400 text-center py-4">No conflict declarations found for this member.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.map((d: any) => (
                  <div key={d.id} className="py-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                        {d.entityType}
                      </span>
                      <span className="text-xs font-mono text-gray-500">{d.entityId}</span>
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(d.declaredAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{d.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-800">Note on conflict handling</p>
        <p className="text-sm text-blue-600 mt-1">
          When a panel member declares a conflict with a candidate, the system automatically blocks them from being assigned to that candidate's screening session. All declarations are permanently logged in the audit trail.
        </p>
      </div>
    </div>
  );
}
