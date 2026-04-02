'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMyOpportunities } from '@/hooks/useOpportunities';
import { useOpportunityApplications, useUpdateApplicationStatus } from '@/hooks/useEngagements';
import { useCloseOpportunity } from '@/hooks/useOpportunities';
import { ModuleChip } from '@/components/ui/ModuleChip';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { ApplicationStatus } from '@udyogasakha/types';

const STATUS_COLORS: Record<string, string> = {
  DRAFT:      'bg-gray-100 text-gray-500',
  MODERATION: 'bg-yellow-50 text-yellow-700',
  PUBLISHED:  'bg-teal-50 text-teal-700',
  ENGAGED:    'bg-blue-50 text-blue-700',
  CLOSED:     'bg-gray-100 text-gray-500',
  REJECTED:   'bg-red-50 text-red-700',
};

function ApplicationsPanel({ opportunityId }: { opportunityId: string }) {
  const { data: apps, isLoading } = useOpportunityApplications(opportunityId);
  const updateMutation = useUpdateApplicationStatus();
  const { toast } = useToast();

  const handle = (id: string, status: ApplicationStatus) => {
    updateMutation.mutate(
      { id, status },
      {
        onSuccess: () => toast(`Application ${status.toLowerCase()}`),
        onError: () => toast('Failed to update application', 'error'),
      },
    );
  };

  if (isLoading) return <p className="text-sm text-gray-400 py-4 text-center">Loading applications…</p>;
  if (!apps?.length) return <p className="text-sm text-gray-400 py-4 text-center">No applications yet.</p>;

  return (
    <div className="border-t border-gray-100 mt-3 pt-3 space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Applications ({apps.length})
      </p>
      {apps.map((app: any) => (
        <div key={app.id} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {app.provider?.profile?.fullName ?? 'Applicant'}
            </p>
            <p className="text-xs text-gray-400">
              {app.provider?.email} · Applied {formatDate(app.appliedAt)}
            </p>
            {app.coverMessage && (
              <p className="text-xs text-gray-500 mt-0.5 italic line-clamp-2">"{app.coverMessage}"</p>
            )}
            <TrustBadge
              level={app.provider?.trustRecord?.currentLevel ?? 'L0_REGISTERED'}
              size="sm"
              className="mt-1"
            />
          </div>
          <div className="shrink-0 flex flex-col gap-1 items-end">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              app.status === 'ACCEPTED'    ? 'bg-teal-50 text-teal-700' :
              app.status === 'DECLINED'    ? 'bg-red-50 text-red-700'   :
              app.status === 'SHORTLISTED' ? 'bg-blue-50 text-blue-700' :
              'bg-yellow-50 text-yellow-700'
            }`}>
              {app.status}
            </span>
            {app.status === 'PENDING' && (
              <div className="flex gap-1 mt-1">
                <button
                  onClick={() => handle(app.id, ApplicationStatus.ACCEPTED)}
                  disabled={updateMutation.isPending}
                  className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handle(app.id, ApplicationStatus.DECLINED)}
                  disabled={updateMutation.isPending}
                  className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50 disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListingCard({ listing }: { listing: any }) {
  const [expanded, setExpanded] = useState(false);
  const closeMutation = useCloseOpportunity();
  const { toast } = useToast();

  const handleClose = () => {
    closeMutation.mutate(
      { id: listing.id },
      {
        onSuccess: () => toast('Opportunity closed'),
        onError: () => toast('Failed to close', 'error'),
      },
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ModuleChip moduleType={listing.moduleType} />
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[listing.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {listing.status}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">{listing.title}</h3>
          <p className="text-xs text-gray-400">Created {formatDate(listing.createdAt)}</p>
          {listing.status === 'REJECTED' && listing.rejectionReason && (
            <p className="text-xs text-red-500">Rejection reason: {listing.rejectionReason}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {listing.status === 'PUBLISHED' && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-[#185FA5] hover:underline"
            >
              {expanded ? 'Hide applicants' : 'View applicants'}
            </button>
          )}
          {['PUBLISHED', 'ENGAGED'].includes(listing.status) && (
            <button
              onClick={handleClose}
              disabled={closeMutation.isPending}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {expanded && <ApplicationsPanel opportunityId={listing.id} />}
    </div>
  );
}

export default function MyListingsPage() {
  const { data: listings, isLoading } = useMyOpportunities();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My Listings</h1>
        <Link
          href="/opportunities/new"
          className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64] transition-colors"
        >
          + Post Opportunity
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !listings?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No listings yet"
            description="Post your first opportunity to start receiving applications."
            action={{ label: 'Post an Opportunity', href: '/opportunities/new' }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing: any) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
