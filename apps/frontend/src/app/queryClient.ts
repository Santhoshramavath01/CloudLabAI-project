/**
 * PURPOSE: Single shared TanStack Query client instance so cache config
 * (stale time, retry behavior) is consistent app-wide instead of
 * redefined per component.
 * DEPENDENCIES: @tanstack/react-query
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});
