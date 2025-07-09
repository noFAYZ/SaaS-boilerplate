"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Kbd } from "@heroui/kbd";
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
  PieChart,
  Crown
} from "lucide-react";

// Import the current Zerion implementation from the SaaS boilerplate
import { zerionSDK, zerionUtils, zerionCache } from '@/lib/zerion';
import { BasilWalletOutline, IconParkOutlineClear, LetsIconsPieChartFill, MaterialIconThemeVerified, MdiDollar, MynauiArrowUpDownSolid, SolarTagPriceBoldDuotone, SolarWalletBoldDuotone, SolarWalletOutline } from "../icons/icons";
import GooeyLoader from "../shared/loader";
import { LogoLoader } from "../icons";

// Types
interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ReactNode;
  type: 'wallet' | 'token' | 'defi' | 'transaction';
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
  };
}

interface AdvancedSearchProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onItemSelect?: (item: SearchResult) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showShortcut?: boolean;
}

// Enhanced cache
class SearchCache {
  private cache = new Map<string, { results: SearchResult[]; timestamp: number }>();
  private readonly TTL = 300000; // 5 minutes
  private readonly MAX_SIZE = 50;

  set(query: string, results: SearchResult[]) {
    this.cache.set(query, { results, timestamp: Date.now() });
    this.cleanup();
  }

  get(query: string): SearchResult[] | null {
    const cached = this.cache.get(query);
    if (!cached || Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(query);
      return null;
    }
    return cached.results;
  }

  private cleanup() {
    if (this.cache.size > this.MAX_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 20).forEach(([key]) => this.cache.delete(key));
    }
  }

  clear() {
    this.cache.clear();
  }
}

// Optimized debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Validation helpers
const isValidAddress = (address: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(address);
const isValidENS = (name: string): boolean => /^[a-zA-Z0-9\-_]+\.eth$/.test(name);
const isValidTxHash = (hash: string): boolean => /^0x[a-fA-F0-9]{64}$/.test(hash);

const SEARCH_CACHE = new SearchCache();

// Utility functions
const formatNumber = (num: number): string => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPrice = (price: number): string => {
  if (price < 0.001) return price.toFixed(8);
  if (price < 1) return price.toFixed(6);
  if (price < 100) return price.toFixed(4);
  return price.toLocaleString();
};

// Real Zerion API integration using the current SaaS boilerplate implementation
const zerionAPI = {
  async searchTokens(query: string, limit: number = 8): Promise<SearchResult[]> {
    if (!zerionSDK) return [];
    
    try {
      const cacheKey = `tokens_${query}_${limit}`;
      const cached = zerionCache.get(cacheKey);
      if (cached) return cached;

      const response = await zerionSDK.fungibles.searchFungibles(query, { limit });

      console.log('Token search results:', response);
      
      const results = response ?.map((token: any) => {
        const attrs = token.attributes;
        const marketData = attrs.market_data || {};
        const implementations = attrs.implementations || {};
        
        // Get the first implementation for logo
        const firstImpl = Object.values(implementations)[0] as any;
        const logoUrl = attrs?.icon?.url;
        
        return {
          id: `token-${token.id}`,
          title: `${attrs.name} (${attrs.symbol})`,
          subtitle: 'Token',
          category: 'Tokens',
          icon: logoUrl ? 
            <Avatar src={logoUrl} size="sm" className="w-8 h-8" /> : 
            <Coins size={16} />,
          type: 'token' as const,
          url: `/tokens/${attrs.symbol}`,
          badge: marketData.market_cap > 1e9 ? 'Top 100' : null,
          metadata: {
            value: marketData.price ? `$${formatPrice(marketData.price)}` : undefined,
            change: marketData.percent_change_24h,
            symbol: attrs.symbol,
            logoUrl,
            marketCap: marketData.market_cap ? formatNumber(marketData.market_cap) : undefined,
            volume24h: marketData.volume_24h ? formatNumber(marketData.volume_24h) : undefined,
            verified: true,
            risk: marketData.market_cap > 1e9 ? 'low' : marketData.market_cap > 1e6 ? 'medium' : 'high',
            tags: ['crypto', 'token', attrs.symbol.toLowerCase()],
            network: 'Multi-chain'
          }
        };
      }) || [];

      zerionCache.set(cacheKey, results, 15 * 60 * 1000); // 15 minutes cache
      return results;
    } catch (error) {
      console.error('Token search failed:', error);
      return [];
    }
  },

  async getWalletData(address: string): Promise<SearchResult | null> {
    if (!zerionSDK) return null;
    
    try {
      const cacheKey = `wallet_${address}`;
      const cached = zerionCache.get(cacheKey);
      if (cached) return cached;

      // Use the existing zerionUtils from the SaaS boilerplate
      const summary = await zerionUtils.getWalletSummary(address);

   
      
      const result = {
        id: `wallet-${address}`,
        title: address ,
        subtitle: isValidENS(address) ? 'ENS Domain' : 'EVM Wallet',
        category: 'Wallets',
        icon: <div className="flex justify-center items-center rounded-full bg-primary-500/15 w-8 h-8"><SolarWalletBoldDuotone className="w-5 h-5 text-default-700" /></div>,
        type: 'wallet' as const,
        url: `/wallets/${address}`,
        badge: summary.totalValue?.positions > 100000 ? 'Whale' : summary.totalValue?.positions > 10000 ? 'Active' : undefined,
        metadata: {
          address,
          network: summary.chainsCount > 1 ? `${summary.chainsCount} Chains` : 'Ethereum',
          value: formatNumber(summary.totalValue?.positions),
          change: summary.dayChangePercent,
          verified: summary.totalValue?.positions > 1000,
          tags: ['wallet', 'ethereum', 'defi']
        }
      };

      zerionCache.set(cacheKey, result, 5 * 60 * 1000); // 5 minutes cache
      return result;
    } catch (error) {
      console.error('Wallet data fetch failed:', error);
      
      // Return fallback result for invalid addresses
      return {
        id: `wallet-${address}`,
        title: isValidENS(address) ? address : `${address.slice(0, 6)}...${address.slice(-4)}`,
        subtitle: isValidENS(address) ? 'ENS Domain' : 'Ethereum Address',
        category: 'Wallets',
        icon: <Wallet size={16} />,
        type: 'wallet' as const,
        url: `/wallets/${address}`,
        metadata: {
          address,
          network: 'Ethereum',
          ens: isValidENS(address) ? address : undefined,
          tags: ['wallet', 'ethereum']
        }
      };
    }
  },

  async getTopTokens(limit: number = 8): Promise<SearchResult[]> {
    if (!zerionSDK) return [];
    
    try {
      const cacheKey = `top_tokens_${limit}`;
      const cached = zerionCache.get(cacheKey);
      if (cached) return cached;

      // Use the existing zerionUtils from the SaaS boilerplate
      const tokens = await zerionUtils.getTopTokens(limit);

      
      const results = tokens?.map((token: any, index: number) => ({
        id: `token-top-${index}`,
        title: `${token?.attributes?.name} (${token?.attributes?.symbol})`,
        subtitle: 'Top Token',
        category: 'Top Tokens',
        icon: token?.attributes?.icon?.url ? 
          <Avatar src={token?.attributes?.icon?.url} size="sm" className="w-6 h-6" /> : 
          <Coins size={16} />,
        type: 'token' as const,
        url: `/tokens/${token?.attributes?.symbol}`,
        badge: 'Top 100',
        metadata: {
          value: token?.attributes?.market_data?.price ? `$${formatPrice(token?.attributes?.market_data?.price)}` : undefined,
          change: token?.attributes?.market_data?.changes?.percent_1d,
          symbol: token?.attributes?.symbol,
          logoUrl: token?.attributes?.icon?.url,
          marketCap: token?.attributes?.market_data?.market_cap ? formatNumber(token?.attributes?.market_data?.market_cap) : undefined,
          verified: token?.attributes?.flags?.verified ? true : false,
          risk: 'low' as const,
          tags: ['top', 'crypto', 'token']
        }
      })) || [];

      zerionCache.set(cacheKey, results, 30 * 60 * 1000); // 30 minutes cache
      return results;
    } catch (error) {
      console.error('Top tokens fetch failed:', error);
      return [];
    }
  },

  async searchDeFi(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!zerionSDK) return [];
    
    try {
      const cacheKey = `defi_${query}_${limit}`;
      const cached = zerionCache.get(cacheKey);
      if (cached) return cached;

      // Use Zerion SDK to search for DeFi protocols
      const response = await zerionSDK.fungibles.searchFungibles(query, { 
        limit,
        search_query: `${query} protocol defi` 
      });
      
      const results = response.data?.filter((item: any) => {
        const attrs = item.attributes;
        // Filter for DeFi-related tokens/protocols
        return attrs.name?.toLowerCase().includes('protocol') ||
               attrs.name?.toLowerCase().includes('dao') ||
               attrs.description?.toLowerCase().includes('defi') ||
               attrs.description?.toLowerCase().includes('protocol');
      }).map((protocol: any) => {
        const attrs = protocol.attributes;
        const marketData = attrs.market_data || {};
        
        return {
          id: `defi-${protocol.id}`,
          title: attrs.name,
          subtitle: 'DeFi Protocol',
          category: 'DeFi',
          icon: <Activity size={16} />,
          type: 'defi' as const,
          url: `/defi/${attrs.symbol?.toLowerCase()}`,
          badge: 'Protocol',
          metadata: {
            value: marketData.price ? `$${formatPrice(marketData.price)}` : undefined,
            change: marketData.percent_change_24h,
            verified: true,
            risk: 'medium' as const,
            tags: ['defi', 'protocol'],
            network: 'Multi-chain'
          }
        };
      }) || [];

      zerionCache.set(cacheKey, results, 20 * 60 * 1000); // 20 minutes cache
      return results;
    } catch (error) {
      console.error('DeFi search failed:', error);
      return [];
    }
  },

  // Comprehensive search that combines all types
  async comprehensiveSearch(query: string): Promise<SearchResult[]> {
    const searchPromises: Promise<SearchResult | SearchResult[] | null>[] = [];

    // Wallet search for addresses and ENS
    if (isValidAddress(query) || isValidENS(query)) {
      searchPromises.push(this.getWalletData(query));
    }

    // Token search for general queries
    if (query.length >= 2) {
      searchPromises.push(this.searchTokens(query, 6));
    }

    // DeFi search for protocol-related queries
    if (query.length >= 3) {
      searchPromises.push(this.searchDeFi(query, 3));
    }

    try {
      const results = await Promise.allSettled(searchPromises);
      const finalResults: SearchResult[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          if (Array.isArray(result.value)) {
            finalResults.push(...result.value);
          } else {
            finalResults.push(result.value);
          }
        }
      });

      // Add transaction result for valid hashes
      if (isValidTxHash(query)) {
        finalResults.push({
          id: `tx-${query}`,
          title: `${query.slice(0, 10)}...${query.slice(-8)}`,
          subtitle: 'Transaction Hash',
          category: 'Transactions',
          icon: <ArrowUpRight size={16} />,
          type: 'transaction',
          url: `/tx/${query}`,
          metadata: {
            address: query,
            network: 'Ethereum',
            tags: ['transaction', 'hash']
          }
        });
      }

      return finalResults;
    } catch (error) {
      console.error('Comprehensive search failed:', error);
      return [];
    }
  }
};

// Search Input Component
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
}>(({ value, onChange, onKeyDown, placeholder, isOpen, isLoading, onClear, onFocus, inputRef, showShortcut }) => {
  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        size="md"
        variant="flat"
        classNames={{
          base: "w-full",
          inputWrapper: `
            
            ${isOpen 
              ? 'border-default bg-content2 shadow-lg' 
              : 'border-divider bg-content2 hover:border-default-300'
            }
          `,
          input: "text-base font-medium placeholder:text-default-400",
          innerWrapper: "gap-3"
        }}
        startContent={
          <div className="flex items-center">
            {isLoading ? (
              <Spinner size="sm" color="primary" />
            ) : (
              <Search 
                className={`transition-colors ${
                  isOpen ? 'text-primary' : 'text-default-400'
                }`} 
                size={18} 
              />
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
                className="min-w-6 w-6 h-6"
                onPress={onClear}
              >
                <X size={14} />
              </Button>
            )}
            {showShortcut && !isOpen && (
              <div className="hidden md:flex items-center gap-1">
                <Kbd size="sm">⌘</Kbd>
                <Kbd size="sm">K</Kbd>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
});

// Result Item Component
const SearchResultItem = memo<{
  item: SearchResult;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  showBalance: boolean;
}>(({ item, isSelected, onClick, onMouseEnter, showBalance }) => {
  const formatValue = useCallback((value: string | undefined) => {
    if (!value || !showBalance) return '••••••';
    return value;
  }, [showBalance]);

  const handleCopyAddress = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.metadata?.address) {
      navigator.clipboard.writeText(item.metadata.address);
    }
  }, [item.metadata?.address]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      default: return 'default';
    }
  };

  
  return (
    <div
      className={`
        relative p-2 cursor-pointer  border-b border-divider last:border-b-0 group
        ${isSelected 
          ? 'bg-default-100 dark:bg-default-100' 
          : 'hover:bg-content2'
        }
      `}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex items-center gap-2">
        {/* Icon */}
        <div className={`
          relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
       
        `}>
          {item.icon}
         
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs truncate text-foreground">{item.title}</span>
            {item.metadata?.value && (
              <div className="flex items-center  gap-1">
                
                <Chip size="sm" className=" text-[11px] h-5 rounded-lg font-semibold text-foreground">
                  {formatValue(item.metadata.value)}
                </Chip>
              </div>
            )}
            {item.badge && (
              <Chip size="sm"  variant="flat" className="text-[10px] h-5 rounded-lg bg-gradient-to-br from-pink-500/70 to-orange-500/70 text-white"
              startContent={<Crown size={12}/>}>
                {item.badge}
              </Chip>
            )}
          {/*   {item.metadata?.risk && (
              <Chip 
                size="sm" 
                color={getRiskColor(item.metadata.risk)} 
                variant="faded"
              />
            )} */}
     
          </div>
          
       
          
          {/* Value and change */}
          <div className="flex items-center gap-3 text-xs">
                   {/* Subtitle and metadata */}
                   <div className="flex items-center justify-end gap-2 text-xs">
            <Chip size="sm" variant="solid" className="text-default-600 font-medium text-[10px] rounded-lg h-5">{item.subtitle}</Chip>
            {item.metadata?.network && (
              <span className="text-[10px] rounded-lg">
                {item.metadata.network}
              </span>
            )}
          </div>
            {item.metadata?.change !== undefined && (
              <div className={`flex items-center gap-1 font-medium ${
                item.metadata.change >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {item.metadata.change >= 0 ? 
                  <TrendingUp size={10} /> : 
                  <TrendingDown size={10} />
                }
                <span>{item.metadata.change >= 0 ? '+' : ''}{item.metadata.change.toFixed(1)}%</span>
              </div>
            )}
            {item.metadata?.marketCap && (
              <div className="flex items-center gap-1">
                <LetsIconsPieChartFill  className="text-default-400 h-3.5 w-3.5" />
                <span className="text-default-600 font-medium">{item.metadata.marketCap}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {item.metadata?.address && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="min-w-5 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onPress={handleCopyAddress}
            >
              <Copy size={10} />
            </Button>
          )}
          <ChevronRight 
            className={`transition-all duration-150 ${
              isSelected 
                ? 'text-primary transform translate-x-0.5' 
                : 'text-default-400'
            }`} 
            size={14} 
          />
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-primary rounded-r-full" />
      )}
    </div>
  );
});

// Main Component
export const AdvancedSearch: React.FC<AdvancedSearchProps> = memo(({
  className = "",
  placeholder = "Search wallets, tokens, DeFi...",
  onSearch,
  onItemSelect,
  isOpen: controlledOpen,
  onOpenChange,
  showShortcut = true
}) => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query, 300);
  const finalIsOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // Load top tokens on mount using real Zerion API
  useEffect(() => {
    const loadTopTokens = async () => {
      try {
        const tokens = await zerionAPI.getTopTokens(8);

    
        setTopTokens(tokens);
      } catch (error) {
        console.error('Failed to load top tokens:', error);
        setTopTokens([]); // Set empty array on error
      }
    };

    loadTopTokens();
  }, []);

  // Enhanced top tokens state
  const [topTokens, setTopTokens] = useState<SearchResult[]>([]);

  // Enhanced quick search examples with real-world addresses
  const quickSearchExamples = useMemo(() => [
    { 
      query: 'vitalik.eth', 
      type: 'ENS Domain', 
      icon: '👑',
      description: 'Ethereum co-founder'
    },
    { 
      query: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 
      type: 'Whale Wallet', 
      icon: '🐋',
      description: 'High-value address'
    },
    { 
      query: 'ethereum', 
      type: 'Token Search', 
      icon: '⟠',
      description: 'Native blockchain token'
    },
    { 
      query: 'USDC', 
      type: 'Stablecoin', 
      icon: '💎',
      description: 'USD-pegged token'
    }
  ], []);

  // Category filtering
  const categories = useMemo(() => {
    const cats = Array.from(new Set(searchResults.map(item => item.category)));
    return cats.map(cat => ({
      name: cat,
      count: searchResults.filter(item => item.category === cat).length,
      icon: cat === 'Wallets' ? '👛' : 
            cat === 'Tokens' ? '🪙' : 
            cat === 'DeFi' ? '🏦' : 
            cat === 'Transactions' ? '📄' : '🔍'
    }));
  }, [searchResults]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const filteredResults = useMemo(() => {
    if (!activeCategory) return searchResults;
    return searchResults.filter(item => item.category === activeCategory);
  }, [searchResults, activeCategory]);

  // Enhanced search function with real Zerion API integration
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const cachedResults = SEARCH_CACHE.get(searchQuery);
    if (cachedResults) {
      setSearchResults(cachedResults);
      setSelectedIndex(-1);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    
    try {
      // Use comprehensive search with real Zerion API
      const results = await zerionAPI.comprehensiveSearch(searchQuery);

      // Enhanced sorting algorithm
      results.sort((a, b) => {
        // Exact matches first
        const aExact = a.title.toLowerCase() === searchQuery.toLowerCase() ? 1 : 0;
        const bExact = b.title.toLowerCase() === searchQuery.toLowerCase() ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;

        // Type priority: wallets > tokens > defi > transactions
        const typeOrder = { wallet: 1, token: 2, defi: 3, transaction: 4 };
        const aOrder = typeOrder[a.type] || 5;
        const bOrder = typeOrder[b.type] || 5;
        if (aOrder !== bOrder) return aOrder - bOrder;

        // Verification status
        if (a.metadata?.verified && !b.metadata?.verified) return -1;
        if (!a.metadata?.verified && b.metadata?.verified) return 1;

        // Risk level (lower risk first)
        const riskOrder = { low: 1, medium: 2, high: 3 };
        const aRisk = riskOrder[a.metadata?.risk || 'medium'];
        const bRisk = riskOrder[b.metadata?.risk || 'medium'];
        if (aRisk !== bRisk) return aRisk - bRisk;

        return 0;
      });

      // Limit results and cache
      const limitedResults = results.slice(0, 12);
      SEARCH_CACHE.set(searchQuery, limitedResults);
      setSearchResults(limitedResults);
      setSelectedIndex(-1);
      
      // Update recent searches
      if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
      
      onSearch?.(searchQuery);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, recentSearches]);

  // Effects
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }
  }, [debouncedQuery, performSearch]);

  const handleOpen = useCallback(() => {
    const newOpen = true;
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    const newOpen = false;
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
    setQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
    setActiveCategory(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [onOpenChange]);

  const handleItemSelect = useCallback((item: SearchResult) => {
    onItemSelect?.(item);
    handleClose();
  }, [onItemSelect, handleClose]);

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
    }
  }, [finalIsOpen, filteredResults, selectedIndex, handleClose, handleItemSelect]);

  // Global shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpen();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleOpen]);

  // Click outside
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
      />

      {/* Dropdown */}
      {finalIsOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="bg-content1 border border-divider rounded-2xl s max-h-[70vh] overflow-hidden">
            
            {/* Enhanced Controls with Category Filtering */}
            <div className="py-2 px-3 border-b border-divider bg-content2/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                    onPress={() => setShowBalance(!showBalance)}
                    className="text-xs h-6"
                  >
                    {showBalance ? 'Hide' : 'Show'} Values
                  </Button>
                  {query && (
                    <span className="text-xs text-default-500">
                      {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
            
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={() => SEARCH_CACHE.clear()}
                    className="text-xs h-6 w-6"
                  >
                    <IconParkOutlineClear className="w-4 h-4"/>
                  </Button>
                </div>
              </div>
              
              {/* Category Filter Pills */}
              {categories.length > 1 && query && (
                <div className="flex items-center gap-1 overflow-x-auto">
                  <Button
                    size="sm"
                    variant={activeCategory === null ? "solid" : "flat"}
                    color={activeCategory === null ? "primary" : "default"}
                    className="text-xs h-6 min-w-fit px-2"
                    onPress={() => setActiveCategory(null)}
                  >
                    All ({searchResults.length})
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      size="sm"
                      variant={activeCategory === category.name ? "solid" : "flat"}
                      color={activeCategory === category.name ? "primary" : "default"}
                      className="text-xs h-6 min-w-fit px-2"
                      onPress={() => setActiveCategory(category.name)}
                      startContent={<span className="text-xs">{category.icon}</span>}
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query ? (
                filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      isSelected={selectedIndex === index}
                      onClick={() => handleItemSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      showBalance={showBalance}
                    />
                  ))
                ) : !isLoading ? (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 mx-auto mb-2 text-default-300" />
                    <p className="text-sm text-default-500 mb-1">No results found</p>
                    <p className="text-xs text-default-400">
                      Try searching for wallets, tokens, or transaction hashes
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col w-full text-center items-center justify-center py-8">
                   <span className="w-14 h-14"> <LogoLoader    /></span>
                    <p className="text-sm text-default-500 mt-2">Searching...</p>
                  </div>
                )
              ) : (
                <div className="p-4 space-y-4">
                  {/* Top Tokens Section with real data from Zerion API */}
                  {topTokens.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        Top Tokens
                        <Chip size="sm" color="success" variant="flat" className="text-[10px] rounded-lg h-5">
                          Live
                        </Chip>
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {topTokens.slice(0, 6).map((token) => (
                          <button
                            key={token.id}
                            className="text-left px-3 py-2 bg-content2 rounded-2xl hover:bg-content2 transition-colors group"
                            onClick={() => setQuery(token.metadata?.symbol || token.title)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 flex-shrink-0">
                                  {token.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium truncate">
                                      {token.metadata?.symbol || 'N/A'}
                                    </span>
                                 {/*    {!token.metadata?.verified && (
                                      <MaterialIconThemeVerified className="w-4 h-4 text-success flex-shrink-0" />
                                    )} */}
                                  </div>
                                  <div className="text-xs text-default-500 truncate">
                                    {showBalance ? token.metadata?.value || 'N/A' : '••••••'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {token.metadata?.change !== undefined && (
                                  <Chip 
                                    size="sm" 
                                    color={token.metadata.change >= 0 ? "success" : "danger"} 
                                    variant="flat"
                                    className="text-[10px] rounded-lg h-5"
                                  >
                                    {token.metadata.change >= 0 ? '+' : ''}{token.metadata.change.toFixed(1)}%
                                  </Chip>
                                )}
                                <ChevronRight className="text-default-400 opacity-0 group-hover:opacity-100 transition-opacity" size={10} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions with real examples */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Quick Search
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {quickSearchExamples.map((example, index) => (
                        <button
                          key={index}
                          className="p-2 text-left bg-content2 hover:bg-content3 rounded-lg transition-colors"
                          onClick={() => setQuery(example.query)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{example.icon}</span>
                            <div className="min-w-0">
                              <span className="text-sm font-medium block truncate">{example.query}</span>
                              <span className="text-xs text-default-500">{example.type}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-default-500" />
                        Recent
                      </h4>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            className="w-full text-left p-2 rounded-lg hover:bg-content2 transition-colors flex items-center justify-between group"
                            onClick={() => setQuery(search)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Clock className="w-3 h-3 text-default-400 flex-shrink-0" />
                              <span className="text-sm truncate">{search}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              className="opacity-0 group-hover:opacity-100 transition-opacity min-w-5 w-5 h-5"
                              onPress={(e) => {
                                e.stopPropagation();
                                setRecentSearches(prev => prev.filter((_, i) => i !== index));
                              }}
                            >
                              <X size={10} />
                            </Button>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

            
                </div>
              )}
            </div>

            {/* Enhanced Footer with real Zerion API status */}
            <div className="border-t border-divider p-3 bg-content2/30">
              <div className="flex items-center justify-between text-xs text-default-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center text-[10px] ">
                    <Kbd size="sm"><MynauiArrowUpDownSolid className="w-4 h-5" /></Kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center text-[10px] ">
                    <Kbd size="sm">↵</Kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center  ">
                    <Kbd size="sm" className="text-[11px]">esc</Kbd>
                    <span>Close</span>
                  </div>
                </div>
                <div className="flex items-center text-[10px]">
                  {zerionSDK ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                 
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                     
                    </div>
                  )}
                 
              
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Enhanced example with real Zerion API integration
export const SearchExample = memo(() => {
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [cacheStats, setCacheStats] = useState<{ size: number } | null>(null);

  // Check API status and cache stats on mount
  useEffect(() => {
    const checkAPIStatus = async () => {
      try {
        if (zerionSDK) {
          // Test API connection with a simple call
          await zerionAPI.getTopTokens(1);
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        console.warn('API connection failed:', error);
        setApiStatus('error');
      }
    };

    const updateCacheStats = () => {
      // Get cache size from internal cache
      const size = SEARCH_CACHE['cache']?.size || 0;
      setCacheStats({ size });
    };

    checkAPIStatus();
    updateCacheStats();

    // Update cache stats periodically
    const interval = setInterval(updateCacheStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleItemSelect = useCallback((item: SearchResult) => {
    setSelectedItem(item);
    setSearchHistory(prev => {
      const newHistory = [item, ...prev.filter(h => h.id !== item.id)].slice(0, 5);
      return newHistory;
    });
    
    // Enhanced navigation with real routing
    if (item.url) {
      console.log(`🔗 Navigation:`, {
        type: item.type,
        title: item.title,
        url: item.url,
        metadata: item.metadata
      });
      
      // For wallet addresses, ensure proper routing format
      if (item.type === 'wallet' && item.metadata?.address) {
        const walletUrl = `/wallets/${item.metadata.address}`;
        console.log(`👛 Wallet route: ${walletUrl}`);
        // Uncomment for actual navigation: 
        // window.location.href = walletUrl;
        // or use Next.js router: router.push(walletUrl);
      }
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    console.log('🔍 Search query:', query);
    
    // Update cache stats after search
    setTimeout(() => {
      const size = SEARCH_CACHE['cache']?.size || 0;
      setCacheStats({ size });
    }, 1000);
  }, []);

  const clearCache = useCallback(() => {
    zerionCache.clear();
    SEARCH_CACHE.clear();
    setCacheStats({ size: 0 });
    console.log('🗑️ Cache cleared');
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
          Zerion Advanced Search
        </h1>
        <p className="text-default-600 max-w-2xl mx-auto">
          Modern, efficient blockchain search powered by real-time Zerion API integration. Discover wallets, tokens, and DeFi protocols instantly.
        </p>
        
        {/* API Status Indicator with real Zerion context */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {apiStatus === 'checking' && (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-sm text-default-500">Connecting to Zerion API...</span>
            </div>
          )}
          {apiStatus === 'connected' && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success">Zerion API Connected</span>
            </div>
          )}
          {apiStatus === 'error' && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm text-warning">API Unavailable</span>
            </div>
          )}
          
          {/* Cache stats */}
          {cacheStats && (
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-secondary" />
              <span className="text-sm text-secondary">Cache: {cacheStats.size} items</span>
              <Button
                size="sm"
                variant="light"
                onPress={clearCache}
                className="text-xs h-6"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      <AdvancedSearch
        placeholder="Search wallets (0x..., .eth), tokens (ETH, USDC), DeFi protocols..."
        className="w-full"
        onItemSelect={handleItemSelect}
        onSearch={handleSearch}
        showShortcut={true}
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />

      {/* Selected Item Display with enhanced metadata */}
      {selectedItem && (
        <div className="p-5 bg-content1 border border-divider rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Selected Result</h3>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={() => setSelectedItem(null)}
            >
              <X size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-default-500 uppercase tracking-wide">Title</span>
                <p className="text-foreground font-semibold">{selectedItem.title}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-default-500 uppercase tracking-wide">Category</span>
                <p className="text-foreground">{selectedItem.category}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-default-500 uppercase tracking-wide">Type</span>
                <Chip size="sm" variant="flat" color="primary">
                  {selectedItem.type}
                </Chip>
              </div>
              {selectedItem.metadata?.network && (
                <div>
                  <span className="text-xs font-medium text-default-500 uppercase tracking-wide">Network</span>
                  <Chip size="sm" variant="flat" color="secondary">
                    {selectedItem.metadata.network}
                  </Chip>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {selectedItem.url && (
                <div>
                  <span className="text-xs font-medium text-default-500 uppercase tracking-wide">URL</span>
                  <p className="text-foreground font-mono text-sm break-all">{selectedItem.url}</p>
                </div>
              )}
              {selectedItem.metadata?.value && (
                <div>
                  <span className="text-xs font-medium text-default-500 uppercase tracking-wide">Value</span>
                  <p className="text-foreground font-bold text-lg">{selectedItem.metadata.value}</p>
                </div>
              )}
              {selectedItem.metadata?.address && (
                <div>
                  <span className="text-xs font-medium text-default-500 uppercase tracking-wide">Address</span>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-mono text-sm truncate">
                      {selectedItem.metadata.address}
                    </p>
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      onPress={() => navigator.clipboard.writeText(selectedItem.metadata?.address || '')}
                    >
                      <Copy size={12} />
                    </Button>
                  </div>
                </div>
              )}
              {selectedItem.metadata?.tags && (
                <div>
                  <span className="text-xs font-medium text-default-500 uppercase tracking-wide">Tags</span>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedItem.metadata.tags.map((tag, i) => (
                      <Chip key={i} size="sm" variant="flat" className="text-xs">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recent Selections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchHistory.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                className="p-3 text-left bg-content1 border border-divider hover:border-primary-300 rounded-lg transition-all duration-200 group"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-content2 rounded-lg flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip size="sm" variant="flat" className="text-xs">
                        {item.category}
                      </Chip>
                      {item.metadata?.verified && (
                        <CheckCircle className="w-3 h-3 text-success" />
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-default-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Performance & Feature Showcase with real Zerion integration */}
      <div className="text-center p-5 bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-950/20 dark:to-primary-950/20 rounded-lg border border-success-200 dark:border-success-800/30">
        <h4 className="text-lg font-semibold mb-3">🚀 Real Zerion Integration</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-success">✅ Live API</p>
            <p className="text-default-500">Zerion SDK</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-primary">⚡ Smart Cache</p>
            <p className="text-default-500">5-30min TTL</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-secondary">🎯 Real Data</p>
            <p className="text-default-500">No Mock APIs</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-warning">⌨️ Efficient</p>
            <p className="text-default-500">300ms Debounce</p>
          </div>
        </div>
      </div>
    </div>
  );
});

AdvancedSearch.displayName = 'AdvancedSearch';
SearchExample.displayName = 'SearchExample';

export default AdvancedSearch;