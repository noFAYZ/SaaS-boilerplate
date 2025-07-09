// components/search/index.ts
export { default as EnhancedSearch } from './EnhancedSearch';
export { SearchResultItem } from './SearchResultItem';
export { SearchFiltersPanel } from './SearchFiltersPanel';
export { EmptyState } from './EmptyState';
 
// Re-export types for convenience
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
} from '@/lib/search/types';

// Re-export service
export { searchService } from '@/lib/search/searchService';

// Re-export hook
export { useSearch } from '@/hooks/useSearch';