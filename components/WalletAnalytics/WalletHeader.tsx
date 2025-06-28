// components/WalletAnalytics/WalletHeader.tsx
'use client';

import React from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { SUPPORTED_CHAINS } from '@/lib/wallet-analytics/constants';
import { copyToClipboard, openEtherscan, truncateAddress } from '@/lib/wallet-analytics/utils';

interface WalletHeaderProps {
  address: string;
  selectedChain: string;
  onChainChange: (chainId: string) => void;
  showBalance: boolean;
  onToggleBalance: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  availableChains: string[];
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({
  address,
  selectedChain,
  onChainChange,
  showBalance,
  onToggleBalance,
  onRefresh,
  refreshing,
  availableChains
}) => {
  const handleCopyAddress = () => {
    copyToClipboard(address);
  };

  const handleOpenEtherscan = () => {
    openEtherscan(address, 'address');
  };

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold">Wallet Analytics</h1>
                <Badge color="success" variant="flat" className="text-xs">
                  Live
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-default-500 font-mono bg-default-100 rounded px-2 py-1">
                  {truncateAddress(address, 10, 8)}
                </p>
                <Button size="sm" variant="light" isIconOnly onPress={handleCopyAddress}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="light" isIconOnly onPress={handleOpenEtherscan}>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  variant="flat" 
                  size="sm"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  <div className="flex items-center gap-2">
                    {selectedChain === 'all' ? (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>All Chains</span>
                      </>
                    ) : (
                      <>
                        <span>{SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.icon}</span>
                        <span>{SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name}</span>
                      </>
                    )}
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectedKeys={[selectedChain]}
                onSelectionChange={(keys) => onChainChange(Array.from(keys)[0] as string)}
              >
                <DropdownItem key="all">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>All Chains</span>
                  </div>
                </DropdownItem>
                {availableChains.map((chainId) => {
                  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
                  return (
                    <DropdownItem key={chainId}>
                      <div className="flex items-center gap-2">
                        <span>{chain?.icon || '🔗'}</span>
                        <span>{chain?.name || chainId}</span>
                      </div>
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>

            <Button size="sm" variant="light" isIconOnly onPress={onToggleBalance}>
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            <Button 
              size="sm" 
              variant="flat" 
              isIconOnly 
              onPress={onRefresh} 
              isLoading={refreshing}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};