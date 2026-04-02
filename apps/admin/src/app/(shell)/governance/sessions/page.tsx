'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { governanceApi } from '@udyogasakha/api-client';
import { apiClient } from '@udyogasakha/api-client';
import { formatDate } from '@/components/ui';

function useSessions() {
  return useQuery({
    queryKey: ['admin', 'governance', 'sessions'],
    queryFn: () => apiClient.get('/governance/sessions').then((r) => r.data),
  });
}

const OUTCOME_COLORS: Record<string, string> = {
  approved: 'bg-teal-50 text-teal-700',
  rejected: 'bg-red-50 text-red-700',
  deferred: 'bg-yellow-50 text-yellow-700',
};

export default function SessionsPage() {
  const [form, setForm] = useState({ candidateId: '', scheduledAt: '', domain: '' });
  const { data: sessions, isLoading, refetch } = useSessions();
  const scheduleMutation = useMutation({
    mutationFn: governanceApi.scheduleSession,
    onSuccess: () => { setForm({ candidateId: '', scheduledAt: '', domain: '' }); refetch(); },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Screening Sessions</h1>

      {/* Schedule form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-medium text-gray-700">Schedule a DEP Screening Session</h2>
        <p className="text-sm text-gray-400">
          Conflict-of-interest check runs automatically. The logged-in user acts as panel member.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate User ID</label>
            <input value={form.candidateId} onChange={(e) => setForm((f) => ({ ...f, candidateId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
              placeholder="UUID" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <input value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
              placeholder="e.g. Technology" />
          </div>
        </div>
        {scheduleMutation.isError && (
          <p className="text-sm text-red-500">Failed — check for conflict of interest declarations.</p>
        )}
        {scheduleMutation.isSuccess && (
          <p className="text-sm text-teal-600">Session scheduled ✓</p>
        )}
        <button onClick={() => scheduleMutation.mutate(form)}
          disabled={!form.candidateId.trim() || !form.scheduledAt || !form.domain.trim() || scheduleMutation.isPending}
          className="px-4 py-2 bg-[#185FA5] text-white text-sm font-medium rounded-lg hover:bg-[#144e8a] disabled:opacity-50">
          {scheduleMutation.isPending ? 'Scheduling…' : 'Schedule Session'}
        </button>
      </div>

      {/* Sessions list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">All Sessions</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : !sessions?.length ? (
          <div className="p-8 text-center text-sm text-gray-400">No sessions scheduled yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Candidate', 'Panel Member', 'Domain', 'Scheduled', 'Status', 'Outcome'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sessions.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500 truncate max-w-[100px]">{s.candidateId}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500 truncate max-w-[100px]">{s.panelMemberId}</td>
                  <td className="px-5 py-3 text-gray-700">{s.domain}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(s.scheduledAt)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${s.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {s.outcome ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${OUTCOME_COLORS[s.outcome] ?? 'bg-gray-100 text-gray-600'}`}>
                        {s.outcome}
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
