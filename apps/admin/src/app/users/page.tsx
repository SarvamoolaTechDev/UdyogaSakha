export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
          <input
            type="search"
            placeholder="Search by name, email or phone…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
          />
        </div>
        <div className="p-8 text-center text-gray-400 text-sm">
          {/* TODO: UserTable — status badge, trust level, roles, Suspend / Restrict / View Audit actions */}
          User search and management — coming soon.
        </div>
      </div>
    </div>
  );
}
