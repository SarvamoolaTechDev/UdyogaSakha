import { apiClient } from '../client';

export interface SearchFilters {
  q?: string;
  moduleType?: string;
  page?: number;
  limit?: number;
}

export const searchApi = {
  opportunities: (filters: SearchFilters = {}) =>
    apiClient.get<any>('/search/opportunities', { params: filters }).then((r) => r.data),
};
