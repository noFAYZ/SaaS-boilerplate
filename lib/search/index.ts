import { SearchResult } from './types';

// lib/search/index.ts
export { SearchService, searchService } from './searchService';
export type {
  SearchResult,
  SearchCategory,
  SearchFilters,
  SearchResultType,
  SearchHistory,
  SearchStats,
  SearchConfig,
  SearchContextType,
  UseSearchOptions
} from './types';

// Utility functions for search
export const searchUtils = {
  /**
   * Format search query for better matching
   */
  formatQuery: (query: string): string => {
    return query.trim().toLowerCase();
  },

  /**
   * Check if query is likely an address
   */
  isAddressLike: (query: string): boolean => {
    return /^(0x)?[a-fA-F0-9]{40}$/.test(query) || query.endsWith('.eth');
  },

  /**
   * Check if query is likely a token symbol
   */
  isTokenSymbol: (query: string): boolean => {
    return /^[A-Z]{2,10}$/.test(query.toUpperCase());
  },

  /**
   * Extract search terms from query
   */
  extractTerms: (query: string): string[] => {
    return query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  },

  /**
   * Calculate search relevance score
   */
  calculateRelevance: (result: SearchResult, query: string): number => {
    const terms = searchUtils.extractTerms(query);
    const title = result.title.toLowerCase();
    const subtitle = result.subtitle?.toLowerCase() || '';
    
    let score = 0;
    
    // Exact title match
    if (title === query.toLowerCase()) score += 100;
    
    // Title starts with query
    if (title.startsWith(query.toLowerCase())) score += 50;
    
    // Title contains all terms
    if (terms.every(term => title.includes(term))) score += 30;
    
    // Subtitle matches
    if (terms.some(term => subtitle.includes(term))) score += 10;
    
    // Verification bonus
    if (result.metadata?.verified) score += 5;
    
    // Type priority
    const typePriority = { wallet: 4, token: 3, nft: 2, defi: 1 };
    score += typePriority[result.type] || 0;
    
    return score;
  }
};