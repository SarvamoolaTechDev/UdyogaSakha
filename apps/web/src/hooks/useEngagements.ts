import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { engagementsApi } from '@udyogasakha/api-client';

export const engagementKeys = {
  myApplications: ['engagements', 'applications', 'mine'] as const,
  myEngagements:  ['engagements', 'mine'] as const,
  forOpportunity: (id: string) => ['engagements', 'applications', 'opportunity', id] as const,
};

export function useMyApplications() {
  return useQuery({ queryKey: engagementKeys.myApplications, queryFn: engagementsApi.getMyApplications });
}

export function useMyEngagements() {
  return useQuery({ queryKey: engagementKeys.myEngagements, queryFn: engagementsApi.getMyEngagements });
}

export function useOpportunityApplications(opportunityId: string) {
  return useQuery({
    queryKey: engagementKeys.forOpportunity(opportunityId),
    queryFn: () => engagementsApi.getOpportunityApplications(opportunityId),
    enabled: !!opportunityId,
  });
}

export function useApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ opportunityId, coverMessage }: { opportunityId: string; coverMessage?: string }) =>
      engagementsApi.apply(opportunityId, coverMessage),
    onSuccess: () => qc.invalidateQueries({ queryKey: engagementKeys.myApplications }),
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reviewNote }: { id: string; status: string; reviewNote?: string }) =>
      engagementsApi.updateApplicationStatus(id, status, reviewNote),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['engagements'] }),
  });
}

export function useCloseEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      engagementsApi.closeEngagement(id, status, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: engagementKeys.myEngagements }),
  });
}

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: ({ engagementId, rating, comment }: { engagementId: string; rating: number; comment?: string }) =>
      engagementsApi.submitFeedback(engagementId, rating, comment),
  });
}
