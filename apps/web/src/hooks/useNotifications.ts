import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type InAppNotification } from '@udyogasakha/api-client';

export const notificationKeys = {
  all:         ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

/** Fetch all notifications (last 50) */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.getAll(),
    staleTime: 10_000,
  });
}

/** Fetch unread count (lightweight poll) */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,   // poll every 30s as fallback when WS is unavailable
    staleTime: 10_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onMutate: async (id) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: notificationKeys.all });
      const prev = qc.getQueryData<InAppNotification[]>(notificationKeys.all);
      qc.setQueryData<InAppNotification[]>(notificationKeys.all, (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? [],
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(notificationKeys.all, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.unreadCount }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}
