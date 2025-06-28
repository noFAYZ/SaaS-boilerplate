// components/WalletAnalytics/index.ts
export { WalletAnalytics } from './WalletAnalytics';
export { WalletHeader } from './WalletHeader';
export { PortfolioStats } from './PortfolioStats';
export { PortfolioChart } from './PortfolioChart';
export { ChainDistribution } from './ChainDistribution';
export { TokensList } from './TokensList';
export { NFTsList } from './NFTsList';
export { TransactionsList } from './TransactionsList';
export { CustomTooltip } from './CustomTooltip';

// Re-export types
export type {
  WalletAnalyticsProps,
  PortfolioData,
  WalletPosition,
  NFTPosition,
  Transaction,
  ChartDataPoint,
  ChartMetrics,
  ViewMode,
  SortOption,
  TabKey,
  Period,
  Chain
} from '@/lib/wallet-analytics/types';

// Re-export utilities
export {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatTokenId,
  formatTimeAgo,
  getChainInfo,
  getUniqueChains,
  calculateChartMetrics,
  getNFTRarity,
  copyToClipboard,
  openEtherscan,
  openOpenSea,
  isValidAddress,
  truncateAddress
} from '@/lib/wallet-analytics/utils';

// Re-export constants
export {
  SUPPORTED_CHAINS,
  CHART_COLORS,
  PERIOD_MAP,
  TRANSACTION_TYPES,
  NFT_RARITY_LEVELS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_CHART_HEIGHT,
  ANIMATION_DELAYS
} from '@/lib/wallet-analytics/constants';