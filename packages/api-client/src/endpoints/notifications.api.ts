import { apiClient } from '../client';

export interface InAppNotification {
  id: string;
  userId: string;
  subject?: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: (unreadOnly = false) =>
    apiClient
      .get<InAppNotification[]>('/notifications', { params: unreadOnly ? { unread: 'true' } : {} })
      .then((r) => r.data),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    apiClient.patch('/notifications/read-all').then((r) => r.data),
};
