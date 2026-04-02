import { apiClient } from '../client';

export const analyticsApi = {
  getOverview: () =>
    apiClient.get('/analytics/overview').then((r) => r.data),

  getTrustDistribution: () =>
    apiClient.get<{ level: string; count: number }[]>('/analytics/trust-distribution').then((r) => r.data),

  getOpportunitiesByModule: () =>
    apiClient.get<{ moduleType: string; count: number }[]>('/analytics/opportunities-by-module').then((r) => r.data),

  getWeeklyActivity: () =>
    apiClient.get<{ week: string; newUsers: number; newOpportunities: number }[]>('/analytics/weekly-activity').then((r) => r.data),

  getGovernanceHealth: () =>
    apiClient.get('/analytics/governance-health').then((r) => r.data),
};
