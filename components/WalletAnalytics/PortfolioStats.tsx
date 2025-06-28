// components/WalletAnalytics/PortfolioStats.tsx
'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/card';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Coins, 
  Globe, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, getUniqueChains } from '@/lib/wallet-analytics/utils';
import { ANIMATION_DELAYS } from '@/lib/wallet-analytics/constants';
import type { PortfolioData } from '@/lib/wallet-analytics/types';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  color: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  subtitle, 
  icon: Icon, 
  color, 
  index 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * ANIMATION_DELAYS.STATS_CARD }}
  >
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-default-500 uppercase tracking-wide">{title}</p>
            <p className="text-lg font-semibold">{value}</p>
            {change !== undefined ? (
              <div className={`flex items-center gap-1 text-[10px] ${
                change >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {change >= 0 ? 
                  <ArrowUpRight className="w-3 h-3" /> : 
                  <ArrowDownRight className="w-3 h-3" />
                }
                {Math.abs(change).toFixed(2)}%
              </div>
            ) : (
              subtitle && <p className="text-[10px] text-default-400">{subtitle}</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  </motion.div>
);

interface PortfolioStatsProps {
  portfolioData: PortfolioData;
  showBalance: boolean;
}

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({ 
  portfolioData, 
  showBalance 
}) => {
  const uniqueChains = getUniqueChains(portfolioData.positions || []);

  const stats = [
    {
      title: 'Total Value',
      value: formatCurrency(portfolioData.portfolio?.total, showBalance),
      change: portfolioData.portfolio?.changes?.percent_1d,
      icon: DollarSign,
      color: 'emerald'
    },
    {
      title: 'Assets',
      value: (portfolioData.positions?.length || 0).toString(),
      subtitle: 'Positions',
      icon: Coins,
      color: 'blue'
    },
    {
      title: 'Networks',
      value: uniqueChains.length.toString(),
      subtitle: 'Chains',
      icon: Globe,
      color: 'purple'
    },
    {
      title: 'P&L',
      value: formatCurrency(portfolioData.pnl?.unrealized_gain, showBalance),
      subtitle: 'Unrealized',
      icon: TrendingUp,
      color: 'amber'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  );
};