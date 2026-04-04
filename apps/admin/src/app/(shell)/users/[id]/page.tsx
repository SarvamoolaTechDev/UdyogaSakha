'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@udyogasakha/api-client';
import { useEntityAuditLog } from '@/hooks/useAdmin';
import { TrustBadge, formatDate } from '@/components/ui';
import { AuditEntityType } from '@udyogasakha/types';

function useUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => apiClient.get(`/users/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

function useEnforcementHistory(userId: string) {
  return useQuery({
    queryKey: ['admin', 'enforcement', userId],
    queryFn: () => apiClient.get(`/moderation/users/${userId}/enforcement-history`).then((r) => r.data),
    enabled: !!userId,
  });
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700', PENDING_VERIFICATION: 'bg-yellow-50 text-yellow-700',
  RESTRICTED: 'bg-orange-50 text-orange-700', SUSPENDED: 'bg-red-50 text-red-700',
};

const ACTION_COLORS: Record<string, string> = {
  WARNING: 'bg-yellow-50 text-yellow-700', BADGE_REVOKE: 'bg-orange-50 text-orange-700',
  RESTRICT: 'bg-red-50 text-red-600', SUSPEND: 'bg-red-100 text-red-800',
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useUser(id);
  const { data: enforcements } = useEnforcementHistory(id);
  const { data: auditLog } = useEntityAuditLog(AuditEntityType.USER, id);

  if (isLoading) return <div className="p-8 text-center text-sm text-gray-400">Loading user…</div>;
  if (!user) return <div className="p-8 text-center text-sm text-gray-400">User not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/users" className="text-sm text-gray-400 hover:text-gray-600">← Users</Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-600">{user.profile?.fullName ?? user.email}</span>
      </div>

      {/* Identity */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{user.profile?.fullName ?? '—'}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>
            {user.phone && <p className="text-sm text-gray-400">{user.phone}</p>}
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[user.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {user.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100 text-sm">
          {[
            { label: 'Participant Type', value: user.profile?.participantType },
            { label: 'Roles', value: user.roles?.join(', ') },
            { label: 'Registered', value: formatDate(user.createdAt) },
            { label: 'Organisation', value: user.profile?.organizationName ?? '—' },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-gray-400 text-xs">{f.label}</p>
              <p className="font-medium text-gray-800 mt-0.5">{f.value ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-medium text-gray-700">Trust Status</h2>
        <div className="flex items-center gap-4">
          <TrustBadge level={user.trustRecord?.currentLevel ?? 'L0_REGISTERED'} size="md" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Reputation Score</p>
              <p className="font-bold text-gray-800 text-lg">{user.trustRecord?.reputationScore?.toFixed(1) ?? '0.0'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Completed Engagements</p>
              <p className="font-bold text-gray-800 text-lg">{user.trustRecord?.completedEngagements ?? 0}</p>
            </div>
          </div>
        </div>

        {user.badges?.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Badges</p>
            {user.badges.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 capitalize">{b.badgeType.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${b.status === 'ACTIVE' ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                  <span className="text-gray-400 text-xs">{formatDate(b.grantedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enforcement history */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">Enforcement History</h2>
        </div>
        {!enforcements?.length ? (
          <p className="px-6 py-6 text-sm text-gray-400">No enforcement actions on record.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {enforcements.map((e: any) => (
              <div key={e.id} className="px-6 py-3 flex items-center gap-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${ACTION_COLORS[e.action] ?? 'bg-gray-100 text-gray-600'}`}>{e.action}</span>
                <p className="text-sm text-gray-700 flex-1">{e.reason}</p>
                <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(e.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent audit */}
      {auditLog?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-medium text-gray-700">Recent Audit Activity</h2>
            <Link href={`/audit?mode=entity&type=user&id=${id}`} className="text-xs text-[#185FA5] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {auditLog.slice(0, 5).map((log: any) => (
              <div key={log.id} className="px-6 py-3 flex items-center gap-4 text-sm">
                <span className="font-medium text-gray-800">{log.action}</span>
                <span className="text-gray-400 text-xs ml-auto whitespace-nowrap">
                  {new Date(log.ts).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
