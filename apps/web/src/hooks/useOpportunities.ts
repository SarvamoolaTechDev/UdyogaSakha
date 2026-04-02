import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunitiesApi } from '@udyogasakha/api-client';
import type { OpportunityFiltersInput } from '@udyogasakha/validators';

export const opportunityKeys = {
  all:     ['opportunities'] as const,
  list:    (f: Partial<OpportunityFiltersInput>) => [...opportunityKeys.all, 'list', f] as const,
  detail:  (id: string) => [...opportunityKeys.all, 'detail', id] as const,
  mine:    () => [...opportunityKeys.all, 'mine'] as const,
};

export function useOpportunities(filters: Partial<OpportunityFiltersInput> = {}) {
  return useQuery({
    queryKey: opportunityKeys.list(filters),
    queryFn: () => opportunitiesApi.list(filters),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => opportunitiesApi.getById(id),
    enabled: !!id,
  });
}

export function useMyOpportunities() {
  return useQuery({
    queryKey: opportunityKeys.mine(),
    queryFn: opportunitiesApi.getMine,
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: opportunitiesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: opportunityKeys.all }),
  });
}

export function useCloseOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => opportunitiesApi.close(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: opportunityKeys.all }),
  });
}
