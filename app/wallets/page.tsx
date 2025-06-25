// app/wallets/page.tsx - Redesigned Modern Version
'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { useWallets } from '@/contexts/WalletContext';
import { WalletGrid } from '@/components/Wallets/WalletGrid';
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
  EyeOff,
  Plus,
  ArrowRight,
  Target,
  Sparkles,
  Zap,
  Globe,
  Timer,
  Award,
  Layers,
  Coins,
  Network,
  PieChart,
  Star,
  ChevronUp,
  ChevronDown,
  Flame,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Progress } from '@heroui/progress';
import { Divider } from '@heroui/divider';
import { SolarWalletOutline } from '@/components/icons/icons';
import { AddWalletModal } from '@/components/Wallets/AddWalletModal';

export default function WalletsPage() {
  const { state, actions } = useWallets();
  const [showBalance, setShowBalance] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statsView, setStatsView] = useState<'overview' | 'detailed'>('overview');
  const router = useRouter();

  // Calculate enhanced portfolio overview
  const portfolioOverview = {
    totalValue: state.summaries.reduce((sum, wallet) => sum + (wallet.totalValue?.positions || 0), 0),
    totalChange: state.summaries.reduce((sum, wallet) => sum + (wallet.dayChange || 0), 0),
    totalWallets: state.summaries.length,
    positiveWallets: state.summaries.filter(w => (w.dayChange || 0) >= 0).length,
    highValueWallets: state.summaries.filter(w => (w.totalValue || 0) >= 100000).length,
    totalPositions: state.summaries.reduce((sum, wallet) => sum + (wallet.positionsCount || 0), 0),
    uniqueChains: Math.max(...state.summaries.map(w => w.chainsCount || 0), 0),
    avgWalletValue: state.summaries.length > 0 ? state.summaries.reduce((sum, w) => sum + (w.totalValue || 0), 0) / state.summaries.length : 0,
    topPerformer: state.summaries.reduce((best, wallet) => 
      (wallet.dayChangePercent || 0) > (best?.dayChangePercent || -Infinity) ? wallet : best
    , null),
    worstPerformer: state.summaries.reduce((worst, wallet) => 
      (wallet.dayChangePercent || 0) < (worst?.dayChangePercent || Infinity) ? wallet : worst
    , null)
  };

  const totalChangePercent = portfolioOverview.totalValue > 0 
    ? (portfolioOverview.totalChange / portfolioOverview.totalValue) * 100 
    : 0;

    console.log(state.summaries)

  const formatCurrency = (value: number, compact = false) => {
    if (!showBalance) return '••••••';
    
    if (compact) {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
      return `$${value.toFixed(0)}`;
    }
    
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
        {/* Modern Header */}
        <div className="relative ">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl"></div>
          
          <div className="relative p-2 md:p-4 border rounded-2xl dark:border-default">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
         
                  
                  <div>
                    <p className="text-xs  font-bold text-default-900 dark:text-white">
                     Total Networth
                    </p>
                    <h1 className="text-default-600 mt-1 text-2xl font-bold">
                      {portfolioOverview.totalValue > 0 ? formatCurrency(portfolioOverview.totalValue, true) : 'No data'}
                    </h1>
                  </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium">{portfolioOverview.positiveWallets} gaining</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-medium">{portfolioOverview.totalWallets - portfolioOverview.positiveWallets} declining</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary-500" />
                    <span className="font-medium">{portfolioOverview.totalPositions} positions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{portfolioOverview.uniqueChains}+ networks</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="flat"
                  size="sm"
                  isIconOnly
                  onPress={() => setShowBalance(!showBalance)}
                  className=" backdrop-blur-sm"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="flat"
                  startContent={<RefreshCw className={`w-4 h-4 ${state.isLoading ? 'animate-spin' : ''}`} />}
                  onPress={actions.refreshAllWallets}
                 
                  size="sm"
                  className="font-medium text-xs backdrop-blur-sm"
                >
                  Sync All
                </Button>
                
                <Button
                variant='shadow'
                  
                  startContent={<Plus className="w-4 h-4" />}
                  size="sm"
                  className="font-medium text-xs shadow-lg "
                  onPress={() => setIsAddModalOpen(true)}
                >
                  Add Wallet
                </Button>
              </div>
            </div>
          </div>
        </div>

      

        {/* Status Bar 
        {state.summaries.length > 0 && (
          <Card className="">
            <CardBody className="p-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-default-700">Live Data</span>
                    </div>
                    <Badge variant="flat" color="success" size="sm" className="ml-2 text-xs font-medium">
                      Synced
                    </Badge>
                  </div>
                  
                  <div className="hidden sm:block w-px h-4 bg-default-300"></div>
                  
                  <div className="text-sm text-default-500">
                    Last sync: {state.lastRefresh ? new Date(state.lastRefresh).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    startContent={<BarChart3 className="w-4 h-4" />}
                    onPress={() => router.push('/analytics')}
                    className="font-medium"
                  >
                    Analytics
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Zap className="w-4 h-4" />}
                    className="font-medium"
                  >
                    Optimize
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}*/}

        {/* Wallet Grid */}
        <div>
          <WalletGrid />
        </div>

        {/* Error State */}
        {state.error && (
          <Card className="border border-danger-200 bg-gradient-to-r from-danger-50 to-red-50 dark:from-danger-900/20 dark:to-red-900/20">
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20">
                  <Activity className="w-6 h-6 text-danger-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-danger-700 dark:text-danger-400 mb-1">
                    Synchronization Error
                  </h3>
                  <p className="text-sm text-danger-600 dark:text-danger-500 mb-4">
                    {state.error}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={actions.refreshAllWallets}
                      startContent={<RefreshCw className="w-4 h-4" />}
                    >
                      Retry Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => router.push('/help')}
                      className="text-danger-600"
                    >
                      Get Help
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Empty State Enhancement */}
        {state.summaries.length === 0 && !state.isLoading && (
          <Card className="border-2 border-dashed border-default-300 bg-gradient-to-br from-default-50 to-default-100/50 dark:from-default-900/50 dark:to-default-800/30">
            <CardBody className="p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/25">
                    <Wallet className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">Welcome to Portfolio Hub</h3>
                <p className="text-default-500 mb-8 leading-relaxed">
                  Start building your DeFi portfolio by adding your first wallet. 
                  Track performance, analyze positions, and optimize your strategy across multiple networks.
                </p>
                
                <div className="space-y-4">
                  <Button
                    color="primary"
                    size="lg"
                    onPress={() => {/* Open add wallet modal */}}
                    startContent={<Plus className="w-5 h-5" />}
                    className="font-semibold shadow-lg shadow-primary-500/25"
                  >
                    Add Your First Wallet
                  </Button>
                  
                  <div className="flex items-center justify-center gap-8 text-sm text-default-400 mt-8">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Read-only Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Real-time Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Multi-chain</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

              {/* Modals */}
      <AddWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      </div>
    </ProtectedRoute>
  );
}