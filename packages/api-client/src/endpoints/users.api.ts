import { apiClient } from '../client';

export const usersApi = {
  getMe: () => apiClient.get('/users/me').then((r) => r.data),
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.patch('/users/me/profile', data).then((r) => r.data),
  getById: (id: string) => apiClient.get(`/users/${id}`).then((r) => r.data),
};
