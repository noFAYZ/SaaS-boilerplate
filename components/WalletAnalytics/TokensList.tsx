// components/WalletAnalytics/TokensList.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Spinner, 
  Badge, 
  Button, 
  Avatar,
  Chip,
  Progress,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Switch
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
  Activity,
  Eye,
  EyeOff,
  Star,
  Crown,
  Zap,
  Shield,
  DollarSign,
  Percent,
  Hash,
  SortAsc,
  SortDesc,
  BarChart3,
  Sparkles,
  Globe,
  LineChart,
  PieChart,
  Target,
  Wallet,
  Award,
  Flame,
  Diamond,
  Hexagon
} from 'lucide-react';
import { zerionSDK } from '@/lib/zerion';
import { SUPPORTED_CHAINS, ANIMATION_DELAYS, DEFAULT_PAGE_SIZE } from '@/lib/wallet-analytics/constants';
import { formatCurrency, formatNumber } from '@/lib/wallet-analytics/utils';
import type { WalletPosition } from '@/lib/wallet-analytics/types';
import clsx from 'clsx';
import GooeyLoader from '../shared/loader';
import { MaterialIconThemeVerified } from '../icons/icons';

interface TokensListProps {
  address: string;
  selectedChain: string;
  showBalance: boolean;
}

type SortMode = 'value' | 'change' | 'quantity' | 'alphabetical' | 'price';
type FilterMode = 'all' | 'verified' | 'highValue' | 'gainers' | 'losers';

export const TokensList: React.FC<TokensListProps> = ({ 
  address, 
  selectedChain, 
  showBalance 
}) => {
  const [tokens, setTokens] = useState<WalletPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('value');
  const [sortAscending, setSortAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [hideZeroValues, setHideZeroValues] = useState(true);
  const [hideDustTokens, setHideDustTokens] = useState(true);
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);

  const DUST_THRESHOLD = 0.01;

  const loadTokens = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          trash: 'only_non_trash' as const,
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        sort: 'value' as const,
        page: { size: DEFAULT_PAGE_SIZE }
      };
      
      const response = await zerionSDK.wallets.getPositions(address, filters);
      setTokens(response.data || []);
    } catch (err) {
      console.error('Failed to load tokens:', err);
      setError('Failed to load tokens');
      setTokens([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // Filter and sort tokens
  const filteredAndSortedTokens = useMemo(() => {
    let filtered = tokens.filter(token => {
      const value = token.attributes?.value || 0;
      const symbol = token.attributes?.fungible_info?.symbol || '';
      const name = token.attributes?.fungible_info?.name || '';
      const isVerified = token.attributes?.fungible_info?.flags?.verified || false;
      const change24h = token.attributes?.changes?.percent_1d || 0;

      if (hideZeroValues && value <= 0) return false;
      if (hideDustTokens && value > 0 && value <= DUST_THRESHOLD) return false;

      const matchesSearch = symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           name.toLowerCase().includes(searchQuery.toLowerCase());
      if (searchQuery && !matchesSearch) return false;

      switch (filterMode) {
        case 'verified':
          return isVerified;
        case 'highValue':
          return value >= 1000;
        case 'gainers':
          return change24h > 0;
        case 'losers':
          return change24h < 0;
        default:
          return true;
      }
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortMode) {
        case 'value':
          comparison = (b.attributes?.value || 0) - (a.attributes?.value || 0);
          break;
        case 'change':
          comparison = (b.attributes?.changes?.percent_1d || 0) - (a.attributes?.changes?.percent_1d || 0);
          break;
        case 'quantity':
          comparison = (b.attributes?.quantity_float || 0) - (a.attributes?.quantity_float || 0);
          break;
        case 'price':
          comparison = (b.attributes?.price || 0) - (a.attributes?.price || 0);
          break;
        case 'alphabetical':
          comparison = (a.attributes?.fungible_info?.symbol || '').localeCompare(
            b.attributes?.fungible_info?.symbol || ''
          );
          break;
        default:
          comparison = 0;
      }

      return sortAscending ? -comparison : comparison;
    });

    return filtered;
  }, [tokens, searchQuery, sortMode, sortAscending, filterMode, hideZeroValues, hideDustTokens]);

  const portfolioMetrics = useMemo(() => {
    const validTokens = tokens.filter(token => (token.attributes?.value || 0) > 0);
    const totalValue = validTokens.reduce((sum, token) => sum + (token.attributes?.value || 0), 0);
    const totalGainers = validTokens.filter(token => (token.attributes?.changes?.percent_1d || 0) > 0).length;
    const totalLosers = validTokens.filter(token => (token.attributes?.changes?.percent_1d || 0) < 0).length;
    const avgChange = validTokens.length > 0 
      ? validTokens.reduce((sum, token) => sum + (token.attributes?.changes?.percent_1d || 0), 0) / validTokens.length 
      : 0;
    const topGainer = validTokens.reduce((max, token) => 
      (token.attributes?.changes?.percent_1d || 0) > (max.attributes?.changes?.percent_1d || 0) ? token : max, 
      validTokens[0] || null
    );
    const topLoser = validTokens.reduce((min, token) => 
      (token.attributes?.changes?.percent_1d || 0) < (min.attributes?.changes?.percent_1d || 0) ? token : min, 
      validTokens[0] || null
    );

    return {
      totalValue,
      totalTokens: validTokens.length,
      totalGainers,
      totalLosers,
      avgChange,
      topGainer,
      topLoser
    };
  }, [tokens]);

  const handleCopyAddress = async (tokenAddress: string) => {
    try {
      await navigator.clipboard.writeText(tokenAddress);
      setCopiedAddress(tokenAddress);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const getTokenRarity = (value: number, totalValue: number) => {
    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
    if (percentage >= 50) return { 
      level: 'legendary', 
      color: 'from-yellow-400 via-orange-500 to-red-500', 
      icon: Crown,
      gradient: 'bg-gradient-to-r from-yellow-400/20 to-orange-500/20',
      border: 'border-yellow-400/50'
    };
    if (percentage >= 20) return { 
      level: 'epic', 
      color: 'from-purple-400 via-pink-500 to-purple-600', 
      icon: Diamond,
      gradient: 'bg-gradient-to-r from-purple-400/20 to-pink-500/20',
      border: 'border-purple-400/50'
    };
    if (percentage >= 10) return { 
      level: 'rare', 
      color: 'from-blue-400 via-cyan-500 to-blue-600', 
      icon: Zap,
      gradient: 'bg-gradient-to-r from-blue-400/20 to-cyan-500/20',
      border: 'border-blue-400/50'
    };
    if (percentage >= 5) return { 
      level: 'uncommon', 
      color: 'from-green-400 via-emerald-500 to-green-600', 
      icon: Star,
      gradient: 'bg-gradient-to-r from-green-400/20 to-emerald-500/20',
      border: 'border-green-400/50'
    };
    return { 
      level: 'common', 
      color: 'from-gray-400 to-gray-500', 
      icon: Shield,
      gradient: 'bg-gray-100',
      border: 'border-gray-300'
    };
  };

  const getPerformanceColor = (change: number) => {
    if (change >= 10) return 'text-green-500';
    if (change >= 5) return 'text-green-400';
    if (change > 0) return 'text-emerald-400';
    if (change > -5) return 'text-orange-400';
    if (change > -10) return 'text-red-400';
    return 'text-red-500';
  };

  const getPerformanceIcon = (change: number) => {
    if (change >= 10) return Flame;
    if (change >= 5) return TrendingUp;
    if (change > 0) return ArrowUpRight;
    if (change > -5) return ArrowDownRight;
    return TrendingDown;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative">
            <GooeyLoader />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <p className="text-default-500 font-medium mt-6">Analyzing your portfolio...</p>
          <p className="text-xs text-default-400 mt-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Discovering hidden gems
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4 relative">
            <AlertCircle className="w-8 h-8 text-danger" />
            <div className="absolute inset-0 bg-danger/20 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
          <p className="text-default-500 mb-6">{error}</p>
          <Button 
            color="danger" 
            variant="flat" 
            onPress={loadTokens} 
            startContent={<RefreshCw className="w-4 h-4" />}
            className="relative overflow-hidden"
          >
            <span className="relative z-10">Try Again</span>
            <div className="absolute inset-0 bg-gradient-to-r from-danger/20 to-danger/10 animate-pulse"></div>
          </Button>
        </div>
      </div>
    );
  }
 
  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/30 flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
            <Coins className="w-10 h-10 text-primary relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-semibold mb-3">Portfolio Empty</h3>
          <p className="text-default-500 mb-6">
            This wallet doesn't have any positions on the selected network, or all positions have zero value.
          </p>
          <Button 
            variant="flat" 
            color="primary" 
            onPress={loadTokens} 
            startContent={<RefreshCw className="w-4 h-4" />}
            className="relative overflow-hidden"
          >
            <span className="relative z-10">Refresh Data</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 hover:opacity-100 transition-opacity"></div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">


      {/* Enhanced Controls */}
      <div className=" relative overflow-hidden">
   
        <div className="relative z-10 flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-3 h-3 text-default-400" />}
              className="w-full"
              size="sm"
              variant="flat"
              isClearable
              onClear={() => setSearchQuery('')}
              classNames={{
                input: "text-xs",
                inputWrapper: "h-8 bg-default-200 focus-within:bg-default-100 ",
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  size="sm" 
                  startContent={<Filter className="w-3 h-3" />}
                  className="h-8 text-xs min-w-16"
                >
                  {filterMode === 'all' ? 'All' : 
                   filterMode === 'verified' ? '✓' :
                   filterMode === 'highValue' ? '💎' :
                   filterMode === 'gainers' ? '📈' : '📉'}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[filterMode]}
                onSelectionChange={(keys) => setFilterMode(Array.from(keys)[0] as FilterMode)}
              >
                <DropdownItem key="all" startContent={<Globe className="w-4 h-4" />}>
                  All Tokens
                </DropdownItem>
                <DropdownItem key="verified" startContent={<CheckCircle2 className="w-4 h-4 text-success" />}>
                  Verified Only
                </DropdownItem>
                <DropdownItem key="highValue" startContent={<Crown className="w-4 h-4 text-warning" />}>
                  High Value ($1K+)
                </DropdownItem>
                <DropdownItem key="gainers" startContent={<TrendingUp className="w-4 h-4 text-success" />}>
                  24h Gainers
                </DropdownItem>
                <DropdownItem key="losers" startContent={<TrendingDown className="w-4 h-4 text-danger" />}>
                  24h Losers
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  size="sm" 
                  isIconOnly
                  className="h-8 w-8 "
                >
                  {sortAscending ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />}
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="value" onPress={() => setSortMode('value')} startContent={<DollarSign className="w-4 h-4" />}>
                  By Value
                </DropdownItem>
                <DropdownItem key="change" onPress={() => setSortMode('change')} startContent={<BarChart3 className="w-4 h-4" />}>
                  By 24h Change
                </DropdownItem>
                <DropdownItem key="quantity" onPress={() => setSortMode('quantity')} startContent={<Hash className="w-4 h-4" />}>
                  By Quantity
                </DropdownItem>
                <DropdownItem key="price" onPress={() => setSortMode('price')} startContent={<Target className="w-4 h-4" />}>
                  By Price
                </DropdownItem>
                <DropdownItem key="alphabetical" onPress={() => setSortMode('alphabetical')} startContent={<Award className="w-4 h-4" />}>
                  Alphabetical
                </DropdownItem>
                <DropdownItem key="toggle-order" onPress={() => setSortAscending(!sortAscending)}>
                  {sortAscending ? 'Sort Descending' : 'Sort Ascending'}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <div className="flex items-center gap-2">
              <Switch
                size="sm"
                isSelected={hideZeroValues}
                onValueChange={setHideZeroValues}
                classNames={{
                  wrapper: "group-data-[selected=true]:bg-gradient-to-r group-data-[selected=true]:from-primary-500 group-data-[selected=true]:to-pink-500"
                }}
              />
              <span className="text-xs text-default-500">Hide Zero</span>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                size="sm"
                isSelected={hideDustTokens}
                onValueChange={setHideDustTokens}
                classNames={{
                  wrapper: "group-data-[selected=true]:bg-gradient-to-r group-data-[selected=true]:from-primary-500 group-data-[selected=true]:to-pink-500"
                }}
              />
              <span className="text-xs text-default-500">Hide Dust</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tokens List */}
      <div className="  overflow-hidden relative">
     
        
   

        <div className="relative z-10 divide-y divide-default">
          <AnimatePresence>
            {filteredAndSortedTokens.map((position, index) => {
              const value = position.attributes?.value || 0;
              const quantity = position.attributes?.quantity?.numeric || 0;
              const symbol = position.attributes?.fungible_info?.symbol || 'Unknown';
              const name = position.attributes?.fungible_info?.name || 'Unknown Asset';
              const chainId = position.relationships?.chain?.data?.id || '';
              const percentage = portfolioMetrics.totalValue > 0 ? (value / portfolioMetrics.totalValue) * 100 : 0;
              const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
              const change24h = position.attributes?.changes?.percent_1d || 0;
              const price = position.attributes?.price || 0;
              const isVerified = position.attributes?.fungible_info?.flags?.verified || false;
              const tokenAddress = position.attributes?.fungible_info?.implementations?.[0]?.address || '';
              const isPositive = change24h >= 0;
              const rarity = getTokenRarity(value, portfolioMetrics.totalValue);
              const isHovered = hoveredToken === position.id;
              const PerformanceIcon = getPerformanceIcon(change24h);
              
              return (
                <motion.div
                  key={position.id || index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ delay: index * 0.01, duration: 0.1 }}
                  className={clsx(
                    "group cursor-pointer  relative overflow-hidden",
                    isHovered && "bg-gradient-to-r from-primary-500/10 to-transparent",
                    !isHovered && "hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5",
                  
                  )}
                  onMouseEnter={() => setHoveredToken(position.id)}
                  onMouseLeave={() => setHoveredToken(null)}
                >
              
                  
                  <div className="relative z-10 flex items-center gap-2 p-2 min-h-[48px]">
                    {/* Token Avatar & Info */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="relative flex-shrink-0 group/avatar">
                        <Avatar
                          src={position.attributes?.fungible_info?.icon?.url || undefined}
                          fallback={
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center text-white text-xs font-bold relative overflow-hidden">
                              <span className="relative z-10">{symbol.slice(0, 2)}</span>
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                            </div>
                          }
                          className={clsx(
                            "w-10 h-10 border border-background shadow-sm  group-hover/avatar:scale-105 group-hover/avatar:shadow-lg",
                            rarity.level !== 'common' && `${rarity.border} shadow-md`,
                            isHovered && "scale-105"
                          )}
                        />
                        
                        {/* Chain Badge */}
                        {chainInfo && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-default border border-background shadow-sm flex items-center justify-center text-[10px] transition-transform group-hover/avatar:scale-105">
                            {chainInfo.icon}
                          </div>
                        )}
                        
                     

                        {/* Performance Glow Effect */}
                        {Math.abs(change24h) > 5 && (
                          <div className={clsx(
                            "absolute inset-0 rounded-lg blur-sm opacity-30 animate-pulse",
                            change24h > 5 ? "bg-green-400" : "bg-red-400"
                          )}></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <h4 className={clsx(
                            "font-semibold text-sm truncate ",
                         
                          )}>
                            {symbol}
                          </h4>
                          
                          {isVerified && (
                            <div className="w-4 h-4 rounded-full bg-success/10 flex items-center justify-center transition-transform group-hover:scale-105">
                              <MaterialIconThemeVerified className="w-3.5 h-3.5 " />
                            </div>
                          )}
                          
                          {percentage >= 5 && (
                            <Chip 
                              size="sm" 
                              color={percentage >= 20 ? "warning" : percentage >= 10 ? "secondary" : "primary"} 
                              variant="flat" 
                              className={clsx(
                                "text-[10px] h-4 px-1 ",
                                isHovered && "scale-105"
                              )}
                              startContent={percentage >= 20 ? <Crown className="w-2 h-2" /> : undefined}
                            >
                              {percentage.toFixed(0)}%
                            </Chip>
                          )}

                          {/* Performance Badge */}
                          {Math.abs(change24h) >= 10 && (
                            <div className={clsx(
                              "w-4 h-4 rounded-full flex items-center justify-center  group-hover:scale-110",
                              change24h >= 10 ? "bg-green-500/20" : "bg-red-500/20"
                            )}>
                              {change24h >= 10 ? (
                                <Flame className="w-2 h-2 text-green-500" />
                              ) : (
                                <TrendingDown className="w-2 h-2 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className={clsx(
                            "text-[10px] text-default-500 font-mono bg-default-100 px-1.5 py-0.5 rounded truncate ",
                            isHovered && "bg-primary/10 text-primary"
                          )}>
                            {formatNumber(quantity, showBalance)}
                          </span>
                          
                          <span className="text-[10px] text-default-400 truncate max-w-[80px]  group-hover:text-default-600">
                            {name.length > 12 ? name.slice(0, 12) + '...' : name}
                          </span>

                          {/* Price Display */}
                          {price > 0 && (
                            <span className="text-[9px] text-default-300 font-mono">
                              ${price < 0.01 ? price.toExponential(1) : price.toFixed(price < 1 ? 4 : 2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Portfolio Allocation (Desktop) */}
                    <div className="hidden md:flex items-center gap-1 min-w-[70px] group/progress">
                      <div className="flex-1 relative">
                        <Progress 
                          value={percentage} 
                          color={percentage > 20 ? "warning" : percentage > 10 ? "secondary" : "primary"}
                          size="sm"
                          className="h-1.5  group-hover/progress:h-2"
                          classNames={{
                            indicator: clsx(
                              "",
                              rarity.level !== 'common' && `bg-gradient-to-r ${rarity.color}`,
                              isHovered && "shadow-md"
                            )
                          }}
                        />
                        
                        {/* Progress Glow Effect */}
                        {percentage > 10 && (
                          <div className={clsx(
                            "absolute inset-0 rounded-full blur-sm opacity-30 transition-opacity ",
                            "group-hover/progress:opacity-60",
                            percentage > 20 ? "bg-yellow-400" : percentage > 10 ? "bg-purple-400" : "bg-blue-400"
                          )}></div>
                        )}
                      </div>
                      
                      <span className={clsx(
                        "text-[10px] font-medium min-w-[24px] text-right ",
                        percentage > 10 ? "text-warning" : "text-default-500",
                        isHovered && "text-primary scale-105"
                      )}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>

                    {/* Enhanced Value & Performance */}
                    <div className="text-right min-w-[80px] space-y-0.5">
                      <p className={clsx(
                        "text-sm font-bold t",
                        isHovered && "scale-105 text-primary-500"
                      )}>
                        {formatCurrency(value, showBalance)}
                      </p>
                      
                      <div className={clsx(
                        "flex items-center justify-end gap-0.5 text-xs font-medium ",
                        getPerformanceColor(change24h),
                        isHovered && "scale-105"
                      )}>
                        <PerformanceIcon className="w-2.5 h-2.5" />
                        <span>{isPositive ? '+' : ''}{change24h.toFixed(1)}%</span>
                        
                        {/* Performance Pulse Effect */}
                        {Math.abs(change24h) > 5 && (
                          <div className={clsx(
                            "absolute w-1 h-1 rounded-full animate-pulse",
                            change24h > 5 ? "bg-green-400" : "bg-red-400"
                          )}></div>
                        )}
                      </div>

               
                    </div>

                    {/* Enhanced Actions */}
                    <div className={clsx(
                      "transition-all duration-75 transform",
                      isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className={clsx(
                              "text-default-400 hover:text-primary w-6 h-6 min-w-6 transition-all duration-75",
                              "hover:bg-primary/10 hover:scale-110"
                            )}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu className="min-w-[160px]">
                          <DropdownItem 
                            key="copy" 
                            startContent={
                              copiedAddress === tokenAddress ? (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )
                            }
                            onPress={() => handleCopyAddress(tokenAddress)}
                            className="transition-colors"
                          >
                            {copiedAddress === tokenAddress ? 'Copied!' : 'Copy Address'}
                          </DropdownItem>
                          <DropdownItem 
                            key="external" 
                            startContent={<ExternalLink className="w-4 h-4" />}
                            className="transition-colors"
                          >
                            View on Explorer
                          </DropdownItem>
                          <DropdownItem 
                            key="chart" 
                            startContent={<LineChart className="w-4 h-4" />}
                            className="transition-colors"
                          >
                            View Chart
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>

                  {/* Rank Indicator */}
                  {index < 3 && (
                    <div className={clsx(
                      "absolute left-0 top-0 bottom-0 w-1 ",
                      index === 0 ? "bg-gradient-to-b from-yellow-400 to-orange-500" :
                      index === 1 ? "bg-gradient-to-b from-gray-300 to-gray-400" :
                      "bg-gradient-to-b from-orange-400 to-orange-600"
                    )}></div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Enhanced Footer Summary */}
        {filteredAndSortedTokens.length > 0 && (
          <div className="relative z-10 p-2 border-t border-default-200 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-default-600 font-medium">
                    {filteredAndSortedTokens.length}/{tokens.length}
                  </span>
                  {(hideZeroValues || hideDustTokens) && (
                    <Chip size="sm" variant="flat" color="primary" className="text-[10px] h-4 bg-gradient-to-r from-primary/20 to-secondary/20">
                      Filtered
                    </Chip>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="hidden sm:flex items-center gap-3">
                  {portfolioMetrics.topGainer && (
                    <Tooltip content={`Best performer: ${portfolioMetrics.topGainer.attributes?.fungible_info?.symbol}`}>
                      <div className="flex items-center gap-1 text-xs text-success">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{(portfolioMetrics.topGainer.attributes?.changes?.percent_1d || 0).toFixed(1)}%</span>
                      </div>
                    </Tooltip>
                  )}
                  
                  {portfolioMetrics.topLoser && (
                    <Tooltip content={`Worst performer: ${portfolioMetrics.topLoser.attributes?.fungible_info?.symbol}`}>
                      <div className="flex items-center gap-1 text-xs text-danger">
                        <TrendingDown className="w-3 h-3" />
                        <span>{(portfolioMetrics.topLoser.attributes?.changes?.percent_1d || 0).toFixed(1)}%</span>
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] text-default-500 mb-0.5">Portfolio Value</p>
                <p className="text-sm font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  {formatCurrency(portfolioMetrics.totalValue, showBalance)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced No Results State */}
      {filteredAndSortedTokens.length === 0 && (tokens.length > 0 || searchQuery || filterMode !== 'all') && (
        <div className="bg-background/60 backdrop-blur-sm rounded-xl border border-default-200 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/30 flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
              <Search className="w-8 h-8 text-primary relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 animate-pulse"></div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              No matches found
            </h3>
            
            <p className="text-sm text-default-500 mb-6">
              {searchQuery && (
                <>No results for <span className="font-medium text-primary">"{searchQuery}"</span></>
              )}
              {filterMode !== 'all' && (
                <> with <span className="font-medium text-secondary">"{filterMode}"</span> filter applied</>
              )}
            </p>
            
            <div className="flex items-center justify-center gap-3">
              {searchQuery && (
                <Button 
                  variant="flat" 
                  color="primary"
                  size="sm"
                  onPress={() => setSearchQuery('')}
                  startContent={<Search className="w-4 h-4" />}
                  className="relative overflow-hidden"
                >
                  <span className="relative z-10">Clear Search</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 hover:opacity-100 transition-opacity"></div>
                </Button>
              )}
              
              {filterMode !== 'all' && (
                <Button 
                  variant="flat" 
                  color="secondary"
                  size="sm"
                  onPress={() => setFilterMode('all')}
                  startContent={<Filter className="w-4 h-4" />}
                  className="relative overflow-hidden"
                >
                  <span className="relative z-10">Reset Filters</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 opacity-0 hover:opacity-100 transition-opacity"></div>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};