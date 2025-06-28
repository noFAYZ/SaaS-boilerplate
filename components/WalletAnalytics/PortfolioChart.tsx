// components/WalletAnalytics/PortfolioChart.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { AlertCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { zerionSDK } from '@/lib/zerion';
import { CustomTooltip } from './CustomTooltip';
import { formatCurrency, calculateChartMetrics } from '@/lib/wallet-analytics/utils';
import { PERIOD_MAP, DEFAULT_CHART_HEIGHT, SUPPORTED_CHAINS } from '@/lib/wallet-analytics/constants';
import type { Period, ChartDataPoint } from '@/lib/wallet-analytics/types';

interface PortfolioChartProps {
  walletAddress: string;
  selectedChain: string;
  period: Period;
  onPeriodChange: (period: Period) => void;
  showBalance: boolean;
}

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
      
      if (chartResponse.data && chartResponse.data?.length > 0) {
        const formattedData: ChartDataPoint[] = chartResponse.data?.map(point => ({
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

  const chartMetrics = useMemo(() => calculateChartMetrics(chartData), [chartData]);

  const periodButtons: Period[] = ['1h', '24h', '1w', '1m', '1y'];

  if (isLoading) {
    return (
      <Card className={`h-${DEFAULT_CHART_HEIGHT}`}>
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
            {periodButtons.map((p) => (
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
                {formatCurrency(chartMetrics.current, showBalance)}
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
              {chartMetrics.changePercent >= 0 ? '+' : ''}{formatCurrency(chartMetrics.change, showBalance)} for selected period
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
                  tickFormatter={(value) => showBalance ? `${(value / 1000).toFixed(0)}K` : '••••'}
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
              <span className="font-semibold text-success">{formatCurrency(chartMetrics.high, showBalance)}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-danger"></div>
              <span className="text-default-500">Low</span>
              <span className="font-semibold text-danger">{formatCurrency(chartMetrics.low, showBalance)}</span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};