import { apiClient } from '../client';
import { Application, Engagement } from '@udyogasakha/types';

export const engagementsApi = {
  apply: (opportunityId: string, coverMessage?: string) =>
    apiClient.post<Application>('/engagements/apply', { opportunityId, coverMessage }).then((r) => r.data),

  getMyApplications: () =>
    apiClient.get<Application[]>('/engagements/applications/my').then((r) => r.data),

  getOpportunityApplications: (opportunityId: string) =>
    apiClient.get<Application[]>(`/engagements/applications/opportunity/${opportunityId}`).then((r) => r.data),

  updateApplicationStatus: (id: string, status: string, reviewNote?: string) =>
    apiClient.patch(`/engagements/applications/${id}/status`, { status, reviewNote }).then((r) => r.data),

  getMyEngagements: () =>
    apiClient.get<Engagement[]>('/engagements/my').then((r) => r.data),

  closeEngagement: (id: string, status: string, note?: string) =>
    apiClient.patch(`/engagements/${id}/close`, { status, note }).then((r) => r.data),

  submitFeedback: (engagementId: string, rating: number, comment?: string) =>
    apiClient.post(`/engagements/${engagementId}/feedback`, { rating, comment }).then((r) => r.data),
};
