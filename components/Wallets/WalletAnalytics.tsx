// components/Wallets/WalletAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Tabs, Tab } from '@heroui/tabs';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';
import { Badge } from '@heroui/badge';
import { Spinner } from '@heroui/spinner';
import { useWallets } from '@/contexts/WalletContext';
import { WalletData, zerionUtils } from '@/lib/zerion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity,
  Layers,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  ExternalLink,
  Copy,
  Clock,
  Target,
  Zap,
  BarChart3,
  Globe,
  Coins
} from 'lucide-react';

interface WalletAnalyticsProps {
  address: string;
}

export function WalletAnalytics({ address }: WalletAnalyticsProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [refreshing, setRefreshing] = useState(false);
  
  const { actions } = useWallets();

  useEffect(() => {
    loadWalletData();
  }, [address, selectedPeriod]);

  const loadWalletData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [analytics, chart] = await Promise.all([
        actions.getWalletAnalytics(address),
        zerionUtils.getWalletChart(address, selectedPeriod)
      ]);
      
      setWalletData(analytics);
     
      setChartData(chart);
    } catch (err) {
      setError('Failed to load wallet analytics');
      console.error('Error loading wallet analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadWalletData();
    } finally {
      setRefreshing(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  const openInEtherscan = () => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  if (isLoading) {
    return <WalletAnalyticsSkeleton />;
  }

  if (error || !walletData) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Analytics</h3>
          <p className="text-default-500 mb-4">{error}</p>
          <Button color="primary" onPress={refreshData}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-default-500 font-mono text-sm">
              {address.slice(0, 8)}...{address.slice(-6)}
            </p>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={copyAddress}
              className="text-default-400 hover:text-default-600"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={openInEtherscan}
              className="text-default-400 hover:text-default-600"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="flat" color="success" className="text-xs">
            Live Data
          </Badge>
          <Button
            variant="flat"
            startContent={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onPress={refreshData}
            isDisabled={refreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Total Value"
          value={walletData.portfolio?.total || 0}
          change={walletData.portfolio?.changes?.absolute_1d || 0}
          changePercent={walletData.portfolio?.changes?.percent_1d || 0}
          icon={<DollarSign className="w-5 h-5" />}
          format="currency"
          trend="24h"
        />
        
        <OverviewCard
          title="Unrealized P&L"
          value={walletData.pnl?.unrealized_gain || 0}
          change={walletData.pnl?.realized_gain || 0}
          icon={<TrendingUp className="w-5 h-5" />}
          format="currency"
          trend="All Time"
        />
        
        <OverviewCard
          title="Active Positions"
          value={walletData.positions?.length || 0}
          subValue={`${getPositionTypes(walletData.positions || []).length} types`}
          icon={<PieChart className="w-5 h-5" />}
          format="number"
        />
        
        <OverviewCard
          title="Blockchain Networks"
          value={getUniqueChains(walletData.positions || [])}
          subValue={`${getTotalProtocols(walletData.positions || [])} protocols`}
          icon={<Layers className="w-5 h-5" />}
          format="number"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs aria-label="Wallet analytics" className="w-full">
        <Tab 
          key="overview" 
          title={
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </div>
          }
        >
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PortfolioChart 
                data={chartData} 
                period={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                totalValue={walletData.portfolio?.total || 0}
              />
              <ChainDistribution positions={walletData.positions || []} />
            </div>
            
            <PerformanceMetrics 
              portfolio={walletData.portfolio}
              pnl={walletData.pnl}
            />
            
            <TopPositions positions={walletData.positions || []} />
          </div>
        </Tab>
        
        <Tab 
          key="positions" 
          title={
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              <span>Positions</span>
              <Badge size="sm" variant="flat">
                {walletData.positions?.length || 0}
              </Badge>
            </div>
          }
        >
          <div className="mt-6">
            <PositionsTable positions={walletData.positions || []} />
          </div>
        </Tab>
        
        <Tab 
          key="transactions" 
          title={
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Activity</span>
            </div>
          }
        >
          <div className="mt-6">
            <TransactionHistory address={address} />
          </div>
        </Tab>
        
        <Tab 
          key="nfts" 
          title={
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>NFTs</span>
              {walletData.nftPortfolio && (
                <Badge size="sm" variant="flat" color="secondary">
                  {walletData.nftPortfolio.total_count || 0}
                </Badge>
              )}
            </div>
          }
        >
          <div className="mt-6">
            <NFTPortfolio nftData={walletData.nftPortfolio} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

// Overview Card Component
interface OverviewCardProps {
  title: string;
  value: number;
  change?: number;
  changePercent?: number;
  subValue?: string;
  icon: React.ReactNode;
  format: 'currency' | 'number' | 'percent';
  trend?: string;
}

function OverviewCard({ 
  title, 
  value, 
  change, 
  changePercent, 
  subValue, 
  icon, 
  format, 
  trend 
}: OverviewCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: val > 1000 ? 0 : 2
        }).format(val);
      case 'percent':
        return `${val.toFixed(2)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositive = (change || 0) >= 0;
  const hasChange = change !== undefined;

  return (
    <Card className="border border-default-200 hover:shadow-lg transition-shadow">
      <CardBody className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2.5 rounded-xl bg-primary-500/10">
            <div className="text-primary-500">
              {icon}
            </div>
          </div>
          {trend && (
            <Badge variant="flat" color="default" className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-medium text-default-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold leading-tight">
            {formatValue(value)}
          </p>
          
          {hasChange && (
            <div className={`flex items-center gap-1.5 text-sm ${
              isPositive ? 'text-success' : 'text-danger'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className="font-medium">
                {formatValue(Math.abs(change))}
              </span>
              {changePercent !== undefined && (
                <span className="font-medium">
                  ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
          
          {subValue && (
            <p className="text-xs text-default-400 mt-1">
              {subValue}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Portfolio Chart Component
interface PortfolioChartProps {
  data: any;
  period: 'day' | 'week' | 'month';
  onPeriodChange: (period: 'day' | 'week' | 'month') => void;
  totalValue: number;
}

function PortfolioChart({ data, period, onPeriodChange, totalValue }: PortfolioChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  console.log(  data)

  return (
    <Card className="border border-default-200">
      <CardHeader className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-lg font-semibold">Portfolio Value</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'solid' : 'light'}
              color={period === p ? 'primary' : 'default'}
              onPress={() => onPeriodChange(p)}
              className="capitalize min-w-16"
            >
              {p === 'day' ? '1D' : p === 'week' ? '7D' : '30D'}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        {data ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary-600" />
              </div>
              <p className="text-sm font-medium text-default-700 mb-1">
                Chart Ready for Integration
              </p>
              <p className="text-xs text-default-500">
                {Array.isArray(data) ? data.length : 0} data points for {period}
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-default-400">
                <span>• Recharts</span>
                <span>• Chart.js</span>
                <span>• D3.js</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-default-400 mx-auto mb-2" />
              <p className="text-sm text-default-500">No chart data available</p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// Performance Metrics Component
interface PerformanceMetricsProps {
  portfolio: any;
  pnl: any;
}

function PerformanceMetrics({ portfolio, pnl }: PerformanceMetricsProps) {
  const metrics = [
    {
      label: 'All Time High',
      value: portfolio?.all_time_high || 0,
      format: 'currency',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      label: 'Total Fees Paid',
      value: pnl?.total_fee || 0,
      format: 'currency',
      icon: <Zap className="w-4 h-4" />
    },
    {
      label: 'Net Investment',
      value: pnl?.net_invested || 0,
      format: 'currency',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      label: 'Realized Gains',
      value: pnl?.realized_gain || 0,
      format: 'currency',
      icon: <Target className="w-4 h-4" />
    }
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    return value.toLocaleString();
  };

  return (
    <Card className="border border-default-200">
      <CardHeader>
        <h3 className="text-lg font-semibold">Performance Metrics</h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-default-50">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                  {metric.icon}
                </div>
              </div>
              <p className="text-lg font-bold">
                {formatValue(metric.value, metric.format)}
              </p>
              <p className="text-xs text-default-500 mt-1">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// Chain Distribution Component
function ChainDistribution({ positions }: { positions: any[] }) {
  const chainData = positions.reduce((acc, position) => {
    const chainId = position.relationships?.chain?.data?.id || 'unknown';
    const chainName = getChainName(chainId);
    const value = position.attributes?.value || 0;
    
    if (!acc[chainId]) {
      acc[chainId] = { name: chainName, value: 0, count: 0, color: getChainColor(chainId) };
    }
    acc[chainId].value += value;
    acc[chainId].count += 1;
    
    return acc;
  }, {} as Record<string, { name: string; value: number; count: number; color: string }>);

  const totalValue = Object.values(chainData).reduce((sum, chain) => sum + chain.value, 0);
  const sortedChains = Object.entries(chainData)
    .sort(([, a], [, b]) => b.value - a.value)
    .slice(0, 6);

  return (
    <Card className="border border-default-200">
      <CardHeader className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Chain Distribution</h3>
          <p className="text-sm text-default-500 mt-1">
            Assets across {Object.keys(chainData).length} networks
          </p>
        </div>
        <Badge variant="flat" color="primary">
          {Object.keys(chainData).length} chains
        </Badge>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {sortedChains.map(([chainId, data]) => {
            const percentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
            
            return (
              <div key={chainId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: data.color }}
                    />
                    <div>
                      <span className="text-sm font-medium">{data.name}</span>
                      <p className="text-xs text-default-500">
                        {data.count} position{data.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${data.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-default-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className="max-w-full"
                  color="primary"
                  size="sm"
                />
              </div>
            );
          })}
          
          {sortedChains.length === 0 && (
            <div className="text-center py-8">
              <Globe className="w-8 h-8 text-default-400 mx-auto mb-2" />
              <p className="text-default-500">No chain data available</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Top Positions Component
function TopPositions({ positions }: { positions: any[] }) {
  const topPositions = positions
    .filter(p => p.attributes?.value > 0)
    .sort((a, b) => (b.attributes?.value || 0) - (a.attributes?.value || 0))
    .slice(0, 10);

  return (
    <Card className="border border-default-200">
      <CardHeader className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Top Holdings</h3>
          <p className="text-sm text-default-500 mt-1">
            Your largest positions by value
          </p>
        </div>
        <Badge variant="flat" color="success">
          Top {topPositions.length}
        </Badge>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {topPositions.map((position, index) => {
            const symbol = position.attributes?.fungible_info?.symbol || '???';
            const name = position.attributes?.fungible_info?.name || 'Unknown Asset';
            const value = position.attributes?.value || 0;
            const quantity = position.attributes?.quantity_float || 0;
            const change = position.attributes?.changes?.percent_1d || 0;
            
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning-500 flex items-center justify-center">
                        <span className="text-xs text-white">★</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-base">{symbol}</p>
                      <Badge size="sm" variant="flat" color="default">
                        {getPositionType(position)}
                      </Badge>
                    </div>
                    <p className="text-sm text-default-500">{name}</p>
                    <p className="text-xs text-default-400">
                      {quantity.toFixed(4)} {symbol}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-base">
                    ${value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {change >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-danger" />
                    )}
                    <span className={`text-xs font-medium ${
                      change >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {topPositions.length === 0 && (
            <div className="text-center py-8">
              <Coins className="w-8 h-8 text-default-400 mx-auto mb-2" />
              <p className="text-default-500">No positions found</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Positions Table Component
function PositionsTable({ positions }: { positions: any[] }) {
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'name'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterChain, setFilterChain] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const chains = Array.from(new Set(positions.map(p => 
    p.relationships?.chain?.data?.id || 'unknown'
  )));

  const positionTypes = Array.from(new Set(positions.map(p => 
    getPositionType(p)
  )));

  const filteredPositions = positions.filter(position => {
    const chainMatch = filterChain === 'all' || 
      (position.relationships?.chain?.data?.id || 'unknown') === filterChain;
    const typeMatch = filterType === 'all' || 
      getPositionType(position) === filterType;
    
    return chainMatch && typeMatch;
  });

  const sortedPositions = [...filteredPositions].sort((a, b) => {
    let aVal, bVal;
    
    if (sortBy === 'value') {
      aVal = a.attributes?.value || 0;
      bVal = b.attributes?.value || 0;
    } else if (sortBy === 'change') {
      aVal = a.attributes?.changes?.percent_1d || 0;
      bVal = b.attributes?.changes?.percent_1d || 0;
    } else {
      aVal = a.attributes?.fungible_info?.name || '';
      bVal = b.attributes?.fungible_info?.name || '';
      return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
    }
    
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  return (
    <Card className="border border-default-200">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">All Positions</h3>
          <p className="text-sm text-default-500">
            {sortedPositions.length} of {positions.length} positions
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value)}
            className="px-3 py-1 text-sm border border-default-200 rounded-lg bg-background"
          >
            <option value="all">All Chains</option>
            {chains.map(chain => (
              <option key={chain} value={chain}>
                {getChainName(chain)}
              </option>
            ))}
          </select>
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 text-sm border border-default-200 rounded-lg bg-background"
          >
            <option value="all">All Types</option>
            {positionTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={sortBy === 'value' ? 'solid' : 'light'}
              onPress={() => setSortBy('value')}
            >
              Value
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'change' ? 'solid' : 'light'}
              onPress={() => setSortBy('change')}
            >
              Change
            </Button>
            <Button
              size="sm"
              variant="light"
              isIconOnly
              onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedPositions.map((position, index) => {
            const symbol = position.attributes?.fungible_info?.symbol || '???';
            const name = position.attributes?.fungible_info?.name || 'Unknown Asset';
            const value = position.attributes?.value || 0;
            const quantity = position.attributes?.quantity_float || 0;
            const change = position.attributes?.changes?.percent_1d || 0;
            const chainId = position.relationships?.chain?.data?.id || 'unknown';
            
            return (
            // components/Wallets/WalletAnalytics.tsx - Continued from previous file

            <div key={index} className="flex items-center justify-between p-3 border border-default-200 rounded-lg hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                {symbol.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{symbol}</p>
                  <Badge size="sm" variant="flat" color="default">
                    {getPositionType(position)}
                  </Badge>
                  <Badge size="sm" variant="flat" color="secondary">
                    {getChainName(chainId)}
                  </Badge>
                </div>
                <p className="text-sm text-default-500">{name}</p>
                <p className="text-xs text-default-400">
                  {quantity.toFixed(4)} {symbol}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-medium text-base">
                ${value.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 justify-end">
                {change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-danger" />
                )}
                <span className={`text-xs font-medium ${
                  change >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
      
      {sortedPositions.length === 0 && (
        <div className="text-center py-8">
          <Coins className="w-8 h-8 text-default-400 mx-auto mb-2" />
          <p className="text-default-500">No positions match the current filters</p>
        </div>
      )}
    </div>
  </CardBody>
</Card>
);
}

// Transaction History Component
function TransactionHistory({ address }: { address: string }) {
const [transactions, setTransactions] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
loadTransactions();
}, [address]);

const loadTransactions = async () => {
setIsLoading(true);
setError(null);

try {
  // In a real app, you'd use the Zerion SDK to fetch transactions
  // const txs = await zerionSDK.wallets.getTransactions(address, { 
  //   page: { size: 20 },
  //   filter: { operation_types: ['trade', 'send', 'receive', 'deposit', 'withdraw'] }
  // });
  // setTransactions(txs.data);
  
  // Mock data for demonstration
  const mockTransactions = [
    {
      id: '1',
      type: 'Swap',
      hash: '0x1234...5678',
      timestamp: '2 hours ago',
      amount: '+1,250 USDC',
      status: 'Success',
      fromToken: 'ETH',
      toToken: 'USDC',
      gasFee: '$12.50',
      protocol: 'Uniswap V3'
    },
    {
      id: '2',
      type: 'Deposit',
      hash: '0x2345...6789',
      timestamp: '1 day ago',
      amount: '+500 DAI',
      status: 'Success',
      fromToken: 'DAI',
      toToken: 'aDAI',
      gasFee: '$8.20',
      protocol: 'Aave'
    },
    {
      id: '3',
      type: 'Send',
      hash: '0x3456...7890',
      timestamp: '3 days ago',
      amount: '-0.5 ETH',
      status: 'Success',
      fromToken: 'ETH',
      toToken: 'ETH',
      gasFee: '$15.80',
      protocol: 'Transfer'
    }
  ];
  
  setTransactions(mockTransactions);
} catch (err) {
  setError('Failed to load transaction history');
  console.error('Error loading transactions:', err);
} finally {
  setIsLoading(false);
}
};

const getTransactionIcon = (type: string) => {
switch (type.toLowerCase()) {
  case 'swap':
    return <ArrowUpDown className="w-5 h-5" />;
  case 'deposit':
    return <TrendingUp className="w-5 h-5" />;
  case 'withdraw':
    return <TrendingDown className="w-5 h-5" />;
  case 'send':
    return <ArrowUpDown className="w-5 h-5" />;
  case 'receive':
    return <TrendingUp className="w-5 h-5" />;
  default:
    return <Activity className="w-5 h-5" />;
}
};

const getTransactionColor = (type: string) => {
switch (type.toLowerCase()) {
  case 'swap':
    return 'primary';
  case 'deposit':
  case 'receive':
    return 'success';
  case 'withdraw':
  case 'send':
    return 'warning';
  default:
    return 'default';
}
};

return (
<Card className="border border-default-200">
  <CardHeader className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      <p className="text-sm text-default-500 mt-1">
        Latest transactions and interactions
      </p>
    </div>
    <Button
      size="sm"
      variant="flat"
      startContent={<ExternalLink className="w-4 h-4" />}
      onPress={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
    >
      View All
    </Button>
  </CardHeader>
  <CardBody>
    {isLoading ? (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-default-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-default-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-default-200 rounded w-1/2"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-default-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-default-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : error ? (
      <div className="text-center py-8">
        <AlertCircle className="w-8 h-8 text-danger-500 mx-auto mb-2" />
        <p className="text-danger-700 mb-2">{error}</p>
        <Button size="sm" onPress={loadTransactions}>
          Retry
        </Button>
      </div>
    ) : transactions.length > 0 ? (
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 border border-default-200 rounded-lg hover:bg-default-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                getTransactionColor(tx.type) === 'success' ? 'bg-success/10 text-success' :
                getTransactionColor(tx.type) === 'warning' ? 'bg-warning/10 text-warning' :
                getTransactionColor(tx.type) === 'primary' ? 'bg-primary/10 text-primary' :
                'bg-default-100 text-default-600'
              }`}>
                {getTransactionIcon(tx.type)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{tx.type}</p>
                  <Badge size="sm" variant="flat" color="success">
                    {tx.status}
                  </Badge>
                  {tx.protocol && (
                    <Badge size="sm" variant="flat" color="default">
                      {tx.protocol}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-default-500">
                  {tx.fromToken} → {tx.toToken}
                </p>
                <div className="flex items-center gap-3 text-xs text-default-400 mt-1">
                  <span>{tx.timestamp}</span>
                  <span>•</span>
                  <span>Gas: {tx.gasFee}</span>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    onPress={() => window.open(`https://etherscan.io/tx/${tx.hash}`, '_blank')}
                    className="h-4 w-4 min-w-4"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-medium text-base ${
                tx.amount.startsWith('+') ? 'text-success' :
                tx.amount.startsWith('-') ? 'text-danger' :
                'text-default-700'
              }`}>
                {tx.amount}
              </p>
              <p className="text-xs text-default-500 font-mono">
                {tx.hash}
              </p>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-default-400 mx-auto mb-4" />
        <h4 className="font-medium text-default-700 mb-2">No Recent Transactions</h4>
        <p className="text-default-500 text-sm">
          This wallet hasn't had any recent activity
        </p>
      </div>
    )}
  </CardBody>
</Card>
);
}

// NFT Portfolio Component
function NFTPortfolio({ nftData }: { nftData: any }) {
const hasNFTs = nftData && nftData.total_count > 0;

return (
<Card className="border border-default-200">
  <CardHeader className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold">NFT Collection</h3>
      <p className="text-sm text-default-500 mt-1">
        {hasNFTs ? `${nftData.total_count} NFTs across ${nftData.collections_count || 0} collections` : 'No NFTs found'}
      </p>
    </div>
    {hasNFTs && (
      <Badge variant="flat" color="secondary">
        {nftData.total_count} NFTs
      </Badge>
    )}
  </CardHeader>
  <CardBody>
    {hasNFTs ? (
      <div className="space-y-6">
        {/* NFT Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-purple-700">{nftData.total_count || 0}</p>
            <p className="text-xs text-purple-600">Total NFTs</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-700">
              ${(nftData.total_value || 0).toLocaleString()}
            </p>
            <p className="text-xs text-blue-600">Total Value</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
              <PieChart className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-lg font-bold text-green-700">{nftData.collections_count || 0}</p>
            <p className="text-xs text-green-600">Collections</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
              <Layers className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-lg font-bold text-orange-700">{nftData.chains_count || 0}</p>
            <p className="text-xs text-orange-600">Chains</p>
          </div>
        </div>
        
        {/* NFT Grid Placeholder */}
        <div className="border-2 border-dashed border-default-200 rounded-lg p-8">
          <div className="text-center">
            <div className="grid grid-cols-3 gap-4 mb-6 max-w-xs mx-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
            <p className="text-sm font-medium text-default-700 mb-1">
              NFT Gallery Integration Ready
            </p>
            <p className="text-xs text-default-500">
              Connect with OpenSea, Alchemy, or Moralis APIs for NFT visualization
            </p>
          </div>
        </div>
        
        {/* Top Collections */}
        <div>
          <h4 className="font-semibold mb-3">Top Collections</h4>
          <div className="space-y-2">
            {/* Mock collection data */}
            {[
              { name: 'Bored Ape Yacht Club', count: 2, value: 50000 },
              { name: 'CryptoPunks', count: 1, value: 75000 },
              { name: 'Art Blocks', count: 5, value: 15000 }
            ].map((collection, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-default-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400"></div>
                  <div>
                    <p className="font-medium">{collection.name}</p>
                    <p className="text-sm text-default-500">{collection.count} NFT{collection.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${collection.value.toLocaleString()}</p>
                  <p className="text-xs text-default-500">Floor</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
          <Target className="w-10 h-10 text-purple-500" />
        </div>
        <h4 className="text-lg font-semibold mb-2">No NFTs Found</h4>
        <p className="text-default-500 mb-6 max-w-md mx-auto">
          This wallet doesn't currently hold any NFTs, or they haven't been indexed yet.
        </p>
        <Button
          variant="flat"
          color="primary"
          startContent={<RefreshCw className="w-4 h-4" />}
          size="sm"
        >
          Refresh NFT Data
        </Button>
      </div>
    )}
  </CardBody>
</Card>
);
}

// Loading Skeleton Component
function WalletAnalyticsSkeleton() {
return (
<div className="space-y-6">
  {/* Header Skeleton */}
  <div className="flex items-center justify-between">
    <div>
      <div className="h-8 bg-default-200 rounded w-48 mb-2 animate-pulse"></div>
      <div className="h-4 bg-default-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-6 bg-default-200 rounded w-16 animate-pulse"></div>
      <div className="h-10 bg-default-200 rounded w-24 animate-pulse"></div>
    </div>
  </div>

  {/* Overview Cards Skeleton */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="border border-default-200">
        <CardBody className="p-5">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-default-200 rounded-xl"></div>
              <div className="h-4 bg-default-200 rounded w-12"></div>
            </div>
            <div className="h-3 bg-default-200 rounded w-16 mb-1"></div>
            <div className="h-6 bg-default-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-default-200 rounded w-20"></div>
          </div>
        </CardBody>
      </Card>
    ))}
  </div>

  {/* Tabs Skeleton */}
  <div className="space-y-4">
    <div className="flex gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-10 bg-default-200 rounded w-24 animate-pulse"></div>
      ))}
    </div>
    
    {/* Content Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-default-200">
        <CardHeader>
          <div className="h-6 bg-default-200 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardBody>
          <div className="h-64 bg-default-200 rounded animate-pulse"></div>
        </CardBody>
      </Card>
      
      <Card className="border border-default-200">
        <CardHeader>
          <div className="h-6 bg-default-200 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-default-200 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-default-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="h-4 bg-default-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  </div>
</div>
);
}

// Utility Functions
function getUniqueChains(positions: any[]): number {
const chains = new Set(positions.map(p => p.relationships?.chain?.data?.id));
return chains.size;
}

function getPositionTypes(positions: any[]): string[] {
const types = new Set(positions.map(p => getPositionType(p)));
return Array.from(types);
}

function getTotalProtocols(positions: any[]): number {
const protocols = new Set(positions.map(p => 
p.relationships?.dapp?.data?.id || 'unknown'
));
return protocols.size;
}

function getPositionType(position: any): string {
return position.attributes?.position_type || 'wallet';
}

function getChainName(chainId: string): string {
const chainNames: Record<string, string> = {
'ethereum': 'Ethereum',
'polygon': 'Polygon',
'arbitrum': 'Arbitrum',
'optimism': 'Optimism',
'base': 'Base',
'avalanche': 'Avalanche',
'bsc': 'BSC',
'unknown': 'Unknown'
};
return chainNames[chainId] || chainId.charAt(0).toUpperCase() + chainId.slice(1);
}

function getChainColor(chainId: string): string {
const chainColors: Record<string, string> = {
'ethereum': '#627EEA',
'polygon': '#8247E5',
'arbitrum': '#28A0F0',
'optimism': '#FF0420',
'base': '#0052FF',
'avalanche': '#E84142',
'bsc': '#F3BA2F',
'unknown': '#6B7280'
};
return chainColors[chainId] || '#6B7280';
}