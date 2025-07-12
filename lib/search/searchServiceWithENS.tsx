// lib/search/searchServiceWithENS.ts
import { zerionSDK, zerionUtils, zerionCache } from '@/lib/zerion';
import { SearchResult, SearchFilters, SearchCategory } from './types';
import { formatCurrency, formatNumber } from '@/lib/wallet-analytics/utils';
import { ensResolver, isValidENS, isValidAddress } from '@/lib/ens/ensResolver';
import { Avatar } from '@heroui/avatar';
import { Coins, Wallet, Image, Activity, Target, Award, Zap } from 'lucide-react';

/**
 * Enhanced search service with ENS resolution capabilities
 */
export class EnhancedSearchService {
  private static instance: EnhancedSearchService;
  private cache = new Map<string, { data: SearchResult[]; timestamp: number; hits: number }>();
  private requestQueue = new Map<string, Promise<SearchResult[]>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  static getInstance(): EnhancedSearchService {
    if (!EnhancedSearchService.instance) {
      EnhancedSearchService.instance = new EnhancedSearchService();
    }
    return EnhancedSearchService.instance;
  }

  /**
   * Enhanced wallet search with ENS resolution
   */
  private async searchWallets(
    query: string, 
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Handle ENS domains
    if (isValidENS(query)) {
      try {
        // Resolve ENS to address
        const resolvedAddress = await ensResolver.resolveENS(query);
        
        if (resolvedAddress) {
          // Get ENS metadata
          const ensData = await ensResolver.getENSData(query);
          
          // Get wallet summary using resolved address
          const summary = await zerionUtils.getWalletSummary(resolvedAddress);
          
          const result: SearchResult = {
            id: `wallet-ens-${query}`,
            title: query, // Show ENS name as title
            subtitle: `${resolvedAddress.slice(0, 6)}...${resolvedAddress.slice(-4)} • ENS Domain`,
            category: 'wallets',
            icon: ensData.avatar ? 
              <Avatar src={ensData.avatar} size="sm" className="w-8 h-8" /> :
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                <Wallet size={16} className="text-blue-600 dark:text-blue-400" />
              </div>,
            type: 'wallet' as const,
            url: `/wallets/${resolvedAddress}`,
            badge: this.getWalletBadge(summary),
            metadata: {
              address: resolvedAddress,
              ens: query,
              network: this.getWalletNetwork(summary),
              value: this.formatWalletValue(summary),
              change: summary?.dayChangePercent,
              verified: this.isVerifiedWallet(summary),
              tags: this.generateWalletTags(query, summary, true),
              // Additional ENS metadata
              ensAvatar: ensData.avatar,
              ensDescription: ensData.description,
              ensTwitter: ensData.twitter,
              ensGithub: ensData.github,
              ensEmail: ensData.email,
              ensUrl: ensData.url
            }
          };

          results.push(result);
        } else {
          // ENS domain exists but no address set
          results.push({
            id: `wallet-ens-unresolved-${query}`,
            title: query,
            subtitle: 'ENS Domain (No Address Set)',
            category: 'wallets',
            icon: <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Wallet size={16} className="text-gray-400" />
            </div>,
            type: 'wallet' as const,
            url: `/ens/${query}`,
            metadata: {
              ens: query,
              network: 'Ethereum',
              tags: ['ens', 'unresolved']
            }
          });
        }
      } catch (error) {
        console.error('ENS resolution failed:', error);
      }
    }
    
    // Handle Ethereum addresses
    else if (isValidAddress(query)) {
      try {
        // Try reverse ENS resolution
        const ensName = await ensResolver.reverseResolve(query);
        
        // Get wallet summary
        const summary = await zerionUtils.getWalletSummary(query);
        
        // Get ENS data if ENS name exists
        let ensData = null;
        if (ensName) {
          ensData = await ensResolver.getENSData(ensName);
        }

        const result: SearchResult = {
          id: `wallet-address-${query}`,
          title: ensName || this.formatAddress(query),
          subtitle: ensName ? 
            `${query.slice(0, 6)}...${query.slice(-4)} • ENS Domain` :
            'Ethereum Address',
          category: 'wallets',
          icon: ensData?.avatar ? 
            <Avatar src={ensData.avatar} size="sm" className="w-8 h-8" /> :
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900 dark:to-secondary-800 flex items-center justify-center">
              <Wallet size={16} className="text-secondary-600 dark:text-secondary-400" />
            </div>,
          type: 'wallet' as const,
          url: `/wallets/${query}`,
          badge: this.getWalletBadge(summary),
          metadata: {
            address: query,
            ens: ensName,
            network: this.getWalletNetwork(summary),
            value: this.formatWalletValue(summary),
            change: summary?.dayChangePercent,
            verified: this.isVerifiedWallet(summary),
            tags: this.generateWalletTags(query, summary, !!ensName),
            // ENS metadata if available
            ...(ensData && {
              ensAvatar: ensData.avatar,
              ensDescription: ensData.description,
              ensTwitter: ensData.twitter,
              ensGithub: ensData.github,
              ensEmail: ensData.email,
              ensUrl: ensData.url
            })
          }
        };

        results.push(result);
      } catch (error) {
        console.error('Wallet search failed:', error);
        
        // Return fallback result
        results.push({
          id: `wallet-fallback-${query}`,
          title: this.formatAddress(query),
          subtitle: 'Ethereum Address',
          category: 'wallets',
          icon: <Wallet size={16} />,
          type: 'wallet' as const,
          url: `/wallets/${query}`,
          metadata: {
            address: query,
            network: 'Ethereum',
            tags: ['wallet', 'ethereum']
          }
        });
      }
    }

    return this.passesWalletFilters(results, filters);
  }

  /**
   * Search for ENS domains by partial name
   */
  private async searchENSDomains(
    query: string,
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    // This would integrate with ENS subgraph or indexing service
    // For now, we'll just handle exact matches and common patterns
    const results: SearchResult[] = [];

    if (query.length >= 3 && !query.includes('.')) {
      // Try common ENS patterns
      const patterns = [
        `${query}.eth`,
        `${query}eth.eth`,
        `the${query}.eth`,
        `${query}dao.eth`
      ];

      for (const pattern of patterns) {
        try {
          const address = await ensResolver.resolveENS(pattern);
          if (address) {
            const ensData = await ensResolver.getENSData(pattern);
            
            results.push({
              id: `ens-${pattern}`,
              title: pattern,
              subtitle: `${address.slice(0, 6)}...${address.slice(-4)} • ENS Domain`,
              category: 'wallets',
              icon: ensData.avatar ? 
                <Avatar src={ensData.avatar} size="sm" className="w-8 h-8" /> :
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center">
                  <Globe size={16} className="text-purple-600 dark:text-purple-400" />
                </div>,
              type: 'wallet' as const,
              url: `/wallets/${address}`,
              badge: 'ENS',
              metadata: {
                address,
                ens: pattern,
                network: 'Ethereum',
                tags: ['ens', 'domain'],
                ensAvatar: ensData.avatar,
                ensDescription: ensData.description
              }
            });
          }
        } catch (error) {
          // Silent fail for pattern matching
        }
      }
    }

    return results;
  }

  /**
   * Enhanced search that includes ENS resolution
   */
  async search(
    query: string, 
    filters: SearchFilters = {},
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const cacheKey = this.getCacheKey(query, filters);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const searchPromises: Promise<SearchResult[]>[] = [];

      // Wallet search (includes ENS resolution)
      if (isValidAddress(query) || isValidENS(query)) {
        searchPromises.push(this.searchWallets(query, filters, signal));
      }

      // ENS domain search for partial matches
      if (query.length >= 3 && !isValidAddress(query)) {
        searchPromises.push(this.searchENSDomains(query, filters, signal));
      }

      // Token search
      if (query.length >= 2) {
        searchPromises.push(this.searchTokens(query, filters, signal));
      }

      // DeFi search
      if (query.length >= 3) {
        searchPromises.push(this.searchDeFi(query, filters, signal));
      }

      const results = await Promise.allSettled(searchPromises);
      const allResults: SearchResult[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          allResults.push(...result.value);
        }
      });

      // Sort by relevance with ENS boost
      const sortedResults = this.sortByRelevanceWithENS(allResults, query);

      // Cache results
      this.setCache(cacheKey, sortedResults);

      return sortedResults;
    } catch (error) {
      console.error('Enhanced search failed:', error);
      return [];
    }
  }

  /**
   * Sort results with ENS domain boost
   */
  private sortByRelevanceWithENS(results: SearchResult[], query: string): SearchResult[] {
    return results.sort((a, b) => {
      // Exact ENS matches get highest priority
      const aExactENS = a.metadata?.ens === query.toLowerCase() ? 200 : 0;
      const bExactENS = b.metadata?.ens === query.toLowerCase() ? 200 : 0;
      
      // ENS domains get boost
      const aENSBoost = a.metadata?.ens ? 50 : 0;
      const bENSBoost = b.metadata?.ens ? 50 : 0;
      
      // Exact matches
      const aExact = a.title.toLowerCase() === query.toLowerCase() ? 100 : 0;
      const bExact = b.title.toLowerCase() === query.toLowerCase() ? 100 : 0;
      
      // Prefix matches
      const aPrefix = a.title.toLowerCase().startsWith(query.toLowerCase()) ? 50 : 0;
      const bPrefix = b.title.toLowerCase().startsWith(query.toLowerCase()) ? 50 : 0;
      
      // Verification bonus
      const aVerified = a.metadata?.verified ? 20 : 0;
      const bVerified = b.metadata?.verified ? 20 : 0;
      
      const aScore = aExactENS + aENSBoost + aExact + aPrefix + aVerified;
      const bScore = bExactENS + bENSBoost + bExact + bPrefix + bVerified;
      
      return bScore - aScore;
    });
  }

  // Helper methods (same as original but with ENS enhancements)

  private generateWalletTags(address: string, summary: any, hasENS: boolean = false): string[] {
    const tags = ['wallet', 'ethereum'];
    if (hasENS) tags.push('ens');
    if (isValidENS(address)) tags.push('domain');
    if ((summary?.totalValue?.positions || 0) > 1e6) tags.push('whale');
    if (summary?.chainsCount > 1) tags.push('multichain');
    return tags;
  }

  private getWalletBadge(summary: any): string | undefined {
    const value = summary?.totalValue?.positions || 0;
    if (value > 1e6) return 'Whale';
    if (value > 1e5) return 'Active';
    return undefined;
  }

  private formatAddress(address: string): string {
    if (isValidENS(address)) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private formatWalletValue(summary: any): string | undefined {
    const value = summary?.totalValue?.positions;
    return value ? formatNumber(value) : undefined;
  }

  private getWalletNetwork(summary: any): string {
    const chains = summary?.chainsCount || 1;
    return chains > 1 ? `${chains} Networks` : 'Ethereum';
  }

  private isVerifiedWallet(summary: any): boolean {
    return (summary?.totalValue?.positions || 0) > 1000;
  }

  private passesWalletFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter(result => {
      if (filters.verified && !result.metadata?.verified) return false;
      if (filters.minValue && (result.metadata?.value ? parseFloat(result.metadata.value.replace(/[$,]/g, '')) : 0) < filters.minValue) return false;
      if (filters.maxValue && (result.metadata?.value ? parseFloat(result.metadata.value.replace(/[$,]/g, '')) : 0) > filters.maxValue) return false;
      return true;
    });
  }

  /**
   * Token search (same as original implementation)
   */
  private async searchTokens(
    query: string, 
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    if (!zerionSDK) return [];
    
    try {
      const cacheKey = `tokens_${query}_${filters.limit || 12}`;
      const cached = zerionCache.get(cacheKey);
      if (cached) return cached;

      const response = await zerionSDK.fungibles.searchFungibles(query, { 
        limit: filters.limit || 12 
      });

      const results = (response || []).map((token: any) => {
        const attrs = token.attributes;
        const marketData = attrs.market_data || {};
        
        return {
          id: `token-${token.id}`,
          title: `${attrs.name} (${attrs.symbol})`,
          subtitle: 'Token',
          category: 'tokens' as SearchCategory,
          icon: attrs?.icon?.url ? 
            <Avatar src={attrs.icon.url} size="sm" className="w-8 h-8" /> : 
            <Coins size={16} />,
          type: 'token' as const,
          url: `/tokens/${attrs.symbol}`,
          badge: marketData.market_cap > 1e9 ? 'Top 100' : undefined,
          metadata: {
            value: marketData.price ? formatCurrency(marketData.price, true, true) : undefined,
            change: marketData.percent_change_24h,
            symbol: attrs.symbol,
            logoUrl: attrs?.icon?.url,
            marketCap: marketData.market_cap ? formatNumber(marketData.market_cap) : undefined,
            volume24h: marketData.volume_24h ? formatNumber(marketData.volume_24h) : undefined,
            verified: (marketData.market_cap || 0) > 1e6,
            tags: ['token', 'crypto', attrs.symbol?.toLowerCase()],
            network: 'Multi-chain'
          }
        };
      });

      zerionCache.set(cacheKey, results, 15 * 60 * 1000); // 15 minutes cache
      return results;
    } catch (error) {
      console.error('Token search failed:', error);
      return [];
    }
  }

  /**
   * DeFi search (same as original implementation)
   */
  private async searchDeFi(
    query: string, 
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    const defiProtocols = [
      { name: 'Uniswap', category: 'DEX' },
      { name: 'Aave', category: 'Lending' },
      { name: 'Compound', category: 'Lending' },
      { name: 'Curve', category: 'DEX' },
      { name: 'MakerDAO', category: 'CDP' },
      { name: 'SushiSwap', category: 'DEX' },
      { name: 'Balancer', category: 'DEX' },
      { name: 'Yearn', category: 'Yield' },
      { name: 'Convex', category: 'Yield' },
      { name: 'Lido', category: 'Staking' }
    ];

    const matches = defiProtocols.filter(protocol => 
      protocol.name.toLowerCase().includes(query.toLowerCase())
    );

    return matches.map(protocol => ({
      id: `defi-${protocol.name.toLowerCase()}`,
      title: protocol.name,
      subtitle: `${protocol.category} Protocol`,
      category: 'defi' as SearchCategory,
      icon: <div className="w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-900/20 flex items-center justify-center">
        <Zap size={16} className="text-warning-600 dark:text-warning-400" />
      </div>,
      type: 'defi' as const,
      url: `/defi/${protocol.name.toLowerCase()}`,
      metadata: {
        tags: ['defi', protocol.category.toLowerCase(), protocol.name.toLowerCase()],
        verified: true
      }
    }));
  }

  // Cache management methods
  private getCacheKey(query: string, filters: SearchFilters): string {
    return `${query.toLowerCase()}_${JSON.stringify(filters)}`;
  }

  private getFromCache(key: string): SearchResult[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    cached.hits++;
    return cached.data;
  }

  private setCache(key: string, data: SearchResult[]): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });
  }

  /**
   * Get trending tokens with ENS integration
   */
  async getTrending(): Promise<SearchResult[]> {
    try {
      const tokens = await zerionUtils.getTopTokens(8);
      
      return (tokens || []).map((token: any, index: number) => ({
        id: `trending-${index}`,
        title: `${token?.attributes?.name} (${token?.attributes?.symbol})`,
        subtitle: 'Trending Token',
        category: 'tokens' as SearchCategory,
        icon: token?.attributes?.icon?.url ? 
          <Avatar src={token?.attributes?.icon?.url} size="sm" className="w-8 h-8" /> : 
          <Coins size={16} />,
        type: 'token' as const,
        url: `/tokens/${token?.attributes?.symbol?.toLowerCase()}`,
        badge: 'Trending',
        metadata: {
          value: token?.attributes?.market_data?.price ? 
            formatCurrency(token.attributes.market_data.price, true, true) : undefined,
          change: token?.attributes?.market_data?.percent_change_24h,
          symbol: token?.attributes?.symbol,
          logoUrl: token?.attributes?.icon?.url,
          verified: true,
          tags: ['trending', 'token', 'crypto']
        }
      }));
    } catch (error) {
      console.error('Failed to get trending tokens:', error);
      return [];
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    ensResolver.clearCache();
  }

  /**
   * Get search statistics
   */
  getStats(): {
    cacheSize: number;
    ensResolver: { size: number; hitRate: number };
  } {
    return {
      cacheSize: this.cache.size,
      ensResolver: ensResolver.getCacheStats()
    };
  }
}

// Export singleton instance
export const enhancedSearchService = EnhancedSearchService.getInstance();

// Usage example with React component
export const SearchWithENS = () => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const searchWithENS = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await enhancedSearchService.search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchWithENS(query);
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [query, searchWithENS]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    searchWithENS
  };
};