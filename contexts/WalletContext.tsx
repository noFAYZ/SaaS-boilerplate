// contexts/WalletContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { WalletData, WalletSummary, zerionUtils, batchZerionOperations } from '@/lib/zerion';
import { addToast } from '@heroui/react';

interface WalletState {
  wallets: WalletData[];
  summaries: WalletSummary[];
  selectedWallet: string | null;
  isLoading: boolean;
  error: string | null;
  lastRefresh: number;
}

type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_WALLET'; payload: { address: string; name?: string } }
  | { type: 'REMOVE_WALLET'; payload: string }
  | { type: 'UPDATE_WALLET_NAME'; payload: { address: string; name: string } }
  | { type: 'SET_WALLET_DATA'; payload: WalletData }
  | { type: 'SET_SUMMARIES'; payload: WalletSummary[] }
  | { type: 'SELECT_WALLET'; payload: string | null }
  | { type: 'SET_LAST_REFRESH'; payload: number }
  | { type: 'CLEAR_ALL' };

const initialState: WalletState = {
  wallets: [],
  summaries: [],
  selectedWallet: null,
  isLoading: false,
  error: null,
  lastRefresh: 0
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'ADD_WALLET':
      if (state.wallets.some(w => w.address === action.payload.address)) {
        return state; // Wallet already exists
      }
      return {
        ...state,
        wallets: [...state.wallets, { 
          ...action.payload, 
          isLoading: true,
          lastUpdated: Date.now()
        }]
      };
    
    case 'REMOVE_WALLET':
      return {
        ...state,
        wallets: state.wallets.filter(w => w.address !== action.payload),
        summaries: state.summaries.filter(s => s.address !== action.payload),
        selectedWallet: state.selectedWallet === action.payload ? null : state.selectedWallet
      };
    
    case 'UPDATE_WALLET_NAME':
      return {
        ...state,
        wallets: state.wallets.map(w => 
          w.address === action.payload.address 
            ? { ...w, name: action.payload.name }
            : w
        ),
        summaries: state.summaries.map(s => 
          s.address === action.payload.address 
            ? { ...s, name: action.payload.name }
            : s
        )
      };
    
    case 'SET_WALLET_DATA':
      return {
        ...state,
        wallets: state.wallets.map(w => 
          w.address === action.payload.address 
            ? { ...w, ...action.payload, isLoading: false, error: undefined }
            : w
        )
      };
    
    case 'SET_SUMMARIES':
      return { ...state, summaries: action.payload };
    
    case 'SELECT_WALLET':
      return { ...state, selectedWallet: action.payload };
    
    case 'SET_LAST_REFRESH':
      return { ...state, lastRefresh: action.payload };
    
    case 'CLEAR_ALL':
      return { ...initialState };
    
    default:
      return state;
  }
}

interface WalletContextType {
  state: WalletState;
  actions: {
    addWallet: (address: string, name?: string) => Promise<void>;
    removeWallet: (address: string) => void;
    updateWalletName: (address: string, name: string) => void;
    selectWallet: (address: string | null) => void;
    refreshWallet: (address: string) => Promise<void>;
    refreshAllWallets: () => Promise<void>;
    getWalletAnalytics: (address: string) => Promise<WalletData | null>;
    clearAll: () => void;
  };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

// Local storage keys
const WALLETS_STORAGE_KEY = 'moneymappr_wallets';
const WALLET_NAMES_STORAGE_KEY = 'moneymappr_wallet_names';

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Load wallets from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedWallets = localStorage.getItem(WALLETS_STORAGE_KEY);
      const savedNames = localStorage.getItem(WALLET_NAMES_STORAGE_KEY);
      
      if (savedWallets) {
        const walletAddresses = JSON.parse(savedWallets);
        const walletNames = savedNames ? JSON.parse(savedNames) : {};
        
        // Add wallets to state
        walletAddresses.forEach((address: string) => {
          dispatch({ 
            type: 'ADD_WALLET', 
            payload: { address, name: walletNames[address] }
          });
        });
        
        // Load summaries
        if (walletAddresses.length > 0) {
          loadWalletSummaries(walletAddresses);
        }
      }
    } catch (error) {
      console.error('Error loading wallets from localStorage:', error);
    }
  }, []);

  // Save wallets to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const addresses = state.wallets.map(w => w.address);
    const names = state.wallets.reduce((acc, w) => {
      if (w.name) acc[w.address] = w.name;
      return acc;
    }, {} as Record<string, string>);
    
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(addresses));
    localStorage.setItem(WALLET_NAMES_STORAGE_KEY, JSON.stringify(names));
  }, [state.wallets]);

  const loadWalletSummaries = async (addresses: string[]) => {
    if (addresses.length === 0) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const summaries = await batchZerionOperations.getMultipleWalletSummaries(addresses);
      console.log('Wallet summaries loaded:', summaries);
      dispatch({ type: 'SET_SUMMARIES', payload: summaries });
      dispatch({ type: 'SET_LAST_REFRESH', payload: Date.now() });
    } catch (error) {
      console.error('Error loading wallet summaries:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wallet data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addWallet = async (address: string, name?: string) => {
    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      addToast({ title: 'Invalid wallet address format' });
      return;
    }
    
    // Check if wallet already exists
    if (state.wallets.some(w => w.address.toLowerCase() === address.toLowerCase())) {
      addToast({ title: 'Wallet already added' });
      return;
    }
    
    dispatch({ type: 'ADD_WALLET', payload: { address, name } });
    addToast({ title: 'Wallet added successfully' });
    
    // Load wallet data
    try {
      const summary = await zerionUtils.getWalletSummary(address);
      dispatch({ type: 'SET_SUMMARIES', payload: [...state.summaries, summary] });
    } catch (error) {
      console.error('Error loading wallet summary:', error);
      addToast({ title: 'Failed to load wallet data' });
    }
  };

  const removeWallet = (address: string) => {
    dispatch({ type: 'REMOVE_WALLET', payload: address });
    addToast({ title: 'Wallet removed' });
  };

  const updateWalletName = (address: string, name: string) => {
    dispatch({ type: 'UPDATE_WALLET_NAME', payload: { address, name } });
    addToast({ title: 'Wallet name updated' });
  };

  const selectWallet = (address: string | null) => {
    dispatch({ type: 'SELECT_WALLET', payload: address });
  };

  const refreshWallet = async (address: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const summary = await zerionUtils.getWalletSummary(address);
      
      dispatch({ 
        type: 'SET_SUMMARIES', 
        payload: state.summaries.map(s => s.address === address ? summary : s)
      });
      
      addToast({ title: 'Wallet data refreshed' });
    } catch (error) {
      console.error('Error refreshing wallet:', error);
      addToast({ title: 'Failed to refresh wallet data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshAllWallets = async () => {
    const addresses = state.wallets.map(w => w.address);
    await loadWalletSummaries(addresses);
    addToast({ title: 'All wallets refreshed' });
  };

  const getWalletAnalytics = async (address: string): Promise<WalletData | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const analytics = await zerionUtils.getWalletAnalytics(address);
      console.log('Wallet analytics loaded:', analytics);
      dispatch({ type: 'SET_WALLET_DATA', payload: analytics });
  
      return analytics;
    } catch (error) {
      console.error('Error loading wallet analytics:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wallet analytics' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WALLETS_STORAGE_KEY);
      localStorage.removeItem(WALLET_NAMES_STORAGE_KEY);
    }
    addToast({ title: 'All wallets cleared' });
  };

  const contextValue: WalletContextType = {
    state,
    actions: {
      addWallet,
      removeWallet,
      updateWalletName,
      selectWallet,
      refreshWallet,
      refreshAllWallets,
      getWalletAnalytics,
      clearAll
    }
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallets() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallets must be used within a WalletProvider');
  }
  return context;
}