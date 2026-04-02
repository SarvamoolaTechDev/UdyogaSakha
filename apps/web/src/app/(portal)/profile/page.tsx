'use client';

import { useForm } from 'react-hook-form';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { TrustBadgeWidget } from '@/components/ui/TrustBadgeWidget';

export default function ProfilePage() {
  const { data: user, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: {
      fullName:           user?.profile?.fullName ?? '',
      bio:                user?.profile?.bio ?? '',
      location:           user?.profile?.location ?? '',
      showContactAfterMatch: user?.profile?.showContactAfterMatch ?? false,
    },
  });

  const onSubmit = (data: any) => updateMutation.mutate(data);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile & Trust</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Profile edit — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-medium text-gray-700">Profile Details</h2>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  {...register('fullName')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  placeholder="Brief description of your background and expertise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  {...register('location')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                  placeholder="City, State"
                />
              </div>
              <div className="flex items-center gap-2">
                <input {...register('showContactAfterMatch')} type="checkbox" id="showContact" className="rounded" />
                <label htmlFor="showContact" className="text-sm text-gray-700">
                  Show contact details after engagement match
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!isDirty || updateMutation.isPending}
                  className="px-4 py-2 bg-[#1D9E75] text-white text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-[#178a64] transition-colors"
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
                {updateMutation.isSuccess && (
                  <span className="text-sm text-teal-600">Saved ✓</span>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Trust widget — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-medium text-gray-700 mb-4">Trust Status</h2>
          <TrustBadgeWidget />
        </div>
      </div>

      {/* Account info read-only */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-medium text-gray-700 mb-4">Account Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Email</p>
            <p className="font-medium text-gray-800 mt-0.5">{user?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400">Account Status</p>
            <p className="font-medium text-gray-800 mt-0.5">{user?.status ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400">Participant Type</p>
            <p className="font-medium text-gray-800 mt-0.5">{user?.profile?.participantType ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-400">Phone</p>
            <p className="font-medium text-gray-800 mt-0.5">{user?.phone ?? 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
