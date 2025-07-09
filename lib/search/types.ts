// lib/search/types.ts
import { ReactNode } from 'react';

export type SearchCategory = 'tokens' | 'wallets' | 'nfts' | 'defi';
export type SearchResultType = 'wallet' | 'token' | 'nft' | 'defi';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  icon: ReactNode;
  type: SearchResultType;
  url?: string;
  badge?: string;
  metadata?: {
    value?: string;
    change?: number;
    verified?: boolean;
    network?: string;
    address?: string;
    symbol?: string;
    logoUrl?: string;
    marketCap?: string;
    price?: number;
    risk?: 'low' | 'medium' | 'high';
    tags?: string[];
    volume24h?: string;
    ens?: string;
  };
}

export interface SearchFilters {
  categories?: SearchCategory[];
  verified?: boolean;
  limit?: number;
  minValue?: number;
  maxValue?: number;
  chains?: string[];
}

export interface SearchHistory {
  query: string;
  timestamp: number;
  results: number;
}

export interface SearchStats {
  totalQueries: number;
  cacheHits: number;
  averageResponseTime: number;
  popularCategories: Record<SearchCategory, number>;
}

export interface SearchConfig {
  debounceMs: number;
  maxResults: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  enabledCategories: SearchCategory[];
}

export interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  recentSearches: string[];
  clearHistory: () => void;
  selectedResult: SearchResult | null;
  setSelectedResult: (result: SearchResult | null) => void;
}

export interface UseSearchOptions {
  immediate?: boolean;
  debounceMs?: number;
  maxResults?: number;
  filters?: SearchFilters;
  onResults?: (results: SearchResult[]) => void;
  onError?: (error: string) => void;
}