import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens } from '@udyogasakha/types';
import { getUserIdFromToken } from '@/lib/jwt';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,

      setTokens: ({ accessToken, refreshToken }) => {
        // Decode userId from JWT — no library needed
        const userId = getUserIdFromToken(accessToken);
        // Set cookie for Next.js middleware to read
        if (typeof document !== 'undefined') {
          document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Lax`;
        }
        set({ accessToken, refreshToken, userId, isAuthenticated: true });
      },

      clearAuth: () => {
        // Clear the middleware cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'access_token=; path=/; max-age=0';
        }
        set({ accessToken: null, refreshToken: null, userId: null, isAuthenticated: false });
      },
    }),
    { name: 'udyogasakha_auth' },
  ),
);
