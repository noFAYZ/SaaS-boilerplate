// components/WalletAnalytics/ChainDistribution.tsx
'use client';

import React, { useMemo } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Badge } from '@heroui/badge';
import { Progress } from '@heroui/progress';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { SUPPORTED_CHAINS, ANIMATION_DELAYS } from '@/lib/wallet-analytics/constants';
import { formatCurrency } from '@/lib/wallet-analytics/utils';
import type { WalletPosition } from '@/lib/wallet-analytics/types';

interface ChainData {
  chainId: string;
  name: string;
  value: number;
  count: number;
  color: string;
  percentage: number;
}

interface ChainDistributionProps {
  positions: WalletPosition[];
  showBalance: boolean;
}

export const ChainDistribution: React.FC<ChainDistributionProps> = ({ 
  positions, 
  showBalance 
}) => {
  const chainData = useMemo<ChainData[]>(() => {
    if (!positions) return [];
    
    const chains: Record<string, Omit<ChainData, 'percentage'>> = {};
    let totalValue = 0;
    
    positions.forEach(position => {
      const chainId = position.relationships?.chain?.data?.id || 'unknown';
      const value = position.attributes?.value || 0;
      totalValue += value;
      
      if (!chains[chainId]) {
        const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
        chains[chainId] = {
          chainId,
          name: chainInfo?.name || chainId,
          value: 0,
          count: 0,
          color: chainInfo?.color || '#6B7280'
        };
      }
      chains[chainId].value += value;
      chains[chainId].count += 1;
    });
    
    return Object.values(chains)
      .map(data => ({
        ...data,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [positions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-lg font-semibold">Network Distribution</h3>
            <p className="text-sm text-default-500">Assets across chains</p>
          </div>
          <Badge variant="flat" color="primary">
            {chainData.length} chains
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        {chainData.length > 0 ? (
          <div className="space-y-4">
            {chainData.map((chain, index) => (
              <motion.div 
                key={chain.chainId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * ANIMATION_DELAYS.CHART_ITEM }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: chain.color }}
                    />
                    <div>
                      <span className="text-sm font-medium">{chain.name}</span>
                      <p className="text-xs text-default-500">
                        {chain.count} position{chain.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(chain.value, showBalance)}
                    </p>
                    <p className="text-xs text-default-500">
                      {chain.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress
                  value={chain.percentage}
                  className="max-w-full"
                  color="primary"
                  size="sm"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Globe className="w-8 h-8 text-default-400 mx-auto mb-2" />
            <p className="text-default-500">No chain data available</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};