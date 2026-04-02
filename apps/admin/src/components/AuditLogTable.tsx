'use client';

import { useState } from 'react';
import { formatDate } from './ui';

const ENTITY_COLORS: Record<string, string> = {
  opportunity: 'bg-blue-50 text-blue-700',
  user:        'bg-gray-100 text-gray-700',
  trust_level: 'bg-teal-50 text-teal-700',
  trust_badge: 'bg-purple-50 text-purple-700',
  engagement:  'bg-indigo-50 text-indigo-700',
  application: 'bg-sky-50 text-sky-700',
  moderation:  'bg-orange-50 text-orange-700',
  enforcement: 'bg-red-50 text-red-700',
};

export function AuditLogTable({ logs, isLoading }: { logs: any[]; isLoading: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) return (
    <div className="divide-y divide-gray-50">
      {[...Array(5)].map((_, i) => <div key={i} className="px-6 py-3 animate-pulse h-10 bg-gray-50" />)}
    </div>
  );

  if (!logs?.length) return (
    <div className="px-6 py-12 text-center text-sm text-gray-400">No audit log entries found.</div>
  );

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {['Timestamp', 'Entity', 'Action', 'Actor', 'Changes'].map((h) => (
            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {logs.map((log: any) => (
          <>
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                {new Date(log.ts).toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${ENTITY_COLORS[log.entityType] ?? 'bg-gray-100 text-gray-600'}`}>
                  {log.entityType}
                </span>
                <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-[100px]">{log.entityId}</p>
              </td>
              <td className="px-6 py-3">
                <span className="font-medium text-gray-800">{log.action}</span>
              </td>
              <td className="px-6 py-3 text-gray-400 font-mono text-xs truncate max-w-[100px]">{log.actorId}</td>
              <td className="px-6 py-3">
                {(log.oldState || log.newState) && (
                  <button
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    className="text-xs text-[#185FA5] hover:underline"
                  >
                    {expanded === log.id ? 'Hide diff' : 'View diff'}
                  </button>
                )}
              </td>
            </tr>
            {expanded === log.id && (
              <tr key={`${log.id}-diff`}>
                <td colSpan={5} className="px-6 py-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    {log.oldState && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-1">Before</p>
                        <pre className="text-xs bg-white border border-gray-100 rounded p-2 overflow-auto max-h-32">
                          {JSON.stringify(log.oldState, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.newState && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-1">After</p>
                        <pre className="text-xs bg-white border border-gray-100 rounded p-2 overflow-auto max-h-32">
                          {JSON.stringify(log.newState, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}
