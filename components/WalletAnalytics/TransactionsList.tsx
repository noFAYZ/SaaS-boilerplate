// components/WalletAnalytics/TransactionsList.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  CardBody,
  Button, 
  Badge, 
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Divider,
  Tooltip,
  Switch,
  Progress,
  Accordion,
  AccordionItem
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Activity, 
  Send, 
  Download, 
  Repeat, 
  ArrowDownRight, 
  ArrowUpRight,
  Target,
  ExternalLink,
  Search,
  Filter,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Hash,
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowUpLeft,
  ArrowDownLeft,
 
  Plus,
  Minus,
  DollarSign,
  Calendar,
  Eye,
  EyeOff,
  MoreVertical,
  Layers,
  Trash2,
  Shield,
  AlertTriangle,
  Info,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronRight,
  User,
  Globe,
  Code,
  FileText,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { zerionSDK } from '@/lib/zerion';
import { SUPPORTED_CHAINS, ANIMATION_DELAYS, DEFAULT_PAGE_SIZE } from '@/lib/wallet-analytics/constants';
import { formatCurrency, formatTimeAgo, openEtherscan, truncateAddress } from '@/lib/wallet-analytics/utils';
import type { Transaction } from '@/lib/wallet-analytics/types';
import clsx from 'clsx';
import GooeyLoader from '../shared/loader';
import { IconoirCoinsSwap } from '../icons/icons';

interface TransactionsListProps {
  address: string;
  selectedChain: string;
  showBalance: boolean;
}

interface TransactionTypeConfig {
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  text: string;
  label: string;
  description: string;
}

type FilterType = 'all' | 'send' | 'receive' | 'swap' | 'approve' | 'failed';
type SortType = 'date' | 'value' | 'gas' | 'type';

const getTypeConfig = (type: string): TransactionTypeConfig => {
  switch (type) {
    case 'send': 
      return { 
        icon: Send, 
        color: 'warning',
        bg: 'bg-warning/10',
        text: 'text-warning-600',
        label: 'Send',
        description: 'Outgoing transfer'
      };
    case 'receive': 
      return { 
        icon: Download, 
        color: 'success',
        bg: 'bg-success/10',
        text: 'text-success-600',
        label: 'Receive',
        description: 'Incoming transfer'
      };
    case 'trade': 
    case 'swap': 
      return { 
        icon: IconoirCoinsSwap, 
        color: 'primary',
        bg: 'bg-primary/10',
        text: 'text-primary-600',
        label: 'Swap',
        description: 'Token exchange'
      };
    case 'deposit': 
      return {
        icon: ArrowDownLeft,
        color: 'secondary',
        bg: 'bg-secondary/10',
        text: 'text-secondary-600',
        label: 'Deposit',
        description: 'Asset deposit'
      };
    case 'withdraw': 
      return {
        icon: ArrowUpLeft,
        color: 'danger',
        bg: 'bg-danger/10',
        text: 'text-danger-600',
        label: 'Withdraw',
        description: 'Asset withdrawal'
      };
    case 'approve':
      return {
        icon: CheckCircle2,
        color: 'default',
        bg: 'bg-default-100',
        text: 'text-default-600',
        label: 'Approve',
        description: 'Token approval'
      };
    default: 
      return { 
        icon: Activity, 
        color: 'default',
        bg: 'bg-default-100',
        text: 'text-default-600',
        label: 'Contract',
        description: 'Contract interaction'
      };
  }
};

const getStatusConfig = (status: string, isTrash: boolean = false) => {
  if (isTrash) {
    return {
      icon: Trash2,
      color: 'text-danger',
      bg: 'bg-danger/10',
      label: 'Spam',
      description: 'Flagged as spam'
    };
  }

  switch (status) {
    case 'confirmed':
      return {
        icon: CheckCircle2,
        color: 'text-success',
        bg: 'bg-success/10',
        label: 'Confirmed',
        description: 'Transaction confirmed'
      };
    case 'pending':
      return {
        icon: Clock,
        color: 'text-warning',
        bg: 'bg-warning/10',
        label: 'Pending',
        description: 'Awaiting confirmation'
      };
    case 'failed':
      return {
        icon: XCircle,
        color: 'text-danger',
        bg: 'bg-danger/10',
        label: 'Failed',
        description: 'Transaction failed'
      };
    default:
      return {
        icon: Info,
        color: 'text-default-500',
        bg: 'bg-default-800 dark:bg-default-100',
        label: 'Unknown',
        description: 'Status unknown'
      };
  }
};

export const TransactionsList: React.FC<TransactionsListProps> = ({ 
  address, 
  selectedChain, 
  showBalance 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [sortAscending, setSortAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hideSpam, setHideSpam] = useState(true);
  const [hideFailedTx, setHideFailedTx] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());

  const loadTransactions = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        page: { size: 50 }
      };
      
      const response = await zerionSDK.wallets.getTransactions(address, filters);
      console.log('Transactions response:', response.data);
      setTransactions(response.data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => {
      const operationType = tx.attributes?.operation_type || '';
      const hash = tx.attributes?.hash || '';
      const status = tx.attributes?.status || '';
      const isTrash = tx.attributes?.flags?.is_trash || false;
      const transfers = tx.attributes?.transfers || [];
      
      // Hide spam transactions if enabled
      if (hideSpam && isTrash) return false;
      
      // Hide failed transactions if enabled
      if (hideFailedTx && status === 'failed') return false;
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesHash = hash.toLowerCase().includes(searchLower);
        const matchesType = operationType.toLowerCase().includes(searchLower);
        const matchesTransfer = transfers.some(transfer => 
          transfer.fungible_info?.symbol?.toLowerCase().includes(searchLower) ||
          transfer.fungible_info?.name?.toLowerCase().includes(searchLower)
        );
        
        if (!matchesHash && !matchesType && !matchesTransfer) return false;
      }
      
      // Type filter
      if (filter !== 'all') {
        if (filter === 'failed' && status !== 'failed') return false;
        if (filter !== 'failed' && operationType !== filter) return false;
      }
      
      return true;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.attributes?.mined_at || 0).getTime();
          const dateB = new Date(b.attributes?.mined_at || 0).getTime();
          comparison = dateB - dateA;
          break;
        case 'value':
          const valueA = a.attributes?.transfers?.reduce((sum, t) => sum + (t.value || 0), 0) || 0;
          const valueB = b.attributes?.transfers?.reduce((sum, t) => sum + (t.value || 0), 0) || 0;
          comparison = valueB - valueA;
          break;
        case 'gas':
          const gasA = a.attributes?.fee?.value || 0;
          const gasB = b.attributes?.fee?.value || 0;
          comparison = gasB - gasA;
          break;
        case 'type':
          comparison = (a.attributes?.operation_type || '').localeCompare(b.attributes?.operation_type || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortAscending ? -comparison : comparison;
    });

    return filtered;
  }, [transactions, filter, sortBy, sortAscending, searchQuery, hideSpam, hideFailedTx]);

  // Calculate metrics
  const transactionMetrics = useMemo(() => {
    const validTxs = transactions.filter(tx => !tx.attributes?.flags?.is_trash);
    const totalValue = validTxs.reduce((sum, tx) => 
      sum + (tx.attributes?.transfers?.reduce((tSum, t) => tSum + (t.value || 0), 0) || 0), 0
    );
    const totalGas = validTxs.reduce((sum, tx) => sum + (tx.attributes?.fee?.value || 0), 0);
    const successfulTxs = validTxs.filter(tx => tx.attributes?.status === 'confirmed').length;
    const failedTxs = validTxs.filter(tx => tx.attributes?.status === 'failed').length;

    return {
      total: validTxs.length,
      totalValue,
      totalGas,
      successfulTxs,
      failedTxs,
      successRate: validTxs.length > 0 ? (successfulTxs / validTxs.length) * 100 : 0
    };
  }, [transactions]);

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const handleOpenEtherscan = (hash: string, chainId: string) => {
    const baseUrls: Record<string, string> = {
      ethereum: 'https://etherscan.io',
      polygon: 'https://polygonscan.com',
      arbitrum: 'https://arbiscan.io',
      optimism: 'https://optimistic.etherscan.io',
      base: 'https://basescan.org',
      bsc: 'https://bscscan.com'
    };
    
    const baseUrl = baseUrls[chainId] || baseUrls.ethereum;
    window.open(`${baseUrl}/tx/${hash}`, '_blank');
  };

  const toggleExpanded = (txId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(txId)) {
      newExpanded.delete(txId);
    } else {
      newExpanded.add(txId);
    }
    setExpandedTransactions(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <GooeyLoader />
          <p className="text-default-500 font-medium mt-4">Loading transactions...</p>
          <p className="text-xs text-default-400 mt-1">Fetching transaction history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger/20 bg-danger/5">
        <CardBody className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-danger mb-2">Failed to Load Transactions</h3>
          <p className="text-danger mb-4">{error}</p>
          <Button color="danger" variant="flat" onPress={loadTransactions} startContent={<RefreshCw className="w-4 h-4" />}>
            Retry Loading
          </Button>
        </CardBody>
      </Card>
    );
  }
 
  if (transactions.length === 0) {
    return (
      <Card className="border-dashed border-2 border-default-200">
        <CardBody className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
          <p className="text-sm text-default-500 max-w-sm mx-auto mb-4">
            Transaction history will appear here once available for this wallet.
          </p>
          <Button variant="flat" color="primary" onPress={loadTransactions} startContent={<RefreshCw className="w-4 h-4" />}>
            Refresh Data
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transaction Metrics */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardBody className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-xs text-default-500 uppercase tracking-wide">Total</span>
              </div>
              <p className="text-lg font-bold">{transactionMetrics.total}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-success" />
                <span className="text-xs text-default-500 uppercase tracking-wide">Volume</span>
              </div>
              <p className="text-lg font-bold text-success">{formatCurrency(transactionMetrics.totalValue, showBalance)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-xs text-default-500 uppercase tracking-wide">Gas Spent</span>
              </div>
              <p className="text-lg font-bold text-warning">{formatCurrency(transactionMetrics.totalGas, showBalance)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs text-default-500 uppercase tracking-wide">Success Rate</span>
              </div>
              <p className="text-lg font-bold text-success">{transactionMetrics.successRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Controls */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search by hash, token, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                className="w-full"
                size="sm"
                variant="flat"
                isClearable
                onClear={() => setSearchQuery('')}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Dropdown */}
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" size="sm" startContent={<Filter className="w-4 h-4" />}>
                    {filter === 'all' ? 'All Types' : 
                     filter === 'send' ? 'Send' :
                     filter === 'receive' ? 'Receive' :
                     filter === 'swap' ? 'Swaps' :
                     filter === 'approve' ? 'Approvals' : 'Failed'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[filter]}
                  onSelectionChange={(keys) => setFilter(Array.from(keys)[0] as FilterType)}
                >
                  <DropdownItem key="all">All Types</DropdownItem>
                  <DropdownItem key="send" startContent={<Send className="w-4 h-4" />}>Send</DropdownItem>
                  <DropdownItem key="receive" startContent={<Download className="w-4 h-4" />}>Receive</DropdownItem>
                  <DropdownItem key="swap" startContent={<IconoirCoinsSwap className="w-4 h-4" />}>Swaps</DropdownItem>
                  <DropdownItem key="approve" startContent={<CheckCircle2 className="w-4 h-4" />}>Approvals</DropdownItem>
                  <DropdownItem key="failed" startContent={<XCircle className="w-4 h-4" />}>Failed</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Sort Dropdown */}
              <Dropdown>
                <DropdownTrigger>
                  <Button variant="flat" size="sm" startContent={sortAscending ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}>
                    Sort
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="date" onPress={() => setSortBy('date')}>By Date</DropdownItem>
                  <DropdownItem key="value" onPress={() => setSortBy('value')}>By Value</DropdownItem>
                  <DropdownItem key="gas" onPress={() => setSortBy('gas')}>By Gas</DropdownItem>
                  <DropdownItem key="type" onPress={() => setSortBy('type')}>By Type</DropdownItem>
                  <DropdownItem key="toggle-order" onPress={() => setSortAscending(!sortAscending)}>
                    {sortAscending ? 'Sort Descending' : 'Sort Ascending'}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          <Divider className="my-3" />

          {/* Toggle Options */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Switch
                size="sm"
                isSelected={hideSpam}
                onValueChange={setHideSpam}
              />
              <span className="text-default-600">Hide spam transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                size="sm"
                isSelected={hideFailedTx}
                onValueChange={setHideFailedTx}
              />
              <span className="text-default-600">Hide failed transactions</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Transactions List - Compact View with Expandable Details */}
      <div className="space-y-1">
        <AnimatePresence>
          {filteredAndSortedTransactions.map((tx, index) => {
            const txId = tx.id || `${tx.attributes?.hash}-${index}`;
            const isExpanded = expandedTransactions.has(txId);
            const operationType = tx.attributes?.operation_type || 'unknown';
            const hash = tx.attributes?.hash || '';
            const minedAt = tx.attributes?.mined_at;
            const status = tx.attributes?.status || 'unknown';
            const isTrash = tx.attributes?.flags?.is_trash || false;
            const config = getTypeConfig(operationType);
            const statusConfig = getStatusConfig(status, isTrash);
            const gasFee = tx.attributes?.fee?.value || 0;
            const chainId = tx.relationships?.chain?.data?.id || '';
            const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
            const transfers = tx.attributes?.transfers || [];
            const nonce = tx.attributes?.nonce;
            const block = tx.attributes?.mined_at_block;
            const sentFrom = tx.attributes?.sent_from;
            const sentTo = tx.attributes?.sent_to;
            
            // Calculate total value from transfers
            const totalValue = transfers.reduce((sum, transfer) => sum + (transfer.value || 0), 0);
            const primaryTransfer = transfers[0];
            
            const IconComponent = config.icon;
            const StatusIcon = statusConfig.icon;
            
            return (
              <motion.div
                key={txId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ delay: index * 0.01, duration: 0.1 }}
              >
                <Card className={clsx(
                  "group hover:shadow-md transition-all duration-75 border border-default rounded-2xl overflow-hidden",
                  isTrash && "border-danger/20 bg-danger/5",
                  status === 'failed' && "border-warning/20 bg-warning/5",
                  isExpanded && "border-primary-500/20 shadow-md"
                )}>
                  {/* Compact Transaction Row */}
                  <CardBody 
                    className="p-3 cursor-pointer"
                    onClick={() => toggleExpanded(txId)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Transaction Icon with Status */}
                      <div className="relative flex-shrink-0">
                        <div className={clsx(
                          "w-8 h-8 rounded-xl flex items-center justify-center border border-background shadow-sm",
                          config.bg
                        )}>
                          <IconComponent className={clsx("w-3.5 h-3.5", config.text)} />
                        </div>
                        <div className={clsx(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center border border-background",
                          statusConfig.bg
                        )}>
                          <StatusIcon className={clsx("w-2 h-2", statusConfig.color)} />
                        </div>
                      </div>

                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm">{config.label}</span>
                          
                          {primaryTransfer && (
                            <div className="flex items-center gap-1">
                              <Avatar
                                src={primaryTransfer.fungible_info?.icon?.url}
                                fallback={
                                  <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[8px] font-semibold">
                                    {(primaryTransfer.fungible_info?.symbol || 'T').slice(0, 1)}
                                  </div>
                                }
                                className="w-4 h-4"
                              />
                              <span className="text-xs text-default-600 font-medium">
                                {primaryTransfer.fungible_info?.symbol || 'Unknown'}
                              </span>
                            </div>
                          )}
                          
                          {transfers.length > 1 && (
                            <Chip size="sm" variant="flat" className="text-[9px] px-1 h-4">
                              +{transfers.length - 1}
                            </Chip>
                          )}
                          
                          {chainInfo && (
                            <span className="text-xs">{chainInfo.icon}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-default-500">
                          <span>{minedAt ? formatTimeAgo(minedAt) : 'Pending'}</span>
                          {hash && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{truncateAddress(hash, 6)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Value and Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          {totalValue > 0 && (
                            <p className="font-bold text-sm">
                              {formatCurrency(totalValue, showBalance)}
                            </p>
                          )}
                          <div className={clsx(
                            "flex items-center justify-end gap-1 text-[10px] font-medium",
                            statusConfig.color
                          )}>
                            <span>{statusConfig.label}</span>
                          </div>
                        </div>
                        
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4 text-default-400" />
                        </motion.div>
                      </div>
                    </div>
                  </CardBody>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Divider />
                        <CardBody className="p-4 pt-3 bg-default-50/50">
                          <div className="space-y-4">
                            {/* Transaction Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              <div>
                                <p className="text-default-500 mb-1">Status</p>
                                <div className={clsx("flex items-center gap-1", statusConfig.color)}>
                                  <StatusIcon className="w-3 h-3" />
                                  <span className="font-medium">{statusConfig.label}</span>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-default-500 mb-1">Gas Fee</p>
                                <p className="font-semibold">{formatCurrency(gasFee, showBalance)}</p>
                              </div>
                              
                              {nonce && (
                                <div>
                                  <p className="text-default-500 mb-1">Nonce</p>
                                  <p className="font-mono">{nonce}</p>
                                </div>
                              )}
                              
                              {block && (
                                <div>
                                  <p className="text-default-500 mb-1">Block</p>
                                  <p className="font-mono">{block.toLocaleString()}</p>
                                </div>
                              )}
                            </div>

                            {/* Address Information */}
                            {(sentFrom || sentTo) && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Addresses
                                </h4>
                                <div className="grid gap-2 text-xs">
                                  {sentFrom && (
                                    <div className="flex items-center justify-between bg-background rounded-lg p-2">
                                      <span className="text-default-500">From:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono">{truncateAddress(sentFrom)}</span>
                                        <Button
                                          size="sm"
                                          variant="light"
                                          isIconOnly
                                          className="h-6 w-6 min-w-6"
                                          onPress={(e) => {
                                            e.stopPropagation();
                                            handleCopyHash(sentFrom);
                                          }}
                                        >
                                          {copiedHash === sentFrom ? (
                                            <CheckCircle2 className="w-3 h-3 text-success" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  {sentTo && (
                                    <div className="flex items-center justify-between bg-background rounded-lg p-2">
                                      <span className="text-default-500">To:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono">{truncateAddress(sentTo)}</span>
                                        <Button
                                          size="sm"
                                          variant="light"
                                          isIconOnly
                                          className="h-6 w-6 min-w-6"
                                          onPress={(e) => {
                                            e.stopPropagation();
                                            handleCopyHash(sentTo);
                                          }}
                                        >
                                          {copiedHash === sentTo ? (
                                            <CheckCircle2 className="w-3 h-3 text-success" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Transfers Details */}
                            {transfers.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm flex items-center gap-2">
                                  <Coins className="w-4 h-4" />
                                  Transfers ({transfers.length})
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {transfers.map((transfer, transferIndex) => (
                                    <div key={transferIndex} className="flex items-center justify-between bg-background rounded-lg p-3">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Avatar
                                          src={transfer.fungible_info?.icon?.url}
                                          fallback={
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold">
                                              {(transfer.fungible_info?.symbol || 'T').slice(0, 2)}
                                            </div>
                                          }
                                          className="w-8 h-8"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-sm truncate">
                                              {transfer.fungible_info?.symbol || 'Unknown'}
                                            </p>
                                            {transfer.fungible_info?.flags?.verified && (
                                              <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0" />
                                            )}
                                          </div>
                                          <p className="text-xs text-default-500 truncate">
                                            {transfer.fungible_info?.name || 'Unknown Token'}
                                          </p>
                                          <p className="text-xs text-default-600 font-mono">
                                            {transfer.quantity?.float || 0} {transfer.fungible_info?.symbol}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className={clsx(
                                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                          transfer.direction === 'in' 
                                            ? 'bg-success/10 text-success' 
                                            : 'bg-warning/10 text-warning'
                                        )}>
                                          {transfer.direction === 'in' ? (
                                            <ArrowDownRight className="w-3 h-3" />
                                          ) : (
                                            <ArrowUpRight className="w-3 h-3" />
                                          )}
                                          <span>{transfer.direction === 'in' ? 'IN' : 'OUT'}</span>
                                        </div>
                                        
                                        {transfer.value && (
                                          <div className="text-right">
                                            <p className="font-bold text-sm">
                                              {formatCurrency(transfer.value, showBalance)}
                                            </p>
                                            {transfer.price && (
                                              <p className="text-xs text-default-500">
                                                ${transfer.price.toFixed(transfer.price < 1 ? 6 : 2)}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Transaction Hash & Actions */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                Transaction Hash
                              </h4>
                              <div className="flex items-center gap-2 bg-background rounded-lg p-3">
                                <span className="font-mono text-xs flex-1 truncate">{hash}</span>
                                <div className="flex items-center gap-1">
                                  <Tooltip content="Copy hash">
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      isIconOnly
                                      onPress={(e) => {
                                        e.stopPropagation();
                                        handleCopyHash(hash);
                                      }}
                                    >
                                      {copiedHash === hash ? (
                                        <CheckCircle2 className="w-4 h-4 text-success" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content="View on explorer">
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      isIconOnly
                                      onPress={(e) => {
                                        e.stopPropagation();
                                        handleOpenEtherscan(hash, chainId);
                                      }}
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>

                            {/* Additional Metadata */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-background rounded-lg p-2">
                                <p className="text-default-500 mb-1">Network</p>
                                <div className="flex items-center gap-2">
                                  <span>{chainInfo?.icon}</span>
                                  <span className="font-medium">{chainInfo?.name || 'Unknown'}</span>
                                </div>
                              </div>
                              
                              <div className="bg-background rounded-lg p-2">
                                <p className="text-default-500 mb-1">Timestamp</p>
                                <p className="font-medium">
                                  {minedAt ? new Date(minedAt).toLocaleString() : 'Pending'}
                                </p>
                              </div>
                            </div>

                            {/* Warning for Spam/Failed */}
                            {(isTrash || status === 'failed') && (
                              <div className={clsx(
                                "rounded-lg p-3 border",
                                isTrash 
                                  ? "bg-danger/5 border-danger/20 text-danger" 
                                  : "bg-warning/5 border-warning/20 text-warning"
                              )}>
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold text-sm">
                                      {isTrash ? 'Spam Transaction' : 'Failed Transaction'}
                                    </p>
                                    <p className="text-xs opacity-80">
                                      {isTrash 
                                        ? 'This transaction has been flagged as spam or malicious.'
                                        : 'This transaction failed to execute properly.'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredAndSortedTransactions.length === 0 && (transactions.length > 0 || searchQuery || filter !== 'all') && (
        <Card className="border-dashed border-2 border-default-200">
          <CardBody className="text-center py-8">
            <Search className="w-8 h-8 text-default-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No transactions match your criteria</h3>
            <p className="text-sm text-default-500 mb-3">
              {searchQuery && `No results for "${searchQuery}"`}
              {filter !== 'all' && ` with filter "${filter}"`}
            </p>
            <div className="flex items-center justify-center gap-2">
              {searchQuery && (
                <Button 
                  variant="flat" 
                  color="primary" 
                  size="sm"
                  onPress={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              )}
              {filter !== 'all' && (
                <Button 
                  variant="flat" 
                  color="secondary" 
                  size="sm"
                  onPress={() => setFilter('all')}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Summary Footer */}
      {filteredAndSortedTransactions.length > 0 && (
        <Card className="border-default bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardBody className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-default-500">
                  Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
                </span>
                {(hideSpam || hideFailedTx || filter !== 'all') && (
                  <Chip size="sm" variant="flat" color="default">
                    Filtered
                  </Chip>
                )}
                <div className="flex items-center gap-1 text-xs text-default-500">
                  <Info className="w-3 h-3" />
                  <span>Click any transaction to expand details</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-xs text-default-500">Success Rate</p>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={transactionMetrics.successRate} 
                      color="success"
                      size="sm"
                      className="w-16"
                    />
                    <span className="font-semibold text-success">
                      {transactionMetrics.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-default-500">Total Gas Spent</p>
                  <p className="font-bold text-warning">
                    {formatCurrency(transactionMetrics.totalGas, showBalance)}
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};