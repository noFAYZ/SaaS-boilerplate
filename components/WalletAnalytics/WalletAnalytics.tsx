// components/WalletAnalytics/WalletAnalytics.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  Coins, 
  Image, 
  Activity,
  Clock
} from 'lucide-react';
import { zerionSDK } from '@/lib/zerion';
import { WalletHeader } from './WalletHeader';
import { PortfolioStats } from './PortfolioStats';
import { PortfolioChart } from './PortfolioChart';
import { ChainDistribution } from './ChainDistribution';
import { TokensList } from './TokensList';
import { NFTsList } from './NFTsList';
import { TransactionsList } from './TransactionsList';
import { getUniqueChains, isValidAddress } from '@/lib/wallet-analytics/utils';
import { SUPPORTED_CHAINS } from '@/lib/wallet-analytics/constants';
import type { 
  WalletAnalyticsProps, 
  PortfolioData, 
  Period, 
  TabKey 
} from '@/lib/wallet-analytics/types';

export const WalletAnalytics: React.FC<WalletAnalyticsProps> = ({ 
  address,
  showBalance: externalShowBalance = true,
  onShowBalanceChange,
  className = ''
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Period>('1w');
  const [showBalance, setShowBalance] = useState(externalShowBalance);
  const [selectedTab, setSelectedTab] = useState<TabKey>('tokens');
  
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({});
  const [availableChains, setAvailableChains] = useState<string[]>([]);

  // Validate address
  if (!isValidAddress(address)) {
    return (
      <Card className="border-danger/20">
        <CardBody className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-danger mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-danger">Invalid Wallet Address</h3>
          <p className="text-default-500">Please provide a valid Ethereum address.</p>
        </CardBody>
      </Card>
    );
  }

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
       // zerionSDK.wallets.getPnL(address).catch(() => null) 
      ]);
      
      // Extract available chains from positions
      const chains = getUniqueChains(positions.data || []);
      
      setPortfolioData({
        portfolio: portfolio.data?.attributes,
        positions: positions.data,
        pnl: pnl?.data?.attributes
      });
      
      setAvailableChains(chains);
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

  // Handle show balance change
  const handleToggleBalance = () => {
    const newValue = !showBalance;
    setShowBalance(newValue);
    onShowBalanceChange?.(newValue);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadPortfolioData();
    setRefreshing(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-500">Loading wallet analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`border-danger/20 ${className}`}>
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <WalletHeader
        address={address}
        selectedChain={selectedChain}
        onChainChange={setSelectedChain}
        showBalance={showBalance}
        onToggleBalance={handleToggleBalance}
        onRefresh={refreshData}
        refreshing={refreshing}
        availableChains={availableChains}
      />

      {/* Portfolio Stats */}
      <PortfolioStats 
        portfolioData={portfolioData} 
        showBalance={showBalance} 
      />

      {/* Charts Section */}
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
          positions={portfolioData.positions || []} 
          showBalance={showBalance}
        />
      </div>

      {/* Tabbed Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between w-full">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as TabKey)}
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

      {/* Footer */}
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
};