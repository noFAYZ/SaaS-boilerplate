// lib/services/ZerionService.ts
import  ZerionSDK  from 'zerion-sdk-ts';
import { config } from '@/config/environment';
import { cacheService, withCache, cacheKey } from '@/lib/cache/CacheService';
import { logger } from '@/lib/logger/Logger';
import { ExternalServiceError } from '@/lib/errors/AppError';

class ZerionService {
  private sdk: ZerionSDK;

  constructor() {
    this.sdk = new ZerionSDK({
      apiKey: config.zerion.apiKey,
      baseURL: config.zerion.baseUrl,
      timeout: config.zerion.timeout,
      retries: config.zerion.retries,
    });
  }

  async getWalletSummary(address: string): Promise<any> {
    return withCache(
      `wallet_summary:${address}`,
      async () => {
        try {
          // Use your existing logic but with enhanced error handling
          const portfolio = await this.sdk.wallets.getPortfolio(address);
          const positions = await this.sdk.wallets.getPositions(address);

          const summary = {
            totalValue: portfolio?.data?.attributes?.total || { positions: 0 },
            dayChangePercent: portfolio?.data?.attributes?.changes?.percent_1d || 0,
            chainsCount: positions?.data?.length || 0,
          };

          logger.info('Wallet summary fetched', { address });
          return summary;
        } catch (error) {
          logger.error('Failed to fetch wallet summary', { address, error });
          throw new ExternalServiceError('Zerion API', error as Error);
        }
      },
      { ttl: 300, tags: ['zerion', address] }
    );
  }

  async searchTokens(query: string, limit: number = 8): Promise<any> {
    return withCache(
      cacheKey.tokens(query, limit),
      async () => {
        try {
          const results = await this.sdk.fungibles.searchFungibles(query, { limit });
          logger.info('Token search completed', { query, count: results?.length });
          return results;
        } catch (error) {
          logger.error('Token search failed', { query, error });
          throw new ExternalServiceError('Zerion API', error as Error);
        }
      },
      { ttl: 900, tags: ['zerion', 'tokens'] }
    );
  }

  async getTopTokens(limit: number = 8): Promise<any> {
    return withCache(
      `top_tokens:${limit}`,
      async () => {
        try {
          const tokens = await this.sdk.fungibles.getTopFungibles({ limit });
          logger.info('Top tokens fetched', { count: tokens?.length });
          return tokens;
        } catch (error) {
          logger.error('Failed to fetch top tokens', { error });
          throw new ExternalServiceError('Zerion API', error as Error);
        }
      },
      { ttl: 1800, tags: ['zerion', 'tokens'] }
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.sdk.chains.getChains({ limit: 1 });
      return true;
    } catch {
      return false;
    }
  }
}

// Backward compatibility objects
export const zerionService = new ZerionService();

// Create instances that match your existing imports
export const zerionUtils = {
  getWalletSummary: (address: string) => zerionService.getWalletSummary(address),
  getTopTokens: (limit: number) => zerionService.getTopTokens(limit),
  searchTokens: (query: string, limit: number) => zerionService.searchTokens(query, limit),
};

export const zerionSDK = new ZerionSDK({
  apiKey: config.zerion.apiKey,
  baseURL: config.zerion.baseUrl,
  timeout: config.zerion.timeout,
  retries: config.zerion.retries,
});

// Backward compatible cache
export const zerionCache = {
  get: <T>(key: string): T | null => {
    const cached = cacheService.cache.get(key);
    return (cached && cached.expires > Date.now()) ? cached.value : null;
  },
  set: (key: string, value: any, ttl: number = 300000) => {
    cacheService.set(key, value, { ttl: ttl / 1000 });
  },
  has: (key: string) => cacheService.has(key),
  delete: (key: string) => cacheService.delete(key),
  clear: () => cacheService.invalidateByTag('zerion'),
  size: () => cacheService.cache.size,
};