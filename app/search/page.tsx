'use client'
import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from "react";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  X, 
  Star, 
  Shield, 
  DollarSign, 
  BarChart3, 
  Wallet, 
  Coins, 
  ArrowUpRight, 
  Globe, 
  Activity, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Trash2, 
  Sparkles, 
  Command, 
  Target, 
  Award,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Zap,
  Hash,
  Image,
  Menu,
  Grid,
  List,
  SortDesc,
  SortAsc,
  RefreshCw,
  Bookmark,
  Share2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Layers,
  PieChart
} from "lucide-react";

// Import actual search architecture
import { useSearch } from '@/hooks/useSearch';
import { searchService } from '@/lib/search/searchService';
import { SearchResult, SearchCategory } from '@/lib/search/types';
import { LogoLoader } from "@/components/icons";

// Default categories from the actual implementation
const categories: SearchCategory[] = ['tokens', 'wallets', 'nfts', 'defi'];

const SearchResultItem = memo(({ 
  item, 
  isSelected, 
  onSelect, 
  showBalance = true,
  viewMode = "list" 
}: {
  item: SearchResult;
  isSelected: boolean;
  onSelect: (item: SearchResult) => void;
  showBalance: boolean;
  viewMode: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.metadata?.address || item.title);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [item]);

  const formatPrice = (value: string | number | undefined) => {
    if (!value) return '';
    if (typeof value === 'string') {
      return value.replace(/\$/, '');
    }
    return value.toString();
  };

  const getChangeColor = (change: number | undefined) => {
    if (!change) return 'text-default-500';
    return change > 0 ? 'text-success' : 'text-danger';
  };

  const getChangeIcon = (change: number | undefined) => {
    if (!change) return null;
    return change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  if (viewMode === "grid") {
    return (
      <div
        className={`
          group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
          ${isSelected 
            ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-950/20' 
            : 'border-default-200 bg-default-50 dark:border-default-800 dark:bg-default-900/20'
          }
          hover:border-primary-200 hover:bg-primary-50 dark:hover:border-primary-800 dark:hover:bg-primary-950/20
          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
        `}
        onClick={() => onSelect(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon/Avatar */}
          <div className="relative">
            {item.metadata?.logoUrl ? (
              <img
                src={item.metadata.logoUrl}
                alt={item.title}
                className="w-12 h-12 rounded-full object-cover border-2 border-default-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
                {item.icon}
              </div>
            )}
            {item.metadata?.verified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="w-full">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-xs text-default-500 mt-1 truncate">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Price & Change */}
          {showBalance && (item.metadata?.value || item.metadata?.price) && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-medium">
                {item.metadata.value || 
                 (item.metadata.price ? `$${formatPrice(item.metadata.price)}` : '')}
              </span>
              {item.metadata.change && (
                <div className={`flex items-center gap-1 ${getChangeColor(item.metadata.change)}`}>
                  {getChangeIcon(item.metadata.change)}
                  <span className="text-xs">
                    {Math.abs(item.metadata.change).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Badge */}
          {item.badge && (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {item.badge}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        group relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-l-4 border-primary bg-primary-50 dark:bg-primary-950/20' 
          : 'border-l-4 border-transparent hover:border-primary-200 hover:bg-default-50 dark:hover:bg-default-900/20'
        }
        hover:shadow-md active:scale-[0.99]
      `}
      onClick={() => onSelect(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon/Avatar */}
      <div className="relative flex-shrink-0">
        {item.metadata?.logoUrl ? (
          <img
            src={item.metadata.logoUrl}
            alt={item.title}
            className="w-10 h-10 rounded-full object-cover border-2 border-default-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
            {item.icon}
          </div>
        )}
        {item.metadata?.verified && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
            <CheckCircle className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="text-xs text-default-500 mt-0.5 truncate">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Price & Change */}
          {showBalance && (item.metadata?.value || item.metadata?.price) && (
            <div className="flex items-center gap-2 text-sm ml-3">
              <span className="font-medium">
                {item.metadata.value || 
                 (item.metadata.price ? `$${formatPrice(item.metadata.price)}` : '')}
              </span>
              {item.metadata.change && (
                <div className={`flex items-center gap-1 ${getChangeColor(item.metadata.change)}`}>
                  {getChangeIcon(item.metadata.change)}
                  <span className="text-xs">
                    {Math.abs(item.metadata.change).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {item.badge && (
              <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                {item.badge}
              </div>
            )}
            <span className="text-xs text-default-400 capitalize">{item.category}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {(item.type === 'wallet' || item.type === 'token') && item.metadata?.address && (
              <button
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-default-100 dark:hover:bg-default-800 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-3 h-3 text-success" />
                ) : (
                  <Copy className="w-3 h-3 text-default-400" />
                )}
              </button>
            )}
            <button className="p-1 rounded-md hover:bg-default-100 dark:hover:bg-default-800 transition-colors">
              <ExternalLink className="w-3 h-3 text-default-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

const SearchFilters = memo(({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle 
}: {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      categories: categories,
      verified: false,
      limit: 12,
      minValue: undefined,
      maxValue: undefined,
      chains: undefined
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = [
    localFilters.verified,
    localFilters.minValue,
    localFilters.maxValue,
    localFilters.categories && localFilters.categories.length < categories.length,
    localFilters.chains && localFilters.chains.length > 0
  ].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="border-t border-default-200 bg-default-50 dark:bg-default-900/20 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Categories */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const isSelected = localFilters.categories?.includes(category) ?? true;
              return (
                <button
                  key={category}
                  onClick={() => {
                    const currentCategories = localFilters.categories || categories;
                    const newCategories = isSelected
                      ? currentCategories.filter(c => c !== category)
                      : [...currentCategories, category];
                    handleFilterChange('categories', newCategories.length > 0 ? newCategories : categories);
                  }}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize
                    ${isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-default-200 text-default-700 hover:bg-default-300 dark:bg-default-800 dark:text-default-300 dark:hover:bg-default-700'
                    }
                  `}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Value Range */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Value Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min ($)"
              value={localFilters.minValue || ''}
              onChange={(e) => handleFilterChange('minValue', e.target.value ? Number(e.target.value) : undefined)}
              className="flex-1 px-3 py-2 rounded-lg border border-default-200 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max ($)"
              value={localFilters.maxValue || ''}
              onChange={(e) => handleFilterChange('maxValue', e.target.value ? Number(e.target.value) : undefined)}
              className="flex-1 px-3 py-2 rounded-lg border border-default-200 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Verified Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="verified"
            checked={localFilters.verified || false}
            onChange={(e) => handleFilterChange('verified', e.target.checked)}
            className="w-4 h-4 text-primary border-default-300 rounded focus:ring-primary"
          />
          <label htmlFor="verified" className="text-sm font-medium text-foreground">
            Verified Only
          </label>
        </div>

        {/* Reset */}
        <button
          onClick={resetFilters}
          className="px-4 py-2 text-sm font-medium text-danger hover:text-danger-600 transition-colors"
        >
          Reset
        </button>
      </div>

      {activeFiltersCount > 0 && (
        <div className="mt-3 pt-3 border-t border-default-200">
          <div className="flex items-center gap-2 text-sm text-default-600">
            <span>{activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
});

const EmptyState = memo(({ query, onSuggestionClick, isLoading }: {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
}) => {
  const suggestions = [
    { text: "ethereum", icon: <Coins className="w-4 h-4" /> },
    { text: "bitcoin", icon: <Coins className="w-4 h-4" /> },
    { text: "uniswap", icon: <Zap className="w-4 h-4" /> },
    { text: "0x742d35Cc6634C0532925a3b8D", icon: <Wallet className="w-4 h-4" /> }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-default-500">Searching...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-default-100 dark:bg-default-800 flex items-center justify-center">
        <Search className="w-8 h-8 text-default-400" />
      </div>
      
      {query ? (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No results found for "{query}"
          </h3>
          <p className="text-default-500 mb-6">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Start searching
          </h3>
          <p className="text-default-500 mb-6">
            Search for tokens, wallets, NFTs, and DeFi protocols
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-200 dark:hover:bg-default-700 transition-colors"
          >
            {suggestion.icon}
            <span className="text-sm">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

export default function EnhancedSearchPage() {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  const inputRef = useRef<HTMLInputElement>(null);

  // Use the actual search hook from the architecture
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    recentSearches,
    filters,
    setFilters,
    navigateToResult,
    getTrending,
    clearHistory
  } = useSearch({
    immediate: false,
    debounceMs: 300,
    maxResults: 20,
    filters: {
      categories: categories,
      verified: false,
      limit: 20
    }
  });

  // Load trending content on mount
  useEffect(() => {
    if (!query) {
      getTrending();
    }
  }, [query, getTrending]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      navigateToResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleItemSelect = (item: SearchResult) => {
    setSelectedIndex(results.indexOf(item));
    navigateToResult(item);
  };

  const filteredResults = useMemo(() => {
    if (!results.length) return [];

    let filtered = results;

    // Apply category filter
    if (filters.categories && filters.categories.length < categories.length) {
      filtered = filtered.filter(item => filters.categories!.includes(item.category));
    }

    // Apply verified filter
    if (filters.verified) {
      filtered = filtered.filter(item => item.metadata?.verified);
    }

    // Apply value range filter
    if (filters.minValue || filters.maxValue) {
      filtered = filtered.filter(item => {
        const value = item.metadata?.price || 
                     (item.metadata?.value ? parseFloat(item.metadata.value.replace(/[$,]/g, '')) : 0);
        const min = filters.minValue || 0;
        const max = filters.maxValue || Infinity;
        return value >= min && value <= max;
      });
    }

    return filtered;
  }, [results, filters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-default-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-12 h-12"> <LogoLoader className="w-12 h-12"/></div>
         
           
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-default-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search tokens, wallets, NFTs, and more..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-default-200 bg-background text-foreground placeholder-default-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedIndex(-1);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-default-100 dark:hover:bg-default-800 transition-colors"
                  >
                    <X className="w-4 h-4 text-default-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg border border-default-200 p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-default-500 hover:text-default-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-default-500 hover:text-default-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Balance Toggle */}
              <button
                onClick={() => setShowBalance(!showBalance)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-default-200 text-sm font-medium transition-colors ${
                  showBalance 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-default-700 hover:bg-default-100 dark:text-default-300 dark:hover:bg-default-800'
                }`}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {showBalance ? 'Hide' : 'Show'} Values
                </span>
              </button>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-default-200 text-sm font-medium transition-colors ${
                  showFilters 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-default-700 hover:bg-default-100 dark:text-default-300 dark:hover:bg-default-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {[filters.verified, filters.minValue, filters.maxValue].filter(Boolean).length > 0 && (
                  <span className="w-2 h-2 bg-danger rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        {(query || filteredResults.length > 0) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {query ? `Search Results for "${query}"` : 'Trending'}
              </h2>
              <p className="text-default-500">
                {isLoading ? (
                  "Searching..."
                ) : (
                  `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} found`
                )}
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            {filteredResults.length > 0 ? (
              <div className={`
                ${viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
                  : "space-y-2"
                }
              `}>
                {filteredResults.map((item, index) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    isSelected={index === selectedIndex}
                    onSelect={handleItemSelect}
                    showBalance={showBalance}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                query={query}
                onSuggestionClick={handleSuggestionClick}
                isLoading={isLoading}
              />
            )}
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <EmptyState
            query={query}
            onSuggestionClick={handleSuggestionClick}
            isLoading={isLoading}
          />
        )}

        {/* Recent Searches for Empty State */}
        {!query && !isLoading && recentSearches.length > 0 && (
          <div className="mt-8 pt-6 border-t border-default-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-default-500" />
                Recent Searches
              </h3>
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-sm text-danger hover:text-danger-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 8).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-200 dark:hover:bg-default-700 transition-colors"
                >
                  <Clock className="w-3 h-3 text-default-400" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats for Empty State */}
        {!query && !isLoading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Tokens</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">12,847</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Active Wallets</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">2.4M</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">DeFi Protocols</p>
                  <p className="text-xl font-bold text-purple-900 dark:text-purple-100">3,429</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Image className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">NFT Collections</p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">156K</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-background border border-default-200 rounded-lg p-3 shadow-lg">
          <div className="text-xs text-default-500 space-y-1">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-default-100 dark:bg-default-800 rounded">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-default-100 dark:bg-default-800 rounded">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-default-100 dark:bg-default-800 rounded">Esc</kbd>
              <span>Clear</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile Search */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 lg:hidden">
        <button
          onClick={() => inputRef.current?.focus()}
          className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="text-sm font-medium">Quick Search</span>
        </button>
      </div>
    </div>
  );
}