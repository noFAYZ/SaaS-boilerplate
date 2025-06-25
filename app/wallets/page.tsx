// app/wallets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Tabs, Tab } from '@heroui/tabs';
import { Badge } from '@heroui/badge';
import { useWallets } from '@/contexts/WalletContext';
import { WalletGrid } from '@/components/Wallets/WalletGrid';
import { WalletAnalytics } from '@/components/Wallets/WalletAnalytics';
import { title } from '@/components/primitives';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign,
  Activity,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Chip } from '@heroui/react';

export default function WalletsPage() {
  const { state, actions } = useWallets();
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>('overview');



  // Calculate portfolio overview
  const portfolioOverview = {
    totalValue: state.summaries.reduce((sum, wallet) => sum + wallet.totalValue, 0),
    totalChange: state.summaries.reduce((sum, wallet) => sum + wallet.dayChange, 0),
    totalWallets: state.summaries.length,
    positiveWallets: state.summaries.filter(w => w.dayChange >= 0).length
  };

  const totalChangePercent = portfolioOverview.totalValue > 0 
    ? (portfolioOverview.totalChange / portfolioOverview.totalValue) * 100 
    : 0;

  // Auto-select analytics tab when a wallet is selected
  useEffect(() => {
    if (state.selectedWallet && selectedTab === 'overview') {
      setSelectedTab('analytics');
    }
  }, [state.selectedWallet]);

  const formatCurrency = (value: number) => {
    if (!showBalance) return '••••••';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={title()}>Portfolio Tracker</h1>
            <p className="mt-2 text-default-500">
              Monitor your DeFi portfolio across multiple wallets and chains
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="flat"
              size="sm"
              isIconOnly
              onPress={() => setShowBalance(!showBalance)}
              className="text-default-500"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="flat"
              startContent={<RefreshCw className="w-4 h-4" />}
              onPress={actions.refreshAllWallets}
              isLoading={state.isLoading}
              size="sm"
            >
              Refresh All
            </Button>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        {state.summaries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-default-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary-500/10">
                    <DollarSign className="w-5 h-5 text-primary-500" />
                  </div>
                  <Badge 
                    variant="flat" 
                    color={portfolioOverview.totalChange >= 0 ? 'success' : 'danger'}
                    className="text-xs"
                  >
                    24h
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-default-500 mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(portfolioOverview.totalValue)}
                  </p>
                  <div className={`flex items-center gap-1 mt-1 text-sm ${
                    portfolioOverview.totalChange >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {portfolioOverview.totalChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {showBalance ? formatCurrency(Math.abs(portfolioOverview.totalChange)) : '••••'}
                    </span>
                    <span>({formatPercent(totalChangePercent)})</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-default-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Wallet className="w-5 h-5 text-success" />
                  </div>
                  <Badge variant="flat" color="default" className="text-xs">
                    Active
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-default-500 mb-1">Total Wallets</p>
                  <p className="text-2xl font-bold">{portfolioOverview.totalWallets}</p>
                  <p className="text-sm text-default-500 mt-1">
                    {portfolioOverview.positiveWallets} gaining today
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-default-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <BarChart3 className="w-5 h-5 text-warning" />
                  </div>
                  <Badge variant="flat" color="warning" className="text-xs">
                    Avg
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-default-500 mb-1">Avg Wallet Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      portfolioOverview.totalWallets > 0 
                        ? portfolioOverview.totalValue / portfolioOverview.totalWallets 
                        : 0
                    )}
                  </p>
                  <p className="text-sm text-default-500 mt-1">
                    Per wallet average
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-default-200">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Activity className="w-5 h-5 text-secondary" />
                  </div>
                  <Badge variant="flat" color="secondary" className="text-xs">
                    Live
                  </Badge>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-default-500 mb-1">Best Performer</p>
                  <p className="text-2xl font-bold">
                    {state.summaries.length > 0 
                      ? `${Math.max(...state.summaries.map(w => w.dayChangePercent)).toFixed(2)}%`
                      : '0.00%'
                    }
                  </p>
                  <p className="text-sm text-default-500 mt-1">
                    24h change
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs 
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          className='rounded-full'

          classNames={{
       base: 'bg-default-50 border border-default-200 shadow-sm rounded-full',
       tabList: 'flex items-center justify-between p-1 rounded-full',
            tab: 'px-4 py-2 text-sm font-medium rounded-full ',
            tabWrapper: 'flex items-center gap-2 rounded-full',
            cursor: 'cursor-pointer rounded-full',
            
           
     
     
          }}
       
       
        >
          <Tab 
            key="overview" 
            className='rounded-full'
            title={
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>Overview</span>
                {state.summaries.length > 0 && (
                  <Chip size="sm" variant="solid" color="danger" className='text-xs'>
                    {state.summaries.length}
                  </Chip>
                )}
              </div>
            }

            
          >
            <div className="mt-6">
              <WalletGrid />
            </div>
          </Tab>

          <Tab 
            key="analytics" 
            title={
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
                {state.selectedWallet && (
                  <Badge size="sm" variant="flat" color="success">
                    Active
                  </Badge>
                )}
              </div>
            }
          >
            <div className="mt-6">
              {state.selectedWallet ? (
                <WalletAnalytics address={state.selectedWallet} />
              ) : (
                <WalletAnalyticsPlaceholder />
              )}
            </div>
          </Tab>

          <Tab 
            key="insights" 
            title={
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Insights</span>
                <Badge size="sm" variant="flat" color="warning">
                  Pro
                </Badge>
              </div>
            }
          >
            <div className="mt-6">
              <PortfolioInsights />
            </div>
          </Tab>
        </Tabs>

        {/* Quick Actions Footer */}
        {state.summaries.length > 0 && (
          <Card className="">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Portfolio Status</h3>
                  <p className="text-sm text-default-600">
                    Your portfolio is being tracked across {portfolioOverview.totalWallets} wallets. 
                    Last updated {state.lastRefresh ? new Date(state.lastRefresh).toLocaleTimeString() : 'never'}.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-sm font-medium text-default-700">Status</p>
                    <Badge 
                      color={state.error ? 'danger' : 'success'} 
                      variant="flat"
                      className="mt-1"
                    >
                      {state.error ? 'Error' : 'Synced'}
                    </Badge>
                  </div>
                  
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={actions.refreshAllWallets}
                    isLoading={state.isLoading}
                    startContent={<RefreshCw className="w-4 h-4" />}
                  >
                    Sync Now
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}

// Analytics Placeholder Component
function WalletAnalyticsPlaceholder() {
  return (
    <Card className="p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <BarChart3 className="w-10 h-10 text-primary-600" />
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Select a Wallet to View Analytics</h3>
        <p className="text-default-500 mb-6">
          Choose any wallet from the overview tab to see detailed analytics, 
          position breakdowns, transaction history, and performance charts.
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-default-400">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Portfolio Tracking</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span>Real-time Data</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span>Advanced Charts</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Portfolio Insights Component
function PortfolioInsights() {
  const { state } = useWallets();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Portfolio Insights</h3>
          <p className="text-sm text-default-500">
            Advanced analytics and recommendations for your portfolio
          </p>
        </CardHeader>
        <CardBody>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-warning-100 to-warning-200 flex items-center justify-center">
              <Activity className="w-8 h-8 text-warning-600" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-default-500 max-w-md mx-auto">
              Advanced portfolio insights, risk analysis, yield optimization suggestions, 
              and automated rebalancing recommendations will be available here.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="p-4 border border-default-200 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="text-sm font-medium">Risk Analysis</p>
              </div>
              <div className="p-4 border border-default-200 rounded-lg">
                <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Yield Optimization</p>
              </div>
              <div className="p-4 border border-default-200 rounded-lg">
                <Activity className="w-6 h-6 text-warning mx-auto mb-2" />
                <p className="text-sm font-medium">Auto Rebalancing</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}