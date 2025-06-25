// app/wallets/[address]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';
import { useWallets } from '@/contexts/WalletContext';
import { WalletData, zerionUtils } from '@/lib/zerion';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity,
  Layers,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Copy,
  Target,
  Zap,
  BarChart3,
  Globe,
  Coins,
  Eye,
  EyeOff,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function WalletAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;
  
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  
  const { actions } = useWallets();

  useEffect(() => {
    if (address) {
      loadWalletData();
    }
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

  const formatCurrency = (value: number) => {
    if (!showBalance) return '••••••';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: value > 1000 ? 0 : 2
    }).format(value);
  };

  if (isLoading) {
    return <WalletAnalyticsLoadingSkeleton />;
  }

  if (error || !walletData) {
    return (
      <ProtectedRoute>
        <div className="space-y-6">
          <WalletAnalyticsHeader 
            address={address}
            showBalance={showBalance}
            onShowBalanceToggle={() => setShowBalance(!showBalance)}
            onRefresh={refreshData}
            refreshing={refreshing}
            onBack={() => router.back()}
          />
          
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
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <WalletAnalyticsHeader 
          address={address}
          showBalance={showBalance}
          onShowBalanceToggle={() => setShowBalance(!showBalance)}
          onRefresh={refreshData}
          refreshing={refreshing}
          onBack={() => router.back()}
        />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Portfolio Value"
            value={walletData.portfolio?.total || 0}
            change={walletData.portfolio?.changes?.absolute_1d || 0}
            changePercent={walletData.portfolio?.changes?.percent_1d || 0}
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            trend="24h"
            showBalance={showBalance}
            color="emerald"
          />
          
          <MetricCard
            title="Unrealized P&L"
            value={walletData.pnl?.unrealized_gain || 0}
            subValue={`Realized: ${formatCurrency(walletData.pnl?.realized_gain || 0)}`}
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            trend="All Time"
            showBalance={showBalance}
            color="blue"
          />
          
          <MetricCard
            title="Active Positions"
            value={walletData.positions?.length || 0}
            subValue={`${getPositionTypes(walletData.positions || []).length} types`}
            icon={<PieChart className="w-5 h-5" />}
            format="number"
            showBalance={showBalance}
            color="purple"
          />
          
          <MetricCard
            title="Networks"
            value={getUniqueChains(walletData.positions || [])}
            subValue={`${getTotalProtocols(walletData.positions || [])} protocols`}
            icon={<Layers className="w-5 h-5" />}
            format="number"
            showBalance={showBalance}
            color="amber"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Chart */}
          <PortfolioChart 
            data={chartData} 
            period={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            totalValue={walletData.portfolio?.total || 0}
            showBalance={showBalance}
          />

          {/* Chain Distribution */}
          <ChainDistribution 
            positions={walletData.positions || []} 
            showBalance={showBalance}
          />
        </div>

        {/* Performance & Positions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <PerformanceMetrics 
            portfolio={walletData.portfolio}
            pnl={walletData.pnl}
            showBalance={showBalance}
          />

          {/* Top Positions */}
          <div className="lg:col-span-2">
            <TopPositions 
              positions={walletData.positions || []} 
              showBalance={showBalance}
            />
          </div>
        </div>

        {/* NFT Portfolio */}
        {walletData.nftPortfolio && (
          <NFTPortfolioCard nftData={walletData.nftPortfolio} />
        )}
      </div>
    </ProtectedRoute>
  );
}

// Header Component
interface WalletAnalyticsHeaderProps {
  address: string;
  showBalance: boolean;
  onShowBalanceToggle: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onBack: () => void;
}

function WalletAnalyticsHeader({ 
  address, 
  showBalance, 
  onShowBalanceToggle, 
  onRefresh, 
  refreshing, 
  onBack 
}: WalletAnalyticsHeaderProps) {
  const copyAddress = () => navigator.clipboard.writeText(address);
  const openInEtherscan = () => window.open(`https://etherscan.io/address/${address}`, '_blank');

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="flat"
          onPress={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">Wallet Analytics</h1>
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
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="flat" color="success" className="text-xs">
          Live Data
        </Badge>
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          onPress={onShowBalanceToggle}
          className="text-default-500"
        >
          {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
        <Button
          variant="flat"
          startContent={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          onPress={onRefresh}
          isDisabled={refreshing}
          size="sm"
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  changePercent?: number;
  subValue?: string;
  icon: React.ReactNode;
  format: 'currency' | 'number' | 'percent';
  trend?: string;
  showBalance: boolean;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
}

function MetricCard({ 
  title, 
  value, 
  change, 
  changePercent, 
  subValue, 
  icon, 
  format, 
  trend,
  showBalance,
  color
}: MetricCardProps) {
  const formatValue = (val: number) => {
    if (!showBalance && format === 'currency') return '••••••';
    
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

  const colorClasses = {
    emerald: 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 text-emerald-600',
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 text-blue-600',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/20 text-purple-600',
    amber: 'from-amber-500/10 to-amber-600/10 border-amber-500/20 text-amber-600'
  };

  const isPositive = (change || 0) >= 0;
  const hasChange = change !== undefined;

  return (
    <Card className="border border-default-200/80 hover:shadow-md transition-all duration-200">
      <CardBody className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-lg bg-gradient-to-br border ${colorClasses[color]}`}>
            {icon}
          </div>
          {trend && (
            <Badge variant="flat" color="default" className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
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
                {showBalance ? formatValue(Math.abs(change)) : '••••'}
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
  showBalance: boolean;
}

function PortfolioChart({ data, period, onPeriodChange, totalValue, showBalance }: PortfolioChartProps) {
  const formatCurrency = (value: number) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="border border-default-200/80">
      <CardHeader className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-lg font-semibold">Portfolio Performance</h3>
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
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-default-700 mb-1">
              Chart Integration Ready
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
      </CardBody>
    </Card>
  );
}

// Chain Distribution Component
function ChainDistribution({ positions, showBalance }: { positions: any[]; showBalance: boolean }) {
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
    <Card className="border border-default-200/80">
      <CardHeader className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Network Distribution</h3>
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
                      {showBalance ? `${data.value.toLocaleString()}` : '••••'}
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
              <p className="text-default-500">No network data available</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Performance Metrics Component
function PerformanceMetrics({ portfolio, pnl, showBalance }: { portfolio: any; pnl: any; showBalance: boolean }) {
  const metrics = [
    {
      label: 'All Time High',
      value: portfolio?.all_time_high || 0,
      format: 'currency',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      label: 'Total Fees',
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
    if (!showBalance && format === 'currency') return '••••••';
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
    <Card className="border border-default-200/80">
      <CardHeader>
        <h3 className="text-lg font-semibold">Performance Overview</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                  {metric.icon}
                </div>
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              <p className="font-semibold">
                {formatValue(metric.value, metric.format)}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// Top Positions Component
function TopPositions({ positions, showBalance }: { positions: any[]; showBalance: boolean }) {
  const topPositions = positions
    .filter(p => p.attributes?.value > 0)
    .sort((a, b) => (b.attributes?.value || 0) - (a.attributes?.value || 0))
    .slice(0, 8);

  return (
    <Card className="border border-default-200/80">
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
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-100/50 hover:bg-default-100 dark:hover:bg-default-200/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                        <Sparkles className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{symbol}</p>
                      <Chip size="sm" variant="flat" color="default" className="text-xs">
                        {getPositionType(position)}
                      </Chip>
                    </div>
                    <p className="text-xs text-default-500">{name}</p>
                    <p className="text-xs text-default-400">
                      {quantity.toFixed(4)} {symbol}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {showBalance ? `${value.toLocaleString()}` : '••••'}
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

// NFT Portfolio Card Component
function NFTPortfolioCard({ nftData }: { nftData: any }) {
  const hasNFTs = nftData && nftData.total_count > 0;

  return (
    <Card className="border border-default-200/80">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{nftData.total_count || 0}</p>
              <p className="text-xs text-purple-600 dark:text-purple-500">Total NFTs</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                ${(nftData.total_value || 0).toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-500">Total Value</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <PieChart className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-green-700 dark:text-green-400">{nftData.collections_count || 0}</p>
              <p className="text-xs text-green-600 dark:text-green-500">Collections</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <Layers className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{nftData.chains_count || 0}</p>
              <p className="text-xs text-orange-600 dark:text-orange-500">Networks</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-purple-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">No NFTs Found</h4>
            <p className="text-default-500 mb-6 max-w-md mx-auto">
              This wallet doesn't currently hold any NFTs, or they haven't been indexed yet.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// Loading Skeleton Component
function WalletAnalyticsLoadingSkeleton() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-default-200 rounded animate-pulse"></div>
            <div>
              <div className="h-8 bg-default-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-default-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-default-200 rounded w-16 animate-pulse"></div>
            <div className="h-10 bg-default-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Metrics Skeleton */}
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
    </ProtectedRoute>
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