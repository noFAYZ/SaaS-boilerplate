// components/WalletAnalytics/TransactionsList.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from '@heroui/spinner';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Activity, 
  Send, 
  Download, 
  Repeat, 
  ArrowDownRight, 
  ArrowUpRight,
  Target,
  ExternalLink
} from 'lucide-react';
import { zerionSDK } from '@/lib/zerion';
import { SUPPORTED_CHAINS, ANIMATION_DELAYS, DEFAULT_PAGE_SIZE } from '@/lib/wallet-analytics/constants';
import { formatCurrency, formatTimeAgo, openEtherscan } from '@/lib/wallet-analytics/utils';
import type { Transaction } from '@/lib/wallet-analytics/types';

interface TransactionsListProps {
  address: string;
  selectedChain: string;
  showBalance: boolean;
}

interface TransactionTypeConfig {
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  text: string;
}

const getTypeConfig = (type: string): TransactionTypeConfig => {
  switch (type) {
    case 'send': 
      return { 
        icon: Send, 
        color: 'warning',
        bg: 'bg-warning/10',
        text: 'text-warning'
      };
    case 'receive': 
      return { 
        icon: Download, 
        color: 'success',
        bg: 'bg-success/10',
        text: 'text-success'
      };
    case 'trade': 
    case 'swap': 
      return { 
        icon: Repeat, 
        color: 'primary',
        bg: 'bg-primary/10',
        text: 'text-primary'
      };
    case 'deposit': 
      return {
        icon: ArrowDownRight,
        color: 'secondary',
        bg: 'bg-secondary/10',
        text: 'text-secondary'
      };
    case 'withdraw': 
      return {
        icon: ArrowUpRight,
        color: 'danger',
        bg: 'bg-danger/10',
        text: 'text-danger'
      };
    default: 
      return { 
        icon: Activity, 
        color: 'default',
        bg: 'bg-default-100',
        text: 'text-default-600'
      };
  }
};

export const TransactionsList: React.FC<TransactionsListProps> = ({ 
  address, 
  selectedChain, 
  showBalance 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!address) return;
    
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
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleOpenEtherscan = (hash: string) => {
    openEtherscan(hash, 'tx');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-sm text-default-500">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <p className="text-danger mb-4">{error}</p>
        <Button color="danger" variant="flat" onPress={loadTransactions}>
          Retry
        </Button>
      </div>
    );
  }
 
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-default-100 flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-default-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
        <p className="text-sm text-default-500 max-w-sm mx-auto">
          Transaction history will appear here once available.
        </p>
      </div>
    );
  }
 
  return (
    <div className="space-y-2">
      {transactions.map((tx, index) => {
        const operationType = tx.attributes?.operation_type || 'unknown';
        const value = tx.attributes?.value || 0;
        const minedAt = tx.attributes?.mined_at;
        const hash = tx.attributes?.hash;
        const config = getTypeConfig(operationType);
        const gasFee = tx.attributes?.fee?.value || 0;
        const chainId = tx.relationships?.chain?.data?.id;
        const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
        const IconComponent = config.icon;
 
        return (
          <motion.div
            key={tx.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * ANIMATION_DELAYS.CHART_ITEM, duration: 0.3 }}
            className={`p-3 rounded-xl ${config.bg} border border-default-200 hover:border-default-300 transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center ${config.text}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm capitalize truncate">
                    {operationType.replace('_', ' ')}
                  </h4>
                  {chainInfo && (
                    <Badge size="sm" variant="flat" className="text-xs">
                      {chainInfo.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-default-500">
                  <span>
                    {minedAt ? formatTimeAgo(minedAt) : 'Pending'}
                  </span>
                  {gasFee > 0 && (
                    <>
                      <span>•</span>
                      <span>Gas: {formatCurrency(gasFee, showBalance)}</span>
                    </>
                  )}
                  {hash && (
                    <>
                      <span>•</span>
                      <Button
                        size="sm"
                        variant="light"
                        className="h-4 px-1 text-xs"
                        onPress={() => handleOpenEtherscan(hash)}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-sm">{formatCurrency(value, showBalance)}</p>
                <div className="flex items-center justify-end gap-1 text-xs text-success">
                  <Target className="w-3 h-3" />
                  <span>Confirmed</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};