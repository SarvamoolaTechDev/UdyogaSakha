export default function TrustPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Trust Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['L0 Registered', 'L1 Doc Verified', 'L2 Screened', 'L3 Expert Certified'].map((l, i) => (
          <div key={l} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase">{l}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">—</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">Verification Requests</h2>
        </div>
        <div className="p-8 text-center text-gray-400 text-sm">
          {/* TODO: VerificationRequestTable with Approve L1 / View Documents actions */}
          Document verification queue — coming soon.
        </div>
      </div>
    </div>
  );
}
