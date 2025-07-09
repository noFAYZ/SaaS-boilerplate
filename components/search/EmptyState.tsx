// components/search/EmptyState.tsx
"use client";

import React, { memo, useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Kbd } from "@heroui/kbd";
import {
  Clock,
  TrendingUp,
  Star,
  Search,
  Wallet,
  Coins,
  Zap,
  ChevronRight,
  X
} from "lucide-react";
import { Avatar } from "@heroui/avatar";
import { zerionSDK, zerionUtils } from '@/lib/zerion';
import { MaterialIconThemeVerified, MynauiArrowUpDownSolid } from "../icons/icons";

interface EmptyStateProps {
  recentSearches: string[];
  onRecentSearch: (query: string) => void;
  onGetTrending: () => void;
  showBalance: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({
  recentSearches,
  onRecentSearch,
  onGetTrending,
  showBalance
}) => {
  const [topTokens, setTopTokens] = useState<any[]>([]);

  // Quick search examples
  const quickSearchExamples = [
    { query: 'USDC', icon: '🪙', type: 'Token' },
    { query: 'vitalik.eth', icon: '👛', type: 'ENS' },
    { query: 'ETH', icon: '💎', type: 'Token' },
    { query: 'Uniswap', icon: '🦄', type: 'DeFi' },
    { query: '0x742d35...', icon: '📍', type: 'Wallet' },
    { query: 'Aave', icon: '👻', type: 'DeFi' }
  ];

  // Load top tokens on mount
  useEffect(() => {
    const loadTopTokens = async () => {
      try {
        const tokens = await zerionUtils.getTopTokens(6);
        if (tokens) {
          const formattedTokens = tokens.map((token: any, index: number) => ({
            id: `top-token-${index}`,
            title: `${token?.attributes?.name} (${token?.attributes?.symbol})`,
            icon: token?.attributes?.icon?.url ? 
              <Avatar src={token?.attributes?.icon?.url} size="sm" className="w-6 h-6" /> : 
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                <Coins size={12} className="text-primary-600" />
              </div>,
            metadata: {
              symbol: token?.attributes?.symbol,
              value: token?.attributes?.market_data?.price ? 
                `$${token?.attributes?.market_data?.price.toFixed(token?.attributes?.market_data?.price < 1 ? 4 : 2)}` : 
                'N/A',
              change: token?.attributes?.market_data?.changes?.percent_1d,
              verified: true
            }
          }));
          setTopTokens(formattedTokens);
        }
      } catch (error) {
        console.error('Failed to load top tokens:', error);
      }
    };

    loadTopTokens();
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* Top Tokens Section with real data from Zerion API */}
      {topTokens.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Top Tokens
            <Chip size="sm" color="success" variant="flat" className="text-[10px] rounded-lg h-5">
              Live
            </Chip>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {topTokens.slice(0, 6).map((token) => (
              <button
                key={token.id}
                className="text-left px-3 py-2 bg-content2 rounded-2xl hover:bg-content3 transition-colors group"
                onClick={() => onRecentSearch(token.metadata?.symbol || token.title)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 flex-shrink-0">
                      {token.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">
                          {token.metadata?.symbol || 'N/A'}
                        </span>
                        {token.metadata?.verified && (
                          <MaterialIconThemeVerified className="w-4 h-4 text-success flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-default-500 truncate">
                        {showBalance ? token.metadata?.value || 'N/A' : '••••••'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {token.metadata?.change !== undefined && (
                      <Chip 
                        size="sm" 
                        color={token.metadata.change >= 0 ? "success" : "danger"} 
                        variant="flat"
                        className="text-[10px] rounded-lg h-5"
                      >
                        {token.metadata.change >= 0 ? '+' : ''}{token.metadata.change.toFixed(1)}%
                      </Chip>
                    )}
                    <ChevronRight className="text-default-400 opacity-0 group-hover:opacity-100 transition-opacity" size={10} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions with real examples */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Quick Search
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {quickSearchExamples.map((example, index) => (
            <button
              key={index}
              className="p-2 text-left bg-content2 hover:bg-content3 rounded-lg transition-colors"
              onClick={() => onRecentSearch(example.query)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{example.icon}</span>
                <div className="min-w-0">
                  <span className="text-sm font-medium block truncate">{example.query}</span>
                  <span className="text-xs text-default-500">{example.type}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-default-500" />
            Recent
          </h4>
          <div className="space-y-1">
            {recentSearches.map((search, index) => (
              <a
                key={index}
                className="w-full text-left p-2 rounded-lg hover:bg-content2 transition-colors flex items-center justify-between group"
                onClick={() => onRecentSearch(search)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-3 h-3 text-default-400 flex-shrink-0" />
                  <span className="text-sm truncate">{search}</span>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  className="opacity-0 group-hover:opacity-100 transition-opacity min-w-5 w-5 h-5"
                  onPress={(e) => {
                    e.stopPropagation();
                    // Remove this search from recent searches
                    const updatedSearches = recentSearches.filter((_, i) => i !== index);
                    // This would need to be passed as a callback prop
                    console.log('Remove search:', search);
                  }}
                >
                  <X size={10} />
                </Button>
              </a>
            ))}
            </div>
       
        </div>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';