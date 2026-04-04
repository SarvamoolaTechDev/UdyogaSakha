'use client';

import { useState } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { data: user } = useProfile();
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();
  const { logout } = useAuth();

  const [showContact, setShowContact] = useState(
    user?.profile?.showContactAfterMatch ?? false,
  );
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const savePrivacy = () => {
    updateMutation.mutate(
      { showContactAfterMatch: showContact },
      { onSuccess: () => toast('Privacy settings saved') },
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('udyogasakha_auth') ? JSON.parse(localStorage.getItem('udyogasakha_auth')!).state.accessToken : ''}` },
        },
      );
      if (res.ok || res.status === 204) {
        logout();
      } else {
        const body = await res.json().catch(() => ({}));
        toast(body.message ?? 'Could not delete account — ensure all engagements are closed first.', 'error');
      }
    } catch {
      toast('Request failed. Please try again.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      {/* Privacy settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="font-medium text-gray-700">Privacy</h2>

        <div className="flex items-start gap-3">
          <input
            id="showContact"
            type="checkbox"
            checked={showContact}
            onChange={(e) => setShowContact(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-[#1D9E75] focus:ring-[#1D9E75]"
          />
          <div>
            <label htmlFor="showContact" className="text-sm font-medium text-gray-700 cursor-pointer">
              Show contact details after engagement match
            </label>
            <p className="text-xs text-gray-400 mt-0.5">
              When enabled, your email and phone number become visible to matched parties after an
              engagement is initiated. Before a match, your details remain private.
            </p>
          </div>
        </div>

        <button
          onClick={savePrivacy}
          disabled={updateMutation.isPending}
          className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg hover:bg-[#178a64] disabled:opacity-60 transition-colors"
        >
          {updateMutation.isPending ? 'Saving…' : 'Save Privacy Settings'}
        </button>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-medium text-gray-700">Account</h2>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-800">{user?.email ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account status</span>
            <span className="font-medium text-gray-800">{user?.status ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Participant type</span>
            <span className="font-medium text-gray-800">{user?.profile?.participantType ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* DPDP — Right to deletion */}
      <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6 space-y-4">
        <h2 className="font-medium text-red-700">Delete Account</h2>
        <p className="text-sm text-gray-500">
          Permanently deletes your account, profile, trust record, and all listings. This action
          cannot be undone. You must close all active engagements before deleting.
          Audit log entries are retained as required by the Foundation's data retention policy.
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Type <span className="font-mono bg-gray-100 px-1 rounded">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Type DELETE to confirm"
          />
        </div>

        <button
          onClick={handleDeleteAccount}
          disabled={deleteConfirm !== 'DELETE' || deleting}
          className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors"
        >
          {deleting ? 'Deleting account…' : 'Permanently Delete My Account'}
        </button>
      </div>
    </div>
  );
}
