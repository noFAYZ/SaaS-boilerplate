// components/Wallets/PortfolioSummaryHeader.tsx - Portfolio overview header
'use client';

import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Progress } from '@heroui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Activity,
  Coins,
  PieChart,
  BarChart3,
  Users,
  Crown,
  Shield,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { SolarWalletOutline } from '@/components/icons/icons';

interface PortfolioSummaryHeaderProps {
  portfolioOverview: {
    totalValue: number;
    totalChange: number;
    totalWallets: number;
    positiveWallets: number;
    totalPositions: number;
    highValueWallets: number;
  };
  showBalance: boolean;
  onToggleBalance: () => void;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

export function PortfolioSummaryHeader({
  portfolioOverview,
  showBalance,
  onToggleBalance,
  formatCurrency,
  formatPercent
}: PortfolioSummaryHeaderProps) {
  const totalChangePercent = portfolioOverview.totalValue > 0 
    ? (portfolioOverview.totalChange / portfolioOverview.totalValue) * 100 
    : 0;
  
  const isPositiveTrend = totalChangePercent >= 0;
  const positiveTrendPercentage = portfolioOverview.totalWallets > 0 
    ? (portfolioOverview.positiveWallets / portfolioOverview.totalWallets) * 100 
    : 0;

  const stats = [
    {
      label: 'Total Portfolio Value',
      value: formatCurrency(portfolioOverview.totalValue),
      change: formatPercent(totalChangePercent),
      icon: DollarSign,
      color: 'primary',
      isPositive: isPositiveTrend,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Active Wallets',
      value: portfolioOverview.totalWallets.toString(),
      change: `${portfolioOverview.positiveWallets} profitable`,
      icon: SolarWalletOutline,
      color: 'secondary',
      progress: positiveTrendPercentage,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Total Positions',
      value: portfolioOverview.totalPositions.toString(),
      change: `${portfolioOverview.highValueWallets} high-value`,
      icon: Coins,
      color: 'warning',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      label: '24h Performance',
      value: formatPercent(totalChangePercent),
      change: formatCurrency(portfolioOverview.totalChange),
      icon: isPositiveTrend ? TrendingUp : TrendingDown,
      color: isPositiveTrend ? 'success' : 'danger',
      isPositive: isPositiveTrend,
      gradient: isPositiveTrend ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="relative overflow-hidden border-default-200 hover:shadow-lg transition-all duration-300"
        >
          <CardBody className="p-6">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                
                {index === 0 && (
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={onToggleBalance}
                    className="text-default-400 hover:text-default-600"
                  >
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-default-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-default-900">
                    {stat.value}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    {typeof stat.isPositive === 'boolean' && (
                      <div className={`flex items-center gap-1 ${
                        stat.isPositive ? 'text-success' : 'text-danger'
                      }`}>
                        {stat.isPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                      </div>
                    )}
                    
                    <p className={`text-sm font-medium ${
                      typeof stat.isPositive === 'boolean'
                        ? stat.isPositive ? 'text-success' : 'text-danger'
                        : 'text-default-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>

                  {typeof stat.progress === 'number' && (
                    <div className="pt-2">
                      <Progress 
                        value={stat.progress} 
                        color={stat.color as any}
                        className="h-1.5"
                        classNames={{
                          track: "bg-default-200",
                          indicator: `bg-gradient-to-r ${stat.gradient}`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-white/5" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}