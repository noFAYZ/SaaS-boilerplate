'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type NavigationMode = 'sidebar' | 'navbar';

interface NavigationContextType {
  navigationMode: NavigationMode;
  setNavigationMode: (mode: NavigationMode) => void;
  disabledSidebarPaths: string[];
  toggleNavigationMode: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Paths where sidebar should be disabled by default
  const disabledSidebarPaths = ['/','/login', '/reset-password', '/update-password', ];
  
  // Initialize navigation mode from localStorage (if available) or default to 'sidebar'
  const [navigationMode, setNavigationModeState] = useState<NavigationMode>('sidebar');
  
  useEffect(() => {
    // Load preference from localStorage on client side
    const savedMode = localStorage.getItem('navigationMode');
    if (savedMode && (savedMode === 'sidebar' || savedMode === 'navbar')) {
      setNavigationModeState(savedMode as NavigationMode);
    }
  }, []);
  
  // Save preference to localStorage when it changes
  const setNavigationMode = (mode: NavigationMode) => {
    setNavigationModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('navigationMode', mode);
    }
  };
  
  // Toggle between sidebar and navbar mode
  const toggleNavigationMode = () => {
    const newMode = navigationMode === 'sidebar' ? 'navbar' : 'sidebar';
    setNavigationMode(newMode);
  };
  
  const value = {
    navigationMode,
    setNavigationMode,
    disabledSidebarPaths,
    toggleNavigationMode,
  };
  
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}