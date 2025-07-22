"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import clsx from "clsx";
import { 
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Zap,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  Palette,
} from "lucide-react";

import { LogoMappr } from "@/components/icons";
import { 
  CuidaLogoutOutline, 
  HugeiconsSettings05, 
  HugeiconsSidebarLeft01,
  TablerHelpSquareRounded, 
  RadixIconsDashboard,
  SolarPieChartBold,
  SolarWalletOutline,
  HugeiconsAnalyticsUp,
  BasilWalletOutline,
  HugeiconsSidebarRight01
} from "./icons/icons";
import { useNavigation } from "@/contexts/NavigationContext";

interface SubMenuItem {
  label: string;
  href: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  submenu?: SubMenuItem[];
  accent?: string;
}

interface SidebarProps {
  className?: string;
}

// Enhanced navigation with modern design
const navigationItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <RadixIconsDashboard className="w-5 h-5" />,
    accent: "from-blue-500 to-cyan-500",
  },
  {
    label: "Wallets",
    href: "/wallets",
    icon: <BasilWalletOutline className="w-5 h-5" />,
    badge: "3",
    accent: "from-emerald-500 to-teal-500",
    submenu: [
      { label: "All Wallets", href: "/wallets", icon: <SolarWalletOutline className="w-4 h-4" /> },
      { label: "Add Wallet", href: "/wallets/add", icon: <Zap className="w-4 h-4" /> },
      { label: "Import Wallet", href: "/wallets/import", icon: <Sparkles className="w-4 h-4" /> },
      { label: "Hardware", href: "/wallets/hardware", icon: <Settings className="w-4 h-4" /> },
    ]
  },
  {
    label: "Portfolios",
    href: "/portfolios",
    icon: <SolarPieChartBold className="w-5 h-5" />,
    accent: "from-purple-500 to-pink-500",
    submenu: [
      { label: "Overview", href: "/portfolios", icon: <RadixIconsDashboard className="w-4 h-4" /> },
      { label: "Performance", href: "/portfolios/performance", icon: <HugeiconsAnalyticsUp className="w-4 h-4" /> },
      { label: "Allocation", href: "/portfolios/allocation", icon: <SolarPieChartBold className="w-4 h-4" /> },
      { label: "Rebalance", href: "/portfolios/rebalance", icon: <Palette className="w-4 h-4" /> },
    ]
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: <SolarWalletOutline className="w-5 h-5" />,
    accent: "from-orange-500 to-red-500",
    submenu: [
      { label: "All Accounts", href: "/accounts", icon: <SolarWalletOutline className="w-4 h-4" /> },
      { label: "Exchanges", href: "/accounts/exchanges", icon: <Zap className="w-4 h-4" /> },
      { label: "Banks", href: "/accounts/banks", icon: <Settings className="w-4 h-4" /> },
      { label: "DeFi", href: "/accounts/defi", icon: <Sparkles className="w-4 h-4" /> },
    ]
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <HugeiconsAnalyticsUp className="w-5 h-5" />,
    badge: "New",
    accent: "from-indigo-500 to-purple-500",
    submenu: [
      { label: "Overview", href: "/analytics", icon: <RadixIconsDashboard className="w-4 h-4" /> },
      { label: "P&L Reports", href: "/analytics/pnl", icon: <HugeiconsAnalyticsUp className="w-4 h-4" /> },
      { label: "Tax Reports", href: "/analytics/tax", icon: <Settings className="w-4 h-4" /> },
      { label: "Custom", href: "/analytics/custom", icon: <Palette className="w-4 h-4" /> },
    ]
  },
];

const userMenuItems = [
  { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
  { label: "Help", href: "/help", icon: <HelpCircle className="w-4 h-4" /> },
  { label: "Logout", href: "/logout", icon: <LogOut className="w-4 h-4" /> },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const sidebarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { navigationMode, disabledSidebarPaths } = useNavigation();
  
  const shouldHideSidebar = disabledSidebarPaths.includes(pathname) || navigationMode === 'navbar';

  // Handle resize with debouncing
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile && mobileOpen) setMobileOpen(false);
  }, [mobileOpen]);

  useEffect(() => {
    setMounted(true);
    handleResize();
    
    const debouncedResize = () => {
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(window.resizeTimeout);
    };
  }, [handleResize]);

  // Handle mobile overlay and keyboard
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
      if (!collapsed) setExpandedMenus(new Set());
    }
  };

  const handleNavClick = () => {
    if (isMobile) setMobileOpen(false);
    setHoveredItem(null);
  };

  const toggleSubmenu = (itemLabel: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(itemLabel)) {
      newExpanded.delete(itemLabel);
    } else {
      newExpanded.add(itemLabel);
    }
    setExpandedMenus(newExpanded);
  };

  const isSubmenuActive = (submenu: SubMenuItem[]) => {
    return submenu.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));
  };

  const isItemActive = (item: MenuItem) => {
    if (pathname === item.href) return true;
    if (item.submenu) return isSubmenuActive(item.submenu);
    return false;
  };

  if (!mounted || shouldHideSidebar) return null;

  const isExpanded = (!collapsed && !isMobile) || (isMobile && mobileOpen);

  return (
    <>
      {/* Glass morphism overlay for mobile */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 md:hidden" />
      )}

      {/* Floating mobile toggle with micro-animation */}
      {isMobile && (
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          className="fixed top-4 left-4 z-50 shadow-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 dark:border-black/20 md:hidden hover:scale-105 transition-all duration-200"
          onPress={toggleSidebar}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      )}

      {/* Premium Sidebar with glass morphism */}
      <aside
        ref={sidebarRef}
        className={clsx(
          "fixed md:sticky top-0 h-screen bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-r border-divider dark:border-gray-800/50 z-50 transition-all duration-100 ease-out flex flex-col shadow-2xl md:shadow-none",
          collapsed && !isMobile ? "w-16" : "w-56",
          {
            "-translate-x-full md:translate-x-0": isMobile && !mobileOpen,
            "translate-x-0": !isMobile || mobileOpen,
          },
          className
        )}
      >
        {/* Premium header with gradient accent */}
        <header className={clsx(
          "relative flex items-center h-16 transition-all duration-100 gap-4",
          collapsed && !isMobile ? "px-3 justify-center" : "px-6 justify-between"
        )}>
          {/* Gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10" />
          
          {isExpanded && (
            <NextLink href="/" className="flex items-center gap-3 group relative z-10" onClick={handleNavClick}>
              <div className="relative">
              
                <LogoMappr className="h-8 w-8 text-white relative z-10" />
              </div>
              <span className="font-bold text-md bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                MoneyMappr
              </span>
            </NextLink>
          )}
          
          {collapsed && !isMobile && (
            <NextLink href="/" className="relative z-10 group" onClick={handleNavClick}>
              <div className="relative">
              
                <LogoMappr className="h-9 w-9 text-white relative z-10" />
              </div>
            </NextLink>
          )}
          
          {!isMobile && !collapsed && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-200 relative z-10"
              onPress={toggleSidebar}
            >
              <HugeiconsSidebarLeft01 className="w-5 h-5" />
            </Button>
          )}
        </header>

        {/* Elegant collapse button for collapsed state */}
        {!isMobile && collapsed && (
          <div className="flex justify-center my-4">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-200 hover:scale-105"
              onPress={toggleSidebar}
            >
              <HugeiconsSidebarRight01 className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Premium Navigation */}
        <div className="flex-1  px-2 py-6 space-y-2 scrollbar-none">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = isItemActive(item);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus.has(item.label);
              
              return (
                <div key={item.label} className="group">
                  {/* Tooltip for collapsed mode */}
                  <div
                    className="relative"
                    onMouseEnter={() => collapsed && !isMobile && setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {collapsed && !isMobile && hoveredItem === item.label && (
                      <div className="absolute left-full top-0 ml-3 z-50 px-4 py-3 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl rounded-xl text-sm font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.submenu && (
                          <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
                            {item.submenu.map((subItem) => (
                              <div key={subItem.href} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                {subItem.icon}
                                {subItem.label}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="absolute right-full top-4 border-8 border-transparent border-r-white/95 dark:border-r-black/95" />
                      </div>
                    )}
                    
                    <Button
                      href={!hasSubmenu ? item.href : undefined}
                      as={!hasSubmenu ? NextLink : "button"}
                      variant="light"
                      size="sm"
                      className={clsx(
                        "w-full h-10 text-sm font-medium transition-all duration-100 ",
                        collapsed && !isMobile ? "px-0 justify-center min-w-12" : "px-4 justify-start",
                        isActive 
                          ? ` bg-default-100 text-gray-800 dark:text-gray-400` 
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10"
                      )}
                      onPress={() => {
                        if (hasSubmenu && !collapsed) {
                          toggleSubmenu(item.label);
                        } else if (!hasSubmenu) {
                          handleNavClick();
                        }
                      }}
                      startContent={
                        <div className={clsx(
                          "flex items-center justify-center shrink-0 transition-all duration-100",
                          isActive ? " " : "text-gray-500 dark:text-gray-400"
                        )}>
                          {item.icon}
                        </div>
                      }
                      endContent={
                        !collapsed && (
                          <div className="flex items-center gap-2 ml-auto">
                            {item.badge && (
                              <span className="px-2 h-5  rounded-md text-[10px] text-center items-center bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                                {item.badge}
                              </span>
                            )}
                            {hasSubmenu && (
                              <ChevronDown 
                                size={16} 
                                className={clsx(
                                  "transition-transform duration-100",
                                  isExpanded ? "rotate-180" : "",
                                  isActive ? "" : "text-gray-400"
                                )} 
                              />
                            )}
                          </div>
                        )
                      }
                    >
                      {!collapsed && (
                        <span className="truncate text-left text-sm flex-1 font-medium">
                          {item.label}
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Premium Submenu */}
                  {hasSubmenu && !collapsed && isExpanded && (
                    <div className="ml-8 mt-2 space-y-1 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600" />
                      {item.submenu!.map((subItem) => (
                        <Button
                          key={subItem.href}
                          href={subItem.href}
                          as={NextLink}
                          variant="light"
                          size="sm"
                          className={clsx(
                            "w-full h-8 justify-start text-xs font-medium transition-all duration-100 hover:scale-[1.02] pl-4",
                            pathname === subItem.href
                              ? " text-orange-700 dark:text-orange-500"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5"
                          )}
                          onPress={handleNavClick}
                          startContent={
                            <div className="flex items-center justify-center shrink-0">
                              {subItem.icon}
                            </div>
                          }
                          endContent={
                            subItem.badge && (
                              <span className="px-2 py-0.5 text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                {subItem.badge}
                              </span>
                            )
                          }
                        >
                          <span className="truncate text-xs">{subItem.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Premium User Section */}
        <footer className="border-t border-white/20 dark:border-gray-800/50 p-3">
          <nav className="space-y-1">
            {userMenuItems.map((item) => (
              <div 
                key={item.href}
                className="relative"
                onMouseEnter={() => collapsed && !isMobile && setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {collapsed && !isMobile && hoveredItem === item.href && (
                  <div className="absolute left-full bottom-0 ml-3 z-50 px-4 py-3 bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 shadow-2xl rounded-xl text-sm font-medium whitespace-nowrap">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-white/95 dark:border-r-black/95" />
                  </div>
                )}
                
                <Button
                  href={item.href}
                  as={NextLink}
                  variant="light"
                  size="sm"
                  className={clsx(
                    "w-full h-10 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/5 transition-all duration-200 hover:scale-[1.02]",
                    collapsed && !isMobile ? "px-0 justify-center min-w-10" : "px-3 justify-start"
                  )}
                  onPress={handleNavClick}
                  startContent={
                    <div className="flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                  }
                >
                  {!collapsed && (
                    <span className="truncate text-left flex-1 text-sm">
                      {item.label}
                    </span>
                  )}
                </Button>
              </div>
            ))}
          </nav>
        </footer>
      </aside>
    </>
  );
};