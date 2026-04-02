export default function GovernancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Council Members</h1>
        <button className="px-4 py-2 bg-[#185FA5] text-white text-sm rounded-lg hover:bg-[#144e8a] transition-colors">
          + Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['EGC', 'DEP', 'Moderation Cell'].map((c) => (
          <div key={c} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase">{c}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">—</p>
            <p className="text-xs text-gray-400 mt-1">active members</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-700">Active Members</h2>
        </div>
        <div className="p-8 text-center text-gray-400 text-sm">
          {/* TODO: MemberTable — council type, domain, CoI declarations, Deactivate action */}
          Council member management — coming soon.
        </div>
      </div>
    </div>
  );
}
