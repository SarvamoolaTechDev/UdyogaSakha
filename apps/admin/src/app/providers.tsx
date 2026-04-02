'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { configureApiClient } from '@udyogasakha/api-client';

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('admin_access_token');
}

function handleAdminUnauthorized() {
  sessionStorage.removeItem('admin_access_token');
  window.location.href = '/login';
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      },
    }),
  );

  useEffect(() => {
    configureApiClient({
      getToken: getAdminToken,
      onUnauthorized: handleAdminUnauthorized,
      baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
    });
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
