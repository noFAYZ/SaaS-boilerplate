// components/Wallets/WalletGrid.tsx
import { useState } from 'react';
import { Button } from '@heroui/button';
import { useWallets } from '@/contexts/WalletContext';
import { AddWalletModal } from './AddWalletModal';
import { WalletCard } from './WalletCard';
import { EditWalletModal } from './EditWalletModal';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Spinner } from '@heroui/spinner';

export function WalletGrid() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<{ address: string; name: string } | null>(null);
  const { state, actions } = useWallets();

  const handleWalletSelect = (address: string) => {
    actions.selectWallet(address === state.selectedWallet ? null : address);
  };

  const handleEditWallet = (address: string, currentName: string) => {
    setEditingWallet({ address, name: currentName });
  };

  const handleDeleteWallet = (address: string) => {
    if (confirm('Are you sure you want to remove this wallet?')) {
      actions.removeWallet(address);
    }
  };

  if (state.summaries.length === 0 && !state.isLoading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-default-100 flex items-center justify-center">
            <Plus className="w-8 h-8 text-default-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Wallets Added</h3>
          <p className="text-default-500 mb-6">
            Add your first wallet to start tracking your DeFi portfolio
          </p>
          <Button
            color="primary"
            onPress={() => setIsAddModalOpen(true)}
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Wallet
          </Button>
        </div>
        
        <AddWalletModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions 
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Wallets</h2>
          <p className="text-sm text-default-500">
            {state.summaries.length} wallet{state.summaries.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="flat"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={actions.refreshAllWallets}
            isLoading={state.isLoading}
          >
            Refresh All
          </Button>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => setIsAddModalOpen(true)}
          >
            Add Wallet
          </Button>
        </div>
      </div>*/}

      {/* Loading State */}
      {state.isLoading && state.summaries.length === 0 && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.summaries.map((wallet) => (
          <WalletCard
            key={wallet.address}
            wallet={wallet}
            isSelected={state.selectedWallet === wallet.address}
            onClick={() => handleWalletSelect(wallet.address)}
            onEdit={() => handleEditWallet(wallet.address, wallet.name || '')}
            onDelete={() => handleDeleteWallet(wallet.address)}
            onRefresh={() => actions.refreshWallet(wallet.address)}
            isLoading={state.isLoading}
          />
        ))}
      </div>

      {/* Error State */}
      {state.error && (
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-200">
          <p className="text-danger-700">{state.error}</p>
        </div>
      )}

      {/* Modals */}
      <AddWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      {editingWallet && (
        <EditWalletModal
          isOpen={true}
          wallet={editingWallet}
          onClose={() => setEditingWallet(null)}
          onSave={(address, name) => {
            actions.updateWalletName(address, name);
            setEditingWallet(null);
          }}
        />
      )}
    </div>
  );
}