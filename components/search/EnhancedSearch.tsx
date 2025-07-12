// components/search/EnhancedSearch.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from "react";
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

// Modern Search Input with enhanced UX (KEPT ORIGINAL UI)
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
        size="md"
        variant="flat"
        autoFocus={autoFocus}
        classNames={{
          base: "w-full",
          inputWrapper: ` bg-default-200
            ${hasError 
              ? 'bg-danger-50 dark:bg-danger-950/20' 
              : isOpen 
                ? 'bg-default-200 shadow-lg' 
                : 'hover:shadow-md'
            }
          `,
          input: "text-sm font-medium placeholder:text-default-400 bg-default-200",
          innerWrapper: "gap-2 "
        }}
        startContent={
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="relative w-8 h-8">
                <LogoLoader />
              </div>
            ) : (
              <div className={`p-1.5 rounded-xl  ${
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

  // Enhanced search hook - FIXED: Set immediate to false to prevent initial load
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
    retry
  } = useSearch({
    maxResults,
    filters: { categories },
    enableCache: true,
    retryAttempts: 2,
    immediate: false // FIXED: Don't load tokens on mount
  });

  // Determine if component is controlled
  const finalIsOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // FIXED: Safe category handling with proper fallbacks
  const filteredResults = useMemo(() => {
    // Safely handle results that might not have category property
    const safeResults = results.map(result => ({
      ...result,
      category: (result.category as SearchCategory) || 'tokens' // Default fallback
    }));

    if (!activeCategory) return safeResults;
    return safeResults.filter(result => result.category === activeCategory);
  }, [results, activeCategory]);

  // FIXED: Safe category counting
  const categories_with_counts = useMemo(() => {
    const cats = Array.from(new Set(results.map(item => (item.category as SearchCategory) || 'tokens')));
    return cats.map(cat => ({
      name: cat,
      count: results.filter(item => ((item.category as SearchCategory) || 'tokens') === cat).length,
      icon: cat === 'wallets' ? '👛' : 
            cat === 'tokens' ? '🪙' : 
            cat === 'defi' ? '🏦' : 
            cat === 'nfts' ? '🎨' : '🔍'
    }));
  }, [results]);

  // Event handlers
  const handleOpen = useCallback(() => {
    const newOpen = true;
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
    setSelectedIndex(-1);
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    const newOpen = false;
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
    setSelectedIndex(-1);
    setActiveCategory(null);
  }, [onOpenChange]);

  const handleItemSelect = useCallback((item: SearchResult) => {
    onItemSelect?.(item);
    navigateToResult(item);
    handleClose();
  }, [onItemSelect, navigateToResult, handleClose]);

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
        setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleItemSelect(items[selectedIndex]);
        }
        break;
      case 'Tab':
        if (enableFilters) {
          e.preventDefault();
          setShowFilters(!showFilters);
        }
        break;
    }
  }, [finalIsOpen, filteredResults, selectedIndex, handleClose, handleItemSelect, enableFilters, showFilters]);

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

      {/* Enhanced Dropdown - KEEPING ORIGINAL UI STRUCTURE */}
      {finalIsOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
          <Card className="border border-divider shadow-xl bg-content1 overflow-hidden max-h-[75vh]">
            
            {/* Enhanced Header with Status - KEEPING ORIGINAL LAYOUT */}
            <div className="p-3 border-b border-divider bg-content2">
              <div className="flex items-center justify-between ">
                <div className="flex items-center ">
                     {/* Enhanced Category Navigation - KEEPING ORIGINAL STYLE */}
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  size="sm"
                  variant={"flat"}
                  color={!activeCategory ? "warning" : "default"}
                  className={`cursor-pointer rounded-md text-[11px] font-semibold h-5 ${!activeCategory ? 'bg-warning-100 text-warning-700' : ''}`}
                  onClick={() => setActiveCategory(null)}
                >
                  All ({filteredResults.length})
                </Chip>
                {categories_with_counts.map((category) => (
                  <Chip
                    key={category.name}
                    size="sm"
                    variant={activeCategory === category.name ? "solid" : "flat"}
                    color={activeCategory === category.name ? "primary" : "default"}
                    className="cursor-pointer capitalize rounded-md text-[11px] font-semibold h-5"
                    startContent={<span className="text-xs">{category.icon}</span>}
                    onClick={() => setActiveCategory(category.name)}
                  >
                    {category.name} ({category.count})
                  </Chip>
                ))}
              </div>


              
                </div>

                <div className="flex items-center gap-2">

                <Button
                    size="sm"
                    variant="flat"
                    startContent={showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                    onPress={() => setShowBalance(!showBalance)}
                    className="h-5 px-0.5 rounded-md text-[11px] font-semibold"
                    isIconOnly
                  >
                   
                  </Button>
                  
                  {enableFilters && (
                    <Button
                      size="sm"
                      variant={showFilters ? "solid" : "flat"}
                      color={showFilters ? "primary" : "default"}
                      startContent={<Filter size={12} />}
                      onPress={() => setShowFilters(!showFilters)}
                      className="h-5 px-0.5 rounded-md text-[11px] font-medium"
                    >
                      Filters
                    </Button>
                  )}

                  {error && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="warning"
                      startContent={<TrendingUp size={14} />}
                      onPress={retry}
                      className="h-5 px-0.5 rounded-md text-[11px] font-medium"
                    >
                      Retry
                    </Button>
                  )}

                  {recentSearches.length > 0 && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      startContent={<Trash2 size={12} />}
                      onPress={clearHistory}
                      className="h-5 px-0 rounded-md text-[11px] text-danger font-medium"
                    >
                      Clear
                    </Button>
                  )}
                 
                </div>
              </div>

           
            </div>

            {/* Filters Panel */}
            {showFilters && enableFilters && (
              <SearchFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                categories={categories}
              />
            )}

            {/* Results */}
            <CardBody className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl mb-3">
                    <Spinner size="md" color="primary" />
                  </div>
                  <h3 className="font-semibold text-primary mb-1">Searching...</h3>
                  <p className="text-default-500 text-sm">Finding blockchain data</p>
                </div>
              ) : query ? (
                filteredResults.length > 0 ? (
                  <div ref={resultsRef} className="max-h-96 overflow-y-auto ">
                    {filteredResults.map((result, index) => (
                      <SearchResultItem
                        key={`${result.type}-${result.id}-${index}`}
                        result={result}
                        isSelected={selectedIndex === index}
                        onSelect={() => handleItemSelect(result)}
                        showBalance={showBalance}
                        variant="detailed"
                        density="compact"
                        showActions={false}
                       
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-default-200 rounded-2xl mb-3">
                      <Search className="w-6 h-6 text-default-400" />
                    </div>
                    <h3 className="font-semibold text-default-600 mb-1">No results found</h3>
                    <p className="text-default-400 text-sm mb-3 text-pretty">
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
                )
              ) : (
                <EmptyState
                  recentSearches={recentSearches}
                  onRecentSearch={setQuery}
                  onGetTrending={getTrending} 
                  showBalance={showBalance}
                />
              )}
            </CardBody>

            {/* Enhanced Footer - KEEPING ORIGINAL STYLE */}
            <div className="px-2 py-1 border-t border-default-200 bg-content2/20">
              <div className="flex items-center justify-between text-xs text-default-500">
                <div className="flex items-center gap-1 ">
                  <kbd className="px-1.5 py-0.5 bg-default-200 rounded text-xs">↑↓</kbd>
                  <span>navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-default-200 rounded text-xs">↵</kbd>
                  <span>select</span>
                  <kbd className="px-1.5 py-0.5 bg-default-200 rounded text-xs">tab</kbd>
                  <span>filter</span>
                  <kbd className="px-1.5 py-0.5 bg-default-200 rounded text-xs">esc</kbd>
                  <span>close</span>
                </div>
                <Chip
                    size="sm"
                    variant="flat"
                    content={`$`}
                  >
                    <span className="text-[11px]">Results ({filteredResults.length})</span>
                  </Chip>
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