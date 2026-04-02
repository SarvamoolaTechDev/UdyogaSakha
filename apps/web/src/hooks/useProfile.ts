import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@udyogasakha/api-client';

export const profileKeys = {
  me: ['profile', 'me'] as const,
};

export function useProfile() {
  return useQuery({ queryKey: profileKeys.me, queryFn: usersApi.getMe });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.me }),
  });
}
