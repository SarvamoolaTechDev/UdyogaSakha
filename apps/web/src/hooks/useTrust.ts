import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trustApi } from '@udyogasakha/api-client';

export const trustKeys = {
  me:   ['trust', 'me'] as const,
  user: (id: string) => ['trust', id] as const,
};

export function useTrust() {
  return useQuery({ queryKey: trustKeys.me, queryFn: trustApi.getMyTrust });
}

export function useRequestVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentIds: string[]) => trustApi.requestVerification(documentIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: trustKeys.me }),
  });
}
