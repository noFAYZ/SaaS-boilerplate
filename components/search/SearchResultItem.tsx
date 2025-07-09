// components/search/SearchResultItem.tsx
"use client";

import React, { memo, useState } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
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
} from "lucide-react";
import { SearchResult } from "@/lib/search/types";
import { formatCurrency } from "@/lib/wallet-analytics/utils";
import { LetsIconsPieChartFill, MaterialIconThemeVerified } from "../icons/icons";
import { Tooltip } from "@heroui/react";

interface SearchResultItemProps {
  item: SearchResult;
  isSelected: boolean;
  showBalance: boolean;
  onSelect: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = memo(
  ({ item, isSelected, showBalance, onSelect }) => {
    const [isCopying, setIsCopying] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleCopyAddress = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!item.metadata?.address) return;

      try {
        await navigator.clipboard.writeText(item.metadata.address);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 1500);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    };

    // Enhanced category configurations
    const getCategoryConfig = (category: string) => {
      const configs = {
        tokens: {
          emoji: "🪙",
          color: "primary",
          bg: "bg-blue-50 dark:bg-blue-950/20",
          text: "text-blue-600 dark:text-blue-400",
          icon: BarChart3,
        },
        wallets: {
          emoji: "👛",
          color: "secondary",
          bg: "bg-purple-50 dark:bg-purple-950/20",
          text: "text-purple-600 dark:text-purple-400",
          icon: Target,
        },
        nfts: {
          emoji: "🖼️",
          color: "success",
          bg: "bg-green-50 dark:bg-green-950/20",
          text: "text-green-600 dark:text-green-400",
          icon: Award,
        },
        defi: {
          emoji: "🏦",
          color: "warning",
          bg: "bg-orange-50 dark:bg-orange-950/20",
          text: "text-orange-600 dark:text-orange-400",
          icon: Zap,
        },
      };
      return configs[category] || configs.tokens;
    };

    const getRiskConfig = (risk: string) => {
      switch (risk) {
        case "low":
          return {
            color: "success",
            icon: Shield,
            bg: "bg-green-100 dark:bg-green-900/20",
            text: "text-green-700 dark:text-green-300",
          };
        case "medium":
          return {
            color: "warning",
            icon: Activity,
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
            text: "text-yellow-700 dark:text-yellow-300",
          };
        case "high":
          return {
            color: "danger",
            icon: Activity,
            bg: "bg-red-100 dark:bg-red-900/20",
            text: "text-red-700 dark:text-red-300",
          };
        default:
          return {
            color: "default",
            icon: Activity,
            bg: "bg-gray-100 dark:bg-gray-900/20",
            text: "text-gray-700 dark:text-gray-300",
          };
      }
    };

    const formatValue = (value: string | number | undefined) => {
      if (!value || !showBalance) return "••••••";
      return typeof value === "string" ? value : formatCurrency(value, true);
    };

    const categoryConfig = getCategoryConfig(item.category);
    const riskConfig = item.metadata?.risk
      ? getRiskConfig(item.metadata.risk)
      : null;
    const IconComponent = categoryConfig.icon;

    return (
      <button
        className={`
        w-full px-3 py-2 text-left transition-all duration-200 group relative
        hover:bg-gradient-to-r hover:from-content2/60 hover:to-content3/30
        focus:bg-gradient-to-r focus:from-content2/60 focus:to-content3/30 focus:outline-none
        ${
          isSelected
            ? "bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 border-l-2 border-primary-500"
            : "border-l-2 border-transparent"
        }
      `}
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-3">
          {/* Enhanced Icon with Category Indicator */}
          <div className="relative flex-shrink-0">
            <div
              className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
            ${
              isSelected
                ? "bg-primary-100 dark:bg-primary-900/30 scale-105"
                : `${categoryConfig.bg} group-hover:scale-105`
            }
          `}
            >
              {item.icon || (
                <IconComponent size={18} className={categoryConfig.text} />
              )}
            </div>
          </div>

          {/* Main Content - More Compact */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Title Row with Badges */}
            <div className="flex items-center gap-2">
              <h4
                className={` flex items-center gap-1 min-w-0
              font-semibold text-sm truncate transition-colors
              ${isSelected ? "text-primary-700 dark:text-primary-300" : "text-foreground"}
            `}
              >
                <Tooltip
                  content={
                    <span className=" text-[11px]  font-medium   font-mono">
                      {item.title}
                    </span>
                  }
                  className="bg-content2 border border-divider rounded-lg py-0.5"
                >
                  <span className=" font-mono">{item.metadata.symbol}</span>
                </Tooltip>

                {item.metadata?.verified && (
                  <MaterialIconThemeVerified className="w-4 h-4 text-success flex-shrink-0" />
                )}
              </h4>

              {/* Compact Badges */}
              {item.badge && (
                <Chip
                  size="sm"
                  color={"warning"}
                  variant="flat"
                  className="text-[10px] h-5 rounded-lg  font-semibold"
                >
                  {item.badge}
                </Chip>
              )}

                      {/* Risk Indicator */}
            {riskConfig && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${riskConfig.bg}`}>
                <riskConfig.icon size={8} className={riskConfig.text} />
                <span className={`text-[11px] font-medium ${riskConfig.text}`}>
                  {item.metadata.risk?.toUpperCase()}
                </span>
              </div>
            )}

            </div>

            {/* Compact Metadata Row */}
            <div className="flex items-center gap-2 text-xs">
              {/* Category Chip */}
              <Chip
                size="sm"
                variant="flat"
                className={`text-xs h-4 px-1.5 ${categoryConfig.bg} ${categoryConfig.text} border-0`}
                startContent={<Coins size={10} />}
              >
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Chip>

              {/* Network/Symbol Info */}
              {item.metadata?.network && (
                <div className="flex items-center gap-1 text-default-500">
                  <Globe size={8} />
                  <span className="text-xs">{item.metadata.network}</span>
                </div>
              )}

            {/*   {item.metadata?.symbol && item.type === "token" && (
                <div className="flex items-center gap-1 text-default-500">
                  <DollarSign size={8} />
                  <span className="text-xs font-mono">
                    {item.metadata.symbol}
                  </span>
                </div>
              )} */}
            </div>

       
          </div>

          {/* Compact Value & Change Section */}
          <div className="flex-shrink-0 text-right min-w-[80px]">
            {/* Value */}
            {item.metadata?.value && (
              <div
                className={`
              font-semibold text-sm mb-0.5 transition-colors
              ${isSelected ? "text-primary-700 dark:text-primary-300" : "text-foreground"}
            `}
              >
                {formatValue(item.metadata.value)}
              </div>
            )}

            {/* Change Indicator */}
            {item.metadata?.change !== undefined && (
              <div
                className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium
              ${
                item.metadata.change >= 0
                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }
            `}
              >
                {item.metadata.change >= 0 ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                <span>
                  {item.metadata.change >= 0 ? "+" : ""}
                  {Math.abs(item.metadata.change).toFixed(1)}%
                </span>
              </div>
            )}
                 {/* Additional Stats for Tokens */}
                 {item.type === "token" &&
              (item.metadata?.marketCap || item.metadata?.volume24h) && (
                <div className="flex items-center gap-2 text-xs text-default-500">
                  {item.metadata.marketCap && (
                    <div className="flex items-center gap-1">
                      
                      <span>MC: ${item.metadata.marketCap}</span>
                    </div>
                  )}
                  {item.metadata.volume24h && (
                    <div className="flex items-center gap-1">
                      <Activity size={8} />
                      <span>Vol: {item.metadata.volume24h}</span>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Compact Action Buttons */}
          <div className="flex items-center gap-1 ml-2">
            {item.metadata?.address && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className={`
                min-w-6 w-6 h-6 transition-all duration-200
                ${isHovered || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                ${
                  isCopying
                    ? "text-success bg-success-50 dark:bg-success-900/20"
                    : "text-default-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20"
                }
              `}
                onPress={handleCopyAddress}
              >
                {isCopying ? <CheckCircle size={11} /> : <Copy size={11} />}
              </Button>
            )}

            <Button
              isIconOnly
              size="sm"
              variant="light"
              className={`
              min-w-6 w-6 h-6 transition-all duration-200
              ${isHovered || isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"}
              text-default-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20
            `}
            >
              <ExternalLink size={11} />
            </Button>

            <ChevronRight
              className={`
              transition-all duration-200 ml-1
              ${
                isSelected
                  ? "text-primary transform translate-x-1 scale-110"
                  : "text-default-400 group-hover:text-primary group-hover:translate-x-0.5"
              }
            `}
              size={14}
            />
          </div>
        </div>

        {/* Compact Tags Section - Only show when hovered or selected
      {item.metadata?.tags && item.metadata.tags.length > 0 && (isHovered || isSelected) && (
        <div className="mt-2 pt-2 border-t border-default-100 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {item.metadata.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400"
                >
                  {tag}
                </span>
              ))}
              {item.metadata.tags.length > 4 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs bg-default-100 dark:bg-default-800 text-default-400">
                  +{item.metadata.tags.length - 4}
                </span>
              )}
            </div>
            
          
            <div className="flex items-center gap-1">
              {item.metadata.verified && (
                <Star className="w-3 h-3 text-warning" />
              )}
              {item.badge === 'Top 100' && (
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />
              )}
            </div>
          </div>
        </div>
      )} */}

        {/* Enhanced Selection Indicator */}
        {isSelected && (
          <>
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-r-md" />
            <div className="absolute inset-0 border border-primary-200 dark:border-primary-800 rounded-lg pointer-events-none opacity-30" />
          </>
        )}

        {/* Subtle Hover Effect */}
        {isHovered && !isSelected && (
          <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-default-300 rounded-r-md transition-all duration-200" />
        )}
      </button>
    );
  }
);

SearchResultItem.displayName = "SearchResultItem";
