'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOpportunity } from '@/hooks/useOpportunities';
import { useApply } from '@/hooks/useEngagements';
import { useAuth } from '@/hooks/useAuth';
import { TrustBadge } from '@/components/ui/TrustBadge';
import { ModuleChip } from '@/components/ui/ModuleChip';
import { ApplyModal } from '@/components/ui/ApplyModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDate, truncate } from '@/lib/utils';

function CopyLinkButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="text-xs text-gray-400 hover:text-[#1D9E75] transition-colors flex items-center gap-1"
    >
      {copied ? '✓ Copied!' : '🔗 Copy link'}
    </button>
  );
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { userId } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { data: opp, isLoading } = useOpportunity(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-40" />
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

  const isOwner      = opp.requesterId === userId;
  const detailFields = opp.details
    ? Object.entries(opp.details as Record<string, unknown>).filter(([k]) => k !== 'moduleType')
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/opportunities" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to opportunities
        </Link>
        <CopyLinkButton id={id} />
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <ModuleChip moduleType={opp.moduleType} />
            <h1 className="text-xl font-semibold text-gray-900">{opp.title}</h1>
          </div>
          <TrustBadge level={opp.trustLevelRequired as string} size="sm" className="shrink-0" />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
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

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{opp.description}</p>
      </div>

      {/* Module-specific details */}
      {detailFields.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-medium text-gray-700 mb-3">Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {detailFields.map(([key, val]) => (
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
        <span className="text-blue-400 text-lg">ℹ</span>
        <div>
          <p className="text-sm font-medium text-blue-800">Minimum trust level required</p>
          <p className="text-sm text-blue-600 mt-0.5">
            Applicants must hold at least{' '}
            <TrustBadge level={opp.trustLevelRequired as string} size="sm" className="inline" />{' '}
            to express interest.
          </p>
        </div>
      </div>

      {/* Owner view — link to manage applicants */}
      {isOwner ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-medium text-gray-700 mb-2">This is your listing</h2>
          <p className="text-sm text-gray-500 mb-4">View and manage applicants from My Listings.</p>
          <Link
            href="/opportunities/my"
            className="inline-block px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64]"
          >
            Manage Applicants →
          </Link>
        </div>
      ) : (
        /* Apply section */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h2 className="font-medium text-gray-700">Express Interest</h2>
          <p className="text-sm text-gray-500">
            Submit an expression of interest. The requester will be notified and can choose to proceed with you.
          </p>
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-5 py-2.5 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64] transition-colors"
          >
            Express Interest
          </button>
        </div>
      )}

      {showApplyModal && (
        <ApplyModal
          opportunityId={id}
          opportunityTitle={opp.title}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
}
