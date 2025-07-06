// app/wallets/page.tsx - Split layout with list on left, details on right
'use client';

import { useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { useWallets } from '@/contexts/WalletContext';
import { AddWalletModal } from '@/components/Wallets/AddWalletModal';
import { WalletAnalytics } from '@/components/WalletAnalytics';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { title } from '@/components/primitives';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Activity,
  Sparkles
} from 'lucide-react';
import { FontistoDollar, SolarWalletOutline } from '@/components/icons/icons';
import clsx from 'clsx';
import { WalletCard } from '@/components/Wallets/WalletCard';

export default function WalletsPage() {
  const { state, actions } = useWallets();
  const [showBalance, setShowBalance] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

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

  const isPositiveTrend = totalChangePercent >= 0;

  const handleWalletSelect = (address: string) => {
    setSelectedWallet(address === selectedWallet ? null : address);
  };

  const copyAddress = (address: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(address);
  };

  const openInEtherscan = (address: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  const getWalletTier = (value: number) => {
    if (value >= 1000000) return { tier: 'legendary', icon: Activity };
    if (value >= 100000) return { tier: 'epic', icon: Activity };
    return { tier: 'common', icon: Wallet };
  };

  const handleShowBalanceChange = (show: boolean) => {
    setShowBalance(show);
  };

  return (
    <ProtectedRoute>
      <div className="   space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-20">
          <div className="space-y-4">
            {/* Key Metrics */}
            {state.summaries.length > 0 && (
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/70 to-pink-500/70 flex items-center justify-center">
                    <FontistoDollar className="w-5 h-5 text-white" />
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
              size="sm"
              isIconOnly
              onPress={() => setShowBalance(!showBalance)}
              className="border-default-200"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="flat"
              size="sm"
              startContent={<RefreshCw className={`w-4 h-4 ${state.isLoading ? 'animate-spin' : ''}`} />}
              onPress={actions.refreshAllWallets}
              isLoading={state.isLoading}
              className="border-default-200"
            >
              Refresh
            </Button>
            
            <Button
              size="sm"
              variant="shadow"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setIsAddModalOpen(true)}
            >
              Add Wallet
            </Button>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Left Side - Wallet List */}
          <div className="lg:col-span-4 xl:col-span-4">
            <div className="">
              {state.summaries.length > 0 ? (
                <div className="space-y-2">
                  {state.summaries.map((wallet) => (
                    <WalletCard
                      key={wallet.address}
                      wallet={wallet}
                      viewMode='list'
                      showDetailedStats={false}
                      showBalance={showBalance}
                      onClick={() => handleWalletSelect(wallet.address)}
                      onEdit={() => {/* TODO: Implement edit */}}
                      onDelete={() => {
                        if (confirm('Remove this wallet from tracking?')) {
                          actions.removeWallet(wallet.address);
                          if (selectedWallet === wallet.address) {
                            setSelectedWallet(null);
                          }
                        }
                      }}
                      tier={getWalletTier(wallet.totalValue?.positions || 0)}
                      isLoading={state.isLoading}
                    />
                  ))}
                </div>
              ) : (
                <EmptyWalletList onAddWallet={() => setIsAddModalOpen(true)} />
              )}
            </div>
          </div>

          {/* Right Side - Wallet Details */}
          <div className="lg:col-span-8 xl:col-span-8">
            {selectedWallet ? (
              <WalletAnalytics 
                address={selectedWallet}
                showBalance={showBalance}
                onShowBalanceChange={handleShowBalanceChange}
              />
            ) : (
              <WalletDetailsPlaceholder onAddWallet={() => setIsAddModalOpen(true)} />
            )}
          </div>
        </div>

        <AddWalletModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}

// Empty Wallet List Component
function EmptyWalletList({ onAddWallet }: { onAddWallet: () => void }) {
  return (
    <div className="p-8 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-default-100 flex items-center justify-center">
        <Wallet className="w-6 h-6 text-default-500" />
      </div>
      <h4 className="font-medium mb-2">No Wallets Added</h4>
      <p className="text-sm text-default-500 mb-4">
        Add your first wallet to start tracking
      </p>
      <Button
        color="primary"
        size="sm"
        startContent={<Plus className="w-4 h-4" />}
        onPress={onAddWallet}
      >
        Add Wallet
      </Button>
    </div>
  );
}

// Wallet Details Placeholder Component
function WalletDetailsPlaceholder({ onAddWallet }: { onAddWallet: () => void }) {
  return (
    <Card className="h-full border-2 border-dashed border-default-200">
      <CardBody className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Activity className="w-10 h-10 text-primary-600" />
          </div>
          
          <h3 className="text-xl font-semibold mb-3">Select a Wallet</h3>
          <p className="text-default-500 mb-8">
            Choose a wallet from the list to view detailed analytics, transaction history, and portfolio breakdown.
          </p>
          
          <div className="space-y-4">
            <Button
              color="primary"
              size="lg"
              startContent={<Plus className="w-5 h-5" />}
              onPress={onAddWallet}
            >
              Add Your First Wallet
            </Button>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto rounded-lg bg-success/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-success" />
                </div>
                <p className="text-xs text-default-600 font-medium">Real-time Analytics</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-default-600 font-medium">Portfolio Tracking</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-xs text-default-600 font-medium">Multi-chain Support</p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}