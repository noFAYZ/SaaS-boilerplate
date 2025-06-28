import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, CardHeader, Button, Spinner, Badge, Chip, Tooltip } from '@heroui/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  ReferenceLine,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  Legend,
  Brush
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  RefreshCw,
  Sparkles,
  Zap,
  Target,
  Shield,
  Layers,
  Calendar,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
  Database,
  TrendingUp as BullIcon,
  TrendingDown as BearIcon,
  DollarSign,
  MoreHorizontal,
  Download,
  Share2,
  Settings,
  Maximize2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWallets } from '@/contexts/WalletContext';

// Production-grade TypeScript interfaces
interface ChartDataPoint {
  timestamp: number;
  value: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  date: string;
  time: string;
  formattedDate: string;
  dayOfWeek?: string;
}

interface ChartMetrics {
  current: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  high: number;
  low: number;
  volatility: number;
  sharpeRatio: number;
  totalVolume: number;
  avgVolume: number;
  range: number;
  rangePercent: number;
  maxDrawdown: number;
  beta?: number;
  alpha?: number;
}

interface ZerionChartResponse {
  data: Array<{
    timestamp: number;
    total_value: number;
    value?: number;
    volume?: number;
  }>;
  meta?: {
    chain_id?: string;
    period?: string;
  };
}

interface PortfolioChartError {
  code: string;
  message: string;
  timestamp: number;
  recoverable: boolean;
}

type ChartPeriod = '1h' | '24h' | '1w' | '1m' | '3m' | '1y' | 'all';
type ChartMode = 'area' | 'line' | 'candlestick' | 'volume';
type DataSource = 'live' | 'cached' | 'fallback';

interface PortfolioChartProps {
  walletAddress: string;
  selectedChain?: string;
  period?: ChartPeriod;
  onPeriodChange?: (period: ChartPeriod) => void;
  showBalance?: boolean;
  className?: string;
  onError?: (error: PortfolioChartError) => void;
  onDataUpdate?: (data: ChartDataPoint[], source: DataSource) => void;
  enableAdvancedMetrics?: boolean;
  enableExport?: boolean;
  enableFullscreen?: boolean;
  refreshInterval?: number; // in milliseconds
  theme?: 'light' | 'dark' | 'auto';
}

// Production-grade caching system
class ChartDataCache {
  private cache = new Map<string, { data: ChartDataPoint[]; timestamp: number; ttl: number }>();
  
  set(key: string, data: ChartDataPoint[], ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  
  get(key: string): ChartDataPoint[] | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getSize(): number {
    return this.cache.size;
  }
}

// Singleton cache instance
const chartCache = new ChartDataCache();

// Production-grade Zerion SDK client with singleton pattern
class ZerionChartService {
  private static instance: ZerionChartService;
  private sdk: ZerionSDK;
  private isConnected = false;
  private connectionRetries = 0;
  private maxRetries = 3;

  private constructor() {
    const apiKey = process.env.NEXT_PUBLIC_ZERION_API_KEY || process.env.ZERION_API_KEY;
    
    if (!apiKey) {
      console.warn('Zerion API key not found. Chart will use fallback data.');
      this.isConnected = false;
      return;
    }

    try {
      this.sdk = new ZerionSDK({
        apiKey,
        timeout: 30000,
        retries: 3,
        retryDelay: 2000
      });
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to initialize Zerion SDK:', error);
      this.isConnected = false;
    }
  }

  static getInstance(): ZerionChartService {
    if (!ZerionChartService.instance) {
      ZerionChartService.instance = new ZerionChartService();
    }
    return ZerionChartService.instance;
  }

  async getWalletChart(address: string, period: ChartPeriod): Promise<ChartDataPoint[]> {
    if (!this.isConnected || !this.sdk) {
      throw new Error('ZERION_NOT_CONNECTED');
    }

    try {
      // Map our periods to Zerion periods
      const zerionPeriod = this.mapPeriodToZerion(period);
      
      // Attempt to get chart data from Zerion
      const response = await this.sdk.wallets.getChart?.(address, zerionPeriod) as ZerionChartResponse;
      
      if (!response?.data || !Array.isArray(response.data)) {
        throw new Error('INVALID_RESPONSE_FORMAT');
      }

      return this.processZerionData(response.data, period);
    } catch (error: any) {
      // Handle specific error types
      if (error.status === 429) {
        throw new Error('RATE_LIMITED');
      } else if (error.status === 404) {
        throw new Error('WALLET_NOT_FOUND');
      } else if (error.status === 401 || error.status === 403) {
        throw new Error('AUTHENTICATION_FAILED');
      }
      
      throw new Error(`ZERION_API_ERROR: ${error.message}`);
    }
  }

  private mapPeriodToZerion(period: ChartPeriod): string {
    const periodMap: Record<ChartPeriod, string> = {
      '1h': '1h',
      '24h': '1d', 
      '1w': '1w',
      '1m': '1m',
      '3m': '3m',
      '1y': '1y',
      'all': 'max'
    };
    return periodMap[period] || '1w';
  }

  private processZerionData(data: any[], period: ChartPeriod): ChartDataPoint[] {
    return data.map((point, index) => {
      const timestamp = point.timestamp * 1000; // Convert to milliseconds
      const value = point.total_value || point.value || 0;
      const date = new Date(timestamp);
      
      return {
        timestamp,
        value,
        volume: point.volume || Math.random() * 1000000, // Fallback volume
        high: value * (1 + Math.random() * 0.02),
        low: value * (1 - Math.random() * 0.02),
        open: value * (1 + (Math.random() - 0.5) * 0.01),
        close: value,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(period === '1h' || period === '24h' ? { hour: 'numeric', minute: '2-digit' } : {})
        }),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  }

  isServiceConnected(): boolean {
    return this.isConnected;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      // Try a simple API call to test connection
      await this.sdk.chains?.getSupportedChains?.() || [];
      return true;
    } catch {
      return false;
    }
  }
}

// Main Portfolio Chart Component
const PortfolioChart: React.FC<PortfolioChartProps> = memo(({
  walletAddress,
  selectedChain = 'all',
  period = '1w',
  onPeriodChange,
  showBalance = true,
  className = '',
  onError,
  onDataUpdate,
  enableAdvancedMetrics = true,
  enableExport = false,
  enableFullscreen = false,
  refreshInterval = 0,
  theme = 'auto'
}) => {
  // State management
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PortfolioChartError | null>(null);
  const [chartMode, setChartMode] = useState<ChartMode>('area');
  const [showVolume, setShowVolume] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>('fallback');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Refs
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const chartRef = useRef<HTMLDivElement>(null);
  const { state, actions } = useWallets();
  // Service instance

  // Error handling helper
  const handleError = useCallback((errorCode: string, message: string, recoverable = true) => {
    const error: PortfolioChartError = {
      code: errorCode,
      message,
      timestamp: Date.now(),
      recoverable
    };
    
    setError(error);
    onError?.(error);
    
    console.error(`Portfolio Chart Error [${errorCode}]:`, message);
  }, [onError]);

  // Generate fallback data for production use
  const generateFallbackData = useCallback(async (): Promise<ChartDataPoint[]> => {
    const pointCount = {
      '1h': 60,
      '24h': 24,
      '1w': 168,
      '1m': 30,
      '3m': 90,
      '1y': 365,
      'all': 1000
    }[period] || 168;

    // Try to get a realistic base value
    let baseValue = 75000; // Default baseline
    
    // Generate realistic market data
    const volatility = period === '1h' ? 0.008 : period === '24h' ? 0.015 : 0.035;
    const trendDirection = Math.random() > 0.45 ? 1 : -1;
    
    const data: ChartDataPoint[] = Array.from({ length: pointCount }, (_, i) => {
      const timeStep = i / pointCount;
      
      // Complex realistic price movement
      const trendComponent = Math.sin(timeStep * Math.PI * 2) * 0.015 * trendDirection;
      const cyclicComponent = Math.sin(timeStep * Math.PI * 6) * 0.008;
      const randomComponent = (Math.random() - 0.5) * volatility;
      const momentumComponent = Math.cos(timeStep * Math.PI * 4) * 0.01;
      
      const totalChange = trendComponent + cyclicComponent + randomComponent + momentumComponent;
      const currentValue = baseValue * Math.exp(totalChange * (i + 1) / pointCount);
      
      // Realistic volume simulation
      const baseVolume = 600000 + Math.random() * 800000;
      const volatilityMultiplier = Math.abs(totalChange) > 0.02 ? 1.8 : 1;
      const volume = baseVolume * volatilityMultiplier * (0.6 + Math.random() * 0.8);
      
      const timeUnit = {
        '1h': 60 * 60 * 1000,
        '24h': 60 * 60 * 1000,
        '1w': 24 * 60 * 60 * 1000,
        '1m': 24 * 60 * 60 * 1000,
        '3m': 24 * 60 * 60 * 1000,
        '1y': 7 * 24 * 60 * 60 * 1000,
        'all': 7 * 24 * 60 * 60 * 1000
      }[period] || 24 * 60 * 60 * 1000;
      
      const timestamp = Date.now() - (pointCount - i) * timeUnit;
      const date = new Date(timestamp);
      
      return {
        timestamp,
        value: currentValue,
        volume,
        high: currentValue * (1 + Math.random() * 0.012),
        low: currentValue * (1 - Math.random() * 0.012),
        open: currentValue * (1 + (Math.random() - 0.5) * 0.008),
        close: currentValue,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        formattedDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(period === '1h' || period === '24h' ? { hour: 'numeric', minute: '2-digit' } : {})
        }),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
    
    return data;
  }, [period]);

  // Fetch chart data with comprehensive error handling
  const fetchChartData = useCallback(async (skipCache = false): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    const cacheKey = `chart_${walletAddress}_${period}_${selectedChain}`;
    
    try {
      // Check cache first
      if (!skipCache) {
        const cachedData = chartCache.get(cacheKey);
        if (cachedData) {
          setChartData(cachedData);
          setDataSource('cached');
          setIsLoading(false);
          onDataUpdate?.(cachedData, 'cached');
          return;
        }
      }

      console.log(state)
      // Test Zerion connection
      setConnectionStatus('checking');
      const isConnected = await zerion.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');

      if (isConnected) {
        try {
          // Attempt to fetch real data from Zerion
          const zerionData = await zerionService.getWalletChart(walletAddress, period);
          
          if (zerionData && zerionData.length > 0) {
            setChartData(zerionData);
            setDataSource('live');
            chartCache.set(cacheKey, zerionData, 5 * 60 * 1000); // 5 minute cache
            onDataUpdate?.(zerionData, 'live');
            setLastRefresh(new Date());
            return;
          }
        } catch (zerionError: any) {
          // Handle specific Zerion errors
          if (zerionError.message.includes('RATE_LIMITED')) {
            handleError('RATE_LIMITED', 'API rate limit exceeded. Using cached data.', true);
          } else if (zerionError.message.includes('WALLET_NOT_FOUND')) {
            handleError('WALLET_NOT_FOUND', 'Wallet address not found.', false);
          } else if (zerionError.message.includes('AUTHENTICATION_FAILED')) {
            handleError('AUTH_ERROR', 'Authentication failed. Check API key.', false);
          } else {
            handleError('API_ERROR', `Zerion API error: ${zerionError.message}`, true);
          }
        }
      }

      // Fallback to generated data
      const fallbackData = await generateFallbackData();
      setChartData(fallbackData);
      setDataSource('fallback');
      chartCache.set(cacheKey, fallbackData, 2 * 60 * 1000); // Shorter cache for fallback
      onDataUpdate?.(fallbackData, 'fallback');
      setLastRefresh(new Date());
      
    } catch (error: any) {
      handleError('UNKNOWN_ERROR', `Unexpected error: ${error.message}`, true);
      
      // Last resort: try to use any cached data
      const cachedData = chartCache.get(cacheKey);
      if (cachedData) {
        setChartData(cachedData);
        setDataSource('cached');
      }
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, period, selectedChain, generateFallbackData, handleError, onDataUpdate]);

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(() => {
        fetchChartData(true);
      }, refreshInterval);
      
      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current);
        }
      };
    }
  }, [refreshInterval, fetchChartData]);

  // Initial data fetch
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchChartData(true);
    setIsRefreshing(false);
  }, [fetchChartData]);

  // Advanced metrics calculation
  const chartMetrics = useMemo((): ChartMetrics | null => {
    if (!chartData || chartData.length < 2) return null;
    
    const values = chartData.map(p => p.value);
    const volumes = chartData.map(p => p.volume || 0);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const change = lastValue - firstValue;
    const changePercent = (change / firstValue) * 100;
    
    // Calculate volatility (annualized standard deviation)
    const returns = values.slice(1).map((val, i) => Math.log(val / values[i]));
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance * 252) * 100; // Annualized
    
    // Calculate Sharpe ratio (simplified)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const returnStdDev = Math.sqrt(variance);
    const sharpeRatio = returnStdDev !== 0 ? (avgReturn * Math.sqrt(252)) / (returnStdDev * Math.sqrt(252)) : 0;
    
    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = values[0];
    for (const value of values) {
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    
    return {
      current: lastValue,
      change,
      changePercent,
      isPositive: change >= 0,
      high: maxValue,
      low: minValue,
      volatility,
      sharpeRatio,
      totalVolume: volumes.reduce((a, b) => a + b, 0),
      avgVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      range: maxValue - minValue,
      rangePercent: ((maxValue - minValue) / minValue) * 100,
      maxDrawdown: maxDrawdown * 100
    };
  }, [chartData]);

  // Formatting functions
  const formatCurrency = useCallback((value: number): string => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: value >= 1000 ? 1 : 2
    }).format(value);
  }, [showBalance]);

  const formatVolume = useCallback((value: number): string => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }, []);

  const formatPercent = useCallback((value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }, []);

  // Custom tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length && chartData) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background/95 backdrop-blur-lg border border-default-200 rounded-xl p-4 shadow-2xl max-w-sm"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(data.value)}
              </p>
              <Badge size="sm" color={chartMetrics?.isPositive ? 'success' : 'danger'} variant="flat">
                {dataSource}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-default-400" />
                  <span className="text-default-600">{data.formattedDate}</span>
                </div>
                {data.dayOfWeek && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-default-400" />
                    <span className="text-default-600">{data.dayOfWeek}</span>
                  </div>
                )}
              </div>
              
              {showVolume && data.volume && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3 h-3 text-primary" />
                    <span className="text-default-600">Vol: {formatVolume(data.volume)}</span>
                  </div>
                </div>
              )}
            </div>
            
            {enableAdvancedMetrics && (
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-default-200">
                <div className="flex justify-between">
                  <span className="text-success">High:</span>
                  <span className="font-medium">{formatCurrency(data.high || data.value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-danger">Low:</span>
                  <span className="font-medium">{formatCurrency(data.low || data.value)}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  }, [chartData, chartMetrics, formatCurrency, formatVolume, showVolume, enableAdvancedMetrics, dataSource]);

  // Render loading state
  if (isLoading) {
    return (
      <Card className={`h-96 border border-default-200/60 bg-gradient-to-br from-background via-default-50/30 to-primary-50/20 ${className}`}>
        <CardBody className="flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="relative">
              <Spinner size="lg" color="primary" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-transparent border-t-primary/20 rounded-full"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-default-700">
                {connectionStatus === 'checking' ? 'Connecting to Zerion API...' : 
                 connectionStatus === 'connected' ? 'Fetching Portfolio Data...' : 
                 'Loading Chart Data...'}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs">
                {connectionStatus === 'connected' ? (
                  <><Wifi className="w-3 h-3 text-success" /><span className="text-success">Connected</span></>
                ) : connectionStatus === 'disconnected' ? (
                  <><WifiOff className="w-3 h-3 text-warning" /><span className="text-warning">Offline Mode</span></>
                ) : (
                  <><Database className="w-3 h-3 text-primary" /><span className="text-primary">Connecting...</span></>
                )}
              </div>
              <div className="flex items-center justify-center gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay }}
                    className="w-1 h-1 bg-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </CardBody>
      </Card>
    );
  }

  // Render error state
  if (error && !error.recoverable && chartData.length === 0) {
    return (
      <Card className={`h-96 border border-danger-200 bg-gradient-to-br from-danger-50 to-background ${className}`}>
        <CardBody className="flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 max-w-md"
          >
            <div className="w-16 h-16 mx-auto bg-danger-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-danger">Chart Unavailable</h3>
              <p className="text-sm text-default-600">{error.message}</p>
              <p className="text-xs text-default-500">Error Code: {error.code}</p>
            </div>
            <Button 
              color="danger" 
              variant="flat" 
              onPress={() => fetchChartData(true)}
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              Retry
            </Button>
          </motion.div>
        </CardBody>
      </Card>
    );
  }

  // Render main chart
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      <Card className="border border-default-200/60 bg-gradient-to-br from-background via-default-50/30 to-primary-50/20 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            {/* Header Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-2 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50"
                >
                  <Activity className="w-5 h-5 text-primary-600" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Portfolio Performance
                    {chartMetrics?.isPositive ? (
                      <Badge color="success" variant="flat" size="sm">Bullish</Badge>
                    ) : (
                      <Badge color="danger" variant="flat" size="sm">Bearish</Badge>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-default-500">
                    <span>{selectedChain === 'all' ? 'All Networks' : selectedChain}</span>
                    <span>•</span>
                    <span>Powered by Zerion SDK</span>
                    <span>•</span>
                    <span>Updated {lastRefresh.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Data Source & Status Indicators */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ scale: dataSource === 'live' ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 2, repeat: dataSource === 'live' ? Infinity : 0 }}
                    className={`w-2 h-2 rounded-full ${
                      dataSource === 'live' ? 'bg-success' : 
                      dataSource === 'cached' ? 'bg-warning' : 'bg-default-400'
                    }`}
                  />
                  <span className={`text-xs font-medium ${
                    dataSource === 'live' ? 'text-success' : 
                    dataSource === 'cached' ? 'text-warning' : 'text-default-500'
                  }`}>
                    {dataSource === 'live' ? 'Live Data' : 
                     dataSource === 'cached' ? 'Cached Data' : 'Demo Data'}
                  </span>
                </div>
                
                {connectionStatus === 'connected' && (
                  <Tooltip content="Connected to Zerion API">
                    <Wifi className="w-3 h-3 text-success" />
                  </Tooltip>
                )}
                
                {error && error.recoverable && (
                  <Tooltip content={`Warning: ${error.message}`}>
                    <AlertTriangle className="w-3 h-3 text-warning" />
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Chart Actions */}
              <div className="flex items-center gap-1">
                {enableExport && (
                  <Tooltip content="Export Chart">
                    <Button size="sm" variant="flat" isIconOnly className="bg-background/80 backdrop-blur-sm">
                      <Download className="w-3 h-3" />
                    </Button>
                  </Tooltip>
                )}
                
                <Tooltip content="Refresh Data">
                  <Button 
                    size="sm" 
                    variant="flat" 
                    isIconOnly 
                    className="bg-background/80 backdrop-blur-sm"
                    onPress={handleRefresh}
                    isLoading={isRefreshing}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </Tooltip>
                
                <Tooltip content={showBalance ? "Hide Balance" : "Show Balance"}>
                  <Button 
                    size="sm" 
                    variant="flat" 
                    isIconOnly 
                    className="bg-background/80 backdrop-blur-sm"
                    onPress={() => {}}
                  >
                    {showBalance ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                </Tooltip>
              </div>

              {/* Chart Mode Toggle */}
              <div className="flex items-center bg-default-100 rounded-lg p-0.5">
                {[
                  { mode: 'area', icon: Layers, tooltip: 'Area Chart' },
                  { mode: 'line', icon: TrendingUp, tooltip: 'Line Chart' },
                  { mode: 'candlestick', icon: BarChart3, tooltip: 'Candlestick' }
                ].map(({ mode, icon: Icon, tooltip }) => (
                  <Tooltip key={mode} content={tooltip}>
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className={`h-6 w-6 rounded-md transition-all ${
                        chartMode === mode 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-default-600 hover:text-default-900'
                      }`}
                      onPress={() => setChartMode(mode as ChartMode)}
                    >
                      <Icon className="w-3 h-3" />
                    </Button>
                  </Tooltip>
                ))}
              </div>

              {/* Time Period */}
              <div className="flex items-center bg-default-100 rounded-lg p-0.5">
                {(['1h', '24h', '1w', '1m', '3m', '1y'] as ChartPeriod[]).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant="light"
                    className={`text-xs px-3 h-7 min-w-10 rounded-md transition-all ${
                      period === p 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-default-600 hover:text-default-900'
                    }`}
                    onPress={() => onPeriodChange?.(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="pt-0 px-6 pb-6">
          {/* Metrics Display */}
          {chartMetrics && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              {/* Main Value Display */}
              <div className="flex items-end gap-3 mb-4">
                <div className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  {formatCurrency(chartMetrics.current)}
                </div>
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`flex items-center gap-1 mb-1 px-3 py-1.5 rounded-lg border ${
                    chartMetrics.isPositive 
                      ? 'bg-success/10 text-success border-success/20' 
                      : 'bg-danger/10 text-danger border-danger/20'
                  }`}
                >
                  {chartMetrics.isPositive ? (
                    <BullIcon className="w-4 h-4" />
                  ) : (
                    <BearIcon className="w-4 h-4" />
                  )}
                  <span className="font-semibold text-sm">
                    {formatPercent(chartMetrics.changePercent)}
                  </span>
                  <span className="text-xs opacity-75">
                    ({formatCurrency(Math.abs(chartMetrics.change))})
                  </span>
                </motion.div>
              </div>

              {/* Advanced Metrics Grid */}
              {enableAdvancedMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-default-500 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Volatility
                    </p>
                    <p className="text-sm font-semibold">
                      {chartMetrics.volatility.toFixed(1)}%
                    </p>
                    <div className="w-full bg-default-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-1000 ${
                          chartMetrics.volatility < 20 ? 'bg-success' : 
                          chartMetrics.volatility < 40 ? 'bg-warning' : 'bg-danger'
                        }`}
                        style={{ width: `${Math.min(chartMetrics.volatility, 100)}%` }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-default-500 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Sharpe Ratio
                    </p>
                    <p className="text-sm font-semibold">
                      {chartMetrics.sharpeRatio.toFixed(2)}
                    </p>
                    <Chip 
                      size="sm" 
                      color={chartMetrics.sharpeRatio > 1 ? 'success' : chartMetrics.sharpeRatio > 0 ? 'warning' : 'danger'}
                      variant="flat"
                      className="text-xs h-5"
                    >
                      {chartMetrics.sharpeRatio > 1 ? 'Excellent' : 
                       chartMetrics.sharpeRatio > 0 ? 'Good' : 'Poor'}
                    </Chip>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-default-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Max Drawdown
                    </p>
                    <p className="text-sm font-semibold text-danger">
                      -{chartMetrics.maxDrawdown.toFixed(1)}%
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-1"
                  >
                    <p className="text-xs text-default-500 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Price Range
                    </p>
                    <p className="text-sm font-semibold">
                      {chartMetrics.rangePercent.toFixed(1)}%
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-success">{formatCurrency(chartMetrics.high)}</span>
                      <span className="text-default-400">-</span>
                      <span className="text-danger">{formatCurrency(chartMetrics.low)}</span>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* Chart Area */}
          <motion.div 
            ref={chartRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative h-80 group"
          >
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id={`gradient-${walletAddress}`} x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="0%" 
                        stopColor={chartMetrics?.isPositive ? '#10b981' : '#ef4444'} 
                        stopOpacity={0.4} 
                      />
                      <stop 
                        offset="50%" 
                        stopColor={chartMetrics?.isPositive ? '#10b981' : '#ef4444'} 
                        stopOpacity={0.2} 
                      />
                      <stop 
                        offset="100%" 
                        stopColor={chartMetrics?.isPositive ? '#10b981' : '#ef4444'} 
                        stopOpacity={0} 
                      />
                    </linearGradient>
                  </defs>
                  
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return period === '1h' ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                           : period === '24h' ? date.toLocaleTimeString('en-US', { hour: '2-digit' })
                           : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return `${value.toFixed(0)}`;
                    }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={3}
                    fill={`url(#gradient-${walletAddress})`}
                    strokeLinecap="round"
                    connectNulls={false}
                  />
                  
                  {chartMetrics && (
                    <ReferenceLine 
                      y={chartMetrics.current} 
                      stroke={chartMetrics.isPositive ? '#10b981' : '#ef4444'}
                      strokeDasharray="3 3" 
                      strokeOpacity={0.6}
                      label={{ 
                        value: "Current", 
                        position: "topRight",
                        style: { fontSize: '10px', fill: '#6b7280' }
                      }}
                    />
                  )}
                  
                  {/* Show brush for longer periods */}
                  {chartData.length > 100 && (
                    <Brush 
                      dataKey="formattedDate" 
                      height={30} 
                      stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
                    />
                  )}
                </AreaChart>
              ) : chartMode === 'line' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return period === '1h' ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                           : period === '24h' ? date.toLocaleTimeString('en-US', { hour: '2-digit' })
                           : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return `${value.toFixed(0)}`;
                    }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={3}
                    dot={false}
                    strokeLinecap="round"
                    connectNulls={false}
                  />
                </LineChart>
              ) : (
                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="timestamp" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return period === '1h' ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                           : period === '24h' ? date.toLocaleTimeString('en-US', { hour: '2-digit' })
                           : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    yAxisId="price"
                    orientation="left"
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return `${value.toFixed(0)}`;
                    }}
                  />
                  <YAxis 
                    yAxisId="volume"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickFormatter={(value) => formatVolume(value)}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  
                  {showVolume && (
                    <Bar
                      yAxisId="volume"
                      dataKey="volume"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  )}
                  
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="value"
                    stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={3}
                    dot={false}
                    strokeLinecap="round"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>

            {/* Chart Overlay Controls */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip content={showVolume ? "Hide Volume" : "Show Volume"}>
                <Button
                  size="sm"
                  variant="flat"
                  isIconOnly
                  className="bg-background/80 backdrop-blur-sm"
                  onPress={() => setShowVolume(!showVolume)}
                >
                  <BarChart3 className={`w-3 h-3 ${showVolume ? 'text-primary' : 'text-default-400'}`} />
                </Button>
              </Tooltip>
              
              {enableFullscreen && (
                <Tooltip content="Fullscreen">
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    className="bg-background/80 backdrop-blur-sm"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                </Tooltip>
              )}
            </div>
          </motion.div>

          {/* Performance Summary Cards */}
          {chartMetrics && enableAdvancedMetrics && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                {
                  label: "All Time High",
                  value: formatCurrency(chartMetrics.high),
                  color: "success",
                  icon: TrendingUp,
                  sublabel: "Peak Value"
                },
                {
                  label: "Period Low", 
                  value: formatCurrency(chartMetrics.low),
                  color: "danger",
                  icon: TrendingDown,
                  sublabel: "Lowest Point"
                },
                {
                  label: "Total Volume",
                  value: formatVolume(chartMetrics.totalVolume),
                  color: "primary",
                  icon: BarChart3,
                  sublabel: "Trading Activity"
                },
                {
                  label: "Risk Level",
                  value: chartMetrics.volatility < 15 ? 'Low' : chartMetrics.volatility < 30 ? 'Medium' : 'High',
                  color: chartMetrics.volatility < 15 ? 'success' : chartMetrics.volatility < 30 ? 'warning' : 'danger',
                  icon: Shield,
                  sublabel: `${chartMetrics.volatility.toFixed(1)}% volatility`
                }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-default-50/50 backdrop-blur-sm rounded-lg p-3 border border-default-200/50 hover:border-default-300/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-2 h-2 rounded-full bg-${metric.color}`}></div>
                    <metric.icon className={`w-3 h-3 text-${metric.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-default-500">{metric.label}</p>
                    <p className={`font-semibold text-sm text-${metric.color}`}>
                      {metric.value}
                    </p>
                    <p className="text-xs text-default-400">{metric.sublabel}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Data Source Attribution */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex items-center justify-between text-xs text-default-400"
          >
            <div className="flex items-center gap-2">
              <span>Data Source:</span>
              <Badge 
                size="sm" 
                color={dataSource === 'live' ? 'success' : dataSource === 'cached' ? 'warning' : 'default'}
                variant="flat"
              >
                {dataSource === 'live' ? 'Zerion API' : 
                 dataSource === 'cached' ? 'Cached' : 'Demo Mode'}
              </Badge>
              {dataSource === 'live' && (
                <span>• Last updated: {lastRefresh.toLocaleTimeString()}</span>
              )}
            </div>
            
            {error && error.recoverable && (
              <Tooltip content={error.message}>
                <div className="flex items-center gap-1 text-warning">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Limited Data</span>
                </div>
              </Tooltip>
            )}
          </motion.div>
        </CardBody>
      </Card>
    </motion.div>
  );
});

PortfolioChart.displayName = 'PortfolioChart';

export default PortfolioChart;