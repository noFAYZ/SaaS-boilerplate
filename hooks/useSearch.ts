// hooks/useSearch.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchService } from '@/lib/search/searchService';
import { SearchResult, SearchFilters, UseSearchOptions } from '@/lib/search/types';

/**
 * Custom hook for search functionality
 * Provides debounced search, caching, and navigation
 */
export function useSearch(options: UseSearchOptions = {}) {
  const {
    immediate = false,
    debounceMs = 300,
    maxResults = 12,
    filters: initialFilters = {},
    onResults,
    onError
  } = options;

  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const filtersRef = useRef<SearchFilters>(initialFilters);
  const callbacksRef = useRef({ onResults, onError });

  // Update refs when props change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    callbacksRef.current = { onResults, onError };
  }, [onResults, onError]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('search_recent');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  }, []);

  // Stable search function that doesn't change
  const performSearch = useCallback(async (searchQuery: string, searchFilters?: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchService.search(
        searchQuery,
        { ...filtersRef.current, ...searchFilters, limit: maxResults },
        abortControllerRef.current.signal
      );

      if (abortControllerRef.current.signal.aborted) return;

      setResults(searchResults);
      callbacksRef.current.onResults?.(searchResults);

      // Update recent searches if we got results
      if (searchResults.length > 0 && searchQuery.trim()) {
        const trimmedQuery = searchQuery.trim();
        setRecentSearches(prev => {
          if (prev.includes(trimmedQuery)) return prev;
          
          const newRecentSearches = [trimmedQuery, ...prev.slice(0, 4)];
          
          // Save to localStorage in next frame
          requestAnimationFrame(() => {
            try {
              localStorage.setItem('search_recent', JSON.stringify(newRecentSearches));
            } catch (error) {
              console.warn('Failed to save recent searches:', error);
            }
          });
          
          return newRecentSearches;
        });
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMessage = err.message || 'Search failed';
        setError(errorMessage);
        callbacksRef.current.onError?.(errorMessage);
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [maxResults]); // Only maxResults as dependency

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query || immediate) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, debounceMs);
    } else {
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch, debounceMs, immediate]);

  // Navigation handler
  const navigateToResult = useCallback((result: SearchResult) => {
    if (result.url) {
      router.push(result.url);
      setSelectedResult(result);
    }
  }, [router]);

  // Get trending results for empty state
  const getTrending = useCallback(async () => {
    setIsLoading(true);
    try {
      const trending = await searchService.getTrending();
      setResults(trending);
    } catch (err: any) {
      setError(err.message || 'Failed to load trending');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('search_recent');
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  // Update filters and trigger new search
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (query.trim()) {
      performSearch(query, newFilters);
    }
  }, [query, performSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    query,
    setQuery,
    results,
    isLoading,
    error,
    recentSearches,
    selectedResult,
    setSelectedResult,

    // Actions
    search: performSearch,
    navigateToResult,
    getTrending,
    clearHistory,
    clearCache: searchService.clearCache.bind(searchService),

    // Filters
    filters,
    setFilters: updateFilters
  };
}