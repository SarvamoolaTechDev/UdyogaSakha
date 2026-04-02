'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useNotifications, useMarkAllRead, notificationKeys } from '@/hooks/useNotifications';
import type { InAppNotification } from '@udyogasakha/api-client';
import { useState } from 'react';

export function NotificationsBell() {
  const { accessToken } = useAuthStore();
  const [open, setOpen] = useState(false);
  const socketRef = useRef<any>(null);
  const qc = useQueryClient();

  const { data: notifications = [] } = useNotifications();
  const markAllMutation = useMarkAllRead();

  const unread = notifications.filter((n) => !n.read).length;

  // Connect to WebSocket — pushes new notifications into React Query cache
  useEffect(() => {
    if (!accessToken || typeof window === 'undefined') return;

    import('socket.io-client').then(({ io }) => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:3001';
      socketRef.current = io(`${apiBase}/notifications`, {
        auth: { token: `Bearer ${accessToken}` },
        transports: ['websocket'],
        reconnectionAttempts: 5,
      });

      socketRef.current.on('notification', (data: Omit<InAppNotification, 'userId' | 'read'>) => {
        // Prepend new notification into the cache
        qc.setQueryData<InAppNotification[]>(notificationKeys.all, (old = []) => [
          { ...data, read: false, createdAt: data.createdAt ?? new Date().toISOString() } as InAppNotification,
          ...old.slice(0, 49),
        ]);
        qc.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      });
    }).catch(() => {
      // socket.io-client not yet installed — WS features silent-fail, REST polling is fallback
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [accessToken, qc]);

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  const handleMarkAll = () => {
    markAllMutation.mutate();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ''}`}
      >
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="text-gray-500"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-gray-100 shadow-xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Notifications {unread > 0 && <span className="text-xs text-red-500">({unread} unread)</span>}
              </span>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-gray-400 hover:text-[#1D9E75] transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No notifications yet.
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.slice(0, 20).map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 ${n.read ? 'bg-white' : 'bg-teal-50/50'}`}
                  >
                    {n.subject && (
                      <p className="text-xs font-semibold text-gray-700">{n.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
