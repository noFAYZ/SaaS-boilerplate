// components/WalletAnalytics/NFTsList.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { Badge } from '@heroui/badge';
import { motion } from 'framer-motion';
import { 
  Palette, 
  AlertCircle, 
  Search, 
  Grid3X3, 
  List, 
  Eye, 
  Copy, 
  Share2,
  ExternalLink,
  Crown,
  Sparkles,
  Star,
  Shield,
  TrendingUp,
  Zap
} from 'lucide-react';
import { zerionSDK } from '@/lib/zerion';
import { 
  SUPPORTED_CHAINS, 
  ANIMATION_DELAYS, 
  DEFAULT_PAGE_SIZE 
} from '@/lib/wallet-analytics/constants';
import { 
  formatCurrency, 
  formatTokenId, 
  getChainInfo, 
  getNFTRarity, 
  getTokenTypeIcon,
  copyToClipboard,
  openOpenSea
} from '@/lib/wallet-analytics/utils';
import type { NFTPosition, ViewMode, SortOption } from '@/lib/wallet-analytics/types';

interface NFTsListProps {
  address: string;
  selectedChain: string;
  showBalance: boolean;
}

export const NFTsList: React.FC<NFTsListProps> = ({ 
  address, 
  selectedChain, 
  showBalance 
}) => {
  const [nfts, setNfts] = useState<NFTPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNFT, setHoveredNFT] = useState<string | null>(null);

  const loadNFTs = useCallback(async () => {
    if (!address || !zerionSDK) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        filter: {
          ...(selectedChain !== 'all' && { chain_ids: [selectedChain] })
        },
        sort: 'created_at' as const,
        page: { size: DEFAULT_PAGE_SIZE }
      };
      
      const response = await zerionSDK.wallets.getNFTPositions(address, filters);
      let nftData = response.data || [];
      
      // Filter out spam NFTs
      nftData = nftData.filter(nft => !nft.attributes?.nft_info?.flags?.is_spam);
      
      // Filter by search query if provided
      if (searchQuery) {
        nftData = nftData.filter(nft => {
          const name = nft.attributes?.nft_info?.name?.toLowerCase() || '';
          const collection = nft.attributes?.collection_info?.name?.toLowerCase() || '';
          const query = searchQuery.toLowerCase();
          return name.includes(query) || collection.includes(query);
        });
      }
      
      // Sort based on selected option
      if (sortBy === 'price') {
        nftData.sort((a, b) => (b.attributes?.last_price || 0) - (a.attributes?.last_price || 0));
      } else if (sortBy === 'name') {
        nftData.sort((a, b) => {
          const nameA = a.attributes?.nft_info?.name || '';
          const nameB = b.attributes?.nft_info?.name || '';
          return nameA.localeCompare(nameB);
        });
      }
      
      setNfts(nftData);
    } catch (err) {
      console.error('Failed to load NFTs:', err);
      setError('Failed to load NFTs. Please try again.');
      setNfts([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, selectedChain, searchQuery, sortBy]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  const handleCopyTokenId = (tokenId: string) => {
    copyToClipboard(tokenId);
  };

  const handleOpenSea = (nft: NFTPosition) => {
    const chainId = nft.relationships?.chain?.data?.id || 'ethereum';
    const contractAddress = nft.attributes?.nft_info?.contract_address;
    const tokenId = nft.attributes?.nft_info?.token_id;
    
    if (contractAddress && tokenId) {
      openOpenSea(chainId, contractAddress, tokenId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="md" color="white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Discovering your NFTs</p>
            <p className="text-sm text-default-500">Exploring the digital art universe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-danger" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
        <p className="text-sm text-default-500 mb-6">{error}</p>
        <Button color="danger" variant="flat" onPress={loadNFTs} startContent={<Zap className="w-4 h-4" />}>
          Try Again
        </Button>
      </div>
    );
  }

  if (nfts.length === 0 && !isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-6">
          <Palette className="w-10 h-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-semibold mb-3">No NFTs discovered</h3>
        <p className="text-sm text-default-500 max-w-md mx-auto mb-6">
          {searchQuery 
            ? `No NFTs match your search "${searchQuery}"`
            : selectedChain !== 'all' 
              ? `This wallet doesn't own any NFTs on ${getChainInfo(selectedChain).name}`
              : "This wallet doesn't own any NFTs yet. Start your collection journey!"
          }
        </p>
        {searchQuery && (
          <Button 
            variant="flat" 
            onPress={() => setSearchQuery('')}
            startContent={<Search className="w-4 h-4" />}
          >
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-default-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'solid' : 'light'}
              color={viewMode === 'grid' ? 'primary' : 'default'}
              isIconOnly
              onPress={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'solid' : 'light'}
              color={viewMode === 'list' ? 'primary' : 'default'}
              isIconOnly
              onPress={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Badge variant="flat" color="primary" className="hidden sm:flex">
            {nfts.length} NFT{nfts.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 text-sm bg-default-100 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="recent">Recently Added</option>
            <option value="price">Highest Value</option>
            <option value="name">Name (A-Z)</option>
          </select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-default-400" />
            <input
              type="text"
              placeholder="Search NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm bg-default-100 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48"
            />
          </div>
        </div>
      </div>

      {/* NFTs Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4" 
          : "space-y-4"
      }>
        {nfts.map((nft, index) => {
          const tokenId = nft.attributes?.nft_info?.token_id;
          const tokenName = nft.attributes?.nft_info?.name;
          const collection = nft.attributes?.collection_info;
          const chainId = nft.relationships?.chain?.data?.id || 'ethereum';
          const chainInfo = getChainInfo(chainId);
          const lastPrice = nft.attributes?.last_price || 0;
          const rarity = getNFTRarity(lastPrice);
          const interfaceType = nft.attributes?.nft_info?.interface;
          const previewUrl = nft.attributes?.nft_info?.content?.preview?.url;

          if (viewMode === 'list') {
            return (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * ANIMATION_DELAYS.LIST_ITEM, duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-default-200 hover:border-primary/30">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      {/* NFT Preview */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                        {previewUrl ? (
                          <img 
                            src={previewUrl} 
                            alt={tokenName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            <Palette className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* NFT Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-xs truncate">
                            {tokenName || `Token ${formatTokenId(tokenId)}`}
                          </h4>
                          <Chip size="sm" color={rarity.color} variant="flat" className="flex">
                            {rarity.level}
                          </Chip>
                        </div>
                        <p className="text-[10px] text-default-500 truncate">
                          {collection?.name || 'Unknown Collection'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            style={{ backgroundColor: `${chainInfo.color}20`, color: chainInfo.color }}
                          >
                            {chainInfo.icon} {chainInfo.name}
                          </Chip>
                          <span className="text-xs text-default-400">
                            {formatTokenId(tokenId)}
                          </span>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="text-right">
                        <p className="font-semibold text-sm mb-1">
                          {formatCurrency(lastPrice, showBalance)}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => handleCopyTokenId(tokenId)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => handleOpenSea(nft)}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * ANIMATION_DELAYS.NFT_ITEM, duration: 0.1 }}
              whileHover={{ scale: 1.01 }}
              onHoverStart={() => setHoveredNFT(nft.id)}
              onHoverEnd={() => setHoveredNFT(null)}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-75 border border-default group">
                {/* NFT Image */}
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt={tokenName}
                      className="w-full h-full object-cover group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).nextSibling as HTMLDivElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center absolute inset-0">
                    <Palette className="w-12 h-12 text-white/60" />
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 transition-opacity duration-300 ${
                    hoveredNFT === nft.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      isIconOnly
                      onPress={() => handleOpenSea(nft)}
                      className="bg-white/20 backdrop-blur-md border-white/30"
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      isIconOnly
                      onPress={() => handleCopyTokenId(tokenId)}
                      className="bg-white/20 backdrop-blur-md border-white/30"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      isIconOnly
                      className="bg-white/20 backdrop-blur-md border-white/30"
                    >
                      <Share2 className="w-4 h-4 text-white" />
                    </Button>
                  </div>

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {lastPrice > 1 && (
                      <Chip size="sm" color="warning" variant="solid" className="backdrop-blur-md bg-warning/90">
                        <Crown className="w-3 h-3 mr-1" />
                        {rarity.level}
                      </Chip>
                    )}
                    {interfaceType && (
                      <Chip size="sm" variant="solid" className="backdrop-blur-md bg-black/50 text-white">
                        {getTokenTypeIcon(interfaceType) === 'Crown' && <Crown className="w-3 h-3" />}
                        {getTokenTypeIcon(interfaceType) === 'Sparkles' && <Sparkles className="w-3 h-3" />}
                        {getTokenTypeIcon(interfaceType) === 'Star' && <Star className="w-3 h-3" />}
                        <span className="ml-1">{interfaceType}</span>
                      </Chip>
                    )}
                  </div>

                  {/* Chain badge */}
                  <div className="absolute top-3 right-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm backdrop-blur-md border-2 border-white/30"
                      style={{ backgroundColor: `${chainInfo.color}90` }}
                    >
                      {chainInfo.icon}
                    </div>
                  </div>
                </div>
                
                {/* NFT Details */}
                <CardBody className="space-y-1">
                  <div>
                    <h4 className="font-bold text-xs truncate mb-1">
                      {tokenName || `Token ${formatTokenId(tokenId)}`}
                    </h4>
                    <p className="text-[10px] text-default-500 truncate">
                      {collection?.name || 'Unknown Collection'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-default-400 font-mono">
                        {formatTokenId(tokenId)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(lastPrice, showBalance)}
                      </p>
                      {lastPrice > 0 && (
                        <div className="flex items-center gap-1 text-success">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs">Value</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Load More Button */}
      {nfts.length >= DEFAULT_PAGE_SIZE && (
        <div className="text-center pt-6">
          <Button 
            variant="flat" 
            color="primary"
            size="lg"
            startContent={<Sparkles className="w-4 h-4" />}
            className="px-8"
            onPress={loadNFTs}
          >
            Load More NFTs
          </Button>
        </div>
      )}
    </div>
  );
};