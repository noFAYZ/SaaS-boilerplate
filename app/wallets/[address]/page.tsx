'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Tab, 
  Tabs, 
  Badge, 
  Button, 
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Progress,
  Avatar,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  toast
} from '@heroui/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Layers, 
  RefreshCw,
  Calendar,
  Target,
  BarChart3,
  Coins,
  ChevronDown,
  ExternalLink,
  Copy,
  AlertCircle
} from 'lucide-react';
import { zerionUtils, WalletData, WalletSummary } from '@/lib/zerion';
import { ResponsiveLayout } from '@/components/layouts/ResponsiveLayout';


// Types for chart data
interface ChartDataPoint {
  timestamp: number;
  value: number;
  date: string;
}

interface TokenPosition {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  value: number;
  price: number;
  change24h: number;
  weight: number;
  logo?: string;
  chain: string;
}

interface NFTAsset {
  id: string;
  name: string;
  collection: string;
  image: string;
  floorPrice?: number;
  lastSale?: number;
}

// Color palette for charts
const CHART_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316'
];

export default function WalletAnalyticsPage() {
  const params = useParams();
  const address = params?.address as string;
  
  // State management
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch wallet data
  const fetchWalletData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch wallet analytics and summary in parallel
      const [analytics, summary, chart] = await Promise.all([
        zerionUtils.getWalletAnalytics(address),
        zerionUtils.getWalletSummary(address),
        zerionUtils.getWalletChart(address, selectedPeriod)
      ]);
      
      setWalletData(analytics);
      setWalletSummary(summary);
      
      // Transform chart data
      if (chart && Array.isArray(chart)) {
        const transformedChart = chart.map((point: any) => ({
          timestamp: point.timestamp,
          value: point.value || 0,
          date: new Date(point.timestamp * 1000).toLocaleDateString()
        }));
        setChartData(transformedChart);
      }
      
      setLastRefresh(new Date());
      toast({
        title: 'Success',
        'Wallet data updated successfully'});
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (address) {
      fetchWalletData();
    }
  }, [address, selectedPeriod]);

  // Helper functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard');
  };

  const getTopPositions = (positions: any[]): TokenPosition[] => {
    if (!positions || !Array.isArray(positions)) return [];
    
    return positions
      .map((pos: any) => ({
        id: pos.id || '',
        symbol: pos.attributes?.fungible_info?.symbol || 'Unknown',
        name: pos.attributes?.fungible_info?.name || 'Unknown Token',
        quantity: pos.attributes?.quantity || 0,
        value: pos.attributes?.value || 0,
        price: pos.attributes?.price || 0,
        change24h: pos.attributes?.changes?.percent_1d || 0,
        weight: (pos.attributes?.value || 0) / (walletSummary?.totalValue || 1) * 100,
        logo: pos.attributes?.fungible_info?.icon?.url,
        chain: pos.relationships?.chain?.data?.id || 'unknown'
      }))
      .filter(pos => pos.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  const getChainDistribution = (positions: any[]) => {
    if (!positions || !Array.isArray(positions)) return [];
    
    const chainTotals = positions.reduce((acc: any, pos: any) => {
      const chain = pos.relationships?.chain?.data?.id || 'unknown';
      const value = pos.attributes?.value || 0;
      acc[chain] = (acc[chain] || 0) + value;
      return acc;
    }, {});

    return Object.entries(chainTotals)
      .map(([chain, value]) => ({
        name: chain.charAt(0).toUpperCase() + chain.slice(1),
        value: value as number,
        percentage: ((value as number) / (walletSummary?.totalValue || 1)) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  // Loading skeleton
  if (isLoading && !walletData) {
    return (
      <ResponsiveLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton className="h-16 w-full" />
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <ResponsiveLayout>
        <Card className="border-danger-200">
          <CardBody className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Wallet</h3>
            <p className="text-default-500 mb-4">{error}</p>
            <Button color="primary" onPress={fetchWalletData}>
              Try Again
            </Button>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  const topPositions = getTopPositions(walletData?.positions || []);
  const chainDistribution = getChainDistribution(walletData?.positions || []);

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              icon={<Wallet className="w-6 h-6" />}
              classNames={{
                base: "bg-primary-100",
                icon: "text-primary-600"
              }}
            />
            <div>
              <h1 className="text-2xl font-bold">Wallet Analytics</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500 font-mono">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onPress={() => copyToClipboard(address)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="flat" color="success">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Chip>
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              onPress={fetchWalletData}
              isLoading={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(walletSummary?.totalValue || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-default-500">24h Change</p>
                <div className="flex items-center gap-1">
                  <p className={`text-xl font-bold ${
                    (walletSummary?.dayChange || 0) >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {formatCurrency(walletSummary?.dayChange || 0)}
                  </p>
                  {(walletSummary?.dayChange || 0) >= 0 ? 
                    <TrendingUp className="w-4 h-4 text-success" /> : 
                    <TrendingDown className="w-4 h-4 text-danger" />
                  }
                </div>
                <p className={`text-sm ${
                  (walletSummary?.dayChangePercent || 0) >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {formatPercent(walletSummary?.dayChangePercent || 0)}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Positions</p>
                <p className="text-2xl font-bold">{walletSummary?.positionsCount || 0}</p>
              </div>
              <Layers className="w-8 h-8 text-secondary" />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Chains</p>
                <p className="text-2xl font-bold">{walletSummary?.chainsCount || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-warning" />
            </CardBody>
          </Card>
        </div>

        {/* Main Content */}
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
              {/* Portfolio Chart */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold">Portfolio Performance</h3>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button variant="flat" size="sm" endContent={<ChevronDown className="w-4 h-4" />}>
                        {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                      aria-label="Period selection"
                      selectedKeys={[selectedPeriod]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as 'day' | 'week' | 'month';
                        setSelectedPeriod(selected);
                      }}
                    >
                      <DropdownItem key="day">Day</DropdownItem>
                      <DropdownItem key="week">Week</DropdownItem>
                      <DropdownItem key="month">Month</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </CardHeader>
                <CardBody>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="url(#portfolioGradient)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chain Distribution */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Chain Distribution</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chainDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chainDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={CHART_COLORS[index % CHART_COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {chainDistribution.map((chain, index) => (
                        <div key={chain.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="text-sm">{chain.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(chain.value)}</p>
                            <p className="text-xs text-default-500">{chain.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Top Positions */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Top Positions</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {topPositions.slice(0, 6).map((position, index) => (
                        <div key={position.id} className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-default-500">
                              #{index + 1}
                            </div>
                            <Avatar
                              src={position.logo}
                              fallback={position.symbol[0]}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium">{position.symbol}</p>
                              <p className="text-xs text-default-500">{position.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(position.value)}</p>
                            <p className={`text-xs ${
                              position.change24h >= 0 ? 'text-success' : 'text-danger'
                            }`}>
                              {formatPercent(position.change24h)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Tab>
          
          <Tab 
            key="positions" 
            title={
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>Positions</span>
                <Badge size="sm" variant="flat">
                  {topPositions.length}
                </Badge>
              </div>
            }
          >
            <div className="mt-6">
              <Card>
                <CardBody>
                  <Table aria-label="Token positions">
                    <TableHeader>
                      <TableColumn>Asset</TableColumn>
                      <TableColumn>Balance</TableColumn>
                      <TableColumn>Price</TableColumn>
                      <TableColumn>Value</TableColumn>
                      <TableColumn>24h Change</TableColumn>
                      <TableColumn>Weight</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {topPositions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={position.logo}
                                fallback={position.symbol[0]}
                                size="sm"
                              />
                              <div>
                                <p className="font-medium">{position.symbol}</p>
                                <p className="text-xs text-default-500">{position.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {position.quantity.toFixed(4)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(position.price)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(position.value)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={position.change24h >= 0 ? "success" : "danger"}
                            >
                              {formatPercent(position.change24h)}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={position.weight}
                                className="max-w-md"
                                size="sm"
                                color="primary"
                              />
                              <span className="text-xs">{position.weight.toFixed(1)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </div>
          </Tab>
          
          <Tab 
            key="activity" 
            title={
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Activity</span>
              </div>
            }
          >
            <div className="mt-6">
              <Card>
                <CardBody className="text-center py-12">
                  <Activity className="w-12 h-12 text-default-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
                  <p className="text-default-500">
                    Transaction history will be displayed here. This requires additional API calls to fetch transaction data.
                  </p>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </ResponsiveLayout>
  );
}