import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@udyogasakha/api-client';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const { accessToken, userId, isAuthenticated, setTokens, clearAuth } = useAuthStore();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      router.push('/login');
    },
  });

  return {
    accessToken,
    userId,
    isAuthenticated,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
