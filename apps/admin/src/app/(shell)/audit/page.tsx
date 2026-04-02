'use client';

import { useState } from 'react';
import { AuditLogTable } from '@/components/AuditLogTable';
import { useEntityAuditLog, useActorAuditLog } from '@/hooks/useAdmin';
import { AuditEntityType } from '@udyogasakha/types';

const ENTITY_TYPES = ['opportunity', 'user', 'trust_level', 'trust_badge', 'engagement', 'moderation', 'enforcement'];

export default function AuditPage() {
  const [searchMode, setSearchMode] = useState<'entity' | 'actor'>('entity');
  const [entityType, setEntityType] = useState(ENTITY_TYPES[0]);
  const [entityId, setEntityId] = useState('');
  const [actorId, setActorId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const entityQuery = useEntityAuditLog(
    submitted && searchMode === 'entity' ? entityType : '',
    submitted && searchMode === 'entity' ? entityId : '',
  );
  const actorQuery = useActorAuditLog(
    submitted && searchMode === 'actor' ? actorId : '',
  );

  const { data, isLoading } = searchMode === 'entity' ? entityQuery : actorQuery;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Immutable record of all platform state changes. Read-only.</p>
      </div>

      {/* Search controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex gap-2">
          {(['entity', 'actor'] as const).map((m) => (
            <button key={m} onClick={() => { setSearchMode(m); setSubmitted(false); }}
              className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${searchMode === m ? 'bg-[#185FA5] text-white border-[#185FA5]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              By {m}
            </button>
          ))}
        </div>

        {searchMode === 'entity' ? (
          <div className="flex gap-3">
            <select value={entityType} onChange={(e) => setEntityType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={entityId} onChange={(e) => setEntityId(e.target.value)}
              placeholder="Entity ID (UUID)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
            <button onClick={() => setSubmitted(true)} disabled={!entityId.trim()}
              className="px-4 py-2 bg-[#185FA5] text-white text-sm rounded-lg disabled:opacity-50 hover:bg-[#144e8a]">
              Search
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input value={actorId} onChange={(e) => setActorId(e.target.value)}
              placeholder="Actor User ID (UUID)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
            <button onClick={() => setSubmitted(true)} disabled={!actorId.trim()}
              className="px-4 py-2 bg-[#185FA5] text-white text-sm rounded-lg disabled:opacity-50 hover:bg-[#144e8a]">
              Search
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <AuditLogTable logs={data ?? []} isLoading={submitted && isLoading} />
      </div>
    </div>
  );
}
