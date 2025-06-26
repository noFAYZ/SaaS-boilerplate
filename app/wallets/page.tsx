// app/wallets/page.tsx - Clean, modern design using theme system
'use client';

import { useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { useWallets } from '@/contexts/WalletContext';
import { AddWalletModal } from '@/components/Wallets/AddWalletModal';
import { WalletCard } from '@/components/Wallets/WalletCard';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { title } from '@/components/primitives';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Users,
  Layers,
  Crown,
  ChevronDown,
  Shield,
  Zap,
  Globe,
  Grid3X3,
  List,
  Coins
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SolarWalletOutline } from '@/components/icons/icons';

export default function WalletsPage() {
  const { state, actions } = useWallets();
  const [showBalance, setShowBalance] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'name'>('value');
  const router = useRouter();

  // Calculate portfolio overview
  const portfolioOverview = {
    totalValue: state.summaries.reduce((sum, wallet) => sum + (wallet.totalValue?.positions || 0), 0),
    totalChange: state.summaries.reduce((sum, wallet) => sum + (wallet.dayChange || 0), 0),
    totalWallets: state.summaries.length,
    positiveWallets: state.summaries.filter(w => (w.dayChange || 0) >= 0).length,
    totalPositions: state.summaries.reduce((sum, wallet) => sum + (wallet.positionsCount || 0), 0),
    highValueWallets: state.summaries.filter(w => (w.totalValue || 0) >= 100000).length,
  };

  const totalChangePercent = portfolioOverview.totalValue > 0 
    ? (portfolioOverview.totalChange / portfolioOverview.totalValue) * 100 
    : 0;

  const formatCurrency = (value: number | undefined | null) => {
    if (!showBalance) return '••••••';
    
    const numValue = Number(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue);
  };

  const formatPercent = (value: number | undefined | null) => {
    const numValue = Number(value) || 0;
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  const sortedWallets = [...state.summaries].sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return (b.totalValue || 0) - (a.totalValue || 0);
      case 'change':
        return (b.dayChangePercent || 0) - (a.dayChangePercent || 0);
      case 'name':
        return (a.name || a.address).localeCompare(b.name || b.address);
      default:
        return 0;
    }
  });

  const handleWalletClick = (address: string) => {
    router.push(`/wallets/${address}`);
  };

  const getWalletTier = (value: number) => {
    if (value >= 1000000) return { tier: 'legendary', icon: Crown };
    if (value >= 100000) return { tier: 'epic', icon: Crown };
    return { tier: 'common', icon: Wallet };
  };

  const isPositiveTrend = totalChangePercent >= 0;

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Clean Header */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h1 className={title({ size: 'sm' })}>Manage Wallets</h1>
              
              </div>

              {/* Key Metrics */}
              {state.summaries.length > 0 && (
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-default-500 uppercase tracking-wide font-medium">Total Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioOverview.totalValue)}</p>
                    </div>
                  </div>

                  <Divider orientation="vertical" className="h-12" />

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isPositiveTrend ? 'bg-success/10' : 'bg-danger/10'
                    }`}>
                      {isPositiveTrend ? (
                        <TrendingUp className="w-5 h-5 text-success" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-danger" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-default-500 uppercase tracking-wide font-medium">24h Change</p>
                      <p className={`text-lg font-bold ${
                        isPositiveTrend ? 'text-success' : 'text-danger'
                      }`}>
                        {formatPercent(totalChangePercent)}
                      </p>
                    </div>
                  </div>

                  <Divider orientation="vertical" className="h-12" />

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <SolarWalletOutline className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-default-500 uppercase tracking-wide font-medium">Active Wallets</p>
                      <p className="text-lg font-bold">{portfolioOverview.totalWallets}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="flat"
                size='sm'
                isIconOnly
                onPress={() => setShowBalance(!showBalance)}
                className="border-default-200"
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="flat"
                     size='sm'
                startContent={<RefreshCw className={`w-4 h-4 ${state.isLoading ? 'animate-spin' : ''}`} />}
                onPress={actions.refreshAllWallets}
                isLoading={state.isLoading}
                className="border-default-200"
              >
                Refresh
              </Button>
              <div className="flex bg-default-100 rounded-lg ">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'shadow' : 'light'}
                    isIconOnly
                    onPress={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-background shadow-sm' : ''}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'shadow' : 'light'}
                    isIconOnly
                    onPress={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-background shadow-sm' : ''}
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                </div>
              
              <Button
                   size='sm'
                variant="shadow"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => setIsAddModalOpen(true)}
              >
                Add Wallet
              </Button>
            </div>
          </div>
        </div>

     

        {/* Controls
        <Card>
          <CardBody className="p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
             
                <div className="flex bg-default-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'shadow' : 'light'}
                    isIconOnly
                    onPress={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-background shadow-sm' : ''}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'shadow' : 'light'}
                    isIconOnly
                    onPress={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-background shadow-sm' : ''}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

             
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      variant="flat"
                      endContent={<ChevronDown className="w-3 h-3" />}
                    >
                      Sort: {sortBy === 'value' ? 'Value' : sortBy === 'change' ? 'Change' : 'Name'}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    selectedKeys={[sortBy]}
                    onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as any)}
                  >
                    <DropdownItem key="value" startContent={<DollarSign className="w-4 h-4" />}>
                      By Value
                    </DropdownItem>
                    <DropdownItem key="change" startContent={<TrendingUp className="w-4 h-4" />}>
                      By Change
                    </DropdownItem>
                    <DropdownItem key="name" startContent={<Wallet className="w-4 h-4" />}>
                      By Name
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>

              
                {state.summaries.length > 0 && (
                  <Badge variant="flat" color="default">
                    {state.summaries.length} wallet{state.summaries.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

             
              <div className="flex items-center gap-3">
                <Chip
                  size="sm"
                  variant="flat"
                  color={state.error ? 'danger' : 'success'}
                  startContent={
                    state.error ? (
                      <Activity className="w-3 h-3" />
                    ) : (
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    )
                  }
                >
                  {state.error ? 'Error' : 'Live'}
                </Chip>
                
                {state.lastRefresh && (
                  <p className="text-xs text-default-500">
                    Updated {new Date(state.lastRefresh).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card> */}

        {/* Wallets Display */}
        {state.summaries.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {sortedWallets.map((wallet) => (
              <WalletCard 
                key={wallet.address}
                wallet={wallet} 
                viewMode={viewMode} 
                showBalance={showBalance}
                onEdit={() => {/* TODO: Implement edit */}}
                onDelete={() => {
                  if (confirm('Remove this wallet from tracking?')) {
                    actions.removeWallet(wallet.address);
                  }
                }}
                onClick={() => handleWalletClick(wallet.address)}
                tier={getWalletTier(wallet.totalValue || 0)}
                isLoading={state.isLoading}
              />
            ))}
          </div>
        ) : (
          <EmptyWalletState onAddWallet={() => setIsAddModalOpen(true)} />
        )}

        {/* Error State */}
        {state.error && (
          <Card className="border-danger">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-danger" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-danger mb-1">Sync Error</h3>
                  <p className="text-sm text-danger/80">{state.error}</p>
                </div>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={actions.refreshAllWallets}
                  startContent={<RefreshCw className="w-4 h-4" />}
                  isLoading={state.isLoading}
                >
                  Retry
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        <AddWalletModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}

// Clean Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'positive' | 'negative';
  subtitle?: string;
  icon: React.ReactNode;
}

function StatsCard({ title, value, change, trend, subtitle, icon }: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardBody className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center">
            <div className="text-default-600">
              {icon}
            </div>
          </div>
          
          {change && (
            <Badge 
              variant="flat" 
              color={trend === 'positive' ? 'success' : 'danger'}
              size="sm"
            >
              24h
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-xs font-medium text-default-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold">
            {value}
          </p>
          
          {change && (
            <div className={`flex items-center gap-1.5 text-sm ${
              trend === 'positive' ? 'text-success' : 'text-danger'
            }`}>
              {trend === 'positive' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className="font-medium">{change}</span>
            </div>
          )}
          
          {subtitle && (
            <p className="text-xs text-default-400">
              {subtitle}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Clean Empty State Component
function EmptyWalletState({ onAddWallet }: { onAddWallet: () => void }) {
  return (
    <Card className="border-2 border-dashed border-default-200">
      <CardBody className="p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-default-100 flex items-center justify-center">
          <Wallet className="w-8 h-8 text-default-500" />
        </div>
        
        <h3 className="text-xl font-semibold mb-3">No Wallets Connected</h3>
        <p className="text-default-500 mb-8 max-w-md mx-auto">
          Connect your first wallet to start tracking your DeFi portfolio across multiple networks.
        </p>
        
        <Button
          color="primary"
          size="lg"
          startContent={<Plus className="w-5 h-5" />}
          onPress={onAddWallet}
          className="mb-8"
        >
          Add Your First Wallet
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <FeatureItem
            icon={<Shield className="w-5 h-5" />}
            title="Secure & Private"
            description="Read-only access"
          />
          
          <FeatureItem
            icon={<Zap className="w-5 h-5" />}
            title="Real-time Data"
            description="Live portfolio tracking"
          />
          
          <FeatureItem
            icon={<Globe className="w-5 h-5" />}
            title="Multi-chain"
            description="All networks supported"
          />
        </div>
      </CardBody>
    </Card>
  );
}

// Feature Item Component
function FeatureItem({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="w-12 h-12 rounded-xl bg-default-100 flex items-center justify-center">
        <div className="text-default-600">
          {icon}
        </div>
      </div>
      <div>
        <p className="font-medium text-default-700">{title}</p>
        <p className="text-sm text-default-500">{description}</p>
      </div>
    </div>
  );
}