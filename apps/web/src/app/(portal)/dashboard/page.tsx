export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      {/* TODO: TrustBadgeWidget, RecentOpportunities, ActiveEngagements, Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Trust Level', 'Active Opportunities', 'Engagements'].map((label) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
