import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

let _getToken: (() => string | null) | null = null;
let _onUnauthorized: (() => void) | null = null;

/**
 * Call once at app startup to wire up token retrieval and 401 handler.
 * - Web:    pass () => localStorage / Zustand store getter
 * - Mobile: pass () => SecureStore.getItemAsync(...)
 */
export function configureApiClient(opts: {
  getToken: () => string | null;
  onUnauthorized: () => void;
  baseURL?: string;
}) {
  _getToken = opts.getToken;
  _onUnauthorized = opts.onUnauthorized;
  apiClient.defaults.baseURL =
    opts.baseURL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT on every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _getToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      _onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
