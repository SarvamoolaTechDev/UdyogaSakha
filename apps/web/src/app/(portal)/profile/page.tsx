export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile & Trust</h1>
      {/* TODO: ProfileEditForm, TrustLevelCard (current level + badge list), VerificationRequestButton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-medium text-gray-700 mb-4">Profile Details</h2>
          <p className="text-sm text-gray-400">Profile editor — coming soon.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-medium text-gray-700 mb-4">Trust Status</h2>
          <p className="text-sm text-gray-400">Trust badge widget — coming soon.</p>
        </div>
      </div>
    </div>
  );
}
