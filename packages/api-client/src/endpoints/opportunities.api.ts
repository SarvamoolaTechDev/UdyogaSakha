import { apiClient } from '../client';
import type { Opportunity } from '@udyogasakha/types';
import type { CreateOpportunityInput, OpportunityFiltersInput } from '@udyogasakha/validators';

export interface PaginatedOpportunities {
  data: Opportunity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const opportunitiesApi = {
  list: (filters?: Partial<OpportunityFiltersInput>) =>
    apiClient.get<PaginatedOpportunities>('/opportunities', { params: filters }).then((r) => r.data),

  getMine: () =>
    apiClient.get<Opportunity[]>('/opportunities/my').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Opportunity>(`/opportunities/${id}`).then((r) => r.data),

  create: (dto: CreateOpportunityInput) =>
    apiClient.post<Opportunity>('/opportunities', dto).then((r) => r.data),

  update: (id: string, dto: Partial<CreateOpportunityInput>) =>
    apiClient.patch<Opportunity>(`/opportunities/${id}`, dto).then((r) => r.data),

  close: (id: string, note?: string) =>
    apiClient.patch<Opportunity>(`/opportunities/${id}/close`, { note }).then((r) => r.data),

  publish: (id: string) =>
    apiClient.patch<Opportunity>(`/opportunities/${id}/publish`).then((r) => r.data),

  reject: (id: string, reason: string) =>
    apiClient.patch<Opportunity>(`/opportunities/${id}/reject`, { reason }).then((r) => r.data),
};
