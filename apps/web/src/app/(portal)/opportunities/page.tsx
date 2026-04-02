export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Opportunities</h1>
        <a
          href="/opportunities/new"
          className="px-4 py-2 bg-[#1D9E75] text-white text-sm rounded-lg hover:bg-[#178a64] transition-colors"
        >
          + Post Opportunity
        </a>
      </div>
      {/* TODO: ModuleFilterChips, SearchBar, OpportunityCard list, Pagination */}
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 shadow-sm">
        Opportunity feed — coming soon.
      </div>
    </div>
  );
}
