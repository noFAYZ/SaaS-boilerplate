// lib/cache/CacheService.ts
import { logger } from '@/lib/logger/Logger';

interface CacheEntry {
  value: any;
  expires: number;
  tags: string[];
}

class CacheService {
  private cache = new Map<string, CacheEntry>();

  constructor() {
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = this.cache.get(key);
      
      if (!cached || cached.expires <= Date.now()) {
        if (cached) this.cache.delete(key);
        return null;
      }

      return cached.value;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, options: { ttl?: number; tags?: string[] } = {}): Promise<void> {
    const { ttl = 300, tags = [] } = options; // Default 5 minutes
    
    try {
      this.cache.set(key, {
        value,
        expires: Date.now() + (ttl * 1000),
        tags
      });
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidateByTag(tag: string): Promise<void> {
    for (const [key, cached] of this.cache.entries()) {
      if (cached.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? cached.expires > Date.now() : false;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (cached.expires <= now) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();

// Helper function for caching patterns
export const withCache = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; tags?: string[] } = {}
): Promise<T> => {
  const cached = await cacheService.get<T>(key);
  if (cached !== null) return cached;

  const value = await fetcher();
  await cacheService.set(key, value, options);
  return value;
};

// Cache key helpers
export const cacheKey = {
  wallet: (address: string) => `wallet:${address}`,
  portfolio: (address: string) => `portfolio:${address}`,
  tokens: (query: string, limit: number) => `tokens:${query}:${limit}`,
  user: (id: string) => `user:${id}`,
};