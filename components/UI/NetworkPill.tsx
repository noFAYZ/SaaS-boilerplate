'use client';

import React, { useMemo } from 'react';
import { cn } from "@heroui/theme";
import { Tooltip } from '@heroui/react';
import Image from 'next/image';
import { ZERION_CHAINS } from '@/config/chains';

// Chain data interface based on the ZERION_CHAINS format
export interface ChainData {
  id: string;
  attributes: {
    name: string;
    icon?: {
      url?: string;
    };
    external_id?: string;
    explorer?: {
      name?: string;
      home_url?: string;
    };
    flags?: {
      supports_trading?: boolean;
      supports_sending?: boolean;
      supports_bridge?: boolean;
    };
  };
}

export interface NetworkPillProps {
  chainId: string;
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'glowing' | 'gradient' | 'subtle' | 'glossy' | 'shadowed';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  iconOnly?: boolean;
  chainData?: ChainData[];
  showStatus?: boolean;
  active?: boolean;
  onClick?: (chainId: string) => void;
  disabled?: boolean;
  tooltip?: boolean;
  as?: 'button' | 'div' | 'span';
  className?: string;
  animation?: 'pulse' | 'bounce' | 'shake' | 'none';
  elevated?: boolean;
}

// Fallback chain colors for chains without specific branding
const CHAIN_COLORS: Record<string, { bg: string; text: string; border: string; gradient?: string }> = {
  ethereum: { 
    bg: 'bg-blue-500', 
    text: 'text-blue-500', 
    border: 'border-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  polygon: { 
    bg: 'bg-purple-600', 
    text: 'text-purple-600', 
    border: 'border-purple-600',
    gradient: 'from-purple-600 to-purple-700' 
  },
  arbitrum: { 
    bg: 'bg-blue-700', 
    text: 'text-blue-700', 
    border: 'border-blue-700',
    gradient: 'from-blue-700 to-indigo-800'
  },
  optimism: { 
    bg: 'bg-red-500', 
    text: 'text-red-500', 
    border: 'border-red-500',
    gradient: 'from-red-500 to-red-600'
  },
  base: { 
    bg: 'bg-blue-600', 
    text: 'text-blue-600', 
    border: 'border-blue-600',
    gradient: 'from-blue-600 to-blue-700'
  },
  binance: { 
    bg: 'bg-yellow-500', 
    text: 'text-yellow-700', 
    border: 'border-yellow-500',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  avalanche: { 
    bg: 'bg-red-600', 
    text: 'text-red-600', 
    border: 'border-red-600',
    gradient: 'from-red-600 to-red-700'
  },
  fantom: { 
    bg: 'bg-blue-800', 
    text: 'text-blue-800', 
    border: 'border-blue-800',
    gradient: 'from-blue-800 to-blue-900'
  },
  solana: {
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500',
    gradient: 'from-purple-500 to-blue-500'
  },
  // Default color for any unknown chain
  default: { 
    bg: 'bg-gray-500', 
    text: 'text-gray-500', 
    border: 'border-gray-500',
    gradient: 'from-gray-500 to-gray-600'
  }
};

// Fallback chain icons
const CHAIN_FALLBACK_ICONS: Record<string, string> = {
  ethereum: '🔷',
  polygon: '💠',
  arbitrum: '🔵',
  optimism: '🔴',
  binance: '🟡',
  avalanche: '❄️',
  fantom: '👻',
  solana: '☀️',
  base: '🅱️',
  default: '🔗'
};

export const NetworkPill: React.FC<NetworkPillProps> = ({
  chainId,
  variant = 'light',
  size = 'md',
  radius = 'full',
  iconOnly = false,
  chainData = ZERION_CHAINS,
  showStatus = false,
  active = false,
  onClick,
  disabled = false,
  tooltip = true,
  as = 'div',
  className = '',
  animation = 'none',
  elevated = false,
}) => {
  // Find chain data for the provided chainId
  const chain = useMemo(() => {
    return chainData.find(c => c.id?.toLowerCase() === chainId?.toLowerCase());
  }, [chainId, chainData]);

  const chainName = chain?.attributes?.name || formatChainName(chainId);
  const iconUrl = chain?.attributes?.icon?.url || '';
  const supportsTrading = chain?.attributes?.flags?.supports_trading;
  const supportsSending = chain?.attributes?.flags?.supports_sending;
  
  // Get chain color theme
  const chainColor = CHAIN_COLORS[chainId?.toLowerCase()] || CHAIN_COLORS.default;
  
  // Get fallback chain icon if no image URL available
  const fallbackIcon = CHAIN_FALLBACK_ICONS[chainId?.toLowerCase()] || CHAIN_FALLBACK_ICONS.default;
  
  // Check if component is interactive
  const isClickable = !!onClick && !disabled;
  
  // Size styles for the component
  const sizeStyles = {
    xs: iconOnly ? "w-4 h-4" : "text-[10px] py-0.5 pl-0.5 pr-1 h-5 items-center", 
    sm: iconOnly ? "w-6 h-6" : "text-xs py-1 px-3 h-7",
    md: iconOnly ? "w-8 h-8" : "text-sm py-1 px-3 h-8",
    lg: iconOnly ? "w-10 h-10" : "text-base py-1.5 px-4 h-10",
  };
  
  // Size styles for icons
  const iconSizeStyles = {
    xs: "w-4 h-4",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  
  // Radius styles
  const radiusStyles = {
    none: "rounded-none",
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: iconOnly ? "rounded-full" : "rounded-full",
  };
  
  // Animation styles
  const animationStyles = {
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    shake: "animate-[wiggle_1s_ease-in-out_infinite]",
    none: "",
  };
  
  // Variant styles
  const variantStyles = {
    solid: `${chainColor.bg} text-white`,
    bordered: `bg-transparent ${chainColor.text} ${chainColor.border}`,
    light: `bg-${chainId?.toLowerCase()}-100 dark:bg-${chainId?.toLowerCase()}-900/30 ${chainColor.text}`,
    flat: `bg-${chainId?.toLowerCase()}-500/10 ${chainColor.text}`,
    glowing: `${chainColor.bg} text-white relative before:absolute before:inset-0 ${radiusStyles[radius]} before:bg-${chainId?.toLowerCase()}-500/20 before:blur-md before:-z-10`,
    gradient: `bg-gradient-to-r ${chainColor.gradient} text-white`,
    subtle: `bg-white dark:bg-default-900 ${chainColor.text} ${chainColor.border}/20`,
    glossy: `bg-gradient-to-b from-${chainId?.toLowerCase()}-500/90 to-${chainId?.toLowerCase()}-600 text-white border-${chainId?.toLowerCase()}-500/20 backdrop-blur-sm`,
    shadowed: `bg-white dark:bg-default-800 ${chainColor.text} shadow-sm shadow-${chainId?.toLowerCase()}-500/20`,
  };
  
  // Status indicator styles
  const statusStyles = showStatus
    ? supportsTrading && supportsSending
      ? "after:absolute after:w-2 after:h-2 after:rounded-full after:bg-success-500 after:bottom-0 after:right-0 after:mb-0 after:mr-0"
      : "after:absolute after:w-2 after:h-2 after:rounded-full after:bg-warning-500 after:bottom-0 after:right-0 after:mb-0 after:mr-0"
    : "";
  
  // Active/selected state styles
  const activeStyles = active 
    ? `ring-2 ring-${chainId.toLowerCase()}-500 ring-offset-1 dark:ring-offset-default-900` 
    : "";
  
  // Elevation styles
  const elevationStyles = elevated
    ? "shadow-md hover:shadow-lg transition-shadow"
    : "";
  
  // Clickable styles
  const clickableStyles = isClickable
    ? "cursor-pointer hover:opacity-90 active:opacity-80 hover:scale-[1.02] active:scale-[0.98] transition-transform"
    : disabled
      ? "opacity-50 cursor-not-allowed"
      : "";
  
  // Combine all styles
  const networkPillStyles = cn(
    // Base styles
    "inline-flex items-center justify-center font-medium transition-all gap-2 relative border",
    // Size and variant
    sizeStyles[size],
    variantStyles[variant],
    // Radius, animation and other conditional styles
    radiusStyles[radius],
    animationStyles[animation],
    statusStyles,
    activeStyles,
    elevationStyles,
    clickableStyles,
    // Custom classes
    className
  );
  
  // Prepare the content of the pill
  const content = (
    <>
      {/* Chain Icon */}
      <span className={cn(
        "flex items-center justify-center flex-shrink-0",
        iconSizeStyles[size],
        !iconUrl && "font-emoji"
      )}>
        {iconUrl ? (
          <Image 
            src={iconUrl} 
            alt={chainName} 
            width={size === 'lg' ? 24 : 20} 
            height={size === 'lg' ? 24 : 20}
            className="rounded-full object-contain"
          />
        ) : (
          fallbackIcon
        )}
      </span>
      
      {/* Chain Name (only shown when not iconOnly) */}
      {!iconOnly && (
        <span className="truncate">{chainName}</span>
      )}
    </>
  );
  
  // Handle click
  const handleClick = () => {
    if (isClickable && !disabled) {
      onClick(chainId);
    }
  };
  
  // Determine the component type
  const Component = as;
  
  // Render with tooltip if needed
  const pill = (
    <Component
      className={networkPillStyles}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {content}
    </Component>
  );
  
  // Wrap with tooltip if needed
  if (tooltip && iconOnly) {
    return (
      <Tooltip content={chainName} placement="top" classNames={
        {
          content: " text-[11px] font-medium p-1 rounded-md",
          arrow: ""
        }
      }>
        {pill}
      </Tooltip>
    );
  }
  
  return pill;
};

// Helper function to format chain name from chainId if needed
function formatChainName(chainId: string): string {
  return chainId?.charAt(0)?.toUpperCase() + chainId?.slice(1)?.toLowerCase();
}

export default NetworkPill;