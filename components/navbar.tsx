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
        inputWrapper: "bg-default-200/70 hover:bg-default-100 backdrop-blur-md border-0",
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
          " backdrop-blur-md transition-all duration-75 border-b border-divider",
          isScrolled && "shadow-sm "
        )}
        classNames={{
          wrapper: "max-w-7xl",
        }}
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
            <NavbarItem className="flex-1 max-w-md mx-4">
              <SearchInput className="w-full" />
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
            <ThemeSwitch />
          </NavbarItem>

          {/* Desktop User Area */}
          <NavbarItem className="hidden md:flex">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className="relative text-default-500 hover:text-foreground transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell size={18} />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></span>
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

                {/* User Menu */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      className="h-8 px-2 gap-2 transition-all hover:scale-105"
                      startContent={
                        <Avatar
                          size="sm"
                          src={user.user_metadata?.avatar_url}
                          className="w-6 h-6"
                          fallback={
                            <div className="bg-primary text-primary-foreground flex items-center justify-center w-full h-full rounded-full text-xs font-medium">
                              {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                          }
                        />
                      }
                      endContent={<ChevronDown size={14} className="text-default-500" />}
                    >
                      <span className="text-sm text-default-600 hidden lg:inline-block max-w-[100px] truncate">
                        {user.user_metadata?.full_name?.split(' ')?.[0] || 'User'}
                      </span>
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

          {/* Mobile Actions */}
          <NavbarItem className="md:hidden flex">
            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleSearchFocus}
                className="text-default-500 hover:text-foreground"
                aria-label="Search"
              >
                <Search size={18} />
              </Button>
              <ThemeSwitch />
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={toggleMobileMenu}
                className="text-default-500 hover:text-foreground"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <Menu size={18} />
              </Button>
            </div>
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-divider">
            <NextLink href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
              <Logo size={32} className="text-primary" />
              <span className="font-bold text-xl">MoneyMappr</span>
            </NextLink>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={closeMobileMenu}
              className="text-default-500"
              aria-label="Close menu"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-divider">
            <SearchInput 
              className="w-full" 
              placeholder="Search..."
              variant="compact"
            />
          </div>

          {/* Mobile Navigation Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Categories Tabs */}
            <div className="flex border-b border-divider overflow-x-auto p-2 gap-1">
              {navigationItems.map((category) => (
                <Button
                  key={category.title}
                  variant={activeCategory === category.title ? "solid" : "light"}
                  color={activeCategory === category.title ? "primary" : "default"}
                  size="sm"
                  radius="full"
                  className="whitespace-nowrap flex-shrink-0"
                  onPress={() => handleCategoryChange(category.title)}
                >
                  {category.title}
                </Button>
              ))}
            </div>
            
            {/* Navigation Items */}
            <div className="p-4 space-y-1">
              {activeNavigationItems.map((item) => (
                <NextLink 
                  key={item.href} 
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    pathname === item.href 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-default-100"
                  )}
                >
                  <div className={clsx(
                    "flex-shrink-0",
                    pathname === item.href ? "text-primary" : "text-default-500"
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge color="primary" size="sm" variant="flat">
                      {item.badge.text}
                    </Badge>
                  )}
                </NextLink>
              ))}
            </div>
          </div>

          {/* Mobile User Section */}
          <div className="p-4 border-t border-divider">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={user.user_metadata?.avatar_url}
                    size="sm"
                    fallback={
                      <div className="bg-primary text-primary-foreground flex items-center justify-center w-full h-full rounded-full text-sm font-medium">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-default-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {userMenuItems.map((item) => (
                    <NextLink 
                      key={item.href} 
                      href={item.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-default-100 transition-colors"
                    >
                      <div className="text-default-500 flex-shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </NextLink>
                  ))}
                </div>
              </>
            ) : (
              <AuthButtons isMobile />
            )}
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {showFullSearch && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-4 md:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Search</h3>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => setShowFullSearch(false)}
              aria-label="Close search"
            >
              <X size={18} />
            </Button>
          </div>
          <SearchInput className="w-full mb-6" />
          <div>
            <p className="text-xs text-default-500 mb-3 font-medium">Recent Searches</p>
            <div className="space-y-2">
              {[
                'Portfolio analytics', 
                'Ethereum wallet', 
                'DeFi positions'
              ].map((item) => (
                <button
                  key={item}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-default-100 transition-colors w-full text-left"
                  onClick={() => setShowFullSearch(false)}
                >
                  <Search size={14} className="text-default-400 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};