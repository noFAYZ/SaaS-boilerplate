
import { JsonRpcProvider } from 'ethers';
import React from 'react';

/**
 * ENS Resolution Service
 * Handles ENS domain <-> address resolution with caching and fallbacks
 */
export class ENSResolver {
  private static instance: ENSResolver;
  private provider: JsonRpcProvider;
  private cache = new Map<string, { result: string | null; timestamp: number }>();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_SIZE = 1000;

  // Multiple providers for redundancy
  private providers = [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com',
    'https://eth.drpc.org'
  ];
  private currentProviderIndex = 0;

  constructor() {
    this.provider = new JsonRpcProvider(this.providers[0]);
  }

  static getInstance(): ENSResolver {
    if (!ENSResolver.instance) {
      ENSResolver.instance = new ENSResolver();
    }
    return ENSResolver.instance;
  }

  /**
   * Validate ENS domain format
   */
  isValidENS(name: string): boolean {
    return /^[a-zA-Z0-9\-_]+\.eth$/.test(name.toLowerCase());
  }

  /**
   * Validate Ethereum address format
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Resolve ENS domain to address
   */
  async resolveENS(ensName: string): Promise<string | null> {
    if (!this.isValidENS(ensName)) {
      throw new Error('Invalid ENS domain format');
    }

    const normalizedName = ensName.toLowerCase();
    
    // Check cache first
    const cached = this.getFromCache(`ens_${normalizedName}`);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const address = await this.resolveWithRetry(normalizedName);
      
      // Cache the result
      this.setCache(`ens_${normalizedName}`, address);
      
      return address;
    } catch (error) {
      console.error('ENS resolution failed:', error);
      // Cache null result to prevent repeated failures
      this.setCache(`ens_${normalizedName}`, null);
      return null;
    }
  }

  /**
   * Reverse resolve address to ENS domain
   */
  async reverseResolve(address: string): Promise<string | null> {
    if (!this.isValidAddress(address)) {
      throw new Error('Invalid Ethereum address format');
    }

    const normalizedAddress = address.toLowerCase();
    
    // Check cache first
    const cached = this.getFromCache(`reverse_${normalizedAddress}`);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const ensName = await this.reverseResolveWithRetry(normalizedAddress);
      
      // Verify the reverse resolution by resolving it back
      if (ensName) {
        const verificationAddress = await this.resolveENS(ensName);
        if (verificationAddress?.toLowerCase() !== normalizedAddress) {
          // Reverse resolution doesn't match, cache null
          this.setCache(`reverse_${normalizedAddress}`, null);
          return null;
        }
      }
      
      // Cache the result
      this.setCache(`reverse_${normalizedAddress}`, ensName);
      
      return ensName;
    } catch (error) {
      console.error('Reverse ENS resolution failed:', error);
      // Cache null result to prevent repeated failures
      this.setCache(`reverse_${normalizedAddress}`, null);
      return null;
    }
  }

  /**
   * Get ENS avatar for a domain
   */
  async getENSAvatar(ensName: string): Promise<string | null> {
    if (!this.isValidENS(ensName)) {
      return null;
    }

    const normalizedName = ensName.toLowerCase();
    
    // Check cache first
    const cached = this.getFromCache(`avatar_${normalizedName}`);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const avatar = await this.getAvatarWithRetry(normalizedName);
      
      // Cache the result
      this.setCache(`avatar_${normalizedName}`, avatar);
      
      return avatar;
    } catch (error) {
      console.error('ENS avatar resolution failed:', error);
      this.setCache(`avatar_${normalizedName}`, null);
      return null;
    }
  }

  /**
   * Get comprehensive ENS data (address, avatar, text records)
   */
  async getENSData(ensName: string): Promise<{
    address: string | null;
    avatar: string | null;
    description: string | null;
    twitter: string | null;
    github: string | null;
    email: string | null;
    url: string | null;
  }> {
    if (!this.isValidENS(ensName)) {
      throw new Error('Invalid ENS domain format');
    }

    const normalizedName = ensName.toLowerCase();
    
    // Check cache first
    const cached = this.getFromCache(`data_${normalizedName}`);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const [address, avatar, description, twitter, github, email, url] = await Promise.allSettled([
        this.resolveENS(ensName),
        this.getENSAvatar(ensName),
        this.getTextRecord(ensName, 'description'),
        this.getTextRecord(ensName, 'com.twitter'),
        this.getTextRecord(ensName, 'com.github'),
        this.getTextRecord(ensName, 'email'),
        this.getTextRecord(ensName, 'url')
      ]);

      const data = {
        address: address.status === 'fulfilled' ? address.value : null,
        avatar: avatar.status === 'fulfilled' ? avatar.value : null,
        description: description.status === 'fulfilled' ? description.value : null,
        twitter: twitter.status === 'fulfilled' ? twitter.value : null,
        github: github.status === 'fulfilled' ? github.value : null,
        email: email.status === 'fulfilled' ? email.value : null,
        url: url.status === 'fulfilled' ? url.value : null,
      };

      // Cache the result
      this.setCache(`data_${normalizedName}`, data);
      
      return data;
    } catch (error) {
      console.error('ENS data resolution failed:', error);
      const emptyData = {
        address: null,
        avatar: null,
        description: null,
        twitter: null,
        github: null,
        email: null,
        url: null,
      };
      this.setCache(`data_${normalizedName}`, emptyData);
      return emptyData;
    }
  }

  /**
   * Get text record for ENS domain
   */
  async getTextRecord(ensName: string, key: string): Promise<string | null> {
    if (!this.isValidENS(ensName)) {
      return null;
    }

    try {
      const text = await this.provider.getResolver(ensName.toLowerCase())
        .then(resolver => resolver?.getText(key) || null);
      return text;
    } catch (error) {
      console.error(`ENS text record ${key} resolution failed:`, error);
      return null;
    }
  }

  /**
   * Batch resolve multiple ENS domains
   */
  async batchResolveENS(ensNames: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    
    // Process in batches to avoid overwhelming the provider
    const batchSize = 10;
    for (let i = 0; i < ensNames.length; i += batchSize) {
      const batch = ensNames.slice(i, i + batchSize);
      const batchPromises = batch.map(async (ensName) => {
        try {
          const address = await this.resolveENS(ensName);
          return { ensName, address };
        } catch (error) {
          return { ensName, address: null };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.set(result.value.ensName, result.value.address);
        }
      });

      // Add small delay between batches
      if (i + batchSize < ensNames.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Batch reverse resolve multiple addresses
   */
  async batchReverseResolve(addresses: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();
    
    const batchSize = 10;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const batchPromises = batch.map(async (address) => {
        try {
          const ensName = await this.reverseResolve(address);
          return { address, ensName };
        } catch (error) {
          return { address, ensName: null };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.set(result.value.address, result.value.ensName);
        }
      });

      // Add small delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  // Private helper methods

  private async resolveWithRetry(ensName: string, maxRetries = 3): Promise<string | null> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const address = await this.provider.resolveName(ensName);
        return address;
      } catch (error) {
        console.warn(`ENS resolution attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries - 1) {
          // Switch to next provider
          this.switchProvider();
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    throw new Error(`Failed to resolve ENS after ${maxRetries} attempts`);
  }

  private async reverseResolveWithRetry(address: string, maxRetries = 3): Promise<string | null> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const ensName = await this.provider.lookupAddress(address);
        return ensName;
      } catch (error) {
        console.warn(`Reverse ENS resolution attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries - 1) {
          this.switchProvider();
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    throw new Error(`Failed to reverse resolve ENS after ${maxRetries} attempts`);
  }

  private async getAvatarWithRetry(ensName: string, maxRetries = 3): Promise<string | null> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const avatar = await this.provider.getAvatar(ensName);
        return avatar;
      } catch (error) {
        console.warn(`ENS avatar resolution attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries - 1) {
          this.switchProvider();
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    throw new Error(`Failed to resolve ENS avatar after ${maxRetries} attempts`);
  }

  private switchProvider(): void {
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
    this.provider = new JsonRpcProvider(this.providers[this.currentProviderIndex]);
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return undefined;
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return undefined;
    }
    
    return cached.result;
  }

  private setCache(key: string, result: any): void {
    // Implement LRU eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for actual hit rate
    };
  }
}

// Export singleton instance
export const ensResolver = ENSResolver.getInstance();

// Utility functions for easy use
export const resolveENS = (ensName: string) => ensResolver.resolveENS(ensName);
export const reverseResolveENS = (address: string) => ensResolver.reverseResolve(address);
export const getENSAvatar = (ensName: string) => ensResolver.getENSAvatar(ensName);
export const getENSData = (ensName: string) => ensResolver.getENSData(ensName);
export const isValidENS = (name: string) => ensResolver.isValidENS(name);
export const isValidAddress = (address: string) => ensResolver.isValidAddress(address);

// React Hook for ENS resolution
export const useENSResolution = (input: string) => {
  const [data, setData] = React.useState<{
    address: string | null;
    ensName: string | null;
    avatar: string | null;
    isLoading: boolean;
    error: string | null;
  }>({
    address: null,
    ensName: null,
    avatar: null,
    isLoading: false,
    error: null
  });

  React.useEffect(() => {
    if (!input) {
      setData(prev => ({ ...prev, address: null, ensName: null, avatar: null }));
      return;
    }

    const resolve = async () => {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        if (isValidENS(input)) {
          // Resolve ENS to address
          const address = await resolveENS(input);
          const avatar = await getENSAvatar(input);
          setData({
            address,
            ensName: input,
            avatar,
            isLoading: false,
            error: null
          });
        } else if (isValidAddress(input)) {
          // Reverse resolve address to ENS
          const ensName = await reverseResolveENS(input);
          const avatar = ensName ? await getENSAvatar(ensName) : null;
          setData({
            address: input,
            ensName,
            avatar,
            isLoading: false,
            error: null
          });
        } else {
          setData({
            address: null,
            ensName: null,
            avatar: null,
            isLoading: false,
            error: 'Invalid ENS domain or Ethereum address'
          });
        }
      } catch (error) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Resolution failed'
        }));
      }
    };

    resolve();
  }, [input]);

  return data;
};