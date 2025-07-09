"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import NextLink from "next/link";
import clsx from "clsx";
import { 
  ChevronRightIcon,
} from "lucide-react";

import { Logo, LogoMappr } from "@/components/icons";
import { 
  CuidaLogoutOutline, 
  HugeiconsSettings05, 
  HugeiconsSidebarLeft01, 
  HugeiconsSidebarRight01, 
  TablerHelpSquareRounded, 
} from "./icons/icons";
import { useNavigation } from "@/contexts/NavigationContext";
import { navigationItems } from "@/config/navigation";

interface SidebarProps {
  className?: string;
}

// Breakpoint constants
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Get navigation context
  const { navigationMode, disabledSidebarPaths } = useNavigation();
  
  // Check if sidebar should be hidden on current path
  const shouldHideSidebar = disabledSidebarPaths.includes(pathname) || navigationMode === 'navbar';

  // User menu items
  const userMenuItems = [
    {
      label: "Settings",
      href: "/settings",
      icon: <HugeiconsSettings05 className="w-5 h-5" />,
    },
    {
      label: "Help & Support",
      href: "/help",
      icon: <TablerHelpSquareRounded className="w-5 h-5" />,
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <CuidaLogoutOutline className="w-5 h-5 text-destructive" />,
    },
  ];

  // Memoized resize handler
  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    const mobile = width < MOBILE_BREAKPOINT;
    const tablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
    
    setIsMobile(mobile);
    
    // Auto-collapse on tablet
    if (tablet && !collapsed) {
      setCollapsed(true);
    }
    
    // Close mobile menu when resizing to desktop
    if (!mobile && open) {
      setOpen(false);
    }
  }, [collapsed, open]);

  // Handle screen resize and mobile detection
  useEffect(() => {
    setMounted(true);
    handleResize();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  // Handle click outside for mobile with proper event handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile || !open) return;
      
      const target = event.target as Node;
      const sidebar = sidebarRef.current;
      const overlay = overlayRef.current;
      
      if (sidebar && !sidebar.contains(target) && overlay && overlay.contains(target)) {
        setOpen(false);
      }
    };

    if (isMobile && open) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
      // Add padding to prevent layout shift
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMobile, open]);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && open) {
        setOpen(false);
      }
    };

    if (isMobile && open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobile, open]);

  // Toggle sidebar with proper state management
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  }, [isMobile]);

  // Handle navigation item click
  const handleNavItemClick = useCallback(() => {
    if (isMobile && open) {
      setOpen(false);
    }
    // Clear any hover states
    setHoveredItem(null);
  }, [isMobile, open]);

  // Handle mouse events for tooltips
  const handleMouseEnter = useCallback((href: string) => {
    if (collapsed && !isMobile) {
      setHoveredItem(href);
    }
  }, [collapsed, isMobile]);

  const handleMouseLeave = useCallback(() => {
    setHoveredItem(null);
  }, []);

  // Don't render on server or if sidebar should be hidden
  if (!mounted || shouldHideSidebar) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div 
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          role="button"
          aria-label="Close sidebar"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          isIconOnly
          variant="ghost"
          radius="full"
          size="sm"
          className="fixed top-4 left-4 z-50 shadow-md bg-background/80 dark:bg-background/80 backdrop-blur-md border border-divider md:hidden"
          onPress={toggleSidebar}
          aria-label={open ? "Close sidebar" : "Open sidebar"}
        >
          <ChevronRightIcon size={18} className={clsx("transition-transform duration-75", open && "rotate-180")} />
        </Button>
      )}

      {/* Main Sidebar */}
      <aside
        ref={sidebarRef}
        className={clsx(
          "fixed md:sticky top-0 flex flex-col h-screen bg-background dark:bg-background border-r border-divider transition-all duration-75 ease-in-out z-50",
          {
            // Width classes
            "w-56": (!collapsed && !isMobile) || (isMobile && open),
            "w-16": collapsed && !isMobile,
            // Position classes for mobile
            "-translate-x-full md:translate-x-0": isMobile && !open,
            "translate-x-0": !isMobile || open,
            // Shadow
            "shadow-lg md:shadow-none": isMobile,
          },
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header with glowing effect */}
        <div className={clsx(
          "flex items-center h-16 px-4 relative border-b border-divider z-40",
          collapsed && !isMobile ? "justify-center" : "justify-between"
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent" />
          
          {(!collapsed || isMobile) && (
            <NextLink 
              href="/" 
              className="flex items-center gap-2 z-10 group" 
              onClick={handleNavItemClick}
              aria-label="Go to homepage"
            >
              <div className="relative glow-primary">
                <LogoMappr  className="h-8 w-8" />
              </div>
              <span className="font-bold text-lg tracking-tight">MoneyMappr</span>
            </NextLink>
          )}
          
          {collapsed && !isMobile && (
            <NextLink 
              href="/" 
              className="flex items-center justify-center z-10 group"
              onClick={handleNavItemClick}
              aria-label="Go to homepage"
            >
              <div className="relative glow-primary">
                <LogoMappr   />
              </div>
            </NextLink>
          )}
          
          {!collapsed && !isMobile && (
            <Button
              isIconOnly
              variant="light"
              radius="md"
              size="sm"
              className="text-default-500 p-0 z-10 hover:bg-default-100"
              onPress={toggleSidebar}
              aria-label="Collapse sidebar"
            >
              <HugeiconsSidebarLeft01 className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 px-2 space-y-6 z-50  scrollbar-thin scrollbar-thumb-default-300 scrollbar-track-transparent">
          {/* Collapse button for collapsed mode */}
          {(collapsed && !isMobile) && (
            <div className="flex justify-center px-1">
              <Button
                isIconOnly
                variant="light"
                radius="md"
                size="sm"
                className="text-default-500 p-0 hover:bg-default-100"
                onPress={toggleSidebar}
                aria-label="Expand sidebar"
              >
                <HugeiconsSidebarRight01 className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Navigation items by category */}
          {navigationItems.map((category, categoryIndex) => (
            <nav key={categoryIndex} className="w-full" role="navigation" aria-labelledby={`category-${categoryIndex}`}>
              {/* Category title - only show when expanded */}
              {(!collapsed || isMobile) && (
                <h3 
                  id={`category-${categoryIndex}`}
                  className="text-xs uppercase text-default-400 dark:text-default-500 font-medium tracking-wider mb-2"
                >
                  {category.title}
                </h3>
              )}
              
              {/* Category items */}
              <div className="space-y-1" role="group" aria-labelledby={`category-${categoryIndex}`}>
                {category.items.map((item) => (
                  <div 
                    key={item.href}
                    onMouseEnter={() => handleMouseEnter(item.href)}
                    onMouseLeave={handleMouseLeave}
                    className="relative"
                  >
                    {/* Tooltip for collapsed mode */}
                    {(collapsed && !isMobile && hoveredItem === item.href) && (
                      <div 
                        className="absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-background dark:bg-background text-foreground  px-2 py-1 rounded-lg shadow-lg text-[11px] font-semibold whitespace-nowrap border border-divider"
                        role="tooltip"
                        aria-hidden="false"
                      >
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 inline-block px-1  text-[10px] rounded-lg bg-primary-500 text-white">
                            {item.badge.text}
                          </span>
                        )}
                        {/* Tooltip arrow */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-background" />
                      </div>
                    )}
                    
                    <Button
                      href={item.href}
                      as={NextLink}
                      variant={pathname === item.href ? "flat" : "light"}
                      color={pathname === item.href ? "primary" : "default"}
                      radius="lg"
                      size="sm"
                      className={clsx(
                        "w-full text-sm flex items-center ",
                        collapsed && !isMobile ? "px-0 justify-center min-w-11 min-h-11" : "px-2 justify-start min-w-11 min-h-11",
                        pathname === item.href ? "font-medium bg-gradient-to-br from-orange-500/70 to-pink-500/70 text-white" : "hover:bg-default-100",
                        
                      )}
                      onPress={handleNavItemClick}
                      aria-current={pathname === item.href ? "page" : undefined}
                      startContent={
                        <div className={clsx(
                          "flex items-center justify-center transition-colors shrink-0",
                          pathname === item.href && "text-white"
                        )}>
                          {item.icon}
                        </div>
                      }
                      endContent={
                        (!collapsed || isMobile) && item.badge && (
                          <span className="ml-auto inline-block px-1.5 py-0.5 text-xs rounded-full bg-primary-500 text-white shrink-0">
                            {item.badge.text}
                          </span>
                        )
                      }
                    >
                      {(!collapsed || isMobile) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </nav>
          ))}
        </div>

        {/* User section with modern design */}
        <div className="mt-auto pt-4 border-t border-divider">
          <div className={clsx(
            "p-2",
            collapsed && !isMobile ? "items-center justify-center" : "items-start"
          )}>
            {/* User menu items */}
            <nav className="space-y-1" role="navigation" aria-label="User menu">
              {userMenuItems.map((item) => (
                <div 
                  key={item.href}
                  onMouseEnter={() => handleMouseEnter(item.href)}
                  onMouseLeave={handleMouseLeave}
                  className="relative"
                >
                  {/* Tooltip for collapsed mode */}
                  {(collapsed && !isMobile && hoveredItem === item.href) && (
                    <div 
                      className="absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-background dark:bg-background text-foreground px-3 py-2 rounded-md shadow-lg text-xs whitespace-nowrap border border-divider"
                      role="tooltip"
                    >
                      {item.label}
                      {/* Tooltip arrow */}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-background" />
                    </div>
                  )}
                  
                  <Button
                    href={item.href}
                    as={NextLink}
                    variant="light"
                    color="default"
                    radius="lg"
                    size="sm"
                    className={clsx(
                      "w-full text-xs font-semibold transition-all duration-200 min-h-10", 
                      collapsed && !isMobile ? "px-1 justify-center" : "px-4 justify-start",
                      "hover:bg-default-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    )}
                    onPress={handleNavItemClick}
                    startContent={
                      <div className="shrink-0">
                        {item.icon}
                      </div>
                    }
                  >
                    {(!collapsed || isMobile) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Button>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};