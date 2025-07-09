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
import { cn } from "@heroui/theme";
import { 
  Globe, 
  ChevronDown, 
  Check 
} from "lucide-react";

// Types
interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
  popular?: boolean;
}

interface CurrencyProps {
  value?: string;
  onChange?: (currency: Currency) => void;
  variant?: "flat" | "bordered" | "light" | "solid";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CurrencySelector({
  value = "USD",
  onChange,
  variant = "flat",
  size = "sm",
  className
}: CurrencyProps) {
  // States
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  
  // Currency data - simplified and clean
  const currencies: Currency[] = [
    { code: "USD", name: "US Dollar", symbol: "$", popular: true, flag: "🇺🇸" },
    { code: "EUR", name: "Euro", symbol: "€", popular: true, flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", symbol: "£", popular: true, flag: "🇬🇧" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", popular: true, flag: "🇯🇵" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
    { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" }
  ];
  
  // Initialize selected currency
  useEffect(() => {
    const initialCurrency = currencies.find(c => c.code === value) || currencies[0];
    setSelectedCurrency(initialCurrency);
  }, [value]);

  // Get popular currencies
  const popularCurrencies = useMemo(() => 
    currencies.filter(c => c.popular),
    []
  );

  // Get other currencies
  const otherCurrencies = useMemo(() => 
    currencies.filter(c => !c.popular),
    []
  );
  
  // Handle selection
  const handleSelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    if (onChange) {
      onChange(currency);
    }
  };
  
  return (
    <div className={cn("relative", className)}>
      <Dropdown 
        placement="bottom-end"
        classNames={{
          content: "min-w-[200px] p-0"
        }}
      >
        <DropdownTrigger>
          <Button
            variant={variant}
            size={size}
            className={cn(
              "justify-between min-w-[80px]  rounded-2xl",
              size === "sm" && "h-8 px-2 text-xs",
              size === "md" && "h-10 px-3 text-sm",
              size === "lg" && "h-12 px-4 text-base"
            )}
            startContent={
              selectedCurrency ? (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-default-200/50 text-xs">
                  {selectedCurrency.flag}
                </div>
              ) : (
                <Globe size={16} className="text-default-500" />
              )
            }
            endContent={<ChevronDown size={14} className="text-default-400" />}
          >
            <span className="font-medium text-xs">
              {selectedCurrency?.code || "USD"}
            </span>
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu 
          aria-label="Currency selection"
          className="p-1"
          itemClasses={{
            base: "rounded-lg"
          }}
        >
          {/* Popular currencies */}
          <DropdownSection 
            title="Popular" 
            classNames={{
              heading: "text-xs font-medium text-default-500 px-2 pb-1"
            }}
          >
            {popularCurrencies.map((currency) => (
              <DropdownItem
                key={`popular-${currency.code}`}
                className="py-2"
                startContent={
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-default-100 text-xs">
                    {currency.flag}
                  </div>
                }
                endContent={
                  selectedCurrency?.code === currency.code && (
                    <Check size={14} className="text-primary" />
                  )
                }
                onPress={() => handleSelect(currency)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{currency.code}</span>
                  <span className="text-xs text-default-500">{currency.symbol}</span>
                </div>
              </DropdownItem>
            ))}
          </DropdownSection>
          
          {/* Other currencies */}
          <DropdownSection 
            title="Others" 
            classNames={{
              heading: "text-xs font-medium text-default-500 px-2 pb-1"
            }}
          >
            {otherCurrencies.map((currency) => (
              <DropdownItem
                key={`other-${currency.code}`}
                className="py-2"
                startContent={
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-default-100 text-xs">
                    {currency.flag}
                  </div>
                }
                endContent={
                  selectedCurrency?.code === currency.code && (
                    <Check size={14} className="text-primary" />
                  )
                }
                onPress={() => handleSelect(currency)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{currency.code}</span>
                  <span className="text-xs text-default-500">{currency.symbol}</span>
                </div>
              </DropdownItem>
            ))}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}