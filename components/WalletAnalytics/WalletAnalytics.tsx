// components/WalletAnalytics/WalletAnalytics.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { Badge } from '@heroui/badge';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  Coins, 
  Image, 
  Activity,
  Clock,
  Wallet,
  Copy,
  ExternalLink,
  ChevronDown,
  Eye,
  EyeOff,
  Layers,
  DollarSign,
  Globe,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Zap,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { zerionSDK } from '@/lib/zerion';
import { WalletHeader } from './WalletHeader';
import { PortfolioStats } from './PortfolioStats';
import { PortfolioChart } from './PortfolioChart';
import { ChainDistribution } from './ChainDistribution';
import { TokensList } from './TokensList';
import { NFTsList } from './NFTsList';
import { TransactionsList } from './TransactionsList';
import { getUniqueChains, isValidAddress, truncateAddress, copyToClipboard, openEtherscan } from '@/lib/wallet-analytics/utils';
import { SUPPORTED_CHAINS } from '@/lib/wallet-analytics/constants';
import type { 
  WalletAnalyticsProps, 
  PortfolioData, 
  Period, 
  TabKey 
} from '@/lib/wallet-analytics/types';
import GooeyLoader from '../shared/loader';

// Top Controls Bar
const TopControlsBar: React.FC<{
  selectedChain: string;
  onChainChange: (chain: string) => void;
  showBalance: boolean;
  onToggleBalance: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  availableChains: string[];
}> = ({ 
  selectedChain, 
  onChainChange, 
  showBalance, 
  onToggleBalance, 
  onRefresh, 
  refreshing, 
  availableChains 
}) => {
  return (
    <div className="flex items-center justify-end mb-2">


      <div className="flex items-center gap-2">
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="shadow" 
              size="sm"
              startContent={selectedChain === 'all' ? <Layers className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full bg-primary" />}
              endContent={<ChevronDown className="w-4 h-4" />}
              className="min-w-24 h-7"
            >
              {selectedChain === 'all' ? 'All Chains' : SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name || selectedChain}
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Chain selection"
            onAction={(key) => onChainChange(key as string)}
            selectedKeys={[selectedChain]}
            selectionMode="single"
          >
            <DropdownItem key="all" startContent={<Layers className="w-4 h-4" />}>
              All Chains
            </DropdownItem>
            {availableChains.map((chainId) => {
              const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
              return (
                <DropdownItem key={chainId} startContent={<div className="w-4 h-4 rounded-full bg-primary" />}>
                  {chain?.name || chainId}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>

        <Button
          variant="shadow"
          size="sm"
          isIconOnly
          onPress={onToggleBalance}
          className="w-7 h-7"
        >
          {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="shadow"
          size="sm"
          isIconOnly
          onPress={onRefresh}
          isLoading={refreshing}
          className="w-7 h-7"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>

        <Button
          variant="shadow"
          size="sm"
          isIconOnly
          className="w-7 h-7"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Modern Header with Stats
const ModernWalletHeader: React.FC<{
  address: string;
  portfolioData: PortfolioData;
  showBalance: boolean;
}> = ({ address, portfolioData, showBalance }) => {
  const formatCurrency = (value: number | null | undefined) => {
    if (!showBalance) return '••••••';
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleCopyAddress = () => {
    copyToClipboard(address);
  };

  const handleOpenEtherscan = () => {
    openEtherscan(address, 'address');
  };

  const totalValue = portfolioData.portfolio?.total?.positions || 0;
  const change24h = portfolioData.portfolio?.changes?.percent_1d || 0;
  const positions = portfolioData.positions?.length || 0;
  const uniqueChains = getUniqueChains(portfolioData.positions || []);

  return (
    <Card className="overflow-hidden rounded-none">
      <CardBody className="px-3 py-1.5">
        <div className="flex items-center justify-between">
          {/* Left Section - Wallet Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 via-amber-400 to-pink-400 p-0.5">
                <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primar-500y/10 to-secondary/10" />
                  <div className="relative z-10 text-xl font-bold bg-gradient-to-br from-primary-600 to-secondary bg-clip-text text-transparent">
                    {address.slice(2, 4).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Wallet Portfolio</h2>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 py-1.5 rounded-lg bg-default-100">
                  <Wallet className="w-3 h-3 text-default-500" />
                  <span className="text-xs font-mono text-default-700">
                    {truncateAddress(address, 6, 4)}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="light" 
                  isIconOnly 
                  onPress={handleCopyAddress}
                  className="w-4 h-4"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="light" 
                  isIconOnly 
                  onPress={handleOpenEtherscan}
                  className="w-4 h-4"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
   
          {/* Right Section - Enhanced Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center px-3 py-2 ">
         
              <p className="text-xl font-bold ">{formatCurrency(totalValue)}</p>
              <div className={`flex items-center justify-center gap-1 font-semibold text-xs ${
                change24h >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {showBalance ? `${Math.abs(change24h).toFixed(2)}%` : '••••'}
              </div>
            </div>
   
          </div>
        </div>
      </CardBody>
    </Card>
   );
};

// Modern Tabs Component
const ModernTabs: React.FC<{
  selectedTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  tokenCount: number;
  nftCount: number;
  children: React.ReactNode;
}> = ({ selectedTab, onTabChange, tokenCount, nftCount, children }) => {
  const tabs = [
    {
      key: 'tokens' as TabKey,
      label: 'Tokens',
      count: tokenCount,
      icon: Coins,
      color: 'bg-primary-500'
    },
    {
      key: 'nfts' as TabKey,
      label: 'NFTs',
      count: nftCount,
      icon: Image,
      color: 'secondary'
    },
    {
      key: 'transactions' as TabKey,
      label: 'History',
      count: null,
      icon: Activity,
      color: 'warning'
    }
  ];

  return (
    <div className='w-full rounded-2xl lg:rounded-3xl border border-divider bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl animate-in fade-in-0 duration-100 slide-in-from-bottom-6 p-4 pb-0'>
               {/* Gradient overlay */}
               <div className="absolute inset-0 rounded-2xl lg:rounded-3xl  bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5" />
      <div className="pb-0">
        <div className="flex items-center justify-between w-full">
          {/* Custom Tab Design */}
          <div className="flex items-center gap-1 p-1 bg-default-200 rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`relative flex items-center gap-2 px-2 py-1 rounded-xl text-sm font-medium transition-all duration-75 ${
                  selectedTab === tab.key
                    ? 'bg-default-100 shadow-sm text-foreground'
                    : 'text-default-600 hover:text-foreground hover:bg-default-200/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors `}>
                  <tab.icon className="w-3.5 h-3.5" />
                </div>
                <span className='text-xs font-semibold'>{tab.label}</span>
                {tab.count !== null && (
                  <Chip 
                    size="sm" 
                    variant="solid" 
                    color={selectedTab === tab.key ? tab.color as any : 'default'}
                    className="text-[10px] min-w-6 h-5"
                  >
                    {tab.count}
                  </Chip>
                )}
                
                {selectedTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r from-${tab.color}/5 to-${tab.color}/10 rounded-lg -z-10`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>

     
        </div>
      </div>
      
      <div className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.1 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

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
 
         <div className="flex h-[70vh] items-center justify-center">
        
         <div className="flex items-center space-x-2">
     <GooeyLoader />
          <div className="flex flex-col">
            <span className="text-xl font-bold">MoneyMappr</span>
           <p className="text-sm text-muted-foreground">Loading wallet analytics...</p>
 </div>
 
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

  return (
    <div className={`w-full  space-y-2 ${className}`}>
      {/* Top Controls Bar */}
      <TopControlsBar
        selectedChain={selectedChain}
        onChainChange={setSelectedChain}
        showBalance={showBalance}
        onToggleBalance={handleToggleBalance}
        onRefresh={refreshData}
        refreshing={refreshing}
        availableChains={availableChains}
      />

      {/* Modern Header with Stats */}
      <WalletHeader
        address={address}
        selectedChain={selectedChain}
        showBalance={showBalance} onChainChange={function (chainId: string): void {
          throw new Error('Function not implemented.');
        } } onToggleBalance={function (): void {
          throw new Error('Function not implemented.');
        } } onRefresh={function (): void {
          throw new Error('Function not implemented.');
        } } availableChains={[]}      />

      {/* Charts Section 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
      </div>*/}

      {/* Modern Tabbed Content */}
      <ModernTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        tokenCount={tokenCount}
        nftCount={nftCount}
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
      </ModernTabs>

    </div>
  );
};