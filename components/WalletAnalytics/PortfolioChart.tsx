// components/WalletAnalytics/PortfolioChart.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap,
  Target,
  Sparkles,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Dot
} from 'recharts';
import { zerionSDK } from '@/lib/zerion';
import { CustomTooltip } from './CustomTooltip';
import { formatCurrency, calculateChartMetrics } from '@/lib/wallet-analytics/utils';
import { PERIOD_MAP, DEFAULT_CHART_HEIGHT, SUPPORTED_CHAINS } from '@/lib/wallet-analytics/constants';
import type { Period, ChartDataPoint } from '@/lib/wallet-analytics/types';
import clsx from 'clsx';

interface PortfolioChartProps {
  walletAddress: string;
  selectedChain: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
  showBalance: boolean;
}

interface ChartMode {
  type: 'area' | 'line' | 'minimal';
  label: string;
  icon: React.ComponentType<any>;
}

const chartModes: ChartMode[] = [
  { type: 'area', label: 'Area', icon: Activity },
  { type: 'line', label: 'Line', icon: TrendingUp },
  { type: 'minimal', label: 'Zen', icon: Target }
];

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ 
  walletAddress, 
  selectedChain, 
  period,
  onPeriodChange,
  showBalance 
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'area' | 'line' | 'minimal'>('area');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const fetchChartData = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const chartResponse = await zerionSDK.wallets.getChart(
        walletAddress, 
        PERIOD_MAP[period] || 'week',
        selectedChain !== 'all' ? { filter: { chain_ids: [selectedChain] } } : undefined
      );
      
      if (chartResponse.data && chartResponse.data?.attributes?.points?.length > 0) {
        const formattedData: ChartDataPoint[] = chartResponse.data?.attributes?.points?.map((point, index) => ({
          timestamp: new Date(point[0] * 1000).getTime(),
          value: parseFloat(point[1]) || 0,
          date: new Date(point[0] * 1000).toLocaleDateString(),
          index
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

  // Handle escape key for expanded mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

  const chartMetrics = useMemo(() => calculateChartMetrics(chartData), [chartData]);

  const periodButtons: Period[] = ['1h', '24h', '1w', '1m', '1y'];

  // Custom dot component for interactive points
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!hoveredPoint || hoveredPoint.index !== payload.index) return null;
    
    return (
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={10}
          fill="none"
          stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          opacity={0.4}
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="none"
          stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
          strokeWidth={2}
          opacity={0.7}
        />
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
        />
      </motion.g>
    );
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-gradient-to-br from-background/80 to-background/40 border-default-200/50">
        <CardBody className="flex items-center justify-center h-96">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-secondary rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Analyzing portfolio</p>
              <p className="text-xs text-default-500">Fetching chart data...</p>
            </div>
          </motion.div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-danger/20 bg-danger/5">
        <CardBody className="flex items-center justify-center h-96">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto">
              <TrendingDown className="w-8 h-8 text-danger" />
            </div>
            <div className="space-y-2">
              <p className="text-danger font-medium">{error}</p>
              <Button 
                size="sm" 
                color="danger" 
                variant="flat" 
                onPress={fetchChartData}
                startContent={<Zap className="w-4 h-4" />}
              >
                Retry
              </Button>
            </div>
          </motion.div>
        </CardBody>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-gradient-to-br from-background/80 to-background/40 border-default-200/50">
        <CardBody className="flex items-center justify-center h-96">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-default-400" />
            </div>
            <div className="space-y-2">
              <p className="font-medium">No chart data available</p>
              <p className="text-xs text-default-500">Portfolio data will appear here once available</p>
            </div>
          </motion.div>
        </CardBody>
      </Card>
    );
  }

  const ChartContent = () => (
    <>
      {/* Header Section */}
      <div className="p-4 pb-4  bg-gradient-to-r from-primary-500/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
            
           
              {isExpanded && (
                <Chip size="sm" variant="flat" color="primary" className="ml-2">
                  Expanded View
                </Chip>
              )}
            </h3>
            <p className="text-xs text-default-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {selectedChain === 'all' ? 'All Networks' : SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => setShowMetrics(!showMetrics)}
              className="opacity-60 hover:opacity-100"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            {isExpanded ? (
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setIsExpanded(false)}
                className="opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setIsExpanded(true)}
                className="opacity-60 hover:opacity-100"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        </div>

        {/* Period & Mode Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Period Selector */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center bg-gradient-to-r from-default-100/80 to-default-50/50 backdrop-blur-sm rounded-2xl p-1"
          >
            {periodButtons.map((p, index) => (
              <Button
                key={p}
                size="sm"
                variant="light"
                className={clsx(
                  "text-xs px-4 h-8 min-w-12 rounded-xl transition-all duration-300",
                  period === p 
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105' 
                    : 'text-default-600 hover:text-default-900 hover:bg-background/50'
                )}
                onPress={() => onPeriodChange(p)}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {p}
                </motion.span>
              </Button>
            ))}
          </motion.div>

          {/* Chart Mode Selector */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center bg-gradient-to-r from-default-100/80 to-default-50/50 backdrop-blur-sm rounded-2xl p-1"
          >
            {chartModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.type}
                  size="sm"
                  variant="light"
                  isIconOnly
                  className={clsx(
                    "w-8 h-8 rounded-xl transition-all duration-300",
                    chartMode === mode.type 
                      ? 'bg-gradient-to-r from-secondary to-secondary/80 text-white shadow-lg shadow-secondary/25 scale-105' 
                      : 'text-default-600 hover:text-default-900 hover:bg-background/50'
                  )}
                  onPress={() => setChartMode(mode.type)}
                >
                  <motion.div
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                </Button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Metrics Row */}
      <AnimatePresence>
        {(showMetrics || isExpanded) && chartMetrics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 bg-gradient-to-r from-default-50/50 to-transparent border-b border-default-200/30"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-1"
              >
                <p className="text-xs text-default-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Performance
                </p>
                <Chip 
                  size="sm" 
                  color={chartMetrics.isPositive ? 'success' : 'danger'}
                  variant="flat"
                  className="text-xs h-6"
                >
                  {chartMetrics.changePercent > 0 ? '+' : ''}{chartMetrics.changePercent.toFixed(2)}%
                </Chip>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-1"
              >
                <p className="text-xs text-default-500 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Range
                </p>
                <p className="text-sm font-semibold">
                  {((chartMetrics.high - chartMetrics.low) / chartMetrics.low * 100).toFixed(1)}%
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-1"
              >
                <p className="text-xs text-default-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  High
                </p>
                <p className="text-sm font-semibold text-success">
                  {formatCurrency(chartMetrics.high, showBalance)}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-1"
              >
                <p className="text-xs text-default-500 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Low
                </p>
                <p className="text-sm font-semibold text-danger">
                  {formatCurrency(chartMetrics.low, showBalance)}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Area */}
      <motion.div 
        ref={chartRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={clsx(
          "relative group overflow-hidden",
          isExpanded ? "h-[60vh]" : "h-80"
        )}
     
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(156, 163, 175, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />

        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'area' ? (
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              onMouseMove={(e) => e?.activePayload?.[0] && setHoveredPoint(e.activePayload[0].payload)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
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
                    stopOpacity={0.1}
                  />
                  <stop 
                    offset="100%" 
                    stopColor={chartMetrics?.isPositive ? '#10b981' : '#ef4444'} 
                    stopOpacity={0}
                  />
                </linearGradient>
                
                {/* Glow effect */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <XAxis 
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  if (period === '1h' || period === '24h') {
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  }
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                className="opacity-60"
                height={0}
                padding={{ left: 0, right: 0 }}
              />
              <YAxis 
                domain={['dataMin - dataMin * 0.02', 'dataMax + dataMax * 0.02']}
                tickFormatter={(value) => showBalance ? `${(value / 1000).toFixed(0)}K` : '••••'}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                className="opacity-60"
                width={0}
                padding={{ top: 0, bottom: 0 }}
              />
              
              {/* Reference line for current value */}
              {chartData.length > 0 && (
                <ReferenceLine 
                  y={chartData[chartData.length - 1]?.value} 
                  stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
                  strokeDasharray="2 2"
                  strokeOpacity={0.5}
                />
              )}
              
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={3}
                fill={`url(#gradient-${walletAddress})`}
                dot={false}
                activeDot={false}
                filter="url(#glow)"
              />
              
              {/* Interactive dots */}
              <Line
                dataKey="value"
                stroke="transparent"
                strokeWidth={0}
                dot={<CustomDot />}
                activeDot={false}
              />
            </AreaChart>
          ) : chartMode === 'line' ? (
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              onMouseMove={(e) => e?.activePayload?.[0] && setHoveredPoint(e.activePayload[0].payload)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <filter id="glow-line">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <XAxis 
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(timestamp) => {
                  const date = new Date(timestamp);
                  if (period === '1h' || period === '24h') {
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  }
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                className="opacity-60"
                height={0}
                padding={{ left: 0, right: 0 }}
              />
              <YAxis 
                domain={['dataMin - dataMin * 0.02', 'dataMax + dataMax * 0.02']}
                tickFormatter={(value) => showBalance ? `${(value / 1000).toFixed(0)}K` : '••••'}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                className="opacity-60"
                width={0}
                padding={{ top: 0, bottom: 0 }}
              />
              
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartMetrics?.isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={3}
                dot={false}
                activeDot={false}
                filter="url(#glow-line)"
              />
              
              <Line
                dataKey="value"
                stroke="transparent"
                strokeWidth={0}
                dot={<CustomDot />}
                activeDot={false}
              />
            </LineChart>
          ) : (
            // Minimal Zen Mode
            <LineChart 
              data={chartData} 
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              onMouseMove={(e) => e?.activePayload?.[0] && setHoveredPoint(e.activePayload[0].payload)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="zen-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={chartMetrics?.isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.8} />
                  <stop offset="50%" stopColor={chartMetrics?.isPositive ? '#34d399' : '#f87171'} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={chartMetrics?.isPositive ? '#6ee7b7' : '#fca5a5'} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#zen-gradient)"
                strokeWidth={4}
                dot={false}
                activeDot={false}
              />
              
              <Line
                dataKey="value"
                stroke="transparent"
                strokeWidth={0}
                dot={<CustomDot />}
                activeDot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>

        {/* Floating Value Display */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute top-4 left-4 bg-background/95 backdrop-blur-xl border border-default-200/50 rounded-2xl p-4 shadow-2xl z-10"
            >
              <div className="space-y-2">
                <p className="text-xs text-default-500">{hoveredPoint.date}</p>
                <p className="text-lg font-bold">
                  {formatCurrency(hoveredPoint.value, showBalance)}
                </p>
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    "w-2 h-2 rounded-full",
                    chartMetrics?.isPositive ? 'bg-success' : 'bg-danger'
                  )} />
                  <span className="text-xs text-default-500">Portfolio Value</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart Mode Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1"
        >
          <span className="text-[10px] text-default-500 capitalize">{chartMode} mode</span>
        </motion.div>
      </motion.div>

      {/* Footer Summary (Only when not expanded) */}
      {!isExpanded && chartMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-6 py-4 bg-gradient-to-r from-background/50 to-transparent border-t border-default-200/30"
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-default-500">High</span>
                <span className="font-semibold text-success">
                  {formatCurrency(chartMetrics.high, showBalance)}
                </span>
              </div>
              <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger" />
                <span className="text-default-500">Low</span>
                <span className="font-semibold text-danger">
                  {formatCurrency(chartMetrics.low, showBalance)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Chip 
                size="sm" 
                color={chartMetrics.isPositive ? 'success' : 'danger'}
                variant="flat"
                className="text-xs"
                startContent={
                  chartMetrics.isPositive ? 
                    <TrendingUp className="w-3 h-3" /> : 
                    <TrendingDown className="w-3 h-3" />
                }
              >
                {chartMetrics.changePercent > 0 ? '+' : ''}{chartMetrics.changePercent.toFixed(2)}%
              </Chip>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );

  return (
    <>
      {/* Normal Card View */}
      <Card 
        className={clsx(
          "backdrop-blur-xl",
          " transition-all duration-75",
   
        )}
      >
        <CardBody className="p-0 overflow-hidden">
          <ChartContent />
        </CardBody>
      </Card>

      {/* Expanded Modal Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop with enhanced blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
              }}
              onClick={() => setIsExpanded(false)}
            >
              {/* Enhanced background effects */}
              <div className="absolute inset-0">
                {/* Animated gradient overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"
                />
                
                {/* Noise texture overlay for premium feel */}
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '256px 256px',
                  }}
                />
                
                {/* Radial gradient for focus effect */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20"
                />
              </div>

              {/* Expanded Card */}
              <motion.div
                initial={{ 
                  scale: 0.9, 
                  opacity: 0, 
                  y: 20,
                  filter: 'blur(10px)'
                }}
                animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  filter: 'blur(0px)'
                }}
                exit={{ 
                  scale: 0.9, 
                  opacity: 0, 
                  y: 20,
                  filter: 'blur(10px)'
                }}
                transition={{ 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className="w-full max-w-6xl h-[90vh] max-h-[800px]"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className={clsx(
                  "w-full h-full",
                  "backdrop-blur-3xl bg-gradient-to-br from-background/98 to-background/95",
                  "border-default-200/80 shadow-2xl",
                  "ring-1 ring-white/10",
                  // Glass morphism effect
                  "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none"
                )}>
                  {/* Enhanced glass effect border */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
                  
                  <CardBody className="p-0 overflow-hidden relative z-10 h-full">
                    {/* Premium glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl blur-xl opacity-30 animate-pulse" />
                    
                    <div className="relative bg-background/50 backdrop-blur-sm rounded-xl h-full overflow-hidden">
                      <ChartContent />
                      
                      {/* Enhanced expanded features */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="absolute bottom-6 left-6 right-6"
                      >
                        {/* Additional metrics for expanded view */}
                        {chartMetrics && (
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-background/80 backdrop-blur-xl rounded-2xl border border-default-200/50">
                            <div className="space-y-1 text-center">
                              <p className="text-xs text-default-500">Current</p>
                              <p className="text-sm font-bold">
                                {formatCurrency(chartData[chartData.length - 1]?.value || 0, showBalance)}
                              </p>
                            </div>
                            
                            <div className="space-y-1 text-center">
                              <p className="text-xs text-default-500">24h Change</p>
                              <Chip 
                                size="sm" 
                                color={chartMetrics.isPositive ? 'success' : 'danger'}
                                variant="flat"
                                className="text-xs"
                              >
                                {chartMetrics.changePercent > 0 ? '+' : ''}{chartMetrics.changePercent.toFixed(2)}%
                              </Chip>
                            </div>
                            
                            <div className="space-y-1 text-center">
                              <p className="text-xs text-default-500">Volatility</p>
                              <p className="text-sm font-semibold">
                                {((chartMetrics.high - chartMetrics.low) / chartMetrics.low * 100).toFixed(1)}%
                              </p>
                            </div>
                            
                            <div className="space-y-1 text-center">
                              <p className="text-xs text-default-500">Data Points</p>
                              <p className="text-sm font-semibold text-primary">
                                {chartData.length}
                              </p>
                            </div>
                            
                            <div className="space-y-1 text-center">
                              <p className="text-xs text-default-500">Trend</p>
                              <div className="flex items-center justify-center">
                                {chartMetrics.isPositive ? (
                                  <TrendingUp className="w-4 h-4 text-success" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-danger" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                      
                      {/* Floating close button */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-6 right-6 z-20"
                      >
                        <Button
                          isIconOnly
                          variant="flat"
                          size="lg"
                          onPress={() => setIsExpanded(false)}
                          className="bg-background/80 backdrop-blur-xl border border-default-200/50 hover:bg-background/90 hover:scale-110 transition-all duration-200"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </motion.div>
                      
                      {/* Keyboard hint */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="absolute bottom-6 right-6 bg-background/60 backdrop-blur-sm rounded-lg px-3 py-1"
                      >
                        <span className="text-xs text-default-500">Press ESC to close</span>
                      </motion.div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};