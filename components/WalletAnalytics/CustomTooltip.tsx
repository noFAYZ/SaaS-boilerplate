// components/WalletAnalytics/CustomTooltip.tsx
'use client';

import React from 'react';
import { formatCurrency } from '@/lib/wallet-analytics/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: number;
  showBalance: boolean;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  showBalance 
}) => {
  if (active && payload && payload.length && label) {
    const value = payload[0].value;
    return (
      <div className="bg-background/95 border border-default-200 rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-semibold">
          {formatCurrency(value, showBalance)}
        </p>
        <p className="text-xs text-default-500">
          {new Date(label).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </div>
    );
  }
  return null;
};