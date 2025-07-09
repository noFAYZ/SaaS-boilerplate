// components/search/EnhancedSearch.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Kbd } from "@heroui/kbd";
import { Card, CardBody } from "@heroui/card";
import {
  Search,
  Clock,
  TrendingUp,
  TrendingDown,
  Wallet,
  Coins,
  ArrowUpRight,
  Globe,
  X,
  Star,
  Activity,
  ChevronRight,
  Shield,
  DollarSign,
  BarChart3,
  Hash,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  Zap,
  Trash2,
  Filter,
  Sparkles,
  Command,
  Target,
  Award
} from "lucide-react";

import { useSearch } from '@/hooks/useSearch';
import { SearchResult, SearchCategory, SearchFilters } from '@/lib/search/types';
import { SearchResultItem } from './SearchResultItem';
import { SearchFiltersPanel } from './SearchFiltersPanel';
import { EmptyState } from './EmptyState';
import GooeyLoader from "../shared/loader";
import { LogoLoader } from "../icons";

interface EnhancedSearchProps {
  className?: string;
  placeholder?: string;
  onItemSelect?: (item: SearchResult) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showShortcut?: boolean;
  enableFilters?: boolean;
  maxResults?: number;
  categories?: SearchCategory[];
  autoFocus?: boolean;
  showMetrics?: boolean;
}

// Modern Search Input with enhanced UX
const SearchInput = memo<{
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder: string;
  isOpen: boolean;
  isLoading: boolean;
  onClear: () => void;
  onFocus: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  showShortcut: boolean;
  hasError: boolean;
  autoFocus: boolean;
}>(({ 
  value, 
  onChange, 
  onKeyDown, 
  placeholder, 
  isOpen, 
  isLoading, 
  onClear, 
  onFocus, 
  inputRef, 
  showShortcut, 
  hasError,
  autoFocus 
}) => {
  return (
    <div className="relative group">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        size="lg"
        variant="flat"
        autoFocus={autoFocus}
        classNames={{
          base: "w-full",
          inputWrapper: `
            
            ${hasError 
              ? 'bg-danger-50 dark:bg-danger-950/20' 
              : isOpen 
                ? 'bg-content3  shadow-lg' 
                : '  hover:shadow-md'
            }
          `,
          input: "text-sm font-medium placeholder:text-default-400",
          innerWrapper: "gap-2"
        }}
        startContent={
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="relative w-8 h-8">
                <LogoLoader   />
              </div>
            ) : (
              <div className={`p-1.5 rounded-xl transition-colors ${
                hasError 
                  ? 'bg-danger-100 text-danger-600' 
                  : isOpen 
                    ? 'bg-gradient-to-br from-primary-500/70 to-pink-500/70 text-white' 
                    : 'bg-default-200 text-default-500 group-hover:bg-gradient-to-br from-primary-500/70 to-pink-500/70 group-hover:text-white'
              }`}>
                <Search size={18} />
              </div>
            )}
          
          </div>
        }
        endContent={
          <div className="flex items-center gap-2">
            {value && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="min-w-7 w-7 h-7 rounded-lg hover:bg-danger-100 hover:text-danger-600"
                onPress={onClear}
              >
                <X size={14} />
              </Button>
            )}
            {showShortcut && !isOpen && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-default-100 rounded-lg border border-default-200">
                <Command size={10} />
                <span className="text-xs font-medium">K</span>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
});

const EnhancedSearch: React.FC<EnhancedSearchProps> = memo(({
  className = "",
  placeholder = "Search wallets, tokens, NFTs, DeFi protocols...",
  onItemSelect,
  isOpen: controlledOpen,
  onOpenChange,
  showShortcut = true,
  enableFilters = true,
  maxResults = 12,
  categories = ['tokens', 'wallets', 'nfts', 'defi'],
  autoFocus = false,
  showMetrics = false
}) => {
  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [activeCategory, setActiveCategory] = useState<SearchCategory | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Enhanced search hook
  const {
    query,
    setQuery,
    results,
    isLoading,
    error,
    recentSearches,
    clearHistory,
    navigateToResult,
    getTrending,
    filters,
    setFilters,
    metrics,
    retry
  } = useSearch({
    maxResults,
    filters: { categories },
    enableCache: true,
    retryAttempts: 2
  });

  // Determine if component is controlled
  const finalIsOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Filter results by active category
  const filteredResults = React.useMemo(() => {
    if (!activeCategory) return results;
    return results.filter(result => result.category === activeCategory);
  }, [results, activeCategory]);

  // Category counts with enhanced data
  const categoryCounts = React.useMemo(() => {
    const counts: Record<SearchCategory, number> = {
      tokens: 0,
      wallets: 0,
      nfts: 0,
      defi: 0
    };
    
    results.forEach(result => {
      if (counts[result.category] !== undefined) {
        counts[result.category]++;
      }
    });
    
    return counts;
  }, [results]);

  // Enhanced category configurations
  const getCategoryConfig = (category: SearchCategory) => {
    const configs = {
      tokens: { 
        icon: Coins, 
        color: 'primary' as const,
        emoji: '🪙',
        description: 'Cryptocurrencies and tokens'
      },
      wallets: { 
        icon: Wallet, 
        color: 'secondary' as const,
        emoji: '👛',
        description: 'Wallet addresses and ENS'
      },
      nfts: { 
        icon: Award, 
        color: 'success' as const,
        emoji: '🖼️',
        description: 'Non-fungible tokens'
      },
      defi: { 
        icon: Zap, 
        color: 'warning' as const,
        emoji: '🏦',
        description: 'DeFi protocols and pools'
      }
    };
    return configs[category];
  };

  // Handle open/close with enhanced UX
  const handleOpen = useCallback(() => {
    const newOpen = true;
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
    
    // Auto-focus input with slight delay for better UX
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    
    // Load trending if no query
    if (!query.trim()) {
      getTrending();
    }
  }, [onOpenChange, query, getTrending]);

  const handleClose = useCallback(() => {
    const newOpen = false;
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
    setQuery("");
    setSelectedIndex(-1);
    setActiveCategory(null);
    setShowFilters(false);
  }, [onOpenChange, setQuery]);

  // Enhanced item selection with analytics
  const handleItemSelect = useCallback((item: SearchResult) => {
    onItemSelect?.(item);
    navigateToResult(item);
    handleClose();
    
    // Reset selection
    setSelectedIndex(-1);
  }, [onItemSelect, navigateToResult, handleClose]);

  // Enhanced keyboard navigation with accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!finalIsOpen) return;

    const items = filteredResults;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < items.length - 1 ? prev + 1 : prev;
          // Scroll selected item into view
          setTimeout(() => {
            const element = resultsRef.current?.children[newIndex] as HTMLElement;
            element?.scrollIntoView({ block: 'nearest' });
          }, 0);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : -1;
          // Scroll selected item into view
          setTimeout(() => {
            if (newIndex >= 0) {
              const element = resultsRef.current?.children[newIndex] as HTMLElement;
              element?.scrollIntoView({ block: 'nearest' });
            }
          }, 0);
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleItemSelect(items[selectedIndex]);
        }
        break;
      case 'Tab':
        if (!e.shiftKey && items.length > 0) {
          e.preventDefault();
          // Cycle through categories
          setActiveCategory(prev => {
            const currentIndex = prev ? categories.indexOf(prev) : -1;
            const nextIndex = currentIndex < categories.length - 1 ? currentIndex + 1 : 0;
            return categories[nextIndex];
          });
        }
        break;
    }
  }, [finalIsOpen, filteredResults, selectedIndex, handleClose, handleItemSelect, categories]);

  // Enhanced global shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpen();
      }
      
      // Cmd/Ctrl + / (alternative shortcut)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        handleOpen();
      }
      
      // ESC to close when open
      if (e.key === 'Escape' && finalIsOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleOpen, handleClose, finalIsOpen]);

  // Enhanced click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        finalIsOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [finalIsOpen, handleClose]);

  // Auto-focus on mount if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        isOpen={finalIsOpen}
        isLoading={isLoading}
        onClear={() => setQuery("")}
        onFocus={handleOpen}
        inputRef={inputRef}
        showShortcut={showShortcut}
        hasError={!!error}
        autoFocus={autoFocus}
      />

      {/* Enhanced Dropdown */}
      {finalIsOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
          <Card className="border border-divider shadow-xl bg-content1 overflow-hidden max-h-[75vh]">
            
            {/* Enhanced Header with Status */}
            <div className="p-4 border-b border-divider bg-content2/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
    
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                    onPress={() => setShowBalance(!showBalance)}
                    className="h-7"
                  >
                    {showBalance ? 'Hide' : 'Show'} Values
                  </Button>
                  
                  {enableFilters && (
                    <Button
                      size="sm"
                      variant={showFilters ? "solid" : "flat"}
                      color={showFilters ? "primary" : "default"}
                      startContent={<Filter size={14} />}
                      onPress={() => setShowFilters(!showFilters)}
                      className="h-7"
                    >
                      Filters
                    </Button>
                  )}

                  {error && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={<TrendingUp size={14} />}
                      onPress={retry}
                      className="h-7"
                    >
                      Retry
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {recentSearches.length > 0 && (
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<Trash2 size={12} />}
                      onPress={clearHistory}
                      className="h-6 px-2 text-xs text-danger"
                    >
                      Clear
                    </Button>
                  )}
                  <Chip
                    size="sm"
                    variant="flat"
                    content={`${filteredResults.length}`}
                  >
                    <span className="text-xs">Results</span>
                  </Chip>
                </div>
              </div>

              {/* Enhanced Category Navigation */}
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  size="sm"
                  variant={"flat"}
                  color={!activeCategory ? "warning" : "default"}
     
                  className={`cursor-pointer rounded-lg  h-6 ${!activeCategory ? ' ' : ''}`}
                  startContent={<Globe size={12} />}
                  onClick={() => setActiveCategory(null)}
                  endContent={results.length}
                >
                  All 
                </Chip>
                {categories.map(category => {
                  const config = getCategoryConfig(category);
                  const IconComponent = config.icon;
                  const isActive = activeCategory === category;
                  
                  return (
                    <Chip
                      key={category}
                      size="sm"
                      variant={"flat"}
                      color={isActive ? "warning" : "default"}
                      className={`cursor-pointer capitalize rounded-lg h-6 ${isActive ? '' : ''} `}
                      startContent={<IconComponent size={12} />}
                      onClick={() => setActiveCategory(category)}
                      endContent={categoryCounts[category]}
                    >
                      {category} 
                    </Chip>
                  );
                })}
              </div>

              {/* Performance Metrics (if enabled) */}
              {showMetrics && metrics.totalSearches > 0 && (
                <div className="mt-3 p-2 bg-default-100 dark:bg-default-900/30 rounded-lg">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-primary">{metrics.totalSearches}</div>
                      <div className="text-default-500">Searches</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-success">{Math.round(metrics.avgResponseTime)}ms</div>
                      <div className="text-default-500">Avg Time</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-warning">{Math.round(metrics.cacheHitRate * 100)}%</div>
                      <div className="text-default-500">Cache Hit</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${metrics.isHealthy ? 'text-success' : 'text-danger'}`}>
                        {metrics.isHealthy ? '✓' : '⚠'}
                      </div>
                      <div className="text-default-500">Health</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Filters Panel */}
            {showFilters && enableFilters && (
              <div className="animate-in slide-in-from-top-1 duration-200">
                <SearchFiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  categories={categories}
                />
              </div>
            )}

            {/* Enhanced Results Section */}
            <CardBody className="p-0 max-h-96 overflow-y-auto">
              {error ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-danger-100 dark:bg-danger-900/30 rounded-xl mb-3">
                    <AlertTriangle className="w-6 h-6 text-danger-500" />
                  </div>
                  <h3 className="font-semibold text-danger mb-1">Search Error</h3>
                  <p className="text-danger-600 text-sm mb-3">{error}</p>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={retry}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredResults.length > 0 ? (
                <div ref={resultsRef} className="divide-y divide-default-100">
                  {filteredResults.map((item, index) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      isSelected={index === selectedIndex}
                      showBalance={showBalance}
                      onSelect={() => handleItemSelect(item)}
                    />
                  ))}
                </div>
              ) : isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl mb-3">
                    <Spinner size="md" color="primary" />
                  </div>
                  <h3 className="font-semibold text-primary mb-1">Searching...</h3>
                  <p className="text-default-500 text-sm">Finding blockchain data</p>
                </div>
              ) : query ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-default-100 rounded-xl mb-3">
                    <Search className="w-6 h-6 text-default-400" />
                  </div>
                  <h3 className="font-semibold text-default-600 mb-1">No results found</h3>
                  <p className="text-default-400 text-sm mb-3">
                    Try searching for tokens, wallet addresses, or ENS names
                  </p>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    startContent={<Sparkles size={14} />}
                    onPress={getTrending}
                  >
                    Show Trending
                  </Button>
                </div>
              ) : (
                <EmptyState
                          recentSearches={recentSearches}
                          onRecentSearch={setQuery}
                          onGetTrending={getTrending} showBalance={true}                />
              )}
            </CardBody>

            {/* Enhanced Footer */}
            <div className="px-4 py-2.5 border-t border-default-200 bg-content2/20">
              <div className="flex items-center justify-between text-xs text-default-500">
                <div className="flex items-center gap-3">
                  <kbd className="px-1.5 py-0.5 bg-default-200 rounded text-xs">↑↓</kbd>
                  <span>navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-default-200 rounded text-xs">↵</kbd>
                  <span>select</span>
                  <kbd className="px-1.5 py-0.5 bg-default-200 rounded text-xs">tab</kbd>
                  <span>filter</span>
                  <kbd className="px-1.5 py-0.5 bg-default-200 rounded text-xs">esc</kbd>
                  <span>close</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-success-500 rounded-full animate-pulse" />
                  <span>Powered by Zerion</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
});

EnhancedSearch.displayName = 'EnhancedSearch';
SearchInput.displayName = 'SearchInput';

export default EnhancedSearch;