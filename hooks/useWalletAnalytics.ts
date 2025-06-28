// hooks/useWalletAnalytics.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { zerionSDK } from '@/lib/zerion';
import { getUniqueChains, isValidAddress } from '@/lib/wallet-analytics/utils';
import type { PortfolioData, WalletPosition, NFTPosition, Transaction } from '@/lib/wallet-analytics/types';

interface UseWalletAnalyticsOptions {
  address: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseWalletAnalyticsReturn {
  portfolioData: PortfolioData;
  availableChains: string[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const useWalletAnalytics = ({
  address,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}: UseWalletAnalyticsOptions): UseWalletAnalyticsReturn => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({});
  const [availableChains, setAvailableChains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolioData = useCallback(async (isRefresh = false) => {
    if (!isValidAddress(address)) {
      setError('Invalid wallet address');
      setIsLoading(false);
      return;
    }
    
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    setError(null);
    
    try {
      const [portfolio, positions, pnl] = await Promise.all([
        zerionSDK.wallets.getPortfolio(address),
        zerionSDK.wallets.getPositions(address, { 
          filter: { trash: 'only_non_trash' },
          page: { size: 100 }
        }),
        //zerionSDK.wallets.getPnL(address).catch(() => null) 
      ]);
      
      const chains = getUniqueChains(positions.data || []);
      
      setPortfolioData({
        portfolio: portfolio.data?.attributes,
        positions: positions.data,
        pnl: "pnl?.data?.attributes"
      });
      
      setAvailableChains(chains);
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      setError('Failed to load portfolio data. Please check the address and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [address]);

  const refresh = useCallback(() => loadPortfolioData(true), [loadPortfolioData]);

  useEffect(() => {
    if (address) {
      loadPortfolioData();
    }
  }, [address, loadPortfolioData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !address) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, address, refresh]);

  return {
    portfolioData,
    availableChains,
    isLoading,
    error,
    refresh,
    isRefreshing
  };
};

// Hook for fetching specific wallet positions
export const useWalletPositions = (address: string, selectedChain = 'all') => {
  const [positions, setPositions] = useState<WalletPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPositions = useCallback(async () => {
    if (!isValidAddress(address)) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          trash: 'only_non_trash' as const,
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        sort: 'value' as const,
        page: { size: 50 }
      };
      
      const response = await zerionSDK.wallets.getPositions(address, filters);
      setPositions(response.data || []);
    } catch (err) {
      console.error('Failed to load positions:', err);
      setError('Failed to load positions');
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  return { positions, isLoading, error, refresh: loadPositions };
};

// Hook for fetching NFTs
export const useWalletNFTs = (address: string, selectedChain = 'all') => {
  const [nfts, setNfts] = useState<NFTPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNFTs = useCallback(async () => {
    if (!isValidAddress(address)) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        sort: 'created_at' as const,
        page: { size: 50 }
      };
      
      const response = await zerionSDK.wallets.getNFTPositions(address, filters);
      const nftData = (response.data || []).filter(nft => !nft.attributes?.nft_info?.flags?.is_spam);
      setNfts(nftData);
    } catch (err) {
      console.error('Failed to load NFTs:', err);
      setError('Failed to load NFTs');
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return { nfts, isLoading, error, refresh: loadNFTs };
};

// Hook for fetching transactions
export const useWalletTransactions = (address: string, selectedChain = 'all') => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!isValidAddress(address)) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        page: { size: 20 }
      };
      
      const response = await zerionSDK.wallets.getTransactions(address, filters);
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return { transactions, isLoading, error, refresh: loadTransactions };
};