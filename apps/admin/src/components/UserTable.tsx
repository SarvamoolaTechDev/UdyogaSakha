'use client';

import { useState } from 'react';
import { useEnforce, useUserTrust } from '@/hooks/useAdmin';
import { TrustBadge, formatDate } from './ui';
import { EnforcementActionType } from '@udyogasakha/types';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:               'bg-green-50 text-green-700',
  PENDING_VERIFICATION: 'bg-yellow-50 text-yellow-700',
  RESTRICTED:           'bg-orange-50 text-orange-700',
  SUSPENDED:            'bg-red-50 text-red-700',
};

interface UserTableProps {
  users: any[];
  isLoading: boolean;
}

function EnforceModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [action, setAction] = useState<EnforcementActionType>(EnforcementActionType.WARNING);
  const [reason, setReason] = useState('');
  const enforceMutation = useEnforce();

  const handle = () => {
    enforceMutation.mutate(
      { targetUserId: user.id, action, reason },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Enforcement Action</h3>
        <p className="text-sm text-gray-500">User: <span className="font-medium">{user.profile?.fullName} ({user.email})</span></p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as EnforcementActionType)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value={EnforcementActionType.WARNING}>Warning</option>
            <option value={EnforcementActionType.BADGE_REVOKE}>Badge Revoke</option>
            <option value={EnforcementActionType.RESTRICT}>Restrict Account</option>
            <option value={EnforcementActionType.SUSPEND}>Suspend Account</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="Document the reason for this enforcement action…"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">Cancel</button>
          <button
            onClick={handle}
            disabled={!reason.trim() || enforceMutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {enforceMutation.isPending ? 'Applying…' : 'Apply Action'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserTable({ users, isLoading }: UserTableProps) {
  const [enforceUser, setEnforceUser] = useState<any | null>(null);

  if (isLoading) return (
    <div className="divide-y divide-gray-50">
      {[...Array(4)].map((_, i) => <div key={i} className="px-6 py-4 animate-pulse h-12 bg-gray-50" />)}
    </div>
  );

  if (!users?.length) return (
    <div className="px-6 py-12 text-center text-sm text-gray-400">No users found.</div>
  );

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Name / Email', 'Status', 'Trust Level', 'Registered', 'Actions'].map((h) => (
              <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((user: any) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-3">
                <p className="font-medium text-gray-800">{user.profile?.fullName ?? '—'}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </td>
              <td className="px-6 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[user.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-3">
                <TrustBadge level={user.trustRecord?.currentLevel ?? 'L0_REGISTERED'} size="sm" />
              </td>
              <td className="px-6 py-3 text-gray-400">{formatDate(user.createdAt)}</td>
              <td className="px-6 py-3">
                <button
                  onClick={() => setEnforceUser(user)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Enforce
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {enforceUser && <EnforceModal user={enforceUser} onClose={() => setEnforceUser(null)} />}
    </>
  );
}
