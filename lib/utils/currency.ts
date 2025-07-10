/**
 * Advanced Currency Formatter
 * Handles all types of values from micro-cents to trillions
 * Optimized for crypto/DeFi applications
 */

export interface CurrencyFormatOptions {
    currency?: string;
    locale?: string;
    showFullPrecision?: boolean;
    maxDecimals?: number;
    minDecimals?: number;
    compact?: boolean;
    showSign?: boolean;
    fallback?: string;
  }
  
  export class CurrencyFormatter {
    private static readonly DEFAULT_OPTIONS: Required<CurrencyFormatOptions> = {
      currency: 'USD',
      locale: 'en-US',
      showFullPrecision: false,
      maxDecimals: 10,
      minDecimals: 2,
      compact: true,
      showSign: false,
      fallback: 'N/A'
    };
  
    /**
     * Format currency with intelligent precision and compacting
     */
    static format(
      value: number | string | null | undefined,
      options: CurrencyFormatOptions = {}
    ): string {
      // Handle invalid inputs
      if (value === null || value === undefined || value === '') {
        return options.fallback || this.DEFAULT_OPTIONS.fallback;
      }
  
      // Convert to number
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      
      if (isNaN(numValue)) {
        return options.fallback || this.DEFAULT_OPTIONS.fallback;
      }
  
      const opts = { ...this.DEFAULT_OPTIONS, ...options };
      const absValue = Math.abs(numValue);
  
      // Handle zero
      if (numValue === 0) {
        return this.formatWithSymbol(0, opts, 2);
      }
  
      // Handle very large numbers with compacting
      if (opts.compact && absValue >= 1000) {
        return this.formatCompact(numValue, opts);
      }
  
      // Handle regular and small numbers with intelligent precision
      return this.formatPrecise(numValue, opts);
    }
  
    /**
     * Format large numbers with K, M, B, T suffixes
     */
    private static formatCompact(value: number, opts: Required<CurrencyFormatOptions>): string {
      const absValue = Math.abs(value);
      let suffix = '';
      let scaledValue = value;
  
      if (absValue >= 1e12) {
        scaledValue = value / 1e12;
        suffix = 'T';
      } else if (absValue >= 1e9) {
        scaledValue = value / 1e9;
        suffix = 'B';
      } else if (absValue >= 1e6) {
        scaledValue = value / 1e6;
        suffix = 'M';
      } else if (absValue >= 1e3) {
        scaledValue = value / 1e3;
        suffix = 'K';
      }
  
      // Smart decimal places for compact notation
      let decimals = 2;
      if (Math.abs(scaledValue) >= 100) decimals = 1;
      if (Math.abs(scaledValue) >= 1000) decimals = 0;
  
      const formatted = this.formatWithSymbol(scaledValue, opts, decimals);
      return `${formatted}${suffix}`;
    }
  
    /**
     * Format with precise decimal handling for small values
     */
    private static formatPrecise(value: number, opts: Required<CurrencyFormatOptions>): string {
      const absValue = Math.abs(value);
  
      if (opts.showFullPrecision) {
        // Show all significant digits up to maxDecimals
        return this.formatWithSymbol(value, opts, this.getSignificantDecimals(absValue, opts.maxDecimals));
      }
  
      // Intelligent decimal places based on value range
      let decimals: number;
  
      if (absValue >= 1) {
        decimals = Math.max(opts.minDecimals, 2);
      } else if (absValue >= 0.01) {
        decimals = 3;
      } else if (absValue >= 0.001) {
        decimals = 4;
      } else if (absValue >= 0.0001) {
        decimals = 5;
      } else if (absValue >= 0.00001) {
        decimals = 6;
      } else if (absValue >= 0.000001) {
        decimals = 7;
      } else if (absValue >= 0.0000001) {
        decimals = 8;
      } else {
        // For extremely small values, find first significant digit
        decimals = this.getSignificantDecimals(absValue, opts.maxDecimals);
      }
  
      return this.formatWithSymbol(value, opts, Math.min(decimals, opts.maxDecimals));
    }
  
    /**
     * Get number of decimals needed to show significant digits
     */
    private static getSignificantDecimals(value: number, maxDecimals: number): number {
      if (value === 0) return 2;
      
      const str = value.toExponential();
      const exponentMatch = str.match(/e-?(\d+)$/);
      
      if (exponentMatch) {
        const exponent = parseInt(exponentMatch[1]);
        // For very small numbers, show enough decimals to see first 3 significant digits
        return Math.min(exponent + 3, maxDecimals);
      }
      
      // For numbers >= 1, use standard precision
      return Math.min(6, maxDecimals);
    }
  
    /**
     * Format with currency symbol and proper locale
     */
    private static formatWithSymbol(
      value: number, 
      opts: Required<CurrencyFormatOptions>, 
      decimals: number
    ): string {
      try {
        const formatter = new Intl.NumberFormat(opts.locale, {
          style: 'currency',
          currency: opts.currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
  
        let formatted = formatter?.format(value);
  
        // Remove trailing zeros for cleaner display
        if (decimals > 2 && formatted.includes('.')) {
          formatted = formatted.replace(/\.?0+$/, '');
          // Ensure we don't remove all decimals for currency
          if (!formatted.includes('.') && opts.currency === 'USD') {
            formatted = formatted.replace(/(\$\d+)/, '$1.00');
          }
        }
  
        // Add sign prefix if requested
        if (opts.showSign && value > 0) {
          formatted = `+${formatted}`;
        }
  
        return formatted;
      } catch (error) {
        // Fallback to manual formatting if Intl fails
        const symbol = opts.currency === 'USD' ? '$' : '';
        const sign = opts.showSign && value > 0 ? '+' : '';
        return `${sign}${symbol}${value.toFixed(decimals)}`;
      }
    }
  
    /**
     * Format percentage change with appropriate styling context
     */
    static formatChange(value: number | null | undefined, options: Partial<CurrencyFormatOptions> = {}): {
      formatted: string;
      isPositive: boolean;
      isNegative: boolean;
      isZero: boolean;
    } {
      if (value === null || value === undefined || isNaN(value)) {
        return {
          formatted: options.fallback || '--',
          isPositive: false,
          isNegative: false,
          isZero: true
        };
      }
  
      const sign = value > 0 ? '+' : '';
      const formatted = `${sign}${value.toFixed(2)}%`;
  
      return {
        formatted,
        isPositive: value > 0,
        isNegative: value < 0,
        isZero: value === 0
      };
    }
  
    /**
     * Format market cap with intelligent scaling
     */
    static formatMarketCap(value: number | null | undefined): string {
      return this.format(value, {
        compact: true,
        minDecimals: 0,
        maxDecimals: 2,
        fallback: '--'
      });
    }
  
    /**
     * Format token price with full precision option
     */
    static formatTokenPrice(value: number | null | undefined, showFullPrecision = false): string {
      return this.format(value, {
        compact: false,
        showFullPrecision,
        maxDecimals: showFullPrecision ? 12 : 8,
        minDecimals: 2,
        fallback: '$0.00'
      });
    }
  
    /**
     * Format wallet balance with optional privacy
     */
    static formatBalance(value: number | null | undefined, showBalance = true): string {
      if (!showBalance) return '••••••';
      
      return this.format(value, {
        compact: true,
        minDecimals: 2,
        maxDecimals: 6,
        fallback: '$0.00'
      });
    }
  
    /**
     * Format volume with compact notation
     */
    static formatVolume(value: number | null | undefined): string {
      return this.format(value, {
        compact: true,
        minDecimals: 0,
        maxDecimals: 1,
        fallback: '--'
      });
    }
  
    /**
     * Format with custom options - main public method
     */
    static formatCustom(
      value: number | string | null | undefined,
      options: CurrencyFormatOptions = {}
    ): string {
      return this.format(value, options);
    }
  }
  
  // Convenient shorthand functions
  export const formatCurrency = CurrencyFormatter.format;
  export const formatChange = CurrencyFormatter.formatChange;
  export const formatMarketCap = CurrencyFormatter.formatMarketCap;
  export const formatTokenPrice = CurrencyFormatter.formatTokenPrice;
  export const formatBalance = CurrencyFormatter.formatBalance;
  export const formatVolume = CurrencyFormatter.formatVolume;
  
  // Type exports
