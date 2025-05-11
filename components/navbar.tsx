"use client"
import React, { useState, useEffect } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarItem,

} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { link as linkStyles } from "@heroui/theme";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import {
  SearchIcon,
  Logo,
} from "@/components/icons";
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
import { navigationItems, userMenuItems, NavigationItem } from "@/config/navigation";
import { useSidebarVisibility } from "@/hooks/useSidebarVisibility";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";

export const Navbar = () => {
  // State
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [showFullSearch, setShowFullSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { user, signOut, isLoading } = useAuth();
  const { navigationMode, toggleNavigationMode, disabledSidebarPaths } = useNavigation();
  const isSidebarVisible = useSidebarVisibility();
  const pathname = usePathname();
  
  // Check if current path should have sidebar disabled
  const isSidebarDisabled = disabledSidebarPaths.includes(pathname);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Handle currency change
  const handleFromCurrencyChange = (currency: any) => {
    setFromCurrency(currency.code);
  };

  // Expand search on focus
  const handleSearchFocus = () => {
    setShowFullSearch(true);
  };

  // Collapse search on blur if empty
  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setShowFullSearch(false);
    }
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle category change in navbar dropdown
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  if (isLoading) {
    return null;
  }
  
  // Get active navigation items based on current category
  const activeNavigationItems = navigationItems.find(
    category => category.title === activeCategory
  )?.items || [];

  // Compact search input (collapsed state)
  const compactSearchInput = (
    <div className={`relative transition-all duration-75 ${showFullSearch ? 'w-full max-w-[400px]' : 'w-10'}`}>
      <Input
        aria-label="Search"
        className={`rounded-full transition-all duration-75 bg-default-100/70 hover:bg-default-100 ${
          showFullSearch ? 'pl-10' : 'w-10 p-0'
        }`}
        classNames={{
          inputWrapper: "bg-transparent",
          input: showFullSearch ? "text-sm pl-8" : "opacity-0 w-0",
        }}
        labelPlacement="outside"
        placeholder="Search..."
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        endContent={
          showFullSearch && (
            <Kbd className="hidden lg:inline-block" keys={["command"]}>
              K
            </Kbd>
          )
        }
        startContent={
          <SearchIcon className={`text-base text-default-400 pointer-events-none flex-shrink-0 absolute ${
            showFullSearch ? 'left-3' : 'left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'
          }`} />
        }
        type="search"
      />
    </div>
  );

  // Full-featured search input for larger screens
  const fullSearchInput = (
    <Input
      aria-label="Search"
      className="hidden lg:inline-flex w-full max-w-[400px] rounded-full"
      classNames={{
        inputWrapper: "bg-default-100/70 hover:bg-default-100 backdrop-blur-md",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <>
      <HeroUINavbar 
        maxWidth="xl" 
        position="sticky"
        className={clsx(
          "bg-background/70 backdrop-blur-md transition-shadow duration-0 z-40",
          isScrolled && "shadow-sm border-b border-default-200/50",
        )}
      >
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          {/* Logo and toggle - adjust based on sidebar visibility */}
          <div className="flex items-center gap-2">
            {/* Toggle sidebar/navbar button */}
            {!isSidebarDisabled && (
              <NavigationToggle variant="button" className="hidden sm:flex" />
            )}

            {/* Logo (show when sidebar is hidden or in navbar mode) */}
            {(!isSidebarVisible || navigationMode === 'navbar') && (
              <NavbarItem className="flex">
                <NextLink href="/" className="flex items-center gap-2">
                  <div className="relative glow-primary">
                    <Logo size={30} className="text-primary-500" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">ACME</span>
                </NextLink>
              </NavbarItem>
            )}
          </div>

          {/* Navigation Items - show in navbar mode */}
          {navigationMode === 'navbar' && (
            <div className="hidden lg:flex items-center gap-4 ml-6">
              {navigationItems.map((category) => 
                category.items.map((item) => (
                  <NavbarItem key={item.href}>
                    <NextLink 
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2 text-sm px-2 py-1 rounded-lg transition-colors duration-0",
                        pathname === item.href 
                          ? "font-medium text-primary bg-primary-500/10" 
                          : "text-default-600 hover:bg-default-100"
                      )}
                    >
                      <span className={pathname === item.href ? "text-primary" : "text-default-500"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge 
                          color="default" 
                          variant="shadow" 
                          size="sm"
                          className="ml-1 border-0"
                          content={item.badge.text}
                        >
                          
                        </Badge>
                      )}
                    </NextLink>
                  </NavbarItem>
                ))
              )}
            </div>
          )}

          {/* Center search when not in navbar mode */}
          {navigationMode !== 'navbar' && (
            <div className="flex-1 flex justify-center max-w-md mx-auto">
              {fullSearchInput}
            </div>
          )}

          {/* Adaptive Search Input for navbar mode */}
          {navigationMode === 'navbar' && (
            <NavbarItem className="ml-auto flex lg:hidden">
              {compactSearchInput}
            </NavbarItem>
          )}
        </NavbarContent>

        {/* Right Side Content */}
        <NavbarContent
          className="hidden sm:flex basis-1/5 sm:basis-auto"
          justify="end"
        >
          <div className="flex items-center gap-2">
            {/* Currency Selector - optional component */}
            <NavbarItem className="hidden lg:flex">
              <CurrencySelector 
                value={fromCurrency}
                onChange={handleFromCurrencyChange}
                variant="flat"
                size="sm"
                className="max-w-xs"
              />
            </NavbarItem>

            {/* Theme Switch */}
            <NavbarItem className="hidden sm:flex">
              <ThemeSwitch />
            </NavbarItem>

            {/* User Area */}
            <NavbarItem className="hidden md:flex">
              {user ? (
                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        radius="full"
                        variant="light"
                        size="sm"
                        className="relative"
                      >
                        <Bell size={18} className="text-default-500" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Notifications" className="w-80">
                      <DropdownItem
                        isReadOnly
                        className="py-2 gap-0"
                        key="notifications-header"
                      >
                        <div className="flex justify-between items-center w-full">
                          <p className="font-bold">Notifications</p>
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            radius="full"
                            className="text-xs"
                          >
                            Mark all as read
                          </Button>
                        </div>
                      </DropdownItem>
                      {[1, 2, 3].map((item) => (
                        <DropdownItem
                          key={`notification-${item}`}
                          showDivider={item !== 3}
                          className="py-2"
                          startContent={
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                              <MessageSquare size={14} />
                            </div>
                          }
                          description={
                            <span className="text-xs text-default-400">2 minutes ago</span>
                          }
                        >
                          <p className="text-sm">New comment on your post</p>
                        </DropdownItem>
                      ))}
                      <DropdownItem
                        key="view-all"
                        className="py-2 text-center text-primary"
                      >
                        View all notifications
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  {/* User Menu */}
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button
                        className="px-2 rounded-full h-8 min-w-0 transition-transform"
                        variant="light"
                        disableRipple
                        startContent={
                          <Avatar
                            size="sm"
                            src={user.user_metadata?.avatar_url}
                            fallback={
                              <div className="bg-primary-500 text-white flex items-center justify-center w-full h-full rounded-full">
                                {user.email?.[0]?.toUpperCase() || 'U'}
                              </div>
                            }
                          />
                        }
                        endContent={<ChevronDown size={14} className="text-default-500" />}
                      >
                        <span className="text-sm font-normal text-default-600 ml-2 hidden lg:inline">
                          {user.user_metadata?.full_name?.split(' ')?.[0] || 'User'}
                        </span>
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="User menu">
                      <DropdownItem
                        isReadOnly
                        className="h-14 gap-2 opacity-100"
                      >
                        <p className="font-bold">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs text-default-500">{user.email}</p>
                      </DropdownItem>
                      <DropdownItem
                        key="profile"
                        startContent={<User size={16} />}
                      >
                        Profile
                      </DropdownItem>
                      <DropdownItem
                        key="settings"
                        startContent={<Settings size={16} />}
                        onPress={() => window.location.href = '/settings'}
                      >
                        Settings
                      </DropdownItem>
                      <DropdownItem
                        key="help"
                        startContent={<HelpCircle size={16} />}
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
          </div>
        </NavbarContent>
 
        {/* Mobile Actions */}
        <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={handleSearchFocus}
              className="text-default-500"
            >
              <Search size={18} />
            </Button>
            <ThemeSwitch />
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-default-500"
            >
              <Menu size={18} />
            </Button>
          </div>
        </NavbarContent>
      </HeroUINavbar>

      {/* Mobile Menu (outside navbar) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md overflow-hidden transition-all duration-75">
          <div className="flex items-center justify-between p-4 border-b border-default-200">
            <div className="flex items-center gap-2">
              <Logo size={32} className="text-primary-500" />
              <span className="font-bold text-xl">ACME</span>
            </div>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <X size={20} />
            </Button>
          </div>
          <div className="p-4">
            <Input
              aria-label="Search"
              className="rounded-full mb-4"
              classNames={{
                inputWrapper: "bg-default-100/70",
              }}
              placeholder="Search..."
              startContent={<SearchIcon className="text-default-400" />}
              type="search"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Categories Tab */}
            <div className="flex border-b border-default-200 overflow-x-auto p-1">
              {navigationItems.map((category) => (
                <Button
                  key={category.title}
                  variant={activeCategory === category.title ? "solid" : "light"}
                  color={activeCategory === category.title ? "primary" : "default"}
                  size="sm"
                  radius="full"
                  className="mx-1 whitespace-nowrap"
                  onClick={() => handleCategoryChange(category.title)}
                >
                  {category.title}
                </Button>
              ))}
            </div>
            
            {/* Menu Items */}
            <div className="p-4 space-y-1">
              {activeNavigationItems.map((item) => (
                <NextLink 
                  key={item.href} 
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-default-100 transition-colors",
                    pathname === item.href ? "bg-primary-50 text-primary dark:bg-primary-900/20" : ""
                  )}
                >
                  <div className={clsx(
                    pathname === item.href ? "text-primary" : "text-default-500"
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge color="primary" size="sm" className="ml-auto">
                      {item.badge.text}
                    </Badge>
                  )}
                </NextLink>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-default-200">
            <div className="flex items-center gap-4 mb-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.user_metadata?.avatar_url}
                    fallback={
                      <div className="bg-primary-500 text-white flex items-center justify-center w-full h-full rounded-full">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    }
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-default-500">{user.email}</p>
                  </div>
                </div>
              ) : (
                <AuthButtons isMobile />
              )}
            </div>
            {user && (
              <div className="space-y-1">
                {userMenuItems.map((item) => (
                  <NextLink 
                    key={item.href} 
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-default-100 transition-colors"
                  >
                    <div className="text-default-500">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </NextLink>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {showFullSearch && (
        <div className="fixed inset-0 z-50 bg-background/95 p-4 sm:hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Search</h3>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={() => setShowFullSearch(false)}
            >
              <X size={18} />
            </Button>
          </div>
          <Input
            autoFocus
            aria-label="Search"
            className="w-full rounded-full"
            classNames={{
              inputWrapper: "bg-default-100",
            }}
            placeholder="Search..."
            startContent={<SearchIcon className="text-default-400" />}
            type="search"
          />
          <div className="mt-4">
            <p className="text-xs text-default-500 mb-2">Recent Searches</p>
            <div className="space-y-2">
              {['Dashboard analytics', 'Stock portfolio', 'Account settings'].map((item) => (
                <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-default-100">
                  <Search size={14} className="text-default-400" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};