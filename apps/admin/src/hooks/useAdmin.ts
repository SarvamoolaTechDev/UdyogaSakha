import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi, trustApi, auditApi, moderationApi } from '@udyogasakha/api-client';
import { apiClient } from '@udyogasakha/api-client';
import type { EnforcementActionType } from '@udyogasakha/types';

// ── Moderation queue ──────────────────────────────────────────────────────────
export function usePendingOpportunities() {
  return useQuery({
    queryKey: ['admin', 'moderation', 'opportunities'],
    queryFn: () => apiClient.get('/opportunities/pending-moderation').then((r) => r.data),
    refetchInterval: 30_000,
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
    mutationFn: ({ id, reason }: { id: string; reason: string }) => opportunitiesApi.reject(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'moderation'] }),
  });
}

// ── Reports ───────────────────────────────────────────────────────────────────
export function usePendingReports() {
  return useQuery({
    queryKey: ['admin', 'reports', 'pending'],
    queryFn: moderationApi.getPendingReports,
    refetchInterval: 30_000,
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) =>
      moderationApi.resolveReport(id, resolution),
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

// ── Verification queue ────────────────────────────────────────────────────────
export function usePendingVerifications() {
  return useQuery({
    queryKey: ['admin', 'trust', 'verifications'],
    queryFn: () => apiClient.get('/trust/verifications/pending').then((r) => r.data),
    refetchInterval: 30_000,
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────
export function useUsers(search = '') {
  return useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => apiClient.get('/users', { params: { search } }).then((r) => r.data),
  });
}

// ── Enforcement ───────────────────────────────────────────────────────────────
export function useEnforce() {
  return useMutation({
    mutationFn: (body: {
      targetUserId: string;
      action: EnforcementActionType;
      reason: string;
      expiresAt?: string;
    }) => moderationApi.enforce(body),
  });
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export function useEntityAuditLog(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['admin', 'audit', entityType, entityId],
    queryFn: () => auditApi.getEntityLog(entityType as any, entityId),
    enabled: !!(entityType && entityId),
  });
}

export function useActorAuditLog(actorId: string) {
  return useQuery({
    queryKey: ['admin', 'audit', 'actor', actorId],
    queryFn: () => auditApi.getActorLog(actorId),
    enabled: !!actorId,
  });
}
