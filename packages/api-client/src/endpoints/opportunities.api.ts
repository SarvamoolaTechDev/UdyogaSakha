import { apiClient } from '../client';
import { Opportunity, PaginatedResult } from '@udyogasakha/types';
import type { CreateOpportunityInput, OpportunityFiltersInput } from '@udyogasakha/validators';

export const opportunitiesApi = {
  create: (data: CreateOpportunityInput) =>
    apiClient.post<Opportunity>('/opportunities', data).then((r) => r.data),

  list: (filters?: Partial<OpportunityFiltersInput>) =>
    apiClient.get<PaginatedResult<Opportunity>>('/opportunities', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Opportunity>(`/opportunities/${id}`).then((r) => r.data),

  getMine: () =>
    apiClient.get<Opportunity[]>('/opportunities/my').then((r) => r.data),

  close: (id: string, note?: string) =>
    apiClient.patch(`/opportunities/${id}/close`, { note }).then((r) => r.data),

  // Moderator actions
  publish: (id: string) =>
    apiClient.patch(`/opportunities/${id}/publish`).then((r) => r.data),

  reject: (id: string, reason: string) =>
    apiClient.patch(`/opportunities/${id}/reject`, { reason }).then((r) => r.data),
};
