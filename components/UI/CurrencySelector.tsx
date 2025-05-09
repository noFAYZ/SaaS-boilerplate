"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  DropdownSection 
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { cn } from "@heroui/theme";
import { 
  Search, 
  Globe, 
  ChevronDown, 
  Check, 
  Star 
} from "lucide-react";

// Types
interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
  popular?: boolean;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface CurrencyProps {
  value?: string;
  onChange?: (currency: Currency) => void;
  variant?: "flat" | "bordered" | "light" | "solid";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function CurrencySelector({
  value = "USD",
  onChange,
  variant = "flat",
  size = "md",
  label,
  className
}: CurrencyProps) {
  // States
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  
  // Currency data
  const currencies: Currency[] = [
    { code: "USD", name: "US Dollar", symbol: "$", popular: true, flag: "🇺🇸", trend: "neutral", trendValue: "0.0%" },
    { code: "EUR", name: "Euro", symbol: "€", popular: true, flag: "🇪🇺", trend: "up", trendValue: "+0.3%" },
    { code: "GBP", name: "British Pound", symbol: "£", popular: true, flag: "🇬🇧", trend: "down", trendValue: "-0.2%" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", popular: true, flag: "🇯🇵", trend: "up", trendValue: "+0.5%" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", trend: "neutral", trendValue: "+0.1%" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", trend: "down", trendValue: "-0.4%" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭", trend: "up", trendValue: "+0.2%" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", trend: "neutral", trendValue: "0.0%" }
  ];
  
  // Get popular currencies
  const popularCurrencies = useMemo(() => 
    currencies.filter(c => c.popular),
    [currencies]
  );
  

  
  // Handle selection
  const handleSelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    if (onChange) {
      onChange(currency);
    }
  };
  
  // Helper to get trend color
  const getTrendColor = (trend?: "up" | "down" | "neutral") => {
    if (trend === "up") return "success";
    if (trend === "down") return "danger";
    return "default";
  };
  
  // Button sizing based on prop
  const buttonSizeClass = {
    sm: "h-8 text-xs",
    md: "h-10 text-sm", 
    lg: "h-12 text-base"
  }[size];
  
  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-default-700 mb-1.5">
          {label}
        </label>
      )}
      
      <Dropdown>
        <DropdownTrigger>
          <Button
            variant={variant}
            radius="full"
            startContent={    selectedCurrency ? (
              <div className="flex items-center h-7 w-7 bg-default-100 rounded-full text-center gap-2">
                <span className="text-lg">{selectedCurrency.flag}</span>
                
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Globe size={18} />
                <span>Select</span>
              </div>
            )   }
            endContent={<ChevronDown size={16} />}
            className={cn(buttonSizeClass, " justify-between px-1")}
          >
            {selectedCurrency && (<span className="font-semibold">{selectedCurrency.code}</span>) }
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu aria-label="Currency selection">
          {/* Popular currencies section */}
          <DropdownSection title="Popular Currencies">
            {popularCurrencies.map((currency) => (
              <DropdownItem
                key={`popular-${currency.code}`}
                startContent={
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-default-100 text-sm">
                    {currency.flag}
                  </div>
                }
                endContent={
                  <div className="flex items-center gap-2">
                
                    {selectedCurrency?.code === currency.code && (
                      <Check size={16} className="text-primary" />
                    )}
                  </div>
                }
                className="w-full rounded-2xl"
                onPress={() => handleSelect(currency)}
                description={`${currency.symbol} · ${currency.name}`}
              >
                <span className="font-medium text-xs">{currency.code}</span>
              </DropdownItem>
            ))}
          </DropdownSection>
          
          {/* All currencies section */}
          <DropdownSection title="All Currencies">
            {currencies.filter(c => !c.popular).map((currency) => (
              <DropdownItem
              className="w-full rounded-2xl"
                key={`currency-${currency.code}`}
                startContent={
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-default-100 text-lg">
                    {currency.flag}
                  </div>
                }
                endContent={
                  <div className="flex items-center gap-2">
               
                    {selectedCurrency?.code === currency.code && (
                      <Check size={16} className="text-primary" />
                    )}
                  </div>
                }
                onPress={() => handleSelect(currency)}
                description={`${currency.symbol} · ${currency.name}`}
              >
                <span className="font-medium">{currency.code} </span>
              </DropdownItem>
            ))}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}