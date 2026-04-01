import { apiClient } from '../client';
import { AuthTokens } from '@udyogasakha/types';
import type { RegisterInput, LoginInput } from '@udyogasakha/validators';

export const authApi = {
  register: (data: RegisterInput) =>
    apiClient.post<AuthTokens>('/auth/register', data).then((r) => r.data),

  login: (data: LoginInput) =>
    apiClient.post<AuthTokens>('/auth/login', data).then((r) => r.data),

  refresh: () =>
    apiClient.post<AuthTokens>('/auth/refresh').then((r) => r.data),

  logout: () =>
    apiClient.post('/auth/logout').then((r) => r.data),
};
