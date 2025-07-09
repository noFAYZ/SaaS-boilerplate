// app/search/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Tab, Tabs } from '@heroui/tabs';
import {
  Search,
  Zap,
  BarChart3,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

import { EnhancedSearch } from '@/components/search';
import { SearchResult } from '@/lib/search/types';
import { ResponsiveLayout } from '@/components/layouts/ResponsiveLayout';

export default function SearchDemoPage() {
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [cacheStats, setCacheStats] = useState({ size: 0 });

  // Enhanced item selection handler
  const handleItemSelect = useCallback((item: SearchResult) => {
    setSelectedItem(item);
    setSearchHistory(prev => {
      const newHistory = [item, ...prev.filter(h => h.id !== item.id)].slice(0, 10);
      return newHistory;
    });
    
    // Enhanced navigation with real routing
    if (item.url) {
      console.log(`🔗 Navigation:`, {
        type: item.type,
        title: item.title,
        url: item.url,
        metadata: item.metadata
      });
      
      // For demonstration - in real app, use Next.js router
      // router.push(item.url);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    console.log('🔍 Search query:', query);
  }, []);

  const clearCache = useCallback(() => {
    setCacheStats({ size: 0 });
    console.log('🗑️ Cache cleared');
  }, []);

  return (
    <ResponsiveLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <Search size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                Enhanced Blockchain Search
              </h1>
              <p className="text-default-600 text-lg">
                Powered by Zerion SDK with real-time data
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4">
            <Chip
              size="sm"
              color={apiStatus === 'connected' ? 'success' : 'warning'}
              variant="flat"
              startContent={
                apiStatus === 'connected' ? 
                  <CheckCircle2 size={12} /> : 
                  <AlertCircle size={12} />
              }
            >
              API {apiStatus}
            </Chip>
            <Badge size="sm" color="primary" variant="flat">
              Cache: {cacheStats.size} items
            </Badge>
          </div>
        </div>

        {/* Main Search Interface */}
        <div className="max-w-3xl mx-auto">
          <EnhancedSearch
            placeholder="Search wallets, tokens, NFTs, DeFi protocols..."
            onItemSelect={handleItemSelect}
            onSearch={handleSearch}
            enableFilters={true}
            maxResults={15}
            categories={['tokens', 'wallets', 'nfts', 'defi']}
            className="w-full"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selected Item Details */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Selected Item Details</h3>
              <Button
                size="sm"
                variant="flat"
                startContent={<RefreshCw size={14} />}
                onPress={clearCache}
              >
                Clear Cache
              </Button>
            </CardHeader>
            <CardBody>
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {selectedItem.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-xl font-semibold">{selectedItem.title}</h4>
                        {selectedItem.badge && (
                          <Badge size="sm" color="primary">{selectedItem.badge}</Badge>
                        )}
                        {selectedItem.metadata?.verified && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                      </div>
                      <p className="text-default-600 mb-3">{selectedItem.subtitle}</p>
                      
                      {/* Metadata */}
                      {selectedItem.metadata && (
                        <div className="grid grid-cols-2 gap-4">
                          {selectedItem.metadata.value && (
                            <div>
                              <span className="text-sm text-default-500">Value</span>
                              <p className="font-semibold">{selectedItem.metadata.value}</p>
                            </div>
                          )}
                          {selectedItem.metadata.change !== undefined && (
                            <div>
                              <span className="text-sm text-default-500">24h Change</span>
                              <p className={`font-semibold ${
                                selectedItem.metadata.change >= 0 ? 'text-success' : 'text-danger'
                              }`}>
                                {selectedItem.metadata.change >= 0 ? '+' : ''}
                                {selectedItem.metadata.change.toFixed(2)}%
                              </p>
                            </div>
                          )}
                          {selectedItem.metadata.network && (
                            <div>
                              <span className="text-sm text-default-500">Network</span>
                              <p className="font-semibold">{selectedItem.metadata.network}</p>
                            </div>
                          )}
                          {selectedItem.metadata.address && (
                            <div>
                              <span className="text-sm text-default-500">Address</span>
                              <p className="font-mono text-sm">{selectedItem.metadata.address}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Action Button */}
                      {selectedItem.url && (
                        <Button
                          color="primary"
                          variant="solid"
                          className="mt-4"
                          onPress={() => {
                            console.log(`Navigate to: ${selectedItem.url}`);
                            // In real app: router.push(selectedItem.url);
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {selectedItem.metadata?.tags && (
                    <div>
                      <span className="text-sm text-default-500 mb-2 block">Tags</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.metadata.tags.map((tag, index) => (
                          <Chip key={index} size="sm" variant="flat">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-default-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-default-600 mb-2">
                    No item selected
                  </h4>
                  <p className="text-default-500">
                    Search and select an item to view details
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Search History & Stats */}
          <div className="space-y-6">
            {/* Search History */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock size={18} />
                  Recent Searches
                </h3>
              </CardHeader>
              <CardBody>
                {searchHistory.length > 0 ? (
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-content2 cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex-shrink-0">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          <p className="text-xs text-default-500">{item.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-default-500 text-center py-4">
                    No search history yet
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Features Showcase */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles size={18} />
                  Features
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Real-time Data</p>
                      <p className="text-xs text-default-500">Live Zerion API integration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium text-sm">Smart Caching</p>
                      <p className="text-xs text-default-500">5-30min cache TTL</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-sm">Multi-category</p>
                      <p className="text-xs text-default-500">Tokens, Wallets, NFTs, DeFi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="font-medium text-sm">Advanced Filters</p>
                      <p className="text-xs text-default-500">Categories, verification, value</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Try These Examples</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { query: 'USDC', type: 'Token', desc: 'Popular stablecoin' },
                { query: 'vitalik.eth', type: 'ENS', desc: 'Ethereum founder' },
                { query: '0x742d35cc639c0532...', type: 'Wallet', desc: 'Ethereum address' },
                { query: 'Uniswap', type: 'DeFi', desc: 'DEX protocol' }
              ].map((example, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardBody className="text-center p-4">
                    <h4 className="font-semibold mb-1">{example.query}</h4>
                    <Chip size="sm" color="primary" variant="flat" className="mb-2">
                      {example.type}
                    </Chip>
                    <p className="text-xs text-default-500">{example.desc}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </ResponsiveLayout>
  );
}