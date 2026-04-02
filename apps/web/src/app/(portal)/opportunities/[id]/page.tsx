'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOpportunity } from '@/hooks/useOpportunities';
import { useApply } from '@/hooks/useEngagements';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ModuleChip } from '@/components/ui/ModuleChip';
import { formatDate } from '@/lib/utils';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: opp, isLoading } = useOpportunity(id);
  const applyMutation = useApply();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-gray-100 rounded w-1/3" />
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Opportunity not found.</p>
        <Link href="/opportunities" className="text-sm text-[#1D9E75] hover:underline mt-2 block">
          ← Back to opportunities
        </Link>
      </div>
    );
  }

  const handleApply = () => {
    applyMutation.mutate(
      { opportunityId: id },
      { onSuccess: () => router.push('/engagements') },
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/opportunities" className="text-sm text-gray-400 hover:text-gray-600">
        ← Back to opportunities
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <ModuleChip moduleType={opp.moduleType} />
            <h1 className="text-xl font-semibold text-gray-900">{opp.title}</h1>
          </div>
          <TrustBadge level={opp.trustLevelRequired as string} size="sm" className="shrink-0" />
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>By {opp.requester?.profile?.fullName ?? 'Unknown'}</span>
          <span>·</span>
          <span>Posted {formatDate(opp.publishedAt)}</span>
          {opp.closesAt && (
            <>
              <span>·</span>
              <span>Closes {formatDate(opp.closesAt)}</span>
            </>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{opp.description}</p>
      </div>

      {/* Module-specific details */}
      {opp.details && Object.keys(opp.details as object).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h2 className="font-medium text-gray-700">Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(opp.details as Record<string, unknown>)
              .filter(([k]) => k !== 'moduleType')
              .map(([key, val]) => (
                <div key={key}>
                  <dt className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                  <dd className="font-medium text-gray-800 mt-0.5">{String(val ?? '—')}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {/* Trust requirement notice */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
        <span className="text-blue-500 text-lg">ℹ</span>
        <div>
          <p className="text-sm font-medium text-blue-800">Trust level required</p>
          <p className="text-sm text-blue-600 mt-0.5">
            You need at least <TrustBadge level={opp.trustLevelRequired as string} size="sm" className="inline" /> to express interest in this opportunity.
          </p>
        </div>
      </div>

      {/* Apply */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-medium text-gray-700">Express Interest</h2>
        <p className="text-sm text-gray-500">
          Clicking below submits an expression of interest. The requester will be notified and can choose to proceed with you.
        </p>
        {applyMutation.isError && (
          <p className="text-sm text-red-500">Could not submit — you may have already applied.</p>
        )}
        <button
          onClick={handleApply}
          disabled={applyMutation.isPending || applyMutation.isSuccess}
          className="px-5 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64] disabled:opacity-60 transition-colors"
        >
          {applyMutation.isPending ? 'Submitting…' :
           applyMutation.isSuccess ? 'Interest submitted ✓' :
           'Express Interest'}
        </button>
      </div>
    </div>
  );
}
