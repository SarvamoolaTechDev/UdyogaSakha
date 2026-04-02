'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { governanceApi } from '@udyogasakha/api-client';
import { formatDate } from '@/components/ui';

export default function SessionsPage() {
  const [form, setForm] = useState({ candidateId: '', scheduledAt: '', domain: '' });
  const scheduleMutation = useMutation({ mutationFn: governanceApi.scheduleSession });

  const handle = () => {
    scheduleMutation.mutate(form, {
      onSuccess: () => setForm({ candidateId: '', scheduledAt: '', domain: '' }),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Screening Sessions</h1>

      {/* Schedule new session */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-medium text-gray-700">Schedule a DEP Screening Session</h2>
        <p className="text-sm text-gray-400">
          The logged-in admin acts as the panel member. A conflict-of-interest check runs automatically.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate User ID</label>
            <input
              value={form.candidateId}
              onChange={(e) => setForm((f) => ({ ...f, candidateId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
              placeholder="UUID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <input
              value={form.domain}
              onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
              placeholder="e.g. Technology, Finance"
            />
          </div>
        </div>

        {scheduleMutation.isError && (
          <p className="text-sm text-red-500">
            Failed to schedule — check if a conflict of interest has been declared.
          </p>
        )}
        {scheduleMutation.isSuccess && (
          <p className="text-sm text-teal-600">Session scheduled successfully ✓</p>
        )}

        <button
          onClick={handle}
          disabled={!form.candidateId.trim() || !form.scheduledAt || !form.domain.trim() || scheduleMutation.isPending}
          className="px-4 py-2 bg-[#185FA5] text-white text-sm font-medium rounded-lg hover:bg-[#144e8a] disabled:opacity-50 transition-colors"
        >
          {scheduleMutation.isPending ? 'Scheduling…' : 'Schedule Session'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm text-gray-400">
          Session history and outcome recording — requires sessions to be fetched from the API.
          Wire up a <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">GET /governance/sessions</code> endpoint
          in Phase 2 when DEP workflows are fully activated.
        </p>
      </div>
    </div>
  );
}
