// components/Wallets/WalletCard.tsx
'use client';

import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { Progress } from '@heroui/progress';
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
  Activity
} from 'lucide-react';
import clsx from 'clsx';

interface WalletTier {
  tier: 'legendary' | 'epic' | 'common';
  icon: React.ComponentType<any>;
}

interface WalletCardProps {
  wallet: WalletSummary;
  viewMode: 'grid' | 'list';
  showBalance: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  tier: WalletTier;
  isLoading?: boolean;
}

export function WalletCard({ 
  wallet, 
  viewMode, 
  showBalance, 
  onEdit, 
  onDelete, 
  onClick,
  tier,
  isLoading = false
}: WalletCardProps) {
  const formatCurrency = (value: number | undefined | null, compact = true) => {
    if (!showBalance) return '••••••';
    
    const numValue = Number(value) || 0;
    
    if (compact) {
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
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(1)}%`;
  };

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(wallet.address);
  };

  const openEtherscan = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://etherscan.io/address/${wallet.address}`, '_blank');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const isPositive = (wallet.dayChange || 0) >= 0;
  const isHighValue = (wallet.totalValue || 0) >= 100000;
  const hasActivity = (wallet.positionsCount || 0) > 0;
  const walletInitial = wallet.name?.[0]?.toUpperCase() || wallet.address[2]?.toUpperCase() || 'W';

  if (viewMode === 'list') {
    return (
      <Card 
        className="group cursor-pointer hover:shadow-md transition-all duration-75 border-default-200 hover:border-primary/50 rounded-2xl"
        isPressable
        onPress={onClick}
      >
        <CardBody className="p-4">
          <div className="flex items-center justify-between gap-3 ">
            {/* Left Section - Avatar & Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                  {isHighValue ? <Crown className="w-5 h-5" /> : walletInitial}
                </div>
                {hasActivity && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background">
                    <div className="w-full h-full rounded-full bg-success animate-pulse" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{wallet.name || 'Unnamed Wallet'}</h3>
                  {isHighValue && (
                    <Badge size="sm" color="warning" variant="flat">VIP</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-default-500 font-mono bg-default-100 px-2 py-1 rounded">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="w-5 h-5 min-w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={copyAddress}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Middle Section - Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-[11px] text-default-500 mb-1">Positions</p>
                <p className="font-semibold text-xs">{wallet.positionsCount || 0}</p>
              </div>
              
              <div className="text-center">
                <p className="text-[11px] text-default-500 mb-1">Chains</p>
                <p className="font-semibold text-xs">{wallet.chainsCount || 0}</p>
              </div>
            </div>

            {/* Right Section - Value & Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(wallet.totalValue?.positions)}</p>
                <div className={clsx(
                  "flex items-center gap-1 text-sm",
                  isPositive ? 'text-success' : 'text-danger'
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPercent(wallet.dayChangePercent)}
                </div>
              </div>

              <Dropdown>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
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
        "group cursor-pointer relative overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-1 border-default-200 hover:border-primary/30",
        isHighValue && "ring-1 ring-warning/20"
      )}
      isPressable
      onPress={onClick}
    >
      {/* Premium Corner Badge */}
      {isHighValue && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[24px] border-l-transparent border-t-[24px] border-t-warning z-10">
          <Crown className="absolute -top-5 -right-4 w-3 h-3 text-white" />
        </div>
      )}

      <CardBody className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm group-hover:shadow-md transition-shadow">
              {walletInitial}
            </div>
            
            {hasActivity && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background">
                <div className="w-full h-full rounded-full bg-success animate-pulse" />
              </div>
            )}
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
               
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
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
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-base truncate flex-1">{wallet.name || 'Unnamed Wallet'}</h3>
              {isHighValue && (
                <Chip size="sm" color="warning" variant="flat" className="text-xs">VIP</Chip>
              )}
            </div>
            <p className="text-xs text-default-500 font-mono bg-default-100 rounded px-2 py-1 inline-block">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </p>
          </div>

          {/* Value Section */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                {formatCurrency(wallet.totalValue)}
              </span>
              <div className={clsx(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
                isPositive 
                  ? 'bg-success/10 text-success border border-success/20' 
                  : 'bg-danger/10 text-danger border border-danger/20'
              )}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {formatPercent(wallet.dayChangePercent)}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-default-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>{wallet.positionsCount || 0} positions</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>{wallet.chainsCount || 0} chains</span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <Progress
              value={Math.min(((wallet.totalValue || 0) / 500000) * 100, 100)}
              color="primary"
              size="sm"
              className="max-w-full"
            />
            <p className="text-xs text-default-400 text-center">Portfolio Growth</p>
          </div>

          {/* Hover Action */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-primary/10 rounded-lg border border-primary/20">
              <MousePointer2 className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">View Analytics</span>
              <ArrowUpRight className="w-3 h-3 text-primary" />
            </div>
          </div>
        </div>
      </CardBody>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-primary font-medium">Syncing...</span>
          </div>
        </div>
      )}
    </Card>
  );
}