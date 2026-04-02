import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens } from '@udyogasakha/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  setTokens: (tokens: AuthTokens & { userId: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,
      setTokens: ({ accessToken, refreshToken, userId }) =>
        set({ accessToken, refreshToken, userId, isAuthenticated: true }),
      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, userId: null, isAuthenticated: false }),
    }),
    { name: 'udyogasakha_auth' },
  ),
);
