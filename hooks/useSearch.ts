// hooks/useSearch.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchService } from '@/lib/search/searchService';
import { SearchResult, SearchFilters, UseSearchOptions } from '@/lib/search/types';

/**
 * Enhanced search hook with optimized architecture
 * - Proper empty state handling
 * - Efficient caching and debouncing
 * - Robust error handling and retries
 * - Memory-efficient result management
 */
export function useSearch(options: UseSearchOptions = {}) {
  const {
    immediate = false, // FIXED: Default to false to prevent initial load
    debounceMs = 300,
    maxResults = 12,
    filters: initialFilters = {},
    onResults,
    onError,
    enableCache = true,
    retryAttempts = 2
  } = options;

  const router = useRouter();
  
  // Core state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  
  // Performance refs
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const cacheRef = useRef<Map<string, { results: SearchResult[]; timestamp: number }>>(new Map());
  const lastQueryRef = useRef<string>('');
  const retryCountRef = useRef<number>(0);
  
  // Constants
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const MAX_CACHE_SIZE = 50;
  const MAX_RECENT_SEARCHES = 10;

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('search_recent');
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentSearches(Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : []);
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    try {
      localStorage.setItem('search_recent', JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)));
    } catch (error) {
      console.warn('Failed to save recent searches:', error);
    }
  }, []);

  // Cache management
  const getCachedResults = useCallback((searchQuery: string): SearchResult[] | null => {
    if (!enableCache) return null;
    
    const cached = cacheRef.current.get(searchQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.results;
    }
    
    // Remove expired cache entry
    if (cached) {
      cacheRef.current.delete(searchQuery);
    }
    
    return null;
  }, [enableCache]);

  const setCachedResults = useCallback((searchQuery: string, results: SearchResult[]) => {
    if (!enableCache) return;
    
    // Implement LRU cache behavior
    if (cacheRef.current.size >= MAX_CACHE_SIZE) {
      const firstKey = cacheRef.current.keys().next().value;
      if (firstKey) {
        cacheRef.current.delete(firstKey);
      }
    }
    
    cacheRef.current.set(searchQuery, {
      results: [...results], // Create copy to prevent mutations
      timestamp: Date.now()
    });
  }, [enableCache]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Add to recent searches
  const addToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      const trimmed = searchQuery.trim();
      const filtered = prev.filter(item => item !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      saveRecentSearches(updated);
      return updated;
    });
  }, [saveRecentSearches]);

  // Core search function with optimizations
  const performSearch = useCallback(async (
    searchQuery: string, 
    searchFilters?: SearchFilters,
    skipCache = false
  ): Promise<SearchResult[]> => {
    const trimmedQuery = searchQuery.trim();
    
    // Early return for empty query
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return [];
    }

    // Check cache first
    if (!skipCache) {
      const cachedResults = getCachedResults(trimmedQuery);
      if (cachedResults) {
        setResults(cachedResults);
        setError(null);
        setIsLoading(false);
        onResults?.(cachedResults);
        return cachedResults;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);
    setError(null);
    lastQueryRef.current = trimmedQuery;

    try {
      const searchResults = await searchService.search(
        trimmedQuery,
        { 
          ...filters, 
          ...searchFilters, 
          limit: maxResults 
        },
        signal
      );

      // Check if request was aborted or query changed
      if (signal.aborted || lastQueryRef.current !== trimmedQuery) {
        return [];
      }

      // Apply additional client-side filtering and sorting with safe defaults
      const processedResults = searchResults
        .slice(0, maxResults)
        .map(result => ({
          ...result,
          // Ensure consistent data structure with safe defaults
          category: (result.category as SearchCategory) || 'tokens',
          type: result.type || 'token',
          metadata: {
            verified: false,
            risk: 'medium' as const,
            ...result.metadata
          }
        }));

      // Update state
      setResults(processedResults);
      setError(null);
      retryCountRef.current = 0;

      // Cache results
      setCachedResults(trimmedQuery, processedResults);

      // Add to recent searches
      addToRecentSearches(trimmedQuery);

      // Call callback
      onResults?.(processedResults);

      return processedResults;

    } catch (err: any) {
      // Don't handle errors if request was aborted
      if (signal.aborted) {
        return [];
      }

      const errorMessage = err.message || 'Search failed';
      console.error('Search error:', err);
      
      setError(errorMessage);
      setResults([]);
      onError?.(errorMessage);
      
      return [];
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [
    maxResults, 
    filters, 
    getCachedResults, 
    setCachedResults, 
    addToRecentSearches, 
    onResults, 
    onError
  ]);

  // Debounced search effect - FIXED: Only trigger when query exists or immediate is true
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // FIXED: Only search if there's a query OR immediate is explicitly true
    if (query.trim() || immediate) {
      debounceTimerRef.current = setTimeout(() => {
        if (query.trim()) {
          performSearch(query);
        } else if (immediate) {
          // Only load initial data if immediate is explicitly requested
          performSearch(''); // This will be handled by the service
        }
      }, debounceMs);
    } else {
      // Clear results when query is empty and not immediate
      setResults([]);
      setError(null);
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
    setSelectedResult(result);
    if (result.url) {
      router.push(result.url);
    }
  }, [router]);

  // Get trending results for empty state
  const getTrending = useCallback(async (): Promise<SearchResult[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const trending = await searchService.getTrending();
      setResults(trending);
      onResults?.(trending);
      return trending;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load trending';
      setError(errorMessage);
      onError?.(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [onResults, onError]);

  // Retry with exponential backoff
  const retry = useCallback(async () => {
    if (!query.trim()) {
      await getTrending();
      return;
    }

    retryCountRef.current += 1;
    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
    
    setTimeout(() => {
      performSearch(query, undefined, true); // Skip cache on retry
    }, delay);
  }, [query, performSearch, getTrending]);

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
      // Clear cache when filters change
      clearCache();
      performSearch(query, newFilters, true);
    }
  }, [query, performSearch, clearCache]);

  // Search with specific query (manual trigger)
  const searchWithQuery = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    setQuery(searchQuery);
    return performSearch(searchQuery);
  }, [performSearch]);

  // Get search suggestions based on query
  const getSuggestions = useCallback(async (partialQuery: string): Promise<string[]> => {
    if (!partialQuery.trim()) return [];
    
    try {
      const suggestions = await searchService.getSuggestions(partialQuery);
      return suggestions.slice(0, 5); // Limit suggestions
    } catch (error) {
      console.warn('Failed to get suggestions:', error);
      return [];
    }
  }, []);

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

  // Expose metrics for debugging
  const metrics = {
    cacheSize: cacheRef.current.size,
    lastQuery: lastQueryRef.current,
    retryCount: retryCountRef.current,
    isAborted: abortControllerRef.current?.signal.aborted || false
  };

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
    filters,

    // Actions
    search: performSearch,
    searchWithQuery,
    navigateToResult,
    getTrending,
    getSuggestions,
    retry,
    clearHistory,
    clearCache,

    // Filter management
    setFilters: updateFilters,

    // Utilities
    addToRecentSearches,
    metrics: process.env.NODE_ENV === 'development' ? metrics : undefined
  };
}