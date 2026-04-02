import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@udyogasakha/api-client';

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: analyticsApi.getOverview,
    refetchInterval: 60_000,
  });
}

export function useTrustDistribution() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'trust-distribution'],
    queryFn: analyticsApi.getTrustDistribution,
  });
}

export function useOpportunitiesByModule() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'opportunities-by-module'],
    queryFn: analyticsApi.getOpportunitiesByModule,
  });
}

export function useWeeklyActivity() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'weekly-activity'],
    queryFn: analyticsApi.getWeeklyActivity,
  });
}

export function useGovernanceHealth() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'governance-health'],
    queryFn: analyticsApi.getGovernanceHealth,
    refetchInterval: 60_000,
  });
}
