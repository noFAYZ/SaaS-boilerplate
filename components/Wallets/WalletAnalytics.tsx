import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { Tabs, Tab } from '@heroui/tabs';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Progress } from '@heroui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Coins,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Layers,
  ChevronDown,
  Globe,
  Clock,
  DollarSign,
  Image,
  Send,
  Download,
  Repeat,
  Filter,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Target,
  BarChart3,
  Wallet,
  ExternalLink,
  PieChart,
  Zap,
  Palette,
  Search,
  Grid3X3,
  List,
  Sparkles,
  Share2,
  Star,
  Shield
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import { zerionSDK, zerionUtils } from '@/lib/zerion';
import { BasilWalletOutline } from '../icons/icons';

// Chain configuration
const SUPPORTED_CHAINS = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA' },
  { id: 'polygon', name: 'Polygon', icon: '⬟', color: '#8247E5' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', color: '#28A0F0' },
  { id: 'optimism', name: 'Optimism', icon: '🔴', color: '#FF0420' },
  { id: 'base', name: 'Base', icon: '🟦', color: '#0052FF' },
  { id: 'bsc', name: 'BSC', icon: '🟡', color: '#F3BA2F' }
];

const CHART_COLORS = ['#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

// Custom Tooltip Component for Charts
const CustomTooltip = ({ active, payload, label, showBalance }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-background/95 border border-default-200 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-semibold">
          {showBalance ? `$${value.toLocaleString()}` : '••••••'}
        </p>
        <p className="text-xs text-default-500">
          {new Date(label).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </div>
    );
  }
  return null;
};

// Portfolio Chart Component with Recharts
const PortfolioChart = ({ 
  walletAddress, 
  selectedChain, 
  period = '1w',
  onPeriodChange,
  showBalance 
}) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Map period to Zerion API format
      const periodMap = {
        '1h': 'hour',
        '24h': 'day', 
        '1w': 'week',
        '1m': 'month',
        '1y': 'year'
      };
      
      const chartResponse = await zerionSDK.wallets.getChart(
        walletAddress, 
        periodMap[period] || 'week',
        selectedChain !== 'all' ? { filter: { chain_ids: [selectedChain] } } : undefined
      );
      
      if (chartResponse.data && chartResponse.data?.length > 0) {
        const formattedData = chartResponse.data?.map(point => ({
          timestamp: new Date(point.timestamp * 1000).getTime(),
          value: parseFloat(point.value) || 0,
          date: new Date(point.timestamp * 1000).toLocaleDateString()
        }));
        
        setChartData(formattedData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setError('Failed to load chart data');
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, period, selectedChain]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const chartMetrics = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    
    const values = chartData.map(p => p.value);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const change = lastValue - firstValue;
    const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
    
    return {
      current: lastValue,
      change,
      changePercent,
      isPositive: change >= 0,
      high: maxValue,
      low: minValue
    };
  }, [chartData]);

  const formatCurrency = (value) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: value >= 1000 ? 1 : 2
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="h-80">
        <CardBody className="flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-sm text-default-500">Loading chart...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-80 border-danger/20">
        <CardBody className="flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <p className="text-danger">{error}</p>
            <Button 
              size="sm" 
              color="danger" 
              variant="flat" 
              className="mt-4"
              onPress={fetchChartData}
            >
              Retry
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-lg font-semibold">Portfolio Performance</h3>
            <p className="text-xs text-default-500">
              {selectedChain === 'all' ? 'All Networks' : SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name}
            </p>
          </div>
          
          <div className="flex items-center bg-default-100 rounded-lg p-0.5">
            {['1h', '24h', '1w', '1m', '1y'].map((p) => (
              <Button
                key={p}
                size="sm"
                variant="light"
                className={`text-xs px-3 h-7 min-w-10 rounded-md transition-all ${
                  period === p 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-default-600 hover:text-default-900'
                }`}
                onPress={() => onPeriodChange(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-0">
        {chartMetrics && (
          <div className="mb-6 space-y-1">
            <div className="flex items-end gap-2">
              <div className="text-3xl font-semibold">
                {formatCurrency(chartMetrics.current)}
              </div>
              <div className={`flex items-center gap-1 text-sm mb-1 ${
                chartMetrics.isPositive ? 'text-success' : 'text-danger'
              }`}>
                {chartMetrics.isPositive ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
                <span className="font-medium">
                  {chartMetrics.changePercent >= 0 ? '+' : ''}{chartMetrics.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-default-500">
              {chartMetrics.changePercent >= 0 ? '+' : ''}{formatCurrency(chartMetrics.change)} for selected period
            </p>
          </div>
        )}

        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={chartMetrics?.isPositive ? '#10b981' : '#ef4444'} 
                      stopOpacity={0.3}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={chartMetrics?.isPositive ? '#10b981' : '#ef4444'} 
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="timestamp"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp);
                    if (period === '1h') return date.toLocaleTimeString('en-US', { hour: 'numeric' });
                    if (period === '24h') return date.toLocaleTimeString('en-US', { hour: 'numeric' });
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  domain={['dataMin - dataMin * 0.01', 'dataMax + dataMax * 0.01']}
                  tickFormatter={(value) => showBalance ? `$${(value / 1000).toFixed(0)}K` : '••••'}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip 
                  content={<CustomTooltip showBalance={showBalance} />}
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{ r: 6, fill: chartMetrics?.isPositive ? '#10b981' : '#ef4444' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-default-400 mx-auto mb-2" />
                <p className="text-default-500">No chart data available</p>
              </div>
            </div>
          )}
        </div>

        {chartMetrics && (
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-default-500">High</span>
              <span className="font-semibold text-success">{formatCurrency(chartMetrics.high)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-danger"></div>
              <span className="text-default-500">Low</span>
              <span className="font-semibold text-danger">{formatCurrency(chartMetrics.low)}</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Portfolio Stats Component
const PortfolioStats = ({ portfolioData, showBalance }) => {
  const formatCurrency = (value, compact = true) => {
    if (!showBalance) return '••••••';
    
    const numValue = Number(value) || 0;
    
    if (compact && numValue >= 1000) {
      if (numValue >= 1000000) return `$${(numValue / 1000000).toFixed(1)}M`;
      if (numValue >= 1000) return `$${(numValue / 1000).toFixed(1)}K`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const getUniqueChains = (positions) => {
    if (!positions) return 0;
    return new Set(positions.map(p => p.relationships?.chain?.data?.id).filter(Boolean)).size;
  };

  const stats = [
    {
      title: 'Total Value',
      value: formatCurrency(portfolioData.portfolio?.total, false),
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
      value: getUniqueChains(portfolioData.positions).toString(),
      subtitle: 'Chains',
      icon: Globe,
      color: 'purple'
    },
    {
      title: 'P&L',
      value: formatCurrency(portfolioData.pnl?.unrealized_gain),
      subtitle: 'Unrealized',
      icon: TrendingUp,
      color: 'amber'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-default-500 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                  {stat.change !== undefined ? (
                    <div className={`flex items-center gap-1 text-[10px] ${
                      stat.change >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {stat.change >= 0 ? 
                        <ArrowUpRight className="w-3 h-3" /> : 
                        <ArrowDownRight className="w-3 h-3" />
                      }
                      {Math.abs(stat.change).toFixed(2)}%
                    </div>
                  ) : (
                    <p className="text-[10px] text-default-400">{stat.subtitle}</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Chain Distribution Component
const ChainDistribution = ({ positions, showBalance }) => {
  const chainData = useMemo(() => {
    if (!positions) return [];
    
    const chains = {};
    let totalValue = 0;
    
    positions.forEach(position => {
      const chainId = position.relationships?.chain?.data?.id || 'unknown';
      const value = position.attributes?.value || 0;
      totalValue += value;
      
      if (!chains[chainId]) {
        const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
        chains[chainId] = {
          name: chainInfo?.name || chainId,
          value: 0,
          count: 0,
          color: chainInfo?.color || '#6B7280'
        };
      }
      chains[chainId].value += value;
      chains[chainId].count += 1;
    });
    
    return Object.entries(chains)
      .map(([chainId, data]) => ({
        chainId,
        ...data,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [positions]);

  const formatCurrency = (value) => {
    if (!showBalance) return '••••••';
    return `$${value.toLocaleString()}`;
  };

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
                transition={{ delay: index * 0.1 }}
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
                      {formatCurrency(chain.value)}
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

// Wallet Header Component
const WalletHeader = ({ 
  address, 
  selectedChain, 
  onChainChange, 
  showBalance, 
  onToggleBalance, 
  onRefresh, 
  refreshing, 
  availableChains 
}) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  const openEtherscan = () => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  return (
    <Card>
      <CardBody className="py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/70 to-pink-500/70 flex items-center justify-center">
              <BasilWalletOutline className="w-5 h-5 text-white" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-md font-semibold">Wallet Analytics</h1>
             
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-default-500 font-mono bg-default-100 rounded px-2 py-1">
                  {address.slice(0, 10)}...{address.slice(-8)}
                </p>
                <Button size="sm" variant="light" isIconOnly onPress={copyAddress}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="light" isIconOnly onPress={openEtherscan}>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  size="sm"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  <div className="flex items-center gap-2">
                    {selectedChain === 'all' ? (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>All Chains</span>
                      </>
                    ) : (
                      <>
                        <span>{SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.icon}</span>
                        <span>{SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name}</span>
                      </>
                    )}
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedChain]}
                onSelectionChange={(keys) => onChainChange(Array.from(keys)[0])}
              >
                <DropdownItem key="all">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>All Chains</span>
                  </div>
                </DropdownItem>
                {availableChains.map((chainId) => {
                  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
                  return (
                    <DropdownItem key={chainId}>
                      <div className="flex items-center gap-2">
                        <span>{chain?.icon || '🔗'}</span>
                        <span>{chain?.name || chainId}</span>
                      </div>
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>

            <Button size="sm" variant="light" isIconOnly onPress={onToggleBalance}>
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            <Button 
              size="sm" 
              variant="flat" 
              isIconOnly 
              onPress={onRefresh} 
              isLoading={refreshing}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Tokens List Component
const TokensList = ({ address, selectedChain, showBalance }) => {
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          trash: 'only_non_trash',
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        sort: 'value',
        page: { size: 50 }
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

  const formatCurrency = (value) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    if (!showBalance) return '••••••';
    const num = Number(value) || 0;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(4);
  };

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
            transition={{ delay: index * 0.03, duration: 0.3 }}
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
                    {formatNumber(quantity)} {symbol}
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
                <p className="font-semibold text-sm">{formatCurrency(value)}</p>
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
 
const NFTsList = ({ address, selectedChain = "all", showBalance = true }) => {
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNFT, setHoveredNFT] = useState(null);

  // Load NFTs from Zerion API
  const loadNFTs = useCallback(async () => {
    if (!address || !zerionSDK) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        sort: 'created_at',
        page: { size: 50 }
      };
      
      const response = await zerionSDK.wallets.getNFTPositions(address, filters);
      let nftData = response.data || [];
      
      // Filter out spam NFTs
      nftData = nftData.filter(nft => !nft.attributes?.nft_info?.flags?.is_spam);
      
      // Filter by search query if provided
      if (searchQuery) {
        nftData = nftData.filter(nft => {
          const name = nft.attributes?.nft_info?.name?.toLowerCase() || '';
          const collection = nft.attributes?.collection_info?.name?.toLowerCase() || '';
          const query = searchQuery.toLowerCase();
          return name.includes(query) || collection.includes(query);
        });
      }
      
      // Sort based on selected option
      if (sortBy === 'price') {
        nftData.sort((a, b) => (b.attributes?.last_price || 0) - (a.attributes?.last_price || 0));
      } else if (sortBy === 'name') {
        nftData.sort((a, b) => {
          const nameA = a.attributes?.nft_info?.name || '';
          const nameB = b.attributes?.nft_info?.name || '';
          return nameA.localeCompare(nameB);
        });
      }
      
      setNfts(nftData);
    } catch (err) {
      console.error('Failed to load NFTs:', err);
      setError('Failed to load NFTs. Please try again.');
      setNfts([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain, searchQuery, sortBy, zerionSDK]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  const formatCurrency = (value) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 3
    }).format(value || 0);
  };

  const formatTokenId = (tokenId) => {
    if (!tokenId) return 'N/A';
    if (tokenId.length > 10) {
      return `#${tokenId.slice(0, 6)}...${tokenId.slice(-4)}`;
    }
    return `#${tokenId}`;
  };

  const getChainInfo = (chainId) => {
    return SUPPORTED_CHAINS.find(c => c.id === chainId) || 
           { id: chainId, name: 'Unknown', color: '#6B7280', icon: '?' };
  };

  const getTokenTypeIcon = (interface_type) => {
    switch (interface_type) {
      case 'ERC721': return <Crown className="w-3 h-3" />;
      case 'ERC1155': return <Sparkles className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const getNFTRarity = (lastPrice) => {
    if (lastPrice > 5) return { level: 'legendary', color: 'warning', icon: Crown };
    if (lastPrice > 1) return { level: 'rare', color: 'secondary', icon: Sparkles };
    if (lastPrice > 0.1) return { level: 'uncommon', color: 'primary', icon: Star };
    return { level: 'common', color: 'default', icon: Shield };
  };

  const copyTokenId = (tokenId) => {
    navigator.clipboard.writeText(tokenId);
  };

  const openInOpenSea = (nft) => {
    const chainId = nft.relationships?.chain?.data?.id || 'ethereum';
    const contractAddress = nft.attributes?.nft_info?.contract_address;
    const tokenId = nft.attributes?.nft_info?.token_id;
    
    if (contractAddress && tokenId) {
      window.open(`https://opensea.io/assets/${chainId}/${contractAddress}/${tokenId}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="md" color="white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Discovering your NFTs</p>
            <p className="text-sm text-default-500">Exploring the digital art universe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-danger" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
        <p className="text-sm text-default-500 mb-6">{error}</p>
        <Button color="danger" variant="flat" onPress={loadNFTs} startContent={<Zap className="w-4 h-4" />}>
          Try Again
        </Button>
      </div>
    );
  }

  if (nfts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-6">
          <Palette className="w-10 h-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-semibold mb-3">No NFTs discovered</h3>
        <p className="text-sm text-default-500 max-w-md mx-auto mb-6">
          {searchQuery 
            ? `No NFTs match your search "${searchQuery}"`
            : selectedChain !== 'all' 
              ? `This wallet doesn't own any NFTs on ${getChainInfo(selectedChain).name}`
              : "This wallet doesn't own any NFTs yet. Start your collection journey!"
          }
        </p>
        {searchQuery && (
          <Button 
            variant="flat" 
            onPress={() => setSearchQuery('')}
            startContent={<Search className="w-4 h-4" />}
          >
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-default-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'solid' : 'light'}
              color={viewMode === 'grid' ? 'primary' : 'default'}
              isIconOnly
              onPress={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'solid' : 'light'}
              color={viewMode === 'list' ? 'primary' : 'default'}
              isIconOnly
              onPress={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Badge variant="flat" color="primary" className="hidden sm:flex">
            {nfts.length} NFT{nfts.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-sm bg-default-100 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="recent">Recently Added</option>
            <option value="price">Highest Value</option>
            <option value="name">Name (A-Z)</option>
          </select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-default-400" />
            <input
              type="text"
              placeholder="Search NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm bg-default-100 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48"
            />
          </div>
        </div>
      </div>

      {/* NFTs Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4" 
          : "space-y-4"
      }>
        {nfts.map((nft, index) => {
          const tokenId = nft.attributes?.nft_info?.token_id;
          const tokenName = nft.attributes?.nft_info?.name;
          const collection = nft.attributes?.collection_info;
          const chainId = nft.relationships?.chain?.data?.id || 'ethereum';
          const chainInfo = getChainInfo(chainId);
          const lastPrice = nft.attributes?.last_price || 0;
          const rarity = getNFTRarity(lastPrice);
          const interface_type = nft.attributes?.nft_info?.interface;
          const previewUrl = nft.attributes?.nft_info?.content?.preview?.url;
          const isSpam = nft.attributes?.nft_info?.flags?.is_spam;

          if (viewMode === 'list') {
            return (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-default-200 hover:border-primary/30">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      {/* NFT Preview */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                        {previewUrl ? (
                          <img 
                            src={previewUrl} 
                            alt={tokenName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            <Palette className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* NFT Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-xs truncate">
                            {tokenName || `Token ${formatTokenId(tokenId)}`}
                          </h4>
                          <Chip size="sm" color={rarity.color} variant="flat"className="flex">
                            {rarity.level}
                          </Chip>
                        </div>
                        <p className="text-[10px] text-default-500 truncate">
                          {collection?.name || 'Unknown Collection'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            style={{ backgroundColor: `${chainInfo.color}20`, color: chainInfo.color }}
                          >
                            {chainInfo.icon} {chainInfo.name}
                          </Chip>
                          <span className="text-xs text-default-400">
                            {formatTokenId(tokenId)}
                          </span>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="text-right">
                        <p className="font-semibold text-sm mb-1">
                          {formatCurrency(lastPrice)}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => copyTokenId(tokenId)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => openInOpenSea(nft)}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02, duration: 0.1 }}
              whileHover={{ scale: 1.01 }}
              onHoverStart={() => setHoveredNFT(nft.id)}
              onHoverEnd={() => setHoveredNFT(null)}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-75 border border-default  group">
                {/* NFT Image */}
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt={tokenName}
                      className="w-full h-full object-cover   group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center absolute inset-0">
                    <Palette className="w-12 h-12 text-white/60" />
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 transition-opacity duration-300 ${
                    hoveredNFT === nft.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      isIconOnly
                      onPress={() => openInOpenSea(nft)}
                      className="bg-white/20 backdrop-blur-md border-white/30"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      isIconOnly
                      onPress={() => copyTokenId(tokenId)}
                      className="bg-white/20 backdrop-blur-md border-white/30"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      isIconOnly
                      className="bg-white/20 backdrop-blur-md border-white/30"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {lastPrice > 1 && (
                      <Chip size="sm" color="warning" variant="solid" className="backdrop-blur-md bg-warning/90 "
                      startContent={  <rarity.icon className="w-3 h-3 mr-1" />}>
                      
                        {rarity.level}
                      </Chip>
                    )}
                    {interface_type && (
                      <Chip size="sm" variant="solid" className="backdrop-blur-md bg-black/50 text-white text-[10px] font-semibold" startContent={getTokenTypeIcon(interface_type)}>
                        
                        <span className="ml-1">{interface_type}</span>
                      </Chip>
                    )}
                  </div>

                  {/* Chain badge */}
                  <div className="absolute top-3 right-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm backdrop-blur-md border-2 border-white/30"
                      style={{ backgroundColor: `${chainInfo.color}90` }}
                    >
                      {chainInfo.icon}
                    </div>
                  </div>
                </div>
                
                {/* NFT Details */}
                <CardBody className=" space-y-1">
                  <div>
                    <h4 className="font-bold text-xs truncate mb-1">
                      {tokenName || `Token ${formatTokenId(tokenId)}`}
                    </h4>
                    <p className="text-[10px] text-default-500 truncate">
                      {collection?.name || 'Unknown Collection'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-default-400 font-mono">
                        {formatTokenId(tokenId)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(lastPrice)}
                      </p>
                      {lastPrice > 0 && (
                        <div className="flex items-center gap-1 text-success">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs">Value</span>
                        </div>
                      )}
                    </div>
                  </div>

                
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Load More Button */}
      {nfts.length >= 50 && (
        <div className="text-center pt-6">
          <Button 
            variant="flat" 
            color="primary"
            size="lg"
            startContent={<Sparkles className="w-4 h-4" />}
            className="px-8"
            onPress={loadNFTs}
          >
            Load More NFTs
          </Button>
        </div>
      )}
    </div>
  );
};
 
// Transactions List Component
const TransactionsList = ({ address, selectedChain, showBalance }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const formatCurrency = (value) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value || 0);
  };
 
  const getTypeConfig = (type) => {
    switch (type) {
      case 'send': return { 
        icon: Send, 
        color: 'warning',
        bg: 'bg-warning/10',
        text: 'text-warning'
      };
      case 'receive': return { 
        icon: Download, 
        color: 'success',
        bg: 'bg-success/10',
        text: 'text-success'
      };
      case 'trade': 
      case 'swap': return { 
        icon: Repeat, 
        color: 'primary',
        bg: 'bg-primary/10',
        text: 'text-primary'
      };
      case 'deposit': return {
        icon: ArrowDownRight,
        color: 'secondary',
        bg: 'bg-secondary/10',
        text: 'text-secondary'
      };
      case 'withdraw': return {
        icon: ArrowUpRight,
        color: 'danger',
        bg: 'bg-danger/10',
        text: 'text-danger'
      };
      default: return { 
        icon: Activity, 
        color: 'default',
        bg: 'bg-default-100',
        text: 'text-default-600'
      };
    }
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
 
        return (
          <motion.div
            key={tx.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            className={`p-3 rounded-xl ${config.bg} border border-default-200 hover:border-default-300 transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center ${config.text}`}>
                <config.icon className="w-4 h-4" />
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
                    {minedAt ? new Date(minedAt * 1000).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    }) : 'Pending'}
                  </span>
                  {gasFee > 0 && (
                    <>
                      <span>•</span>
                      <span>Gas: {formatCurrency(gasFee)}</span>
                    </>
                  )}
                  {hash && (
                    <>
                      <span>•</span>
                      <Button
                        size="sm"
                        variant="light"
                        className="h-4 px-1 text-xs"
                        onPress={() => window.open(`https://etherscan.io/tx/${hash}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-sm">{formatCurrency(value)}</p>
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

// Main Wallet Analytics Component
export default function WalletAnalytics({ 
  address = "0x742d35cc6634C0532925a3b8D5c6532c5532925a" 
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChain, setSelectedChain] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1w');
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTab, setSelectedTab] = useState('tokens');
  
  const [portfolioData, setPortfolioData] = useState({});
  const [availableChains, setAvailableChains] = useState([]);

  const loadPortfolioData = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
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
      
      // Extract available chains from positions
      const chains = new Set();
      positions.data?.forEach(position => {
        const chainId = position.relationships?.chain?.data?.id;
        if (chainId && SUPPORTED_CHAINS.find(c => c.id === chainId)) {
          chains.add(chainId);
        }
      });
      
      setPortfolioData({
        portfolio: portfolio.data?.attributes,
        positions: positions.data,
        pnl: pnl?.data?.attributes
      });
      
      setAvailableChains(Array.from(chains));
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      setError('Failed to load portfolio data. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address && address.length === 42) {
      loadPortfolioData();
    }
  }, [address, loadPortfolioData]);

  const refreshData = async () => {
    setRefreshing(true);
    await loadPortfolioData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-500">Loading wallet analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger/20">
        <CardBody className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-danger mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-danger">Failed to Load Wallet</h3>
          <p className="text-default-500 mb-6">{error}</p>
          <Button color="danger" variant="flat" onPress={loadPortfolioData} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardBody>
      </Card>
    );
  }

  const tokenCount = portfolioData.positions?.length || 0;
  const nftCount = 0; // Will be populated by NFT component
  const transactionCount = 0; // Will be populated by transaction component

  return (
    <div className="space-y-6">
      <WalletHeader
        address={address}
        selectedChain={selectedChain}
        onChainChange={setSelectedChain}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
        onRefresh={refreshData}
        refreshing={refreshing}
        availableChains={availableChains}
      />

      <PortfolioStats 
        portfolioData={portfolioData} 
        showBalance={showBalance} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart 
            walletAddress={address}
            selectedChain={selectedChain}
            period={selectedTimeframe}
            onPeriodChange={setSelectedTimeframe}
            showBalance={showBalance}
          />
        </div>
        
        <ChainDistribution 
          positions={portfolioData.positions} 
          showBalance={showBalance}
        />
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between w-full">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab}
              classNames={{
                base: "flex-1",
                tabList: "bg-default-100 p-1 rounded-lg",
                tab: "px-4 py-2 text-sm font-medium",
                cursor: "bg-primary shadow-sm"
              }}
            >
              <Tab key="tokens" title={
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  <span>Tokens</span>
                  <Chip color="primary" size="sm" variant="flat" className="text-xs">
                    {tokenCount}
                  </Chip>
                </div>
              } />
              <Tab key="nfts" title={
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  <span>NFTs</span>
                  <Chip color="secondary" size="sm" variant="flat" className="text-xs">
                    {nftCount}
                  </Chip>
                </div>
              } />
              <Tab key="transactions" title={
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>History</span>
                  <Chip color="warning" size="sm" variant="flat" className="text-xs">
                    Recent
                  </Chip>
                </div>
              } />
            </Tabs>

            <Button
              variant="flat"
              size="sm"
              startContent={<Filter className="w-4 h-4" />}
              className="hidden md:flex ml-4"
            >
              Filter
            </Button>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {selectedTab === 'tokens' && (
                <TokensList 
                  address={address}
                  selectedChain={selectedChain}
                  showBalance={showBalance}
                />
              )}

              {selectedTab === 'nfts' && (
                <NFTsList 
                  address={address}
                  selectedChain={selectedChain}
                  showBalance={showBalance}
                />
              )}

              {selectedTab === 'transactions' && (
                <TransactionsList 
                  address={address}
                  selectedChain={selectedChain}
                  showBalance={showBalance}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardBody>
      </Card>

      <div className="flex items-center justify-center gap-4 text-sm text-default-400 pt-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Live Data</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <span>•</span>
        <span>Powered by Zerion API</span>
      </div>
    </div>
  );
}