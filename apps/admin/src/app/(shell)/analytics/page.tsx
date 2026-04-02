'use client';

import { useAnalyticsOverview, useTrustDistribution, useOpportunitiesByModule, useWeeklyActivity, useGovernanceHealth } from '@/hooks/useAnalytics';
import { moduleTypeLabel } from '@/lib/utils';

function StatCard({ label, value, sub, color = 'text-gray-800' }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// Minimal bar-chart using pure CSS
function BarChart({ data, valueKey, labelKey }: { data: any[]; valueKey: string; labelKey: string }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4 text-center">No data.</p>;
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d[labelKey]} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-36 shrink-0 truncate">{d[labelKey]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="bg-[#1D9E75] h-2 rounded-full transition-all"
              style={{ width: max ? `${(d[valueKey] / max) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-8 text-right">{d[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

function WeeklyChart({ data }: { data: any[] }) {
  if (!data?.length) return <p className="text-sm text-gray-400 py-4 text-center">No data.</p>;
  const maxVal = Math.max(...data.flatMap((d) => [d.newUsers, d.newOpportunities]));
  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#1D9E75] inline-block" /> New Users</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#185FA5] inline-block" /> New Opportunities</span>
      </div>
      <div className="flex items-end gap-1 h-24">
        {data.slice(-12).map((d) => (
          <div key={d.week} className="flex-1 flex flex-col items-center gap-0.5" title={d.week}>
            <div className="w-full flex gap-0.5 items-end" style={{ height: '80px' }}>
              <div
                className="flex-1 bg-[#1D9E75] rounded-t"
                style={{ height: maxVal ? `${(d.newUsers / maxVal) * 80}px` : '2px' }}
              />
              <div
                className="flex-1 bg-[#185FA5] rounded-t"
                style={{ height: maxVal ? `${(d.newOpportunities / maxVal) * 80}px` : '2px' }}
              />
            </div>
            <span className="text-[9px] text-gray-400 rotate-45 origin-left">{d.week.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: overview } = useAnalyticsOverview();
  const { data: trustDist } = useTrustDistribution();
  const { data: byModule } = useOpportunitiesByModule();
  const { data: weekly } = useWeeklyActivity();
  const { data: govHealth } = useGovernanceHealth();

  const trustLabels: Record<string, string> = {
    L0_REGISTERED: 'L0 Registered', L1_DOCUMENT_VERIFIED: 'L1 Verified',
    L2_FOUNDATION_SCREENED: 'L2 Screened', L3_DOMAIN_EXPERT_CERTIFIED: 'L3 Certified',
    L4_COMMUNITY_ENDORSED: 'L4 Endorsed',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Overview</h1>
        <span className="text-xs text-gray-400">Refreshes every 60s</span>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={overview?.users?.total ?? '—'} sub={`${overview?.users?.active ?? 0} active`} />
        <StatCard label="Opportunities" value={overview?.opportunities?.published ?? '—'} sub="published" color="text-teal-700" />
        <StatCard label="Engagements" value={overview?.engagements?.total ?? '—'} sub={`${overview?.engagements?.completed ?? 0} completed`} />
        <StatCard label="Pending Moderation" value={overview?.opportunities?.pendingModeration ?? '—'} color={overview?.opportunities?.pendingModeration > 0 ? 'text-amber-600' : 'text-gray-800'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Verifications" value={overview?.users?.pendingVerification ?? '—'} color="text-blue-700" />
        <StatCard label="Open Reports" value={overview?.moderation?.openReports ?? '—'} color={overview?.moderation?.openReports > 0 ? 'text-red-600' : 'text-gray-800'} />
        <StatCard label="Governance Members" value={govHealth?.activeMembers ?? '—'} />
        <StatCard label="Enforcement (30d)" value={govHealth?.recentEnforcements ?? '—'} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trust distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-medium text-gray-700 mb-4">Trust Level Distribution</h2>
          <BarChart
            data={(trustDist ?? []).map((d: any) => ({ ...d, label: trustLabels[d.level] ?? d.level }))}
            valueKey="count"
            labelKey="label"
          />
        </div>

        {/* Opportunities by module */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-medium text-gray-700 mb-4">Published by Module</h2>
          <BarChart
            data={(byModule ?? []).map((d: any) => ({ ...d, label: moduleTypeLabel(d.moduleType) }))}
            valueKey="count"
            labelKey="label"
          />
        </div>

        {/* Weekly activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-medium text-gray-700 mb-4">Weekly Activity (last 12 weeks)</h2>
          <WeeklyChart data={weekly ?? []} />
        </div>
      </div>
    </div>
  );
}
