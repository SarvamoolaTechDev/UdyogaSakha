import { apiClient } from '../client';
import { CouncilType } from '@udyogasakha/types';

export const governanceApi = {
  getMembers: (councilType?: CouncilType) =>
    apiClient.get('/governance/members', { params: { councilType } }).then((r) => r.data),

  addMember: (data: { userId: string; councilType: CouncilType; domain: string }) =>
    apiClient.post('/governance/members', data).then((r) => r.data),

  deactivateMember: (id: string) =>
    apiClient.patch(`/governance/members/${id}/deactivate`).then((r) => r.data),

  declareConflict: (data: { entityId: string; entityType: string; notes: string }) =>
    apiClient.post('/governance/conflicts', data).then((r) => r.data),

  scheduleSession: (data: { candidateId: string; scheduledAt: string; domain: string }) =>
    apiClient.post('/governance/sessions', data).then((r) => r.data),

  recordOutcome: (
    id: string,
    data: { outcome: 'approved' | 'rejected' | 'deferred'; notes: string },
  ) => apiClient.patch(`/governance/sessions/${id}/outcome`, data).then((r) => r.data),
};
