'use client';

import {
  useAnalyticsOverview, useTrustDistribution,
  useOpportunitiesByModule, useWeeklyActivity, useGovernanceHealth,
} from '@/hooks/useAnalytics';
import { moduleTypeLabel } from '@/lib/utils';
import { exportToCsv, flattenForCsv } from '@/lib/export';

function StatCard({ label, value, sub, color = 'text-gray-800' }: {
  label: string; value: string | number | undefined; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ data, valueKey, labelKey }: {
  data: any[]; valueKey: string; labelKey: string;
}) {
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
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#1D9E75] inline-block" /> New Users
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-[#185FA5] inline-block" /> New Opportunities
        </span>
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
            <span className="text-[9px] text-gray-400">{d.week?.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TRUST_LABELS: Record<string, string> = {
  L0_REGISTERED: 'L0 Registered', L1_DOCUMENT_VERIFIED: 'L1 Verified',
  L2_FOUNDATION_SCREENED: 'L2 Screened', L3_DOMAIN_EXPERT_CERTIFIED: 'L3 Certified',
  L4_COMMUNITY_ENDORSED: 'L4 Endorsed',
};

export default function AnalyticsPage() {
  const { data: overview }  = useAnalyticsOverview();
  const { data: trustDist } = useTrustDistribution();
  const { data: byModule }  = useOpportunitiesByModule();
  const { data: weekly }    = useWeeklyActivity();
  const { data: govHealth } = useGovernanceHealth();

  const handleExportOverview = () => {
    if (!overview) return;
    exportToCsv('udyogasakha_overview', [flattenForCsv(overview)]);
  };

  const handleExportTrust = () => {
    if (!trustDist?.length) return;
    exportToCsv('trust_distribution', trustDist.map((d: any) => ({
      level: d.level,
      label: TRUST_LABELS[d.level] ?? d.level,
      count: d.count,
    })));
  };

  const handleExportModules = () => {
    if (!byModule?.length) return;
    exportToCsv('opportunities_by_module', byModule.map((d: any) => ({
      moduleType: d.moduleType,
      label: moduleTypeLabel(d.moduleType),
      count: d.count,
    })));
  };

  const handleExportWeekly = () => {
    if (!weekly?.length) return;
    exportToCsv('weekly_activity', weekly);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Overview</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Refreshes every 60s</span>
          <button
            onClick={handleExportOverview}
            disabled={!overview}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Export overview CSV
          </button>
        </div>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"          value={overview?.users?.total}                      sub={`${overview?.users?.active ?? 0} active`} />
        <StatCard label="Published Opps"       value={overview?.opportunities?.published}          color="text-teal-700" />
        <StatCard label="Engagements"          value={overview?.engagements?.total}               sub={`${overview?.engagements?.completed ?? 0} completed`} />
        <StatCard label="Pending Moderation"   value={overview?.opportunities?.pendingModeration}
          color={(overview?.opportunities?.pendingModeration ?? 0) > 0 ? 'text-amber-600' : 'text-gray-800'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Verifications" value={overview?.users?.pendingVerification} color="text-blue-700" />
        <StatCard label="Open Reports"          value={overview?.moderation?.openReports}
          color={(overview?.moderation?.openReports ?? 0) > 0 ? 'text-red-600' : 'text-gray-800'} />
        <StatCard label="Active Gov Members"    value={govHealth?.activeMembers} />
        <StatCard label="Enforcements (30d)"    value={govHealth?.recentEnforcements} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trust distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-700">Trust Level Distribution</h2>
            <button onClick={handleExportTrust} className="text-xs text-gray-400 hover:text-[#185FA5]">
              CSV ↓
            </button>
          </div>
          <BarChart
            data={(trustDist ?? []).map((d: any) => ({ ...d, label: TRUST_LABELS[d.level] ?? d.level }))}
            valueKey="count"
            labelKey="label"
          />
        </div>

        {/* Opportunities by module */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-700">Published by Module</h2>
            <button onClick={handleExportModules} className="text-xs text-gray-400 hover:text-[#185FA5]">
              CSV ↓
            </button>
          </div>
          <BarChart
            data={(byModule ?? []).map((d: any) => ({ ...d, label: moduleTypeLabel(d.moduleType) }))}
            valueKey="count"
            labelKey="label"
          />
        </div>

        {/* Weekly activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-700">Weekly Activity (last 12 weeks)</h2>
            <button onClick={handleExportWeekly} className="text-xs text-gray-400 hover:text-[#185FA5]">
              CSV ↓
            </button>
          </div>
          <WeeklyChart data={weekly ?? []} />
        </div>
      </div>
    </div>
  );
}
