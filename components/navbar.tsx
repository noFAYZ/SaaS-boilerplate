"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Input } from "@heroui/input";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo, LogoMappr } from "@/components/icons";
import { AuthButtons } from "@/components/Auth/AuthButtons";
import { 
  Bell, 
  Menu, 
  ChevronDown, 
  Search, 
  User, 
  MessageSquare, 
  HelpCircle,
  Settings, 
  LogOut, 
  X,
} from "lucide-react";
import { CurrencySelector } from "./UI/CurrencySelector";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { NavigationToggle } from "./UI/NavigationToggle";
import { navigationItems, userMenuItems } from "@/config/navigation";
import { useSidebarVisibility } from "@/hooks/useSidebarVisibility";
import { Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import AdvancedSearch from "./UI/AdvancedSearch";
import { EnhancedSearch } from "./search";
import ThemeSwitcher from "./shared/theme-switch";
import { CuidaNotificationBellOutline } from "./icons/icons";

export const Navbar = () => {
  // State management
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [showFullSearch, setShowFullSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { user, signOut, isLoading } = useAuth();
  const { navigationMode, disabledSidebarPaths } = useNavigation();
  const isSidebarVisible = useSidebarVisibility();
  const pathname = usePathname();
  
  // Check if current path should have sidebar disabled
  const isSidebarDisabled = disabledSidebarPaths.includes(pathname);

  // Handle scroll effect for navbar with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 10);
      }, 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle mobile menu body scroll lock
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
        if (showFullSearch) {
          setShowFullSearch(false);
        }
      }
    };

    if (mobileMenuOpen || showFullSearch) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen, showFullSearch]);

  // Memoized handlers
  const handleFromCurrencyChange = useCallback((currency: any) => {
    setFromCurrency(currency.code);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setShowFullSearch(true);
  }, []);

  const handleSearchBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value.trim()) {
      setShowFullSearch(false);
    }
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Handle click outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen && 
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Loading state
  if (!mounted || isLoading) {
    return (
      <HeroUINavbar 
        maxWidth="full" 
        className="h-16 border-b border-divider bg-background/80 backdrop-blur-md"
      >
        <NavbarContent justify="center">
          <div className="animate-pulse flex items-center gap-2">
            <div className="h-8 w-8 bg-default-200 rounded-full"></div>
            <div className="h-4 w-24 bg-default-200 rounded"></div>
          </div>
        </NavbarContent>
      </HeroUINavbar>
    );
  }
  
  // Get active navigation items based on current category
  const activeNavigationItems = navigationItems.find(
    category => category.title === activeCategory
  )?.items || [];

  // Search components
  const SearchInput = ({ 
    className = "", 
    placeholder = "Search wallets, tokens, transactions...",
    variant = "full" 
  }: {
    className?: string;
    placeholder?: string;
    variant?: "full" | "compact";
  }) => (
    <Input
      ref={variant === "full" ? searchInputRef : undefined}
      aria-label="Search"
      className={clsx("transition-all duration-75", className)}
      classNames={{
        inputWrapper: " backdrop-blur-md border-0",
        input: "text-sm placeholder:text-default-500",
      }}
      placeholder={placeholder}
      size="sm"
      startContent={<SearchIcon className="text-default-400 flex-shrink-0" />}
      endContent={
        variant === "full" && (
          <Kbd className="hidden lg:inline-block bg-default-200/50 text-xs" keys={["command"]}>
            K
          </Kbd>
        )
      }
      type="search"
      variant="flat"
      onFocus={handleSearchFocus}
      onBlur={handleSearchBlur}
    />
  );

  return (
    <>
      <HeroUINavbar 
        maxWidth="full"
        className={clsx(
          " shadow-none transition-all duration-75 ",
          isScrolled && "shadow-sm "
        )}
    
        height="4rem"
      >
        {/* Left Content */}
        <NavbarContent justify="start" className="gap-4 flex-1">
          {/* Navigation Toggle (when sidebar is disabled) */}
          {isSidebarDisabled && (
            <NavbarItem className="hidden sm:flex">
              <NavigationToggle variant="button" />
            </NavbarItem>
          )}

          {/* Logo (show when sidebar is hidden or in navbar mode) */}
          {(!isSidebarVisible || navigationMode === 'navbar') && (
            <NavbarItem className="flex-shrink-0">
              <NextLink href="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <LogoMappr className="h-8 w-8" />
                  <div className="absolute inset-0 bg-primary-500/20 blur-md rounded-full opacity-0 group-hover:opacity-60 transition-opacity"></div>
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
                  MoneyMappr
                </span>
              </NextLink>
            </NavbarItem>
          )}

          {/* Navigation Items (navbar mode only) */}
          {navigationMode === 'navbar' && (
            <div className="hidden lg:flex items-center gap-3 ml-6">
              {navigationItems.map((category) => 
                category.items.map((item) => (
                  <NavbarItem key={item.href}>
                    <NextLink 
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2 text-xs px-2 py-1 rounded-lg  transition-all duration-75",
                        pathname === item.href 
                          ? "font-medium  bg-default  shadow-sm" 
                          : "text-default-600 hover:text-foreground hover:bg-default-100"
                      )}
                    >
                      <span className={pathname === item.href ? "text-primary" : "text-default-500"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <Chip 
                          color="default" 
                          variant="solid" 
                          size="sm"
                          className="ml-1 text-[10px] rounded-xl"
                        >
                          {item.badge.text}
                        </Chip>
                      )}
                    </NextLink>
                  </NavbarItem>
                ))
              )}
            </div>
          )}

          {/* Search Bar (when not in navbar mode) */}
          {navigationMode !== 'navbar' && (
            <NavbarItem className="flex-1 max-w-lg mx-2">
              <EnhancedSearch
            placeholder="Search wallets, tokens, NFTs, DeFi protocols..."
          
            enableFilters={true}
            maxResults={15}
            categories={['tokens', 'wallets', 'nfts', 'defi']}
            className="w-full"
          />
            </NavbarItem>
          )}
        </NavbarContent>

        {/* Right Content */}
        <NavbarContent justify="end" className="gap-2 flex-shrink-0">
          {/* Currency Selector */}
          <NavbarItem className="hidden lg:flex">
            <CurrencySelector 
              value={fromCurrency}
              onChange={handleFromCurrencyChange}
              variant="flat"
              size="sm"
            />
          </NavbarItem>

          {/* Theme Switch */}
          <NavbarItem className="hidden sm:flex">
          <ThemeSwitcher />
           
          </NavbarItem>

          {/* Desktop User Area */}
          <NavbarItem className="flex">
            {user ? (
              <div className="flex items-center gap-1 p-1 border border-divider rounded-full">
                {/* Notifications */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      variant="solid"
                      isIconOnly
                      size="sm"
                      className="h-9 w-9 rounded-full  relative"
                      aria-label="Notifications"
                    >
                      <CuidaNotificationBellOutline  className=" w-4 h-4 "/>
            
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Notifications" className="w-80">
                    <DropdownItem
                      isReadOnly
                      className="py-3"
                      key="notifications-header"
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Notifications</p>
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          className="text-xs h-6"
                        >
                          Mark all read
                        </Button>
                      </div>
                    </DropdownItem>
                    {[1, 2, 3].map((item) => (
                      <DropdownItem
                        key={`notification-${item}`}
                        className="py-3"
                        startContent={
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <MessageSquare size={14} />
                          </div>
                        }
                        description="2 minutes ago"
                      >
                        <p className="text-sm">Wallet sync completed successfully</p>
                      </DropdownItem>
                    ))}
                    <DropdownItem
                      key="view-all"
                      className="py-2 text-center text-primary font-medium"
                    >
                      View all notifications
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>

                <span className="text-xs text-default-600 inline-block max-w-[100px] truncate">
                        {user.user_metadata?.full_name?.split(' ')?.[0] || 'User'}
                      </span>

                {/* User Menu */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      className="h-9 w-9 rounded-full p-0 "
                      isIconOnly
                      size="sm"
                    
                    
                    >
                      <Avatar
                          size="sm"
                          src={user.user_metadata?.avatar_url}
                          className="w-9 h-9"
                          fallback={
                            <div className="bg-primary text-primary-foreground flex items-center justify-center w-full h-full rounded-full text-xs font-medium">
                              {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                          }
                        />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User menu">
                    <DropdownItem
                      isReadOnly
                      className="h-14 gap-2 opacity-100"
                      key="profile-info"
                    >
                      <div className="flex flex-col">
                        <p className="font-semibold text-sm">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-default-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownItem>
                    <DropdownItem
                      key="profile"
                      startContent={<User size={16} />}
                      href="/profile"
                    >
                      Profile
                    </DropdownItem>
                    <DropdownItem
                      key="settings"
                      startContent={<Settings size={16} />}
                      href="/settings"
                    >
                      Settings
                    </DropdownItem>
                    <DropdownItem
                      key="help"
                      startContent={<HelpCircle size={16} />}
                      href="/help"
                    >
                      Help & Support
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      startContent={<LogOut size={16} />}
                      color="danger"
                      onPress={signOut}
                    >
                      Logout
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ) : (
              <AuthButtons />
            )}
          </NavbarItem>

       
        </NavbarContent>
      </HeroUINavbar>

     

 
    </>
  );
};