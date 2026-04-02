export default function AuditPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Audit Log</h1>
      <p className="text-sm text-gray-500">
        Immutable record of all state changes across the platform. Read-only.
      </p>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
          <input
            type="text"
            placeholder="Filter by entity ID, actor, or action…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]"
          />
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="">All entity types</option>
            <option value="opportunity">Opportunity</option>
            <option value="user">User</option>
            <option value="trust_level">Trust Level</option>
            <option value="trust_badge">Trust Badge</option>
            <option value="engagement">Engagement</option>
            <option value="moderation">Moderation</option>
            <option value="enforcement">Enforcement</option>
          </select>
        </div>
        <div className="p-8 text-center text-gray-400 text-sm">
          {/* TODO: AuditLogTable — ts, actor, entityType, entityId, action, diff viewer */}
          Audit log viewer — coming soon.
        </div>
      </div>
    </div>
  );
}
