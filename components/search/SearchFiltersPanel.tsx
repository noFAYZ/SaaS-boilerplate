// components/search/SearchFiltersPanel.tsx
"use client";

import React, { memo } from "react";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Slider } from "@heroui/slider";
import { 
  Filter,
  CheckCircle,
  Shield,
  DollarSign,
  RotateCcw,
  Coins,
  Wallet,
  Image,
  Zap
} from "lucide-react";
import { SearchFilters, SearchCategory } from '@/lib/search/types';

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: SearchCategory[];
}

export const SearchFiltersPanel: React.FC<SearchFiltersPanelProps> = memo(({
  filters,
  onFiltersChange,
  categories
}) => {
  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    onFiltersChange({
      categories,
      verified: undefined,
      limit: 12,
      minValue: undefined,
      maxValue: undefined,
      chains: undefined
    });
  };

  const toggleCategory = (category: SearchCategory) => {
    const currentCategories = filters.categories || categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateFilters({ categories: newCategories });
  };

  const getCategoryIcon = (category: SearchCategory) => {
    switch (category) {
      case 'tokens': return <Coins size={14} />;
      case 'wallets': return <Wallet size={14} />;
      case 'nfts': return <Image size={14} />;
      case 'defi': return <Zap size={14} />;
      default: return <Filter size={14} />;
    }
  };

  const getCategoryColor = (category: SearchCategory) => {
    switch (category) {
      case 'tokens': return 'primary';
      case 'wallets': return 'secondary';
      case 'nfts': return 'success';
      case 'defi': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="border-b border-divider bg-content2/30">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            <h3 className="font-semibold text-sm">Search Filters</h3>
          </div>
          <Button
            size="sm"
            variant="light"
            startContent={<RotateCcw size={12} />}
            onPress={resetFilters}
            className="h-6 px-2 text-xs"
          >
            Reset
          </Button>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-default-600">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const isSelected = filters.categories?.includes(category) ?? true;
              return (
                <Chip
                  key={category}
                  size="sm"
                  variant={isSelected ? "solid" : "flat"}
                  color={isSelected ? getCategoryColor(category) : "default"}
                  className="cursor-pointer capitalize"
                  startContent={getCategoryIcon(category)}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Verification Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-success" />
            <span className="text-sm">Verified Only</span>
          </div>
          <Switch
            size="sm"
            isSelected={filters.verified === true}
            onValueChange={(verified) => 
              updateFilters({ verified: verified ? true : undefined })
            }
          />
        </div>

        {/* Value Range (for tokens/wallets) */}
        {(filters.categories?.includes('tokens') || filters.categories?.includes('wallets')) && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-default-600 flex items-center gap-2">
              <DollarSign size={12} />
              Value Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                size="sm"
                placeholder="Min ($)"
                value={filters.minValue?.toString() || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || undefined;
                  updateFilters({ minValue: value });
                }}
                startContent={<span className="text-xs">$</span>}
              />
              <Input
                size="sm"
                placeholder="Max ($)"
                value={filters.maxValue?.toString() || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || undefined;
                  updateFilters({ maxValue: value });
                }}
                startContent={<span className="text-xs">$</span>}
              />
            </div>
          </div>
        )}

        {/* Popular Chains */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-default-600">Popular Chains</label>
          <div className="flex flex-wrap gap-1">
            {['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'].map(chain => {
              const isSelected = filters.chains?.includes(chain) ?? true;
              return (
                <Chip
                  key={chain}
                  size="sm"
                  variant={isSelected ? "solid" : "flat"}
                  color={isSelected ? "primary" : "default"}
                  className="cursor-pointer text-xs capitalize"
                  onClick={() => {
                    const currentChains = filters.chains || [];
                    const newChains = currentChains.includes(chain)
                      ? currentChains.filter(c => c !== chain)
                      : [...currentChains, chain];
                    updateFilters({ chains: newChains.length > 0 ? newChains : undefined });
                  }}
                >
                  {chain}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Results Limit */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-default-600">
            Max Results: {filters.limit || 12}
          </label>
          <Slider
            size="sm"
            step={4}
            minValue={4}
            maxValue={50}
            value={[filters.limit || 12]}
            onChange={(value) => updateFilters({ limit: Array.isArray(value) ? value[0] : value })}
            className="max-w-full"
          />
        </div>

        {/* Active Filters Summary */}
        {(filters.verified || filters.minValue || filters.maxValue || 
          (filters.categories && filters.categories.length < categories.length)) && (
          <div className="pt-2 border-t border-divider">
            <div className="text-xs text-default-500 mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-1">
              {filters.verified && (
                <Chip size="sm" color="success" variant="flat">
                  Verified
                </Chip>
              )}
              {filters.minValue && (
                <Chip size="sm" color="primary" variant="flat">
                  Min: ${filters.minValue}
                </Chip>
              )}
              {filters.maxValue && (
                <Chip size="sm" color="primary" variant="flat">
                  Max: ${filters.maxValue}
                </Chip>
              )}
              {filters.categories && filters.categories.length < categories.length && (
                <Chip size="sm" color="secondary" variant="flat">
                  {filters.categories.length} Categories
                </Chip>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

SearchFiltersPanel.displayName = 'SearchFiltersPanel';