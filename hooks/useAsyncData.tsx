import { useState, useEffect, useCallback, useRef } from 'react';

// Type definitions for the hook
interface UseAsyncDataOptions {
  immediate?: boolean; // Whether to fetch data immediately on mount
  resetDataOnError?: boolean; // Whether to reset data when error occurs
  retries?: number; // Number of automatic retries on error
  retryDelay?: number; // Delay between retries in milliseconds
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reset: () => void;
  isStale: boolean; // Whether data might be outdated
}

// Custom hook for async data fetching with comprehensive error handling
export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
  const {
    immediate = true,
    resetDataOnError = false,
    retries = 0,
    retryDelay = 1000
  } = options;

  // State management
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  // Refs for cleanup and retry logic
  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Reset function
  const reset = useCallback(() => {
    cleanup();
    setData(null);
    setLoading(false);
    setError(null);
    setIsStale(false);
  }, [cleanup]);

  // Fetch data with retry logic
  const fetchData = useCallback(async (attempt: number = 0): Promise<void> => {
    // Don't proceed if component is unmounted
    if (!mountedRef.current) return;

    try {
      // Set loading state only on first attempt
      if (attempt === 0) {
        setLoading(true);
        setError(null);
        setIsStale(false);
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      // Execute the async function
      const result = await asyncFn();
      
      // Only update state if component is still mounted and request wasn't aborted
      if (mountedRef.current && !abortControllerRef.current.signal.aborted) {
        setData(result);
        setError(null);
        setIsStale(false);
      }
    } catch (err) {
      // Don't handle errors if component is unmounted or request was aborted
      if (!mountedRef.current || (abortControllerRef.current?.signal.aborted)) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      // Retry logic
      if (attempt < retries) {
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms:`, errorMessage);
        
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            fetchData(attempt + 1);
          }
        }, retryDelay * Math.pow(2, attempt)); // Exponential backoff
        
        return;
      }

      // Set error state
      setError(errorMessage);
      
      // Reset data if option is enabled
      if (resetDataOnError) {
        setData(null);
      } else {
        // Mark data as stale if we have previous data
        if (data !== null) {
          setIsStale(true);
        }
      }
      
      console.error('Final error after all retries:', errorMessage);
    } finally {
      // Only set loading to false if this is the final attempt (no more retries)
      if (mountedRef.current && (error !== null || attempt >= retries)) {
        setLoading(false);
      }
    }
  }, [asyncFn, retries, retryDelay, resetDataOnError, data]);

  // Refetch function (exposed to component)
  const refetch = useCallback(async (): Promise<void> => {
    cleanup();
    await fetchData();
  }, [fetchData, cleanup]);

  // Effect for initial fetch and dependency changes
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    // Cleanup function
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
    isStale
  };
}

// Specialized hooks for common patterns

// Hook for paginated data
export function usePaginatedAsyncData<T>(
  asyncFn: (page: number) => Promise<T>,
  initialPage: number = 1,
  dependencies: React.DependencyList = []
) {
  const [page, setPage] = useState(initialPage);
  
  const result = useAsyncData(
    () => asyncFn(page),
    [page, ...dependencies],
    { immediate: true }
  );

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  return {
    ...result,
    page,
    nextPage,
    prevPage,
    goToPage
  };
}

// Hook for data with automatic refresh
export function useAutoRefreshAsyncData<T>(
  asyncFn: () => Promise<T>,
  refreshInterval: number = 30000, // 30 seconds default
  dependencies: React.DependencyList = []
) {
  const result = useAsyncData(asyncFn, dependencies);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        result.refetch();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, result.refetch]);

  return result;
}

// Hook for conditional data fetching
export function useConditionalAsyncData<T>(
  asyncFn: () => Promise<T>,
  condition: boolean,
  dependencies: React.DependencyList = []
) {
  return useAsyncData(
    asyncFn,
    [condition, ...dependencies],
    { immediate: condition }
  );
}

// Example usage:
/*
// Basic usage
const { data, loading, error, refetch } = useAsyncData(
  () => ZerionService.getWalletPortfolio(address),
  [address]
);

// With options
const { data, loading, error, refetch, isStale } = useAsyncData(
  () => fetchUserData(userId),
  [userId],
  {
    immediate: true,
    resetDataOnError: false,
    retries: 3,
    retryDelay: 1000
  }
);

// Paginated data
const { data, loading, error, page, nextPage, prevPage } = usePaginatedAsyncData(
  (page) => fetchTransactions(address, page),
  1,
  [address]
);

// Auto-refreshing data
const { data, loading, error } = useAutoRefreshAsyncData(
  () => fetchLivePrice(symbol),
  5000, // Refresh every 5 seconds
  [symbol]
);

// Conditional fetching
const { data, loading, error } = useConditionalAsyncData(
  () => fetchUserProfile(userId),
  !!userId && isAuthenticated,
  [userId, isAuthenticated]
);
*/