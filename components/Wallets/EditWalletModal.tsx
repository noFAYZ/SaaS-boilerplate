import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalContent, ModalHeader, Divider, ModalBody, ModalFooter } from "@heroui/react";
import { useState } from "react";

// components/Wallets/EditWalletModal.tsx
interface EditWalletModalProps {
    isOpen: boolean;
    wallet: { address: string; name: string };
    onClose: () => void;
    onSave: (address: string, name: string) => void;
  }
  
  export function EditWalletModal({ isOpen, wallet, onClose, onSave }: EditWalletModalProps) {
    const [name, setName] = useState(wallet.name);
  
    const handleSave = () => {
      onSave(wallet.address, name.trim());
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">Edit Wallet Name</h3>
          </ModalHeader>
          
          <Divider />
          
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-default-500 mb-2">Wallet Address</p>
                <p className="text-sm font-mono bg-default-100 p-2 rounded">
                  {wallet.address}
                </p>
              </div>
              
              <Input
                label="Wallet Name"
                placeholder="Enter wallet name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </ModalBody>
          
          <Divider />
          
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSave}
              isDisabled={!name.trim()}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }