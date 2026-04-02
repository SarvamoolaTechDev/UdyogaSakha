import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi, trustApi } from '@udyogasakha/api-client';
import { apiClient } from '@udyogasakha/api-client';

// ── Moderation queue ──────────────────────────────────────────────────────────

export function usePendingOpportunities() {
  return useQuery({
    queryKey: ['admin', 'moderation', 'opportunities'],
    queryFn: () => apiClient.get('/moderation/opportunities/pending').then((r) => r.data),
  });
}

export function usePublishOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'moderation'] }),
  });
}

export function useRejectOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      opportunitiesApi.reject(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'moderation'] }),
  });
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function usePendingReports() {
  return useQuery({
    queryKey: ['admin', 'reports', 'pending'],
    queryFn: () => apiClient.get('/moderation/reports/pending').then((r) => r.data),
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      apiClient.patch(`/moderation/reports/${id}/resolve`, { resolution }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });
}

// ── Trust ─────────────────────────────────────────────────────────────────────

export function useUserTrust(userId: string) {
  return useQuery({
    queryKey: ['admin', 'trust', userId],
    queryFn: () => trustApi.getTrust(userId),
    enabled: !!userId,
  });
}

export function useApproveL1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => trustApi.approveL1(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'trust'] }),
  });
}

export function useRevokeBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ badgeId, reason }: { badgeId: string; reason: string }) =>
      trustApi.revokeBadge(badgeId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'trust'] }),
  });
}

// ── Enforcement ───────────────────────────────────────────────────────────────

export function useEnforce() {
  return useMutation({
    mutationFn: (body: { targetUserId: string; action: string; reason: string; expiresAt?: string }) =>
      apiClient.post('/moderation/enforce', body).then((r) => r.data),
  });
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export function useEntityAuditLog(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['admin', 'audit', entityType, entityId],
    queryFn: () => apiClient.get(`/audit/entity/${entityType}/${entityId}`).then((r) => r.data),
    enabled: !!(entityType && entityId),
  });
}
