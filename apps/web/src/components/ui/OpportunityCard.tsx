'use client';

import Link from 'next/link';
import { ModuleType, TrustLevel } from '@udyogasakha/types';

const MODULE_LABELS: Record<string, string> = {
  [ModuleType.EMPLOYMENT_EXCHANGE]:   'Employment',
  [ModuleType.SERVICE_ENGAGEMENT]:    'Service Role',
  [ModuleType.PROJECT_TENDER]:        'Project / Tender',
  [ModuleType.CONSULTANCY_ADVISORY]:  'Consultancy',
  [ModuleType.TRAINING_SKILL_DEV]:    'Training',
  [ModuleType.VENDOR_MARKETPLACE]:    'Vendor',
  [ModuleType.STARTUP_INNOVATION]:    'Startup / Innovation',
  [ModuleType.VOLUNTEER_SOCIAL]:      'Volunteer',
  [ModuleType.AGENCY_STAFF_AUG]:      'Agency',
};

const MODULE_COLORS: Record<string, string> = {
  [ModuleType.EMPLOYMENT_EXCHANGE]:   'bg-blue-50 text-blue-700',
  [ModuleType.SERVICE_ENGAGEMENT]:    'bg-teal-50 text-teal-700',
  [ModuleType.PROJECT_TENDER]:        'bg-amber-50 text-amber-700',
  [ModuleType.CONSULTANCY_ADVISORY]:  'bg-purple-50 text-purple-700',
  [ModuleType.TRAINING_SKILL_DEV]:    'bg-green-50 text-green-700',
  [ModuleType.VENDOR_MARKETPLACE]:    'bg-orange-50 text-orange-700',
  [ModuleType.STARTUP_INNOVATION]:    'bg-pink-50 text-pink-700',
  [ModuleType.VOLUNTEER_SOCIAL]:      'bg-gray-50 text-gray-700',
  [ModuleType.AGENCY_STAFF_AUG]:      'bg-indigo-50 text-indigo-700',
};

const TRUST_LABELS: Record<string, string> = {
  [TrustLevel.L0_REGISTERED]:              'L0+',
  [TrustLevel.L1_DOCUMENT_VERIFIED]:       'L1+',
  [TrustLevel.L2_FOUNDATION_SCREENED]:     'L2+',
  [TrustLevel.L3_DOMAIN_EXPERT_CERTIFIED]: 'L3+',
  [TrustLevel.L4_COMMUNITY_ENDORSED]:      'L4',
};

interface Props {
  opportunity: {
    id: string;
    title: string;
    description: string;
    moduleType: string;
    trustLevelRequired: string;
    publishedAt?: string | null;
    requester?: { profile?: { fullName?: string } | null } | null;
  };
  onApply?: (id: string) => void;
  showApply?: boolean;
}

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function OpportunityCard({ opportunity, onApply, showApply = true }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${MODULE_COLORS[opportunity.moduleType] ?? 'bg-gray-50 text-gray-700'}`}>
            {MODULE_LABELS[opportunity.moduleType] ?? opportunity.moduleType}
          </span>
          <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
            Trust {TRUST_LABELS[opportunity.trustLevelRequired] ?? '—'}
          </span>
        </div>
        {opportunity.publishedAt && (
          <span className="text-xs text-gray-400 shrink-0">{timeAgo(opportunity.publishedAt)}</span>
        )}
      </div>

      <div>
        <Link href={`/opportunities/${opportunity.id}`} className="font-semibold text-gray-900 hover:text-[#1D9E75] transition-colors line-clamp-2">
          {opportunity.title}
        </Link>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{opportunity.description}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs text-gray-400">
          {opportunity.requester?.profile?.fullName ?? 'Anonymous'}
        </span>
        {showApply && onApply && (
          <button
            onClick={() => onApply(opportunity.id)}
            className="text-sm font-medium px-4 py-1.5 bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a64] transition-colors"
          >
            Express Interest
          </button>
        )}
      </div>
    </div>
  );
}
