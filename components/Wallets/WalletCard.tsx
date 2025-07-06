// components/Wallets/WalletCard.tsx
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
  Target
} from 'lucide-react';
import clsx from 'clsx';
import { useState, useMemo } from 'react';

// Breakpoint constants matching project standards
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

interface WalletTier {
  tier: 'legendary' | 'epic' | 'rare' | 'common';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
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

  // Memoized calculations for performance
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
      riskLevel: totalValue > 500000 ? 'high' : totalValue > 100000 ? 'medium' : 'low'
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
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy address:', error);
    } finally {
      setTimeout(() => setIsCopying(false), 1000);
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

  // Determine wallet tier automatically if not provided
  const walletTier = tier || (() => {
    if (calculations.isVeryHighValue) return { tier: 'legendary', icon: Crown, color: 'text-warning', bgColor: 'bg-warning/10' };
    if (calculations.isHighValue) return { tier: 'epic', icon: Star, color: 'text-secondary', bgColor: 'bg-secondary/10' };
    if (calculations.hasActivity && calculations.isHealthy) return { tier: 'rare', icon: Shield, color: 'text-primary-500', bgColor: 'bg-primary-500/10' };
    return { tier: 'common', icon: Wallet, color: 'text-default-500', bgColor: 'bg-default-100' };
  })();

  // Loading state
  if (isLoading) {
    return (
      <Card className={clsx("border-default-200", className)}>
        <CardBody className={viewMode === 'list' ? "py-3 px-4" : "p-5"}>
          <div className={clsx(
            "flex gap-4",
            viewMode === 'list' ? "items-center" : "flex-col"
          )}>
            <Skeleton className={viewMode === 'list' ? "w-10 h-10 rounded-full" : "w-12 h-12 rounded-xl"} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
              {viewMode === 'grid' && (
                <>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-2 w-full" />
                </>
              )}
            </div>
            {viewMode === 'list' && <Skeleton className="h-8 w-20" />}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <Card 
        className={clsx(
          "group cursor-pointer transition-all duration-75 border-default-200 rounded-2xl w-full",
          "hover:shadow-md hover:border-primary-500/30",
          isSelected && "ring-1 ring-primary-500/50 border-primary-500/50",
          calculations.isHighValue && "bg-gradient-to-r from-orange-500/15 to-background/15",
          className
        )}
        isPressable
        onPress={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
        <CardBody className="py-2 px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section - Avatar & Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">

              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{wallet.name || 'Unnamed Wallet'}</h3>
                  {calculations.isVeryHighValue && (
                    <Chip size="sm" color="warning" variant="flat" className="rounded-lg text-[10px] font-medium"
                    startContent={ <Crown className="w-2.5 h-2.5 mr-1" />}>
                     
                      WHALE
                    </Chip>
                  )}
                  {calculations.isHighValue && !calculations.isVeryHighValue && (
                    <Chip size="sm" color="secondary" variant="flat" className="rounded-lg text-[10px] font-medium">
                      VIP
                    </Chip>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-default-500 bg-default-100 px-2 py-1 rounded font-mono">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </code>
                  <Tooltip content={isCopying ? "Copied!" : "Copy address"} delay={500}>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className={clsx(
                        "w-5 h-5 min-w-5 transition-all duration-200",
                        isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                      )}
                      onClick={copyAddress}
                      disabled={isCopying}
                    >
                      <Copy className={clsx("w-3 h-3", isCopying && "text-success")} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Middle Section - Stats (Hidden on mobile) */}
            {showDetailedStats && (
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[11px] text-default-500 mb-1 font-medium">Positions</p>
                  <p className="font-semibold text-xs">{calculations.positionsCount}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-[11px] text-default-500 mb-1 font-medium">Chains</p>
                  <p className="font-semibold text-xs">{calculations.chainsCount}</p>
                </div>

                <div className="text-center">
                  <p className="text-[11px] text-default-500 mb-1 font-medium">Risk</p>
                  <div className={clsx(
                    "w-2 h-2 rounded-full mx-auto",
                    calculations.riskLevel === 'high' ? 'bg-danger' :
                    calculations.riskLevel === 'medium' ? 'bg-warning' : 'bg-success'
                  )} />
                </div>
              </div>
            )}

            {/* Right Section - Value & Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold text-sm sm:text-base">{formatCurrency(calculations.totalValue)}</p>
                <div className={clsx(
                  "flex items-center gap-1 text-xs",
                  calculations.isPositive ? 'text-success' : 'text-danger'
                )}>
                  {calculations.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatPercent(calculations.dayChangePercent)}
                </div>
              </div>

              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className={clsx(
                      "transition-all duration-200",
                      isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
                    )}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu variant="flat">
                  <DropdownItem key="view" startContent={<Eye className="w-4 h-4" />}>
                    View Details
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
        </CardBody>
      </Card>
    );
  }

  // Grid Card View
  return (
    <Card 
      className={clsx(
        "group cursor-pointer relative overflow-hidden transition-all duration-300 ease-out",
        "hover:shadow-xl hover:-translate-y-2 border-default-200 rounded-2xl",
        "hover:border-primary/40 hover:bg-gradient-to-br hover:from-background hover:to-primary/5",
        isSelected && "ring-2 ring-primary/50 border-primary/50 shadow-lg",
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
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-gradient-to-r border-t-warning z-10">
          <Crown className="absolute -top-6 -right-5 w-4 h-4 text-white drop-shadow-sm" />
        </div>
      )}

      {/* Status Indicator */}
      {calculations.hasActivity && (
        <div className="absolute top-3 left-3 z-10">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-sm" />
        </div>
      )}

      <CardBody className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="relative">
            <div className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-all duration-300",
              walletTier.bgColor,
              walletTier.color,
              "group-hover:shadow-lg group-hover:scale-105"
            )}>
              {walletInitial}
            </div>
            
            {calculations.hasActivity && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-3 border-background shadow-sm">
                <div className="w-full h-full rounded-full bg-success animate-pulse" />
              </div>
            )}

            {/* Tier indicator */}
            <div className={clsx(
              "absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
              walletTier.bgColor,
              "group-hover:scale-110"
            )}>
              <walletTier.icon className={clsx("w-2 h-2", walletTier.color)} />
            </div>
          </div>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className={clsx(
                  "w-8 h-8 transition-all duration-300",
                  isHovered ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-90 rotate-90"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu variant="flat">
              <DropdownItem key="view" startContent={<Eye className="w-4 h-4" />}>
                View Details
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
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-base truncate flex-1">{wallet.name || 'Unnamed Wallet'}</h3>
              {calculations.isVeryHighValue && (
                <Chip size="sm" color="warning" variant="flat" className="text-xs font-medium">
                  <Crown className="w-2.5 h-2.5 mr-1" />
                  WHALE
                </Chip>
              )}
              {calculations.isHighValue && !calculations.isVeryHighValue && (
                <Chip size="sm" color="secondary" variant="flat" className="text-xs font-medium">
                  VIP
                </Chip>
              )}
            </div>
            <Tooltip content={wallet.address} delay={1000}>
              <code className="text-xs text-default-500 bg-default-100 rounded-lg px-3 py-1.5 inline-block font-mono cursor-pointer hover:bg-default-200 transition-colors">
                {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
              </code>
            </Tooltip>
          </div>

          {/* Value Section */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight">
                {formatCurrency(calculations.totalValue)}
              </span>
              <div className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                calculations.isPositive 
                  ? 'bg-success/15 text-success border border-success/30 shadow-success/10' 
                  : 'bg-danger/15 text-danger border border-danger/30 shadow-danger/10',
                "shadow-sm"
              )}>
                {calculations.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {formatPercent(calculations.dayChangePercent)}
              </div>
            </div>

            {/* Daily Change Value */}
            <div className="text-sm text-default-600">
              <span className={calculations.isPositive ? 'text-success' : 'text-danger'}>
                {calculations.isPositive ? '+' : ''}{formatCurrency(calculations.dayChange)}
              </span>
              <span className="text-default-400 ml-1">today</span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full shadow-sm" />
                <span className="text-default-600">{calculations.positionsCount} positions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full shadow-sm" />
                <span className="text-default-600">{calculations.chainsCount} chains</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={clsx(
                  "w-2 h-2 rounded-full shadow-sm",
                  calculations.riskLevel === 'high' ? 'bg-danger' :
                  calculations.riskLevel === 'medium' ? 'bg-warning' : 'bg-success'
                )} />
                <span className="text-default-600 capitalize">{calculations.riskLevel} risk</span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-3">
            <Progress
              value={Math.min(((calculations.totalValue) / 1000000) * 100, 100)}
              color={calculations.isVeryHighValue ? "warning" : "primary"}
              size="sm"
              className="max-w-full"
              classNames={{
                track: "border border-default-200",
                indicator: calculations.isVeryHighValue ? "bg-gradient-to-r from-warning to-warning-400" : "bg-gradient-to-r from-primary to-primary-400"
              }}
            />
            <div className="flex justify-between items-center text-xs text-default-400">
              <span>Portfolio Growth</span>
              <span>{Math.min(((calculations.totalValue) / 1000000) * 100, 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Hover Action */}
          <div className={clsx(
            "transition-all duration-300 transform",
            isHovered 
              ? "opacity-100 translate-y-0 scale-100" 
              : "opacity-0 translate-y-4 scale-95"
          )}>
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm">
              <MousePointer2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">View Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </div>
      </CardBody>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
          <div className="flex items-center gap-3 px-4 py-2 bg-background/80 rounded-xl border border-default-200 shadow-lg">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-primary font-medium">Syncing data...</span>
          </div>
        </div>
      )}
    </Card>
  );
}