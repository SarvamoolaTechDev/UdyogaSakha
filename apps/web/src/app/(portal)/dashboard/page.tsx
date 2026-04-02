'use client';

import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import { useTrust } from '@/hooks/useTrust';
import { useMyEngagements } from '@/hooks/useEngagements';
import { useMyOpportunities } from '@/hooks/useOpportunities';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ModuleChip } from '@/components/ui/ModuleChip';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data: profile } = useProfile();
  const { data: trust } = useTrust();
  const { data: engagements } = useMyEngagements();
  const { data: listings } = useMyOpportunities();

  const activeEngagements = engagements?.filter((e: any) =>
    ['INITIATED', 'IN_PROGRESS'].includes(e.status)
  ) ?? [];

  const pendingListings = listings?.filter((l: any) =>
    l.status === 'MODERATION'
  ) ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome{profile?.profile?.fullName ? `, ${profile.profile.fullName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening on your account.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Trust Level',
            value: trust ? (
              <TrustBadge level={trust.currentLevel} size="sm" />
            ) : '—',
          },
          {
            label: 'Reputation Score',
            value: trust?.reputationScore != null ? trust.reputationScore.toFixed(1) : '—',
          },
          {
            label: 'Active Engagements',
            value: activeEngagements.length,
          },
          {
            label: 'Listings Pending Review',
            value: pendingListings.length,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.label}</p>
            <div className="mt-2 text-2xl font-bold text-gray-800">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Active engagements */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">Active Engagements</h2>
          <Link href="/engagements" className="text-sm text-[#1D9E75] hover:underline">View all</Link>
        </div>
        {activeEngagements.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">No active engagements yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {activeEngagements.slice(0, 5).map((eng: any) => (
              <li key={eng.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{eng.opportunity?.title ?? 'Engagement'}</p>
                  <p className="text-xs text-gray-400">Started {formatDate(eng.startedAt)}</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                  {eng.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/opportunities"
          className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-[#1D9E75] transition-colors group"
        >
          <p className="font-medium text-gray-800 group-hover:text-[#1D9E75]">Browse Opportunities</p>
          <p className="text-sm text-gray-400 mt-1">Find and apply to live listings</p>
        </Link>
        <Link
          href="/opportunities/new"
          className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-[#1D9E75] transition-colors group"
        >
          <p className="font-medium text-gray-800 group-hover:text-[#1D9E75]">Post an Opportunity</p>
          <p className="text-sm text-gray-400 mt-1">Create a new listing for review</p>
        </Link>
      </div>
    </div>
  );
}
