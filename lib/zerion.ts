// lib/zerion.ts
import  ZerionSDK  from 'zerion-sdk-ts';

const ZERION_API_KEY = process.env.NEXT_PUBLIC_ZERION_API_KEY;

if (!ZERION_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_ZERION_API_KEY environment variable');
}

export const zerionSDK = new ZerionSDK({
  apiKey: ZERION_API_KEY,
  timeout: 30000,
  retries: 3,
  retryDelay: 2000
});

// Define types for our application
export interface WalletData {
  address: string;
  name?: string;
  portfolio?: any;
  positions?: any[];
  transactions?: any[];
  nftPortfolio?: any;
  pnl?: any;
  chart?: any;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: number;
}

export interface WalletSummary {
  address: string;
  name?: string;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  positionsCount: number;
  chainsCount: number;
  lastActivity?: string;
}

// Cache management
class ZerionCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const zerionCache = new ZerionCache();

// Utility functions for Zerion API calls with caching
export const zerionUtils = {
  async getWalletSummary(address: string): Promise<WalletSummary> {
    const cacheKey = `summary_${address}`;
    const cached = zerionCache.get(cacheKey);
    if (cached) return cached;
    
    try {
      const [portfolio, positions] = await Promise.all([
        zerionSDK.wallets.getPortfolio(address),
        zerionSDK.wallets.getPositions(address, { page: { size: 50 } })
      ]);
      
      const chains = new Set(positions.data.map(p => p.relationships?.chain?.data?.id)).size;
      const totalValue = portfolio.data.attributes.total || 0;
      const dayChange = portfolio.data.attributes.changes?.absolute_1d || 0;
      const dayChangePercent = portfolio.data.attributes.changes?.percent_1d || 0;
      
      const summary: WalletSummary = {
        address,
        totalValue,
        dayChange,
        dayChangePercent,
        positionsCount: positions.data.length,
        chainsCount: chains
      };
      
      zerionCache.set(cacheKey, summary, 2 * 60 * 1000); // 2 minutes cache
      return summary;
    } catch (error) {
      console.error('Error fetching wallet summary:', error);
      throw error;
    }
  },
  
  async getWalletAnalytics(address: string): Promise<WalletData> {
    const cacheKey = `analytics_${address}`;
    const cached = zerionCache.get(cacheKey);
    if (cached) return cached;
    
    try {
      // Use the SDK's high-level analysis method
      const analysis = await zerionSDK.getPortfolioAnalysis(address);
      
      const walletData: WalletData = {
        address,
        portfolio: analysis.summary,
        positions: analysis.positions,
        nftPortfolio: analysis.nftPortfolio,
        pnl: analysis.pnl,
        lastUpdated: Date.now()
      };
      
      zerionCache.set(cacheKey, walletData, 5 * 60 * 1000); // 5 minutes cache
      return walletData;
    } catch (error) {
      console.error('Error fetching wallet analytics:', error);
      throw error;
    }
  },
  
  async getWalletChart(address: string, period: 'day' | 'week' | 'month' = 'week') {
    const cacheKey = `chart_${address}_${period}`;
    const cached = zerionCache.get(cacheKey);
    if (cached) return cached;
    
    try {
      const chart = await zerionSDK.wallets.getChart(address, period);
      zerionCache.set(cacheKey, chart.data, 10 * 60 * 1000); // 10 minutes cache
      return chart.data;
    } catch (error) {
      console.error('Error fetching wallet chart:', error);
      throw error;
    }
  },
  
  async getTopTokens(limit: number = 10) {
    const cacheKey = `top_tokens_${limit}`;
    const cached = zerionCache.get(cacheKey);
    if (cached) return cached;
    
    try {
      const tokens = await zerionSDK.fungibles.getTopFungibles(limit);
      zerionCache.set(cacheKey, tokens, 15 * 60 * 1000); // 15 minutes cache
      return tokens;
    } catch (error) {
      console.error('Error fetching top tokens:', error);
      throw error;
    }
  },
  
  async searchTokens(query: string) {
    if (!query || query.length < 2) return [];
    
    const cacheKey = `search_${query}`;
    const cached = zerionCache.get(cacheKey);
    if (cached) return cached;
    
    try {
      const tokens = await zerionSDK.fungibles.searchFungibles(query, { limit: 20 });
      zerionCache.set(cacheKey, tokens, 30 * 60 * 1000); // 30 minutes cache
      return tokens;
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }
};

// Batch operations for multiple wallets
export const batchZerionOperations = {
  async getMultipleWalletSummaries(addresses: string[]): Promise<WalletSummary[]> {
    const BATCH_SIZE = 3; // Limit concurrent requests
    const results: WalletSummary[] = [];
    
    for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
      const batch = addresses.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(address => 
        zerionUtils.getWalletSummary(address).catch(error => {
          console.error(`Error fetching summary for ${address}:`, error);
          return {
            address,
            totalValue: 0,
            dayChange: 0,
            dayChangePercent: 0,
            positionsCount: 0,
            chainsCount: 0,
            error: error.message
          } as WalletSummary;
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
};