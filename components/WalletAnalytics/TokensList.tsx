// components/WalletAnalytics/TokensList.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from '@heroui/spinner';
import { Badge } from '@heroui/badge';
import { Button } from '@heroui/button';
import { motion } from 'framer-motion';
import { AlertCircle, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { zerionSDK } from '@/lib/zerion';
import { SUPPORTED_CHAINS, ANIMATION_DELAYS, DEFAULT_PAGE_SIZE } from '@/lib/wallet-analytics/constants';
import { formatCurrency, formatNumber } from '@/lib/wallet-analytics/utils';
import type { WalletPosition } from '@/lib/wallet-analytics/types';

interface TokensListProps {
  address: string;
  selectedChain: string;
  showBalance: boolean;
}

export const TokensList: React.FC<TokensListProps> = ({ 
  address, 
  selectedChain, 
  showBalance 
}) => {
  const [tokens, setTokens] = useState<WalletPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          trash: 'only_non_trash' as const,
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        sort: 'value' as const,
        page: { size: DEFAULT_PAGE_SIZE }
      };
      
      const response = await zerionSDK.wallets.getPositions(address, filters);
      setTokens(response.data || []);
    } catch (err) {
      console.error('Failed to load tokens:', err);
      setError('Failed to load tokens');
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-sm text-default-500">Loading positions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <p className="text-danger mb-4">{error}</p>
        <Button color="danger" variant="flat" onPress={loadTokens}>
          Retry
        </Button>
      </div>
    );
  }
 
  if (tokens.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-default-100 flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8 text-default-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No positions found</h3>
        <p className="text-sm text-default-500 max-w-sm mx-auto">
          This wallet doesn't have any positions on the selected network.
        </p>
      </div>
    );
  }

  const totalValue = tokens.reduce((sum, token) => sum + (token.attributes?.value || 0), 0);
 
  return (
    <div className="space-y-2">
      {tokens.map((position, index) => {
        const value = position.attributes?.value || 0;
        const quantity = position.attributes?.quantity_float || 0;
        const symbol = position.attributes?.fungible_info?.symbol || 'Unknown';
        const name = position.attributes?.fungible_info?.name || 'Unknown Asset';
        const chainId = position.relationships?.chain?.data?.id || '';
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
        const change24h = position.attributes?.changes?.percent_1d || 0;
        
        return (
          <motion.div
            key={position.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * ANIMATION_DELAYS.CHART_ITEM, duration: 0.3 }}
            className="p-3 rounded-xl bg-default-50 hover:bg-default-100 border border-default-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold">
                  {symbol.slice(0, 2)}
                </div>
                {chainInfo && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border border-default-200 flex items-center justify-center text-xs">
                    {chainInfo.icon}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{symbol}</h4>
                  <Badge size="sm" variant="flat" className="text-xs">
                    {position.attributes?.position_type || 'wallet'}
                  </Badge>
                  {chainInfo && (
                    <Badge size="sm" variant="flat" color="secondary" className="text-xs">
                      {chainInfo.name}
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-default-500 mb-1 truncate">{name}</p>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-default-600 font-medium">
                    {formatNumber(quantity, showBalance)} {symbol}
                  </span>
                  <div className="flex-1 max-w-16">
                    <div className="w-full bg-default-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-500 ${
                          percentage > 20 ? 'bg-warning' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-default-400 font-medium">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-sm">{formatCurrency(value, showBalance)}</p>
                <div className={`flex items-center justify-end gap-1 text-xs ${
                  change24h >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {change24h >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span>{change24h >= 0 ? '+' : ''}{change24h.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};