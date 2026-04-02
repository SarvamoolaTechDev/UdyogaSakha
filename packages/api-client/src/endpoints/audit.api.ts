import { apiClient } from '../client';
import { AuditEntityType } from '@udyogasakha/types';

export const auditApi = {
  getEntityLog: (entityType: AuditEntityType, entityId: string) =>
    apiClient.get(`/audit/entity/${entityType}/${entityId}`).then((r) => r.data),

  getActorLog: (actorId: string, limit = 50) =>
    apiClient.get(`/audit/actor/${actorId}`, { params: { limit } }).then((r) => r.data),
};
