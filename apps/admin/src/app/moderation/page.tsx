export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Moderation Queue</h1>
        <span className="text-sm text-gray-500">Pending review</span>
      </div>

      {/* TODO: Tabs — Opportunities (pending moderation) | Reports | Enforcement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Opportunities Pending', color: 'text-amber-600 bg-amber-50' },
          { label: 'Open Reports', color: 'text-red-600 bg-red-50' },
          { label: 'Enforcement Actions', color: 'text-blue-600 bg-blue-50' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className={`text-sm font-medium px-2 py-0.5 rounded inline-block ${s.color}`}>{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-3">—</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">Opportunities awaiting review</h2>
        </div>
        <div className="p-8 text-center text-gray-400 text-sm">
          {/* TODO: OpportunityModerationTable with Approve / Reject actions */}
          Listing moderation queue — coming soon.
        </div>
      </div>
    </div>
  );
}
