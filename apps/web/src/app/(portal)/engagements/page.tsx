'use client';

import { useState } from 'react';
import { useMyApplications, useMyEngagements, useCloseEngagement } from '@/hooks/useEngagements';
import { formatDate } from '@/lib/utils';
import { EngagementStatus } from '@udyogasakha/types';

const TABS = ['My Applications', 'My Engagements'] as const;
type Tab = typeof TABS[number];

const STATUS_COLORS: Record<string, string> = {
  PENDING:     'bg-yellow-50 text-yellow-700',
  SHORTLISTED: 'bg-blue-50 text-blue-700',
  ACCEPTED:    'bg-teal-50 text-teal-700',
  DECLINED:    'bg-red-50 text-red-700',
  WITHDRAWN:   'bg-gray-100 text-gray-500',
  INITIATED:   'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-teal-50 text-teal-700',
  COMPLETED:   'bg-green-50 text-green-700',
  CANCELLED:   'bg-gray-100 text-gray-500',
};

export default function EngagementsPage() {
  const [tab, setTab] = useState<Tab>('My Applications');
  const { data: applications, isLoading: appsLoading } = useMyApplications();
  const { data: engagements, isLoading: engsLoading } = useMyEngagements();
  const closeMutation = useCloseEngagement();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Engagements</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-[#1D9E75] text-[#1D9E75]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'My Applications' && applications ? ` (${applications.length})` : ''}
            {t === 'My Engagements' && engagements ? ` (${engagements.length})` : ''}
          </button>
        ))}
      </div>

      {/* Applications tab */}
      {tab === 'My Applications' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {appsLoading ? (
            <p className="p-8 text-center text-sm text-gray-400">Loading…</p>
          ) : applications?.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400">
              You haven't applied to any opportunities yet.
            </p>
          ) : (
            applications?.map((app: any) => (
              <div key={app.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {app.opportunity?.title ?? 'Opportunity'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Applied {formatDate(app.appliedAt)}</p>
                  {app.reviewNote && (
                    <p className="text-xs text-gray-500 mt-1 italic">"{app.reviewNote}"</p>
                  )}
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Engagements tab */}
      {tab === 'My Engagements' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {engsLoading ? (
            <p className="p-8 text-center text-sm text-gray-400">Loading…</p>
          ) : engagements?.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400">No engagements yet.</p>
          ) : (
            engagements?.map((eng: any) => (
              <div key={eng.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {eng.opportunity?.title ?? 'Engagement'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Started {formatDate(eng.startedAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[eng.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {eng.status}
                  </span>
                  {['INITIATED', 'IN_PROGRESS'].includes(eng.status) && (
                    <button
                      onClick={() => closeMutation.mutate({ id: eng.id, status: EngagementStatus.COMPLETED })}
                      className="text-xs text-[#1D9E75] hover:underline"
                    >
                      Mark complete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
