import { apiClient } from '../client';

export const moderationApi = {
  submitReport: (body: { subjectType: string; subjectId: string; reason: string; detail?: string }) =>
    apiClient.post('/moderation/reports', body).then((r) => r.data),

  getPendingReports: () =>
    apiClient.get('/moderation/reports/pending').then((r) => r.data),

  resolveReport: (id: string, resolution: string) =>
    apiClient.patch(`/moderation/reports/${id}/resolve`, { resolution }).then((r) => r.data),

  enforce: (body: { targetUserId: string; action: string; reason: string; expiresAt?: string }) =>
    apiClient.post('/moderation/enforce', body).then((r) => r.data),

  getEnforcementHistory: (userId: string) =>
    apiClient.get(`/moderation/users/${userId}/enforcement-history`).then((r) => r.data),
};
