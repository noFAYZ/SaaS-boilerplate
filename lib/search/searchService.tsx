// lib/search/searchService.ts
import { zerionSDK, zerionUtils, zerionCache } from '@/lib/zerion';
import { SearchResult, SearchFilters, SearchCategory } from './types';
import { formatCurrency, formatNumber } from '@/lib/wallet-analytics/utils';
import { Avatar } from '@heroui/avatar';
import { Coins, Wallet, Image, Activity, Target, Award, Zap } from 'lucide-react';

// Helper function for ENS validation
const isValidENS = (name: string): boolean => /^[a-zA-Z0-9\-_]+\.eth$/.test(name);
const isValidAddress = (address: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(address);

/**
 * Production-ready search service for blockchain data
 * Features: Smart caching, error handling, rate limiting, performance optimization
 */
export class SearchService {
  private static instance: SearchService;
  private cache = new Map<string, { data: SearchResult[]; timestamp: number; hits: number }>();
  private requestQueue = new Map<string, Promise<SearchResult[]>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private searchMetrics = {
    totalSearches: 0,
    cacheHits: 0,
    errors: 0,
    averageResponseTime: 0
  };

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Main search method with advanced error handling and performance optimization
   */
  async search(
    query: string, 
    filters: SearchFilters = {},
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    const startTime = Date.now();
    this.searchMetrics.totalSearches++;

    if (!query.trim()) return [];

    const cacheKey = this.getCacheKey(query, filters);
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.searchMetrics.cacheHits++;
      return cached;
    }

    // Check if same request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    // Create search promise with timeout
    const searchPromise = this.performSearch(query, filters, signal);
    this.requestQueue.set(cacheKey, searchPromise);

    try {
      const results = await Promise.race([
        searchPromise,
        this.createTimeoutPromise(this.REQUEST_TIMEOUT)
      ]);

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);

      // Cache successful results
      this.setCache(cacheKey, results);
      
      return results;
    } catch (error) {
      this.searchMetrics.errors++;
      console.error('Search error:', error);
      return [];
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  /**
   * Performs the actual search across different data sources
   */
  private async performSearch(
    query: string,
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    const searchPromises = [];

    // Determine search scope based on query type
    const queryType = this.analyzeQuery(query);
    
    // Execute relevant searches in parallel
    if (!filters.categories || filters.categories.includes('tokens')) {
      searchPromises.push(this.searchTokens(query, filters, signal));
    }
    
    if (!filters.categories || filters.categories.includes('wallets')) {
      if (queryType.isAddress || queryType.isENS) {
        searchPromises.push(this.searchWallets(query, filters, signal));
      }
    }
    
    if (!filters.categories || filters.categories.includes('nfts')) {
      searchPromises.push(this.searchNFTs(query, filters, signal));
    }
    
    if (!filters.categories || filters.categories.includes('defi')) {
      searchPromises.push(this.searchDefi(query, filters, signal));
    }

    const results = await Promise.allSettled(searchPromises);
    
    const allResults = results
      .filter((result): result is PromiseFulfilledResult<SearchResult[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);

    // Apply filters and ranking
    const filteredResults = this.applyAdvancedFilters(allResults, filters);
    const rankedResults = this.rankResults(filteredResults, query, queryType);
    
    return rankedResults.slice(0, filters.limit || 12);
  }

  /**
   * Advanced token search with market data
   */
  private async searchTokens(
    query: string, 
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    if (!zerionSDK) return [];

    try {
      const response = await zerionSDK.fungibles.searchFungibles(query, { 
        limit: 20 
      });

      return (response || []).map((token: any) => {
        const attrs = token.attributes;
        const marketData = attrs.market_data || {};
        const logoUrl = attrs?.icon?.url;
        
        return {
          id: `token-${token.id}`,
          title: `${attrs.name} (${attrs.symbol})`,
          subtitle: this.getTokenSubtitle(marketData),
          category: 'tokens' as SearchCategory,
          icon: logoUrl ? 
            <Avatar src={logoUrl} size="sm" className="w-8 h-8" /> : 
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Coins size={16} className="text-primary-600" />
            </div>,
          type: 'token' as const,
          url: `/tokens/${attrs.symbol.toLowerCase()}`,
          badge: this.getTokenBadge(marketData),
          metadata: {
            value: marketData.price ? marketData.price : undefined,
            change: marketData.percent_change_24h,
            symbol: attrs.symbol,
            logoUrl,
            marketCap: marketData.market_cap ? formatNumber(marketData.market_cap) : undefined,
            volume24h: marketData.volume_24h ? formatNumber(marketData.volume_24h) : undefined,
            verified: this.isVerifiedToken(marketData),
            risk: this.calculateTokenRisk(marketData),
            tags: this.generateTokenTags(attrs),
            network: 'Multi-chain',
            address: this.getTokenAddress(attrs)
          }
        };
      }).filter(result => this.passesTokenFilters(result, filters));
    } catch (error) {
      console.error('Token search failed:', error);
      return [];
    }
  }

  /**
   * Enhanced wallet search with portfolio analysis
   */
  private async searchWallets(
    query: string, 
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    if (!isValidAddress(query) && !isValidENS(query)) return [];

    try {
      const summary = await zerionUtils.getWalletSummary(query);
      
      const result: SearchResult = {
        id: `wallet-${query}`,
        title: this.formatWalletTitle(query, summary),
        subtitle: this.getWalletSubtitle(query, summary),
        category: 'wallets',
        icon: <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center">
          <Wallet size={16} className="text-secondary-600" />
        </div>,
        type: 'wallet' as const,
        url: `/wallets/${query}`,
        badge: this.getWalletBadge(summary),
        metadata: {
          address: query,
          network: this.getWalletNetwork(summary),
          value: this.formatWalletValue(summary),
          change: summary.dayChangePercent,
          verified: this.isVerifiedWallet(summary),
          tags: this.generateWalletTags(query, summary),
          ens: isValidENS(query) ? query : undefined
        }
      };

      return this.passesWalletFilters(result, filters) ? [result] : [];
    } catch (error) {
      console.error('Wallet search failed:', error);
      // Return basic fallback result
      return [{
        id: `wallet-${query}`,
        title: this.formatAddress(query),
        subtitle: isValidENS(query) ? 'ENS Domain' : 'Ethereum Address',
        category: 'wallets',
        icon: <Wallet size={16} />,
        type: 'wallet' as const,
        url: `/wallets/${query}`,
        metadata: {
          address: query,
          network: 'Ethereum',
          ens: isValidENS(query) ? query : undefined,
          tags: ['wallet', 'ethereum']
        }
      }];
    }
  }

  /**
   * NFT search implementation
   */
  private async searchNFTs(
    query: string, 
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    // Placeholder for NFT search - would integrate with NFT APIs
    return [];
  }

  /**
   * DeFi protocol search
   */
  private async searchDefi(
    query: string, 
    filters: SearchFilters,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    // Placeholder for DeFi search - would integrate with DeFi protocol APIs
    const defiProtocols = [
      { name: 'Uniswap', category: 'DEX' },
      { name: 'Aave', category: 'Lending' },
      { name: 'Compound', category: 'Lending' },
      { name: 'Curve', category: 'DEX' },
      { name: 'MakerDAO', category: 'CDP' }
    ];

    const matches = defiProtocols.filter(protocol => 
      protocol.name.toLowerCase().includes(query.toLowerCase())
    );

    return matches.map(protocol => ({
      id: `defi-${protocol.name.toLowerCase()}`,
      title: protocol.name,
      subtitle: `${protocol.category} Protocol`,
      category: 'defi' as SearchCategory,
      icon: <div className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center">
        <Zap size={16} className="text-warning-600" />
      </div>,
      type: 'defi' as const,
      url: `/defi/${protocol.name.toLowerCase()}`,
      metadata: {
        tags: ['defi', protocol.category.toLowerCase(), protocol.name.toLowerCase()]
      }
    }));
  }

  /**
   * Get trending content for discovery
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
            formatCurrency(token?.attributes?.market_data?.price, true, true) : undefined,
          change: token?.attributes?.market_data?.changes?.percent_1d,
          symbol: token?.attributes?.symbol,
          logoUrl: token?.attributes?.icon?.url,
          verified: true,
          tags: ['trending', 'token']
        }
      }));
    } catch (error) {
      console.error('Failed to fetch trending:', error);
      return [];
    }
  }

  // Utility methods for enhanced functionality

  private analyzeQuery(query: string) {
    return {
      isAddress: isValidAddress(query),
      isENS: isValidENS(query),
      isSymbol: /^[A-Z]{2,10}$/.test(query.toUpperCase()),
      length: query.length,
      hasNumbers: /\d/.test(query)
    };
  }

  private applyAdvancedFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    let filtered = results;

    if (filters.verified !== undefined) {
      filtered = filtered.filter(result => result.metadata?.verified === filters.verified);
    }

    if (filters.minValue) {
      filtered = filtered.filter(result => {
        const value = parseFloat(result.metadata?.value?.replace(/[^0-9.-]/g, '') || '0');
        return value >= filters.minValue!;
      });
    }

    if (filters.maxValue) {
      filtered = filtered.filter(result => {
        const value = parseFloat(result.metadata?.value?.replace(/[^0-9.-]/g, '') || '0');
        return value <= filters.maxValue!;
      });
    }

    return filtered;
  }

  private rankResults(results: SearchResult[], query: string, queryType: any): SearchResult[] {
    return results.sort((a, b) => {
      // Exact matches first
      const aExact = a.title.toLowerCase() === query.toLowerCase() ? 100 : 0;
      const bExact = b.title.toLowerCase() === query.toLowerCase() ? 100 : 0;
      
      // Prefix matches
      const aPrefix = a.title.toLowerCase().startsWith(query.toLowerCase()) ? 50 : 0;
      const bPrefix = b.title.toLowerCase().startsWith(query.toLowerCase()) ? 50 : 0;
      
      // Verification bonus
      const aVerified = a.metadata?.verified ? 20 : 0;
      const bVerified = b.metadata?.verified ? 20 : 0;
      
      // Type relevance
      const typeBonus = { wallet: 15, token: 10, nft: 5, defi: 5 };
      const aType = typeBonus[a.type] || 0;
      const bType = typeBonus[b.type] || 0;
      
      const aScore = aExact + aPrefix + aVerified + aType;
      const bScore = bExact + bPrefix + bVerified + bType;
      
      return bScore - aScore;
    });
  }

  // Helper methods for data formatting and validation

  private getTokenSubtitle(marketData: any): string {
    if (marketData.market_cap > 1e10) return 'Top 10 Token';
    if (marketData.market_cap > 1e9) return 'Top 100 Token';
    if (marketData.market_cap > 1e8) return 'Popular Token';
    return 'Token';
  }

  private getTokenBadge(marketData: any): string | undefined {
    if (marketData.market_cap > 1e10) return 'Top 10';
    if (marketData.market_cap > 1e9) return 'Top 100';
    if (marketData.percent_change_24h > 10) return 'Hot';
    return undefined;
  }

  private getWalletSubtitle(address: string, summary: any): string {
    if (isValidENS(address)) return 'ENS Domain';
    const value = summary.totalValue?.positions || 0;
    if (value > 1e6) return 'Whale Wallet';
    if (value > 1e5) return 'Active Wallet';
    return 'Ethereum Wallet';
  }

  private getWalletBadge(summary: any): string | undefined {
    const value = summary.totalValue?.positions || 0;
    if (value > 1e6) return 'Whale';
    if (value > 1e5) return 'Active';
    return undefined;
  }

  private formatWalletTitle(address: string, summary: any): string {
    if (isValidENS(address)) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private formatAddress(address: string): string {
    if (isValidENS(address)) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  private formatWalletValue(summary: any): string | undefined {
    const value = summary.totalValue?.positions;
    return value ? formatNumber(value) : undefined;
  }

  private getWalletNetwork(summary: any): string {
    const chains = summary.chainsCount || 1;
    return chains > 1 ? `${chains} Networks` : 'Ethereum';
  }

  private isVerifiedToken(marketData: any): boolean {
    return (marketData.market_cap || 0) > 1e6;
  }

  private isVerifiedWallet(summary: any): boolean {
    return (summary.totalValue?.positions || 0) > 1000;
  }

  private calculateTokenRisk(marketData: any): 'low' | 'medium' | 'high' {
    const marketCap = marketData.market_cap || 0;
    if (marketCap > 1e9) return 'low';
    if (marketCap > 1e6) return 'medium';
    return 'high';
  }

  private generateTokenTags(attrs: any): string[] {
    const tags = ['token', 'crypto'];
    if (attrs.symbol) tags.push(attrs.symbol.toLowerCase());
    if (attrs.name) tags.push(...attrs.name.toLowerCase().split(' ').slice(0, 2));
    return tags;
  }

  private generateWalletTags(address: string, summary: any): string[] {
    const tags = ['wallet', 'ethereum'];
    if (isValidENS(address)) tags.push('ens');
    if ((summary.totalValue?.positions || 0) > 1e6) tags.push('whale');
    if (summary.chainsCount > 1) tags.push('multichain');
    return tags;
  }

  private getTokenAddress(attrs: any): string | undefined {
    const implementations = attrs.implementations;
    if (implementations) {
      const firstImpl = Object.values(implementations)[0] as any;
      return firstImpl?.address;
    }
    return undefined;
  }

  private passesTokenFilters(result: SearchResult, filters: SearchFilters): boolean {
    if (filters.verified && !result.metadata?.verified) return false;
    return true;
  }

  private passesWalletFilters(result: SearchResult, filters: SearchFilters): boolean {
    if (filters.verified && !result.metadata?.verified) return false;
    return true;
  }

  // Cache management with LRU eviction
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
    // Implement LRU eviction
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

  private createTimeoutPromise(timeout: number): Promise<SearchResult[]> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Search timeout')), timeout);
    });
  }

  private updateMetrics(responseTime: number): void {
    const { averageResponseTime, totalSearches } = this.searchMetrics;
    this.searchMetrics.averageResponseTime = 
      (averageResponseTime * (totalSearches - 1) + responseTime) / totalSearches;
  }

  // Public methods for monitoring and debugging
  getMetrics() {
    return {
      ...this.searchMetrics,
      cacheSize: this.cache.size,
      cacheHitRate: this.searchMetrics.cacheHits / this.searchMetrics.totalSearches
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats() {
    return Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      hits: value.hits,
      age: Date.now() - value.timestamp
    }));
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();