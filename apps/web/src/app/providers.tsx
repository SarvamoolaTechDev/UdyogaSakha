'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { configureApiClient } from '@udyogasakha/api-client';
import { useAuthStore } from '@/store/auth.store';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
    }),
  );

  const { clearAuth } = useAuthStore();

  useEffect(() => {
    configureApiClient({
      getToken: () => useAuthStore.getState().accessToken,
      onUnauthorized: () => {
        clearAuth();
        window.location.href = '/login';
      },
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
    });
  }, [clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </QueryClientProvider>
  );
}
