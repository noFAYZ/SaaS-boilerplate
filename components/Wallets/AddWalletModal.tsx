// components/Wallets/AddWalletModal.tsx
'use client';

import { useState } from 'react';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import { useWallets } from '@/contexts/WalletContext';
import { Wallet, Scan, AlertCircle } from 'lucide-react';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddWalletModal({ isOpen, onClose }: AddWalletModalProps) {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { actions } = useWallets();

  const validateAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    if (!validateAddress(address)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await actions.addWallet(address, name.trim() || undefined);
      setAddress('');
      setName('');
      onClose();
    } catch (err) {
      setError('Failed to add wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setError('');
  };

  const exampleAddresses = [
    { name: 'Vitalik.eth', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
    { name: 'Uniswap V3', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
    { name: 'ENS Treasury', address: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "border border-default-200"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary-500/10">
              <Wallet className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Add Wallet</h3>
              <p className="text-sm text-default-500">Track any Ethereum wallet</p>
            </div>
          </div>
        </ModalHeader>
        
        <Divider />
        
        <ModalBody className="py-6">
          <div className="space-y-4">
            <Input
              label="Wallet Address"
              placeholder="0x..."
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              isInvalid={!!error}
              errorMessage={error}
              startContent={<Wallet className="w-4 h-4 text-default-400" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="text-default-400"
                  onClick={() => {
                    // In a real app, this would open a QR scanner
                    console.log('QR Scanner would open here');
                  }}
                >
                  <Scan className="w-4 h-4" />
                </Button>
              }
              classNames={{
                inputWrapper: "border-default-200"
              }}
            />
            
            <Input
              label="Wallet Name (Optional)"
              placeholder="My DeFi Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              classNames={{
                inputWrapper: "border-default-200"
              }}
            />
            
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-50 border border-danger-200">
                <AlertCircle className="w-4 h-4 text-danger-500" />
                <span className="text-sm text-danger-700">{error}</span>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-default-700 mb-3">Try These Examples:</p>
              <div className="grid gap-2">
                {exampleAddresses.map((example, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-default-200 hover:bg-default-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setAddress(example.address);
                      setName(example.name);
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{example.name}</p>
                      <p className="text-xs text-default-500 font-mono">
                        {example.address.slice(0, 8)}...{example.address.slice(-6)}
                      </p>
                    </div>
                    <Chip size="sm" variant="flat" color="primary">
                      Try
                    </Chip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        
        <Divider />
        
        <ModalFooter>
          <Button 
            variant="flat" 
            onPress={onClose}
            className="font-medium"
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!address || !validateAddress(address)}
            className="font-medium"
          >
            Add Wallet
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}





