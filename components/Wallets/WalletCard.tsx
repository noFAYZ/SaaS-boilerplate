// components/Wallets/WalletCard.tsx
import { Card, CardBody } from '@heroui/card';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Button } from '@heroui/button';
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
  Loader2,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

interface WalletCardProps {
  wallet: WalletSummary;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function WalletCard({ 
  wallet, 
  isSelected, 
  onClick, 
  onEdit, 
  onDelete, 
  onRefresh,
  isLoading
}: WalletCardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const openInEtherscan = () => {
    window.open(`https://etherscan.io/address/${wallet.address}`, '_blank');
  };

  const hasActivity = wallet.totalValue?.positions > 0;
  const isPositive = wallet.dayChange >= 0;
  const walletInitial = wallet.name?.[0]?.toUpperCase() || wallet.address[2]?.toUpperCase() || 'W';
  const isHighValue = (wallet.totalValue?.positions || 0) >= 100000;

  const getAvatarColor = () => {
    if (isHighValue) return 'from-amber-500 to-orange-600';
    if (hasActivity && isPositive) return 'from-emerald-500 to-teal-600';
    if (hasActivity) return 'from-blue-500 to-indigo-600';
    return 'from-slate-400 to-slate-600';
  };

  return (
    <Card 
      className={clsx(
        "group cursor-pointer relative overflow-hidden",
        "transition-all duration-75 ease-out",
       
        
      )}
      onClick={onClick}
    >
      {/* Premium corner indicator */}
      {isHighValue && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[24px] border-l-transparent border-t-[24px] border-t-amber-400">
          <Sparkles className="absolute -top-3 -right-3 w-2 h-2 text-white" />
        </div>
      )}

      <CardBody className="p-4 flex flex-col h-full">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Compact Avatar */}
            <div className="relative flex-shrink-0">
              <div className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                "bg-gradient-to-br shadow-md transition-transform duration-200 group-hover:scale-105",
                getAvatarColor()
              )}>
                {walletInitial}
              </div>
              {hasActivity && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </div>

            {/* Wallet Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {wallet.name || 'Unnamed Wallet'}
                </h3>
                {isHighValue && (
                  <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded font-medium">
                    VIP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {wallet.address.slice(0, 4)}...{wallet.address.slice(-3)}
                </span>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="w-4 h-4 min-w-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyAddress();
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Wallet actions">
              <DropdownItem key="view" startContent={<Eye className="w-4 h-4" />} onPress={() => onClick?.()}>
                View Details
              </DropdownItem>
              <DropdownItem key="edit" startContent={<Edit3 className="w-4 h-4" />} onPress={() => onEdit?.()}>
                Edit Name
              </DropdownItem>
              <DropdownItem key="refresh" startContent={<RefreshCw className="w-4 h-4" />} onPress={() => onRefresh?.()}>
                Refresh Data
              </DropdownItem>
              <DropdownItem key="copy" startContent={<Copy className="w-4 h-4" />} onPress={() => copyAddress()}>
                Copy Address
              </DropdownItem>
              <DropdownItem key="etherscan" startContent={<ExternalLink className="w-4 h-4" />} onPress={() => openInEtherscan()}>
                View on Etherscan
              </DropdownItem>
              <DropdownItem key="delete" color="danger" startContent={<Trash2 className="w-4 h-4" />} onPress={() => onDelete?.()}>
                Remove Wallet
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Portfolio Value */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none">
              {formatCurrency(wallet.totalValue?.positions || 0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Portfolio</div>
          </div>
          
          {/* Performance Badge */}
          <div className={clsx(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
            isPositive 
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" 
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
          )}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{formatPercent(wallet.dayChangePercent)}</span>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto">
          <div className="flex items-center gap-3">
            <span>{wallet.positionsCount || 0} positions</span>
            <span>•</span>
            <span>{wallet.chainsCount || 0} chains</span>
          </div>
          
          {hasActivity && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
            </div>
          )}
        </div>

        {/* Subtle progress bar
        <div className="mt-2 h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={clsx(
              "h-full transition-all duration-700 ease-out",
              isPositive 
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500" 
                : "bg-gradient-to-r from-red-400 to-red-500"
            )}
            style={{ 
              width: `${Math.min(Math.max((wallet.totalValue?.positions || 0) / 50000 * 100, 5), 100)}%` 
            }}
          />
        </div> */}
      </CardBody>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-600 dark:text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Syncing...</span>
          </div>
        </div>
      )}
    </Card>
  );
}