'use client';

import { TrustLevel, TrustBadgeStatus } from '@udyogasakha/types';
import { useMyTrust } from '@/hooks/useTrust';

const LEVEL_CONFIG: Record<number, { label: string; color: string; bg: string; desc: string }> = {
  0: { label: 'L0 · Registered',         color: 'text-gray-600',   bg: 'bg-gray-100',   desc: 'Account created' },
  1: { label: 'L1 · Document Verified',   color: 'text-blue-700',   bg: 'bg-blue-50',    desc: 'Identity documents reviewed' },
  2: { label: 'L2 · Foundation Screened', color: 'text-teal-700',   bg: 'bg-teal-50',    desc: 'Structured interview completed' },
  3: { label: 'L3 · Domain Certified',    color: 'text-purple-700', bg: 'bg-purple-50',  desc: 'Assessed by Domain Expert Panel' },
  4: { label: 'L4 · Community Endorsed',  color: 'text-amber-700',  bg: 'bg-amber-50',   desc: 'Earned through engagement history' },
};

const LEVEL_ORDER: Record<string, number> = {
  [TrustLevel.L0_REGISTERED]: 0,
  [TrustLevel.L1_DOCUMENT_VERIFIED]: 1,
  [TrustLevel.L2_FOUNDATION_SCREENED]: 2,
  [TrustLevel.L3_DOMAIN_EXPERT_CERTIFIED]: 3,
  [TrustLevel.L4_COMMUNITY_ENDORSED]: 4,
};

export function TrustBadgeWidget() {
  const { data, isLoading, isError } = useMyTrust();

  if (isLoading) return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse space-y-3">
      <div className="h-4 bg-gray-100 rounded w-32" />
      <div className="h-8 bg-gray-100 rounded w-48" />
      <div className="h-2 bg-gray-100 rounded-full" />
    </div>
  );

  if (isError || !data) return (
    <div className="bg-white rounded-xl border border-red-100 p-6">
      <p className="text-sm text-red-500">Could not load trust status.</p>
    </div>
  );

  const levelNum = LEVEL_ORDER[data.currentLevel as string] ?? 0;
  const cfg = LEVEL_CONFIG[levelNum];
  const activeBadges = (data.badges ?? []).filter((b: any) => b.status === TrustBadgeStatus.ACTIVE);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Trust Level</p>
        <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
        <p className="text-xs text-gray-500 mt-1.5">{cfg.desc}</p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          {['L0','L1','L2','L3','L4'].map(l => <span key={l}>{l}</span>)}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#1D9E75] rounded-full transition-all duration-500" style={{ width: `${(levelNum / 4) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Reputation score</p>
          <p className="text-xl font-bold text-gray-800">{data.reputationScore?.toFixed(1) ?? '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Completed engagements</p>
          <p className="text-xl font-bold text-gray-800">{data.completedEngagements ?? 0}</p>
        </div>
      </div>

      {activeBadges.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Active Badges</p>
          <div className="flex flex-wrap gap-2">
            {activeBadges.map((b: any) => (
              <span key={b.id} className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-full font-medium">
                ✓ {b.badgeType.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {levelNum < 2 && (
        <div className="border border-dashed border-gray-200 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1.5">
            {levelNum === 0 ? 'Submit documents to reach L1' : 'Request a Foundation Screening for L2'}
          </p>
          <button className="text-xs font-medium text-[#1D9E75] hover:underline">
            {levelNum === 0 ? 'Start Verification →' : 'Request Screening →'}
          </button>
        </div>
      )}
    </div>
  );
}
