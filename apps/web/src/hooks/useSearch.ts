import { useQuery } from '@tanstack/react-query';
import { searchApi } from '@udyogasakha/api-client';
import { ModuleType } from '@udyogasakha/types';

interface SearchParams {
  q?: string;
  moduleType?: ModuleType;
  page?: number;
  limit?: number;
}

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', 'opportunities', params],
    queryFn: () => searchApi.opportunities(params),
    // Don't refetch on every keystroke — debounce handled by caller
    staleTime: 10_000,
  });
}
