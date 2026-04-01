import { apiClient } from '../client';
import { TrustSummary } from '@udyogasakha/types';

export const trustApi = {
  getMyTrust: () =>
    apiClient.get<TrustSummary>('/trust/me').then((r) => r.data),

  requestVerification: (documentIds: string[]) =>
    apiClient.post('/trust/request-verification', { documentIds }).then((r) => r.data),

  // Moderator actions
  getTrust: (userId: string) =>
    apiClient.get<TrustSummary>(`/trust/${userId}`).then((r) => r.data),

  approveL1: (userId: string) =>
    apiClient.post(`/trust/${userId}/approve-l1`).then((r) => r.data),

  revokeBadge: (badgeId: string, reason: string) =>
    apiClient.post(`/trust/badges/${badgeId}/revoke`, { reason }).then((r) => r.data),
};
