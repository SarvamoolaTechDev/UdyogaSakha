'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceApi } from '@udyogasakha/api-client';
import { CouncilType } from '@udyogasakha/types';
import { formatDate } from '@/components/ui';

const COUNCIL_LABELS: Record<string, string> = {
  EGC: 'Economic Governance Council',
  DEP: 'Domain Expert Panel',
  MODERATION: 'Moderation Cell',
};

function useGovernanceMembers(councilType?: CouncilType) {
  return useQuery({
    queryKey: ['admin', 'governance', 'members', councilType],
    queryFn: () => governanceApi.getMembers(councilType),
  });
}

function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: governanceApi.addMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'governance'] }),
  });
}

function useDeactivateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: governanceApi.deactivateMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'governance'] }),
  });
}

function AddMemberModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ userId: '', councilType: CouncilType.EGC, domain: '' });
  const mutation = useAddMember();

  const handle = () => mutation.mutate(form, { onSuccess: onClose });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Add Council Member</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
            placeholder="UUID of the user"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Council</label>
          <select
            value={form.councilType}
            onChange={(e) => setForm((f) => ({ ...f, councilType: e.target.value as CouncilType }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            {Object.values(CouncilType).map((c) => (
              <option key={c} value={c}>{COUNCIL_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Domain / Expertise</label>
          <input
            value={form.domain}
            onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
            placeholder="e.g. Finance, Legal, Technology"
          />
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-500">Failed to add member — user may already be active in this council.</p>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={handle}
            disabled={!form.userId.trim() || !form.domain.trim() || mutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-[#185FA5] text-white rounded-lg hover:bg-[#144e8a] disabled:opacity-50"
          >
            {mutation.isPending ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GovernancePage() {
  const [filter, setFilter] = useState<CouncilType | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);
  const { data: members, isLoading } = useGovernanceMembers(filter);
  const deactivateMutation = useDeactivateMember();

  const countBy = (type: CouncilType) =>
    members?.filter((m: any) => m.councilType === type).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Governance Members</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-[#185FA5] text-white text-sm font-medium rounded-lg hover:bg-[#144e8a] transition-colors"
        >
          + Add Member
        </button>
      </div>

      {/* Council summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {Object.values(CouncilType).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(filter === c ? undefined : c)}
            className={`bg-white rounded-xl border shadow-sm p-5 text-left transition-colors ${filter === c ? 'border-[#185FA5]' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <p className="text-xs font-semibold text-gray-400 uppercase">{c}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{countBy(c)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{COUNCIL_LABELS[c]}</p>
          </button>
        ))}
      </div>

      {/* Members table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-gray-700">
            {filter ? COUNCIL_LABELS[filter] : 'All Active Members'}
          </h2>
          {filter && (
            <button onClick={() => setFilter(undefined)} className="text-xs text-gray-400 hover:text-gray-600">
              Clear filter ×
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : !members?.length ? (
          <div className="p-8 text-center text-sm text-gray-400">No members found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Member', 'Council', 'Domain', 'Added', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-800">{m.user?.profile?.fullName ?? '—'}</p>
                    <p className="text-xs text-gray-400">{m.user?.email}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{m.councilType}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{m.domain}</td>
                  <td className="px-6 py-3 text-gray-400 text-xs">{formatDate(m.addedAt)}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => deactivateMutation.mutate(m.id)}
                      disabled={deactivateMutation.isPending}
                      className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
