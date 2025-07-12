// components/Wallets/WalletCard.tsx - Modern sleek design
'use client';

import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';
import { Tooltip } from '@heroui/tooltip';
import { Skeleton } from '@heroui/skeleton';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { WalletSummary } from '@/lib/zerion';
import { 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Edit3,
  Trash2,
  RefreshCw,
  Eye,
  Copy,
  ExternalLink,
  Crown,
  Star,
  MousePointer2,
  ArrowUpRight,
  Activity,
  AlertCircle,
  Shield,
  Zap,
  Target,
  CheckCircle,
  Sparkles,
  DollarSign,
  PieChart,
  Layers3
} from 'lucide-react';
import clsx from 'clsx';
import { useState, useMemo } from 'react';

interface WalletTier {
  tier: 'legendary' | 'epic' | 'rare' | 'common';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  gradient: string;
}

interface WalletCardProps {
  wallet: WalletSummary;
  viewMode: 'grid' | 'list';
  showBalance: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  tier?: WalletTier;
  isLoading?: boolean;
  isSelected?: boolean;
  showDetailedStats?: boolean;
  className?: string;
}

export function WalletCard({ 
  wallet, 
  viewMode, 
  showBalance, 
  onEdit, 
  onDelete, 
  onClick,
  tier,
  isLoading = false,
  isSelected = false,
  showDetailedStats = true,
  className = ''
}: WalletCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Enhanced calculations with more metrics
  const calculations = useMemo(() => {
    const totalValue = Number(wallet.totalValue?.positions) || 0;
    const dayChange = Number(wallet.dayChange) || 0;
    const dayChangePercent = Number(wallet.dayChangePercent) || 0;
    const positionsCount = Number(wallet.positionsCount) || 0;
    const chainsCount = Number(wallet.chainsCount) || 0;

    return {
      totalValue,
      dayChange,
      dayChangePercent,
      positionsCount,
      chainsCount,
      isPositive: dayChangePercent >= 0,
      isHighValue: totalValue >= 100000,
      isVeryHighValue: totalValue >= 1000000,
      hasActivity: positionsCount > 0,
      isHealthy: positionsCount >= 3 && chainsCount >= 2,
      riskLevel: totalValue > 500000 ? 'high' : totalValue > 100000 ? 'medium' : 'low',
      performanceScore: Math.min(Math.max((dayChangePercent + 10) / 20 * 100, 0), 100),
      diversificationScore: Math.min((chainsCount * 20) + (positionsCount * 5), 100),
      portfolioHealth: positionsCount > 5 && chainsCount > 2 ? 'excellent' : 
                      positionsCount > 2 && chainsCount > 1 ? 'good' : 'fair'
    };
  }, [wallet]);

  const formatCurrency = (value: number | undefined | null, compact = true) => {
    if (!showBalance) return '••••••';
    
    const numValue = Number(value) || 0;
    
    if (compact) {
      if (numValue >= 1000000000) return `$${(numValue / 1000000000).toFixed(1)}B`;
      if (numValue >= 1000000) return `$${(numValue / 1000000).toFixed(1)}M`;
      if (numValue >= 1000) return `$${(numValue / 1000).toFixed(1)}K`;
      return `$${numValue.toFixed(0)}`;
    }
    
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

  const copyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCopying(true);
    
    try {
      await navigator.clipboard.writeText(wallet.address);
    } catch (error) {
      console.error('Failed to copy address:', error);
    } finally {
      setTimeout(() => setIsCopying(false), 1500);
    }
  };

  const openEtherscan = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://etherscan.io/address/${wallet.address}`, '_blank', 'noopener,noreferrer');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const walletInitial = wallet.name?.[0]?.toUpperCase() || wallet.address[2]?.toUpperCase() || 'W';

  // Enhanced wallet tier system
  const walletTier = tier || (() => {
    if (calculations.isVeryHighValue) return { 
      tier: 'legendary', 
      icon: Crown, 
      color: 'text-warning-600', 
      bgColor: 'bg-gradient-to-br from-warning-100 to-warning-50',
      gradient: 'from-warning-500 to-warning-600'
    };
    if (calculations.isHighValue) return { 
      tier: 'epic', 
      icon: Star, 
      color: 'text-secondary-600', 
      bgColor: 'bg-gradient-to-br from-secondary-100 to-secondary-50',
      gradient: 'from-secondary-500 to-secondary-600'
    };
    if (calculations.hasActivity && calculations.isHealthy) return { 
      tier: 'rare', 
      icon: Shield, 
      color: 'text-primary-600', 
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-50',
      gradient: 'from-primary-500 to-primary-600'
    };
    return { 
      tier: 'common', 
      icon: Wallet, 
      color: 'text-default-600', 
      bgColor: 'bg-gradient-to-br from-default-100 to-default-50',
      gradient: 'from-default-400 to-default-500'
    };
  })() as WalletTier;

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={clsx("border border-default-200/50 shadow-sm", className)}>
        <CardBody className={viewMode === 'list' ? "p-4" : "p-6"}>
          <div className={clsx(
            "flex gap-4",
            viewMode === 'list' ? "items-center" : "flex-col"
          )}>
            <Skeleton className={viewMode === 'list' ? "w-12 h-12 rounded-2xl" : "w-16 h-16 rounded-2xl"} />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              {viewMode === 'grid' && (
                <>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-2 w-full" />
                </>
              )}
            </div>
            {viewMode === 'list' && <Skeleton className="h-8 w-24" />}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <Card 
        className={clsx(
          "group cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02]",
          "border border-default-200/50 hover:border-primary-300/50 hover:shadow-lg hover:shadow-primary-500/10",
          "bg-gradient-to-r from-background via-background to-default-50/30",
          isSelected && "ring-2 ring-primary-500/50 border-primary-400/50 shadow-lg shadow-primary-500/20",
          calculations.isVeryHighValue && "ring-1 ring-warning-400/30 shadow-warning-500/10",
          calculations.isHighValue && !calculations.isVeryHighValue && "ring-1 ring-secondary-300/30",
          className
        )}
        isPressable
        onPress={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardBody className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar Section */}
            <div className="relative flex-shrink-0">
              <div className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300",
                walletTier.bgColor,
                walletTier.color,
                "group-hover:shadow-md group-hover:scale-105"
              )}>
                {walletInitial}
              </div>
              
              {/* Status indicators */}
              {calculations.hasActivity && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background">
                  <div className="w-full h-full bg-success rounded-full animate-pulse" />
                </div>
              )}

              {/* Tier badge */}
              <div className={clsx(
                "absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm",
                `bg-gradient-to-br ${walletTier.gradient}`,
                "border border-background"
              )}>
                <walletTier.icon className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-base truncate">{wallet.name || 'Unnamed Wallet'}</h3>
                
                {/* Premium badges */}
                {calculations.isVeryHighValue && (
                  <Chip 
                    size="sm" 
                    className="bg-gradient-to-r from-warning-500 to-warning-600 text-white text-xs font-bold px-2 py-1"
                    startContent={<Crown className="w-3 h-3" />}
                  >
                    WHALE
                  </Chip>
                )}
                {calculations.isHighValue && !calculations.isVeryHighValue && (
                  <Chip size="sm" color="secondary" variant="solid" className="text-xs font-semibold">
                    VIP
                  </Chip>
                )}
              </div>

              <div className="flex items-center gap-3">
                <code className="text-xs text-default-500 bg-default-100/80 px-2.5 py-1 rounded-lg font-mono border border-default-200/50">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </code>
                
                <div className="flex items-center gap-1">
                  <Tooltip content={isCopying ? "Copied!" : "Copy address"} delay={300}>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className={clsx(
                        "w-6 h-6 min-w-6 transition-all duration-200 rounded-lg",
                        isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      )}
                      onClick={copyAddress}
                      disabled={isCopying}
                    >
                      <Copy className={clsx("w-3 h-3", isCopying && "text-success")} />
                    </Button>
                  </Tooltip>
                  
                  <Tooltip content="View on Etherscan" delay={300}>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className={clsx(
                        "w-6 h-6 min-w-6 transition-all duration-200 rounded-lg",
                        isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      )}
                      onClick={openEtherscan}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Stats Section - Hidden on very small screens */}
            {showDetailedStats && (
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-default-500 mb-1 font-medium">Positions</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <p className="font-semibold text-sm">{calculations.positionsCount}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-default-500 mb-1 font-medium">Chains</p>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <p className="font-semibold text-sm">{calculations.chainsCount}</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-default-500 mb-1 font-medium">Health</p>
                  <div className={clsx(
                    "w-3 h-3 rounded-full mx-auto border-2 border-background shadow-sm",
                    calculations.portfolioHealth === 'excellent' ? 'bg-success' :
                    calculations.portfolioHealth === 'good' ? 'bg-warning' : 'bg-default-400'
                  )} />
                </div>
              </div>
            )}

            {/* Value Section */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(calculations.totalValue)}</p>
                <div className={clsx(
                  "flex items-center gap-1 justify-end text-sm font-semibold",
                  calculations.isPositive ? 'text-success' : 'text-danger'
                )}>
                  {calculations.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {formatPercent(calculations.dayChangePercent)}
                </div>
              </div>

              {/* Action Menu */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className={clsx(
                      "w-8 h-8 transition-all duration-200 rounded-xl",
                      isHovered ? "opacity-100 scale-100 bg-default-100" : "opacity-0 scale-90"
                    )}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu variant="flat" className="min-w-48">
                  <DropdownItem key="view" startContent={<Eye className="w-4 h-4" />}>
                    View Analytics
                  </DropdownItem>
                  <DropdownItem key="edit" startContent={<Edit3 className="w-4 h-4" />} onPress={handleEdit}>
                    Edit Name
                  </DropdownItem>
                  <DropdownItem key="refresh" startContent={<RefreshCw className="w-4 h-4" />}>
                    Refresh Data
                  </DropdownItem>
                  <DropdownItem key="copy" startContent={<Copy className="w-4 h-4" />} onPress={copyAddress}>
                    Copy Address
                  </DropdownItem>
                  <DropdownItem key="etherscan" startContent={<ExternalLink className="w-4 h-4" />} onPress={openEtherscan}>
                    View on Etherscan
                  </DropdownItem>
                  <DropdownItem key="delete" color="danger" startContent={<Trash2 className="w-4 h-4" />} onPress={handleDelete}>
                    Remove Wallet
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Performance indicator bar */}
          <div className={clsx(
            "mt-3 transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center justify-between text-xs text-default-500 mb-1">
              <span>Portfolio Performance</span>
              <span>{calculations.performanceScore.toFixed(0)}%</span>
            </div>
            <Progress
              value={calculations.performanceScore}
              size="sm"
              color={calculations.isPositive ? "success" : "danger"}
              className="h-1"
              classNames={{
                indicator: clsx(
                  "transition-all duration-500",
                  calculations.isPositive 
                    ? "bg-gradient-to-r from-success-400 to-success-600" 
                    : "bg-gradient-to-r from-danger-400 to-danger-600"
                )
              }}
            />
          </div>
        </CardBody>
      </Card>
    );
  }

  // Grid Card View - Enhanced for better visual appeal
  return (
    <Card 
      className={clsx(
        "group cursor-pointer relative overflow-hidden transition-all duration-500 ease-out",
        "hover:shadow-2xl hover:-translate-y-1 border border-default-200/50 rounded-3xl",
        "hover:border-primary/40 bg-gradient-to-br from-background via-background to-default-50/50",
        "hover:bg-gradient-to-br hover:from-background hover:via-background hover:to-primary/5",
        isSelected && "ring-2 ring-primary/50 border-primary/50 shadow-xl shadow-primary/10",
        calculations.isVeryHighValue && "ring-1 ring-warning/30 shadow-warning/10",
        calculations.isHighValue && !calculations.isVeryHighValue && "ring-1 ring-secondary/20",
        className
      )}
      isPressable
      onPress={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium Corner Badge */}
      {calculations.isVeryHighValue && (
        <div className="absolute top-0 right-0 z-10">
          <div className="w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-warning">
            <Crown className="absolute -top-8 -right-6 w-5 h-5 text-white drop-shadow-sm" />
          </div>
        </div>
      )}

      {/* Animated background gradient */}
      <div className={clsx(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        `bg-gradient-to-br ${walletTier.gradient}`,
        "mix-blend-soft-light"
      )} />

      <CardBody className="p-8 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="relative">
            <div className={clsx(
              "w-16 h-16 rounded-3xl flex items-center justify-center font-bold text-xl shadow-lg transition-all duration-500",
              walletTier.bgColor,
              walletTier.color,
              "group-hover:shadow-xl group-hover:scale-110"
            )}>
              {walletInitial}
            </div>
            
            {/* Activity indicator */}
            {calculations.hasActivity && (
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-success rounded-full border-3 border-background shadow-lg">
                <div className="w-full h-full rounded-full bg-success animate-pulse" />
              </div>
            )}

            {/* Tier indicator with glow */}
            <div className={clsx(
              "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg",
              `bg-gradient-to-br ${walletTier.gradient}`,
              "border-2 border-background group-hover:scale-125 group-hover:shadow-xl"
            )}>
              <walletTier.icon className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Action Menu */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className={clsx(
                  "w-10 h-10 transition-all duration-500 rounded-2xl",
                  isHovered 
                    ? "opacity-100 scale-100 rotate-0 bg-default-100/80 backdrop-blur-sm" 
                    : "opacity-0 scale-90 rotate-90"
                )}
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu variant="flat" className="min-w-48">
              <DropdownItem key="view" startContent={<Eye className="w-4 h-4" />}>
                View Analytics
              </DropdownItem>
              <DropdownItem key="edit" startContent={<Edit3 className="w-4 h-4" />} onPress={handleEdit}>
                Edit Name
              </DropdownItem>
              <DropdownItem key="refresh" startContent={<RefreshCw className="w-4 h-4" />}>
                Refresh Data
              </DropdownItem>
              <DropdownItem key="copy" startContent={<Copy className="w-4 h-4" />} onPress={copyAddress}>
                Copy Address
              </DropdownItem>
              <DropdownItem key="etherscan" startContent={<ExternalLink className="w-4 h-4" />} onPress={openEtherscan}>
                View on Etherscan
              </DropdownItem>
              <DropdownItem key="delete" color="danger" startContent={<Trash2 className="w-4 h-4" />} onPress={handleDelete}>
                Remove Wallet
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Wallet Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-xl truncate flex-1">{wallet.name || 'Unnamed Wallet'}</h3>
              {calculations.isVeryHighValue && (
                <Chip 
                  size="sm" 
                  className="bg-gradient-to-r from-warning-500 to-warning-600 text-white font-bold"
                  startContent={<Crown className="w-3 h-3" />}
                >
                  WHALE
                </Chip>
              )}
              {calculations.isHighValue && !calculations.isVeryHighValue && (
                <Chip size="sm" color="secondary" variant="solid" className="font-semibold">
                  VIP
                </Chip>
              )}
            </div>
            
            <Tooltip content={wallet.address} delay={1000}>
              <code className="text-sm text-default-500 bg-default-100/80 rounded-xl px-4 py-2 inline-block font-mono cursor-pointer hover:bg-default-200/80 transition-colors border border-default-200/50">
                {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
              </code>
            </Tooltip>
          </div>

          {/* Value Section */}
          <div className="space-y-5">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold tracking-tight">
                {formatCurrency(calculations.totalValue)}
              </span>
              <div className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg",
                calculations.isPositive 
                  ? 'bg-gradient-to-r from-success-100 to-success-50 text-success-700 border border-success-200' 
                  : 'bg-gradient-to-r from-danger-100 to-danger-50 text-danger-700 border border-danger-200'
              )}>
                {calculations.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {formatPercent(calculations.dayChangePercent)}
              </div>
            </div>

            {/* Daily Change Value */}
            <div className="text-base">
              <span className={clsx("font-semibold", calculations.isPositive ? 'text-success' : 'text-danger')}>
                {calculations.isPositive ? '+' : ''}{formatCurrency(calculations.dayChange)}
              </span>
              <span className="text-default-400 ml-2 font-medium">today</span>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/0 border border-primary/10">
              <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-primary">{calculations.positionsCount}</p>
              <p className="text-xs text-default-500 font-medium">Positions</p>
            </div>
            
            <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-secondary/5 to-secondary/0 border border-secondary/10">
              <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Layers3 className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-sm font-semibold text-secondary">{calculations.chainsCount}</p>
              <p className="text-xs text-default-500 font-medium">Chains</p>
            </div>

            <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-default/5 to-default/0 border border-default/10">
              <div className="w-8 h-8 mx-auto mb-2 rounded-xl bg-default/10 flex items-center justify-center">
                <div className={clsx(
                  "w-4 h-4 rounded-full shadow-sm",
                  calculations.portfolioHealth === 'excellent' ? 'bg-success' :
                  calculations.portfolioHealth === 'good' ? 'bg-warning' : 'bg-default-400'
                )} />
              </div>
              <p className="text-sm font-semibold capitalize">{calculations.portfolioHealth}</p>
              <p className="text-xs text-default-500 font-medium">Health</p>
            </div>
          </div>

          {/* Performance Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-default-600">Portfolio Performance</span>
              <span className="font-semibold">{calculations.performanceScore.toFixed(0)}%</span>
            </div>
            <Progress
              value={calculations.performanceScore}
              color={calculations.isPositive ? "success" : "warning"}
              size="md"
              className="h-2"
              classNames={{
                track: "border border-default-200/50 bg-default-100/50",
                indicator: clsx(
                  "transition-all duration-1000",
                  calculations.isPositive 
                    ? "bg-gradient-to-r from-success-400 via-success-500 to-success-600" 
                    :                   "bg-gradient-to-r from-warning-400 via-warning-500 to-warning-600"
                )
              }}
            />
          </div>

          {/* Hover Action with Smooth Animation */}
          <div className={clsx(
            "transition-all duration-500 transform",
            isHovered 
              ? "opacity-100 translate-y-0 scale-100" 
              : "opacity-0 translate-y-6 scale-95"
          )}>
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl border border-primary/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 text-primary">
                <MousePointer2 className="w-4 h-4" />
                <span className="text-sm font-semibold">View Analytics</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Diversification Indicator */}
          <div className={clsx(
            "mt-4 transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-60"
          )}>
            <div className="flex items-center justify-between text-xs text-default-500 mb-2">
              <span className="font-medium">Diversification Score</span>
              <span className="font-semibold">{calculations.diversificationScore.toFixed(0)}%</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "h-1.5 rounded-full flex-1 transition-all duration-300",
                    i < Math.floor(calculations.diversificationScore / 20)
                      ? "bg-gradient-to-r from-secondary-400 to-secondary-600"
                      : "bg-default-200"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </CardBody>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-20 rounded-3xl">
          <div className="flex items-center gap-4 px-6 py-3 bg-background/90 rounded-2xl border border-default-200 shadow-xl backdrop-blur-sm">
            <div className="relative">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 w-6 h-6 border border-primary/20 rounded-full" />
            </div>
            <span className="text-sm text-primary font-semibold">Syncing data...</span>
          </div>
        </div>
      )}

      {/* Subtle shine effect on hover */}
      <div className={clsx(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none",
        "bg-gradient-to-r from-transparent via-white/5 to-transparent",
        "transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%]",
        "transition-transform duration-1000 ease-out"
      )} />
    </Card>
  );
}