// components/search/SearchResultItem.tsx
"use client";

import React, { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Tooltip } from "@heroui/tooltip";
import { Card } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Skeleton } from "@heroui/skeleton";
import { Divider } from "@heroui/divider";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Shield,
  CheckCircle,
  Star,
  Activity,
  BarChart3,
  Globe,
  Zap,
  Award,
  Target,
  DollarSign,
  Coins,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Bookmark,
  Share2,
  Info,
  TrendingUp as TrendUp,
  Minus,
  Lock,
  Unlock,
  Users,
  Volume2,
  Calendar,
  MapPin
} from "lucide-react";
import { SearchResult, SearchCategory } from "@/lib/search/types";
import { MaterialIconThemeVerified } from "../icons/icons";

// Enterprise-grade currency formatter with financial precision
class EnterpriseCurrencyFormatter {
  private static readonly LOCALE = 'en-US';
  private static readonly CURRENCY = 'USD';

  static formatPrice(value: number | string | null | undefined, options?: {
    showFullPrecision?: boolean;
    compact?: boolean;
    hideOnPrivacy?: boolean;
  }): string {
    const opts = {
      showFullPrecision: false,
      compact: false,
      hideOnPrivacy: false,
      ...options
    };

    if (value === null || value === undefined || value === '') {
      return opts.hideOnPrivacy ? '••••••' : '--';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || !isFinite(numValue)) return '--';

    const absValue = Math.abs(numValue);

    // Handle zero specifically
    if (numValue === 0) return '$0.00';

    // Compact notation for large values
    if (opts.compact && absValue >= 1000) {
      return this.formatCompact(numValue);
    }

    // Full precision mode
    if (opts.showFullPrecision) {
      return this.formatFullPrecision(numValue);
    }

    // Smart precision based on magnitude
    return this.formatSmartPrecision(numValue);
  }

  private static formatCompact(value: number): string {
    const absValue = Math.abs(value);
    let divisor = 1;
    let suffix = '';

    if (absValue >= 1e12) {
      divisor = 1e12;
      suffix = 'T';
    } else if (absValue >= 1e9) {
      divisor = 1e9;
      suffix = 'B';
    } else if (absValue >= 1e6) {
      divisor = 1e6;
      suffix = 'M';
    } else if (absValue >= 1e3) {
      divisor = 1e3;
      suffix = 'K';
    }

    const scaled = value / divisor;
    const decimals = absValue >= 100 * divisor ? 1 : 2;

    try {
      const formatter = new Intl.NumberFormat(this.LOCALE, {
        style: 'currency',
        currency: this.CURRENCY,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return formatter.format(scaled) + suffix;
    } catch {
      return `$${scaled.toFixed(decimals)}${suffix}`;
    }
  }

  private static formatFullPrecision(value: number): string {
    const decimals = this.getOptimalDecimals(Math.abs(value));
    try {
      const formatter = new Intl.NumberFormat(this.LOCALE, {
        style: 'currency',
        currency: this.CURRENCY,
        minimumFractionDigits: Math.min(decimals, 2),
        maximumFractionDigits: decimals,
      });
      return formatter.format(value);
    } catch {
      return `$${value.toFixed(decimals)}`;
    }
  }

  private static formatSmartPrecision(value: number): string {
    const absValue = Math.abs(value);
    let decimals: number;

    if (absValue >= 1) {
      decimals = 2;
    } else if (absValue >= 0.01) {
      decimals = 4;
    } else if (absValue >= 0.0001) {
      decimals = 6;
    } else {
      decimals = this.getOptimalDecimals(absValue);
    }

    try {
      const formatter = new Intl.NumberFormat(this.LOCALE, {
        style: 'currency',
        currency: this.CURRENCY,
        minimumFractionDigits: Math.min(decimals, 2),
        maximumFractionDigits: Math.min(decimals, 12),
      });
      return formatter.format(value);
    } catch {
      return `$${value.toFixed(decimals)}`;
    }
  }

  private static getOptimalDecimals(value: number): number {
    if (value === 0) return 2;
    
    // Find the first significant digit position
    const log = Math.floor(Math.log10(value));
    return Math.max(2, Math.min(12, -log + 3));
  }

  static formatPercentage(value: number | null | undefined): {
    formatted: string;
    isPositive: boolean;
    isNegative: boolean;
    isNeutral: boolean;
    magnitude: 'small' | 'medium' | 'large' | 'extreme';
  } {
    if (value === null || value === undefined || isNaN(value)) {
      return {
        formatted: '--',
        isPositive: false,
        isNegative: false,
        isNeutral: true,
        magnitude: 'small'
      };
    }

    const absValue = Math.abs(value);
    let magnitude: 'small' | 'medium' | 'large' | 'extreme';
    
    if (absValue < 1) magnitude = 'small';
    else if (absValue < 5) magnitude = 'medium';
    else if (absValue < 20) magnitude = 'large';
    else magnitude = 'extreme';

    const decimals = absValue < 0.01 ? 3 : absValue < 1 ? 2 : 1;
    const sign = value > 0 ? '+' : '';
    
    return {
      formatted: `${sign}${value.toFixed(decimals)}%`,
      isPositive: value > 0,
      isNegative: value < 0,
      isNeutral: value === 0,
      magnitude
    };
  }

  static formatVolume(value: number | null | undefined): string {
    return this.formatPrice(value, { compact: true });
  }

  static formatMarketCap(value: number | string | null | undefined): string {
    return this.formatPrice(value, { compact: true });
  }
}

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  showBalance: boolean;
  onSelect: () => void;
  variant?: 'minimal' | 'standard' | 'detailed' | 'executive';
  density?: 'compact' | 'comfortable' | 'spacious';
  showActions?: boolean;
  enableAnimations?: boolean;
  privacyMode?: boolean;
  className?: string;
}

interface SecurityMetrics {
  trustScore: number;
  verificationLevel: 'none' | 'basic' | 'enhanced' | 'enterprise';
  riskAssessment: 'low' | 'medium' | 'high' | 'critical';
  liquidityScore?: number;
}

interface PerformanceMetrics {
  priceChange24h?: number;
  volumeChange24h?: number;
  marketCapRank?: number;
  volatilityScore?: number;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = memo(({
  result,
  isSelected,
  showBalance,
  onSelect,
  variant = 'standard',
  density = 'comfortable',
  showActions = true,
  enableAnimations = true,
  privacyMode = false,
  className = ""
}) => {
  // State management
  const [isHovered, setIsHovered] = useState(false);
  const [actionStates, setActionStates] = useState({
    copying: false,
    bookmarked: false,
    sharing: false,
    loading: false
  });
  const [imageError, setImageError] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Security and performance metrics calculation
  const securityMetrics = useMemo((): SecurityMetrics => {
    let trustScore = 50;
    let verificationLevel: SecurityMetrics['verificationLevel'] = 'none';
    let riskAssessment: SecurityMetrics['riskAssessment'] = 'medium';

    // Trust score calculation
    if (result.metadata?.verified) {
      trustScore += 25;
      verificationLevel = 'basic';
    }
    
    if (result.metadata?.risk === 'low') {
      trustScore += 20;
      riskAssessment = 'low';
    } else if (result.metadata?.risk === 'high') {
      trustScore -= 30;
      riskAssessment = 'high';
    }

    if (result.badge && ['Top 100', 'Verified', 'Featured'].includes(result.badge)) {
      trustScore += 15;
      verificationLevel = 'enhanced';
    }

    // Market cap influence on trust
    if (result.metadata?.marketCap) {
      const marketCap = typeof result.metadata.marketCap === 'string' 
        ? parseFloat(result.metadata.marketCap) 
        : result.metadata.marketCap;
      
      if (marketCap > 1e9) {
        trustScore += 10;
        verificationLevel = 'enterprise';
      }
    }

    return {
      trustScore: Math.max(0, Math.min(100, trustScore)),
      verificationLevel,
      riskAssessment,
      liquidityScore: result.metadata?.volume24h ? 85 : undefined
    };
  }, [result.metadata, result.badge]);

  const performanceMetrics = useMemo((): PerformanceMetrics => {
    return {
      priceChange24h: result.metadata?.change,
      volumeChange24h: undefined, // Could be calculated from API
      marketCapRank: undefined, // Could be fetched from ranking
      volatilityScore: result.metadata?.change ? Math.abs(result.metadata.change) : undefined
    };
  }, [result.metadata]);

  // Category configuration with enhanced styling
  const categoryConfig = useMemo(() => {
    const category = (result.category as SearchCategory) || 'tokens';
    const configs = {
      tokens: {
        gradient: 'from-blue-500 via-indigo-500 to-purple-600',
        bgLight: 'bg-blue-50 border-blue-200',
        bgDark: 'dark:bg-blue-950/20 dark:border-blue-800/30',
        text: 'text-blue-700 dark:text-blue-300',
        icon: Coins,
        badge: 'primary' as const,
        priority: 4,
        label: 'Token'
      },
      wallets: {
        gradient: 'from-purple-500 via-pink-500 to-rose-600',
        bgLight: 'bg-purple-50 border-purple-200',
        bgDark: 'dark:bg-purple-950/20 dark:border-purple-800/30',
        text: 'text-purple-700 dark:text-purple-300',
        icon: Target,
        badge: 'secondary' as const,
        priority: 5,
        label: 'Wallet'
      },
      nfts: {
        gradient: 'from-green-500 via-emerald-500 to-teal-600',
        bgLight: 'bg-green-50 border-green-200',
        bgDark: 'dark:bg-green-950/20 dark:border-green-800/30',
        text: 'text-green-700 dark:text-green-300',
        icon: Award,
        badge: 'success' as const,
        priority: 3,
        label: 'NFT'
      },
      defi: {
        gradient: 'from-orange-500 via-amber-500 to-yellow-600',
        bgLight: 'bg-orange-50 border-orange-200',
        bgDark: 'dark:bg-orange-950/20 dark:border-orange-800/30',
        text: 'text-orange-700 dark:text-orange-300',
        icon: Zap,
        badge: 'warning' as const,
        priority: 4,
        label: 'DeFi'
      }
    };
    return configs[category] || configs.tokens;
  }, [result.category]);

  // Format change data
  const changeData = useMemo(() => {
    return EnterpriseCurrencyFormatter.formatPercentage(performanceMetrics.priceChange24h);
  }, [performanceMetrics.priceChange24h]);

  // Enhanced action handlers
  const handleCopyAddress = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!result.metadata?.address || actionStates.copying) return;

    setActionStates(prev => ({ ...prev, copying: true }));
    try {
      await navigator.clipboard.writeText(result.metadata.address);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setActionStates(prev => ({ ...prev, copying: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
      setActionStates(prev => ({ ...prev, copying: false }));
    }
  }, [result.metadata?.address, actionStates.copying]);

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setActionStates(prev => ({ 
      ...prev, 
      bookmarked: !prev.bookmarked 
    }));
  }, []);

  const handleExternalLink = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (result.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  }, [result.url]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get density-based spacing
  const getDensityClasses = () => {
    switch (density) {
      case 'compact': return 'p-3 gap-2';
      case 'spacious': return 'p-6 gap-4';
      default: return 'p-4 gap-3';
    }
  };

  const IconComponent = categoryConfig.icon;

  // Minimal variant for space-constrained areas
  if (variant === 'minimal') {
    return (
      <div
        onClick={onSelect}
        className={`
          group flex items-center gap-3 p-2 cursor-pointer transition-all duration-200
          hover:bg-content2/50 rounded-lg border border-transparent
          ${isSelected ? 'bg-primary-50 dark:bg-primary-950/30 border-primary-200' : ''}
          ${className}
        `}
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-default-200 to-default-300 flex items-center justify-center">
          <IconComponent size={12} className="text-default-600" />
        </div>
        <span className="font-medium text-sm truncate flex-1">{result.title}</span>
        {showBalance && result.metadata?.value && (
          <span className="text-sm font-semibold">
            {EnterpriseCurrencyFormatter.formatPrice(result.metadata.value, { compact: true })}
          </span>
        )}
        <ChevronRight size={12} className="text-default-400" />
      </div>
    );
  }

  return (
    <div
  
      onPress={onSelect}
      className={`
        group relative transition-all duration-75 cursor-pointer w-full
        ${isSelected 
          ? 'bg-gradient-to-r from-primary-50 via-secondary-50 to-success-50 dark:from-primary-950/30 dark:via-secondary-950/30 dark:to-success-950/30 shadow-lg ring-1 ring-primary-200 dark:ring-primary-800' 
          : 'hover:shadow-md hover:bg-content2'
        }
    
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={getDensityClasses()}>
        {/* Header Section */}
        <div className="flex items-start gap-4">
          {/* Enhanced Icon with Status Indicators */}
          <div className="relative flex-shrink-0">
        
              {result.metadata?.logoUrl && !imageError ? (
                <Avatar 
                  src={result.metadata.logoUrl} 
                  alt={result.title}
                  size="sm" 
                  className="w-10 h-10" 
                  onError={() => setImageError(true)}
                  fallback={<IconComponent size={24} className="text-default-500" />}
                />
              ) : (
                <IconComponent size={24} className="drop-shadow-sm" />
              )}
              
             
          

         
   
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Title and Category */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className={` flex gap-1 items-center min-w-0
                font-semibold text-sm leading-tight truncate 
                ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-foreground'}
              `}>
                {result.title}
                {result.metadata?.verified && (
          
          <MaterialIconThemeVerified  className="text-white w-5 h-5" />
       
      )}
              </h3>
              
        
            {/*   <Chip
                  size="sm"
                  variant="flat"
                  color={
                    securityMetrics.riskAssessment === 'low' ? 'success' :
                    securityMetrics.riskAssessment === 'medium' ? 'warning' : 'danger'
                  }
                  content={
                    `${securityMetrics.riskAssessment === 'low' ? <Shield size={10} /> :
                    securityMetrics.riskAssessment === 'medium' ? <Info size={10} /> :
                    <AlertTriangle size={10} />}`
                  }
               
                  className="text-[10px] rounded-md h-4 font-medium"
                >
              
                </Chip> */}
            </div>

            {/* Subtitle and Metadata */}
            <div className="space-y-1">
            

              {/* Enhanced metadata row */}
              <div className="flex items-center gap-1 text-xs">
              <Chip
                size="sm"
                variant="flat"
                color={"warning"}
                className="text-[10px] font-semibold uppercase  rounded-md h-4 tracking-wide shrink-0"
              >
                {categoryConfig.label}
              </Chip>



                {result.metadata?.network && (
                  <div className="flex items-center gap-1.5 px-2 py-1  rounded-md">
                    <Globe size={10} />
                    <span className="font-medium">{result.metadata.network}</span>
                  </div>
                )}
                
                {result.metadata?.symbol && (
                  <div className="flex items-center gap-1.5 px-2 py-1  rounded-md">
                    <Coins size={10} />
                    <code className="font-mono font-semibold">{result.metadata.symbol}</code>
                  </div>
                )}

             
              </div>
            </div>
          </div>

          {/* Value Display Section */}
          <div className="flex flex-col items-end gap-2 shrink-0 min-w-[120px]">
            {/* Primary Value */}
            {showBalance && result.metadata?.value && (
              <div className="text-right">
                <div className="font-bold text-sm text-foreground/90 leading-tight">
                  {privacyMode 
                    ? '••••••' 
                    : EnterpriseCurrencyFormatter.formatPrice(
                        result.metadata.value, 
                        { showFullPrecision: variant === 'detailed' }
                      )
                  }
                </div>
                
                {/* Change indicator with enhanced styling */}
                {!privacyMode && changeData && !changeData.isNeutral && (
                  <div className={`
                    flex items-center justify-end gap-1.5 mt-1 px-2 py-1 rounded-md text-sm font-semibold
                    ${changeData.isPositive 
                      ? 'bg-success-100 text-success-700 dark:bg-success-950/30 dark:text-success-400' 
                      : 'bg-danger-100 text-danger-700 dark:bg-danger-950/30 dark:text-danger-400'
                    }
                    ${changeData.magnitude === 'extreme' ? 'ring-2 ring-current ring-opacity-20' : ''}
                  `}>
                    {changeData.isPositive ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    <span>{changeData.formatted}</span>
                  </div>
                )}
              </div>
            )}

            {/* Secondary metrics for detailed variant */}
            {variant === 'detailed' && !privacyMode && (
              <div className="text-right space-y-1 text-xs">
                {result.metadata?.marketCap && (
                  <div className="flex justify-end text-default-500 items-center gap-1">
                   MC:
                    <span className="font-medium ">
                      {EnterpriseCurrencyFormatter.formatMarketCap(result.metadata.marketCap)}
                    </span>
                  </div>
                )}
                {result.metadata?.volume24h && (
                  <div className="flex justify-end items-center gap-1">
                    <Volume2 size={10} className="text-default-400" />
                    <span className="font-medium text-default-600">
                      {EnterpriseCurrencyFormatter.formatVolume(result.metadata.volume24h)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Trust score display */}
            {variant === 'executive' && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-default-500">Trust:</span>
                <div className="flex items-center gap-1">
                  <Progress
                    value={securityMetrics.trustScore}
                    size="sm"
                    color={
                      securityMetrics.trustScore >= 70 ? 'success' :
                      securityMetrics.trustScore >= 40 ? 'warning' : 'danger'
                    }
                    className="w-8"
                  />
                  <span className="font-bold text-xs">{securityMetrics.trustScore}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Actions Section */}
        {showActions && (isHovered || isSelected) && (
          <>
            <Divider className="my-3" />
            <div className="flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-1">
                {result.metadata?.address && (
                  <Tooltip content={actionStates.copying ? "Copied!" : "Copy Address"}>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="primary"
                      isLoading={actionStates.copying}
                      onPress={handleCopyAddress}
                      className="w-8 h-8 transition-all duration-200 hover:scale-105"
                    >
                      <Copy size={12} />
                    </Button>
                  </Tooltip>
                )}
                
                <Tooltip content={actionStates.bookmarked ? "Remove Bookmark" : "Add Bookmark"}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color={actionStates.bookmarked ? "warning" : "default"}
                    onPress={handleBookmark}
                    className="w-8 h-8 transition-all duration-200 hover:scale-105"
                  >
                    {actionStates.bookmarked ? <Star size={12} /> : <Bookmark size={12} />}
                  </Button>
                </Tooltip>

                {privacyMode && (
                  <Tooltip content="Privacy Mode Active">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="secondary"
                      className="w-8 h-8"
                    >
                      <Lock size={12} />
                    </Button>
                  </Tooltip>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Tooltip content="View Details">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={handleExternalLink}
                    className="w-8 h-8 transition-all duration-200 hover:scale-105"
                  >
                    <ExternalLink size={12} />
                  </Button>
                </Tooltip>
                
                <ChevronRight 
                  size={16} 
                  className={`
                    text-default-400 transition-all duration-200 ml-1
                    ${isSelected ? 'text-primary-500 translate-x-1 scale-110' : 'group-hover:translate-x-0.5'}
                  `} 
                />
              </div>
            </div>
          </>
        )}

        {/* Enhanced tags for executive variant */}
        {variant === 'executive' && result.metadata?.tags && result.metadata.tags.length > 0 && (
          <>
            <Divider className="my-3" />
            <div className="flex flex-wrap gap-1">
              {result.metadata.tags.slice(0, 5).map((tag, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  className="text-xs bg-default-50 dark:bg-default-900 border border-default-200 dark:border-default-700"
                >
                  {tag}
                </Chip>
              ))}
              {result.metadata.tags.length > 5 && (
                <Chip
                  size="sm"
                  variant="flat"
                  className="text-xs bg-default-100 dark:bg-default-800 font-bold"
                >
                  +{result.metadata.tags.length - 5} more
                </Chip>
              )}
            </div>
          </>
        )}

        {/* Selection indicator with gradient */}
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 via-secondary-400 to-success-400 rounded-r-full shadow-sm" />
        )}

        {/* Loading overlay */}
        {actionStates.loading && (
          <div className="absolute inset-0 bg-content1/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-primary">Loading...</span>
            </div>
          </div>
        )}

        {/* Hover glow effect */}
        {isHovered && enableAnimations && !isSelected && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-success-500/5 pointer-events-none" />
        )}
      </div>
    </div>
  );
});

SearchResultItem.displayName = "SearchResultItem";

// Additional utility components for enterprise features
export const SearchResultSkeleton: React.FC<{ variant?: 'minimal' | 'standard' | 'detailed' }> = memo(({ 
  variant = 'standard' 
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="w-6 h-6 rounded-md" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-3 h-3" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <Skeleton className="absolute -top-1 -right-1 w-5 h-5 rounded-full" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
        </div>
        
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      
      {variant === 'detailed' && (
        <>
          <div className="h-px bg-default-200 my-3" />
          <div className="flex justify-between">
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-4 h-4" />
            </div>
          </div>
        </>
      )}
    </Card>
  );
});

SearchResultSkeleton.displayName = "SearchResultSkeleton";

// Enhanced error boundary component
export const SearchResultErrorBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [children]);

  if (hasError) {
    return fallback || (
      <Card className="p-4 border-danger-200 bg-danger-50 dark:bg-danger-950/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger-500" />
          <div>
            <h4 className="font-medium text-danger-700 dark:text-danger-400">
              Failed to load search result
            </h4>
            <p className="text-sm text-danger-600 dark:text-danger-500">
              Please try refreshing or contact support if the issue persists.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  try {
    return <>{children}</>;
  } catch (error) {
    setHasError(true);
    return null;
  }
};

SearchResultErrorBoundary.displayName = "SearchResultErrorBoundary";

export { EnterpriseCurrencyFormatter };