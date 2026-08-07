import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import type { AppError } from './error-mapper';

// Default stale time: 5 minutes
const DEFAULT_STALE_TIME = 5 * 60 * 1000;

// Default cache time: 10 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000;

// Global error handler
const handleError = (error: unknown) => {
  // Only process AppError types
  if (isAppError(error)) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Query Error:', error);
    }

    // Show toast notification (implement based on your toast library)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app:error', {
          detail: {
            title: error.title,
            message: error.message,
            code: error.code,
          },
        })
      );
    }
  }
};

// Type guard for AppError
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'title' in error &&
    'message' in error &&
    'code' in error &&
    'statusCode' in error
  );
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleError,
  }),
  mutationCache: new MutationCache({
    onError: handleError,
  }),
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_CACHE_TIME, // Previously cacheTime in v4
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (except 408 Request Timeout and 429 Too Many Requests)
        if (isAppError(error) && error.statusCode >= 400 && error.statusCode < 500) {
          if (error.statusCode !== 408 && error.statusCode !== 429) {
            return false;
          }
        }

        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Prefetch helpers
export const prefetchQuery = async <T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};

// Invalidate helpers
export const invalidateQueries = (queryKey: unknown[]) => {
  return queryClient.invalidateQueries({ queryKey });
};

// Set query data helper
export const setQueryData = <T>(queryKey: unknown[], data: T | ((old: T | undefined) => T)) => {
  queryClient.setQueryData(queryKey, data);
};

// Get query data helper
export const getQueryData = <T>(queryKey: unknown[]): T | undefined => {
  return queryClient.getQueryData(queryKey);
};
