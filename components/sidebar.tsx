"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import clsx from "clsx";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  HomeIcon, 
  LayoutDashboardIcon, 
  FileTextIcon, 
  ShoppingCartIcon, 
  UsersIcon,
  SettingsIcon, 
  HelpCircleIcon, 
  LogOutIcon,
  BellIcon,
  ActivityIcon,
  StarIcon,
  TrendingUpIcon
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { CuidaLogoutOutline, HeroiconsOutlineLogout, HugeiconsAnalyticsUp, HugeiconsSettings05, HugeiconsSidebarLeft01, HugeiconsSidebarRight01, RadixIconsDashboard, SolarPieChartBold, SolarWalletOutline, TablerHelpSquareRounded } from "./icons/icons";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();

  // Navigation categories
  const navigationCategories = [
    {
      title: "Main",
      items: [
        {
          label: "Dashboard",
          href: "/",
          icon: <RadixIconsDashboard className="w-5 h-5" />,
          badge: null,
        },
         {
          label: "Portfolios",
          href: "/portfolios",
          icon: <SolarPieChartBold className="w-5 h-5" />,
          badge: null,
        },
        {
          label: "Accounts",
          href: "/accounts",
          icon: <SolarWalletOutline className="w-5 h-5" />,
          badge: null,
        },
        {
          label: "Analytics",
          href: "/analytics",
          icon: <HugeiconsAnalyticsUp className="w-5 h-5" />,
          badge: { text: "New", color: "primary" },
        },
      ],
    },
   
    {
      title: "Business",
      items: [
        {
          label: "Pricing",
          href: "/pricing",
          icon: <ShoppingCartIcon size={20} />,
          badge: null,
        },
        {
          label: "About",
          href: "/about",
          icon: <HelpCircleIcon size={20} />,
          badge: null,
        },
      ],
    },
  ];

  // User menu items
  const userMenuItems = [
    {
      label: "Settings",
      href: "/settings",
      icon: <HugeiconsSettings05 className="w-5 h-5 " />,
    },
    {
      label: "Help & Support",
      href: "/help",
      icon: <TablerHelpSquareRounded className="w-5 h-5 " />,
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <CuidaLogoutOutline className="w-5 h-5 text-red-600" />,
    },
  ];

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
        setOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle toggle sidebar
  const toggleSidebar = () => {
    if (isMobile) {
      setOpen(!open);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Close sidebar when clicking elsewhere on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && open) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, open]);

  // Handle navigation item click (for mobile)
  const handleNavItemClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div 
          className=" fixed inset-0 bg-black/50 backdrop-blur-sm "
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          isIconOnly
          variant="ghost"
          radius="full"
          size="sm"
          className="fixed top-4 left-4 z-40 shadow-md bg-background/80 backdrop-blur-md border-default-200 lg:hidden"
          onClick={toggleSidebar}
        >
          <ChevronRightIcon size={18} />
        </Button>
      )}

      {/* Main Sidebar */}
      <aside
        id="sidebar"
        className={clsx(
          " sticky  top-0 flex flex-col h-screen bg-gradient-to-b from-background to-content1/70 backdrop-blur-md border-r border-divider transition-all duration-75 ease-in-out z-50 shadow-md",
          {
            " md:relative inset-y-0 left-0": true,
            "w-48": !collapsed,
            "w-16": collapsed && !isMobile,
            "-translate-x-full": isMobile && !open,
            "translate-x-0": isMobile && open,
          },
          className
        )}
      >
        {/* Header with glowing effect */}
        <div className={clsx(
          "flex items-center h-16 px-4 relative ",
          collapsed && !isMobile ? "justify-center" : "justify-between"
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 "></div>
          
          {(!collapsed || isMobile) && (
            <NextLink href="/" className="flex items-center gap-2 " onClick={handleNavItemClick}>
              <div className="relative">
                <Logo size={36} />
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-30"></div>
              </div>
              <span className="font-bold text-xl tracking-tight">ACME</span>
            </NextLink>
          )}
          
          {collapsed && !isMobile && (
            <NextLink href="/" className="flex items-center justify-center z-10">
              <div className="relative">
                <Logo size={36} />
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-30"></div>
              </div>
            </NextLink>
          )}
          
          {!collapsed && (
            <Button
              isIconOnly
              variant="light"
              radius="md"
              size="sm"
              className={clsx(
                "text-default-500 p-0 z-10",
                isMobile && "lg:hidden"
              )}
              onClick={toggleSidebar}
            >
              <HugeiconsSidebarLeft01 className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1  py-4 px-2 space-y-6 z-10">
          {/* Collapse button for collapsed mode */}
          {(collapsed && !isMobile) && (
            <div className="flex justify-center px-1">
              <Button
                isIconOnly
                variant="light"
                radius="md"
                size="sm"
                className="text-default-500 p-0 "
                onClick={toggleSidebar}
              >
                <HugeiconsSidebarRight01 className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Navigation items by category */}
          {navigationCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className=" w-full ">
              {/* Category title - only show when expanded */}
              {(!collapsed || isMobile) && (
                <h3 className="text-xs uppercase text-default-400 font-medium tracking-wider px-4 mb-2">
                  {category.title}
                </h3>
              )}
              
              {/* Category items */}
              <div className="space-y-2">
                {category.items.map((item) => (
                  <div 
                    key={item.href}
                    onMouseEnter={() => collapsed && !isMobile && setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative"
                  >
                    {/* Tooltip for collapsed mode */}
                    {(collapsed && !isMobile && hoveredItem === item.href) && (
                      <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-content2 text-foreground px-3 py-2 rounded-md shadow-lg text-xs whitespace-nowrap">
                        {item.label}
                        {item.badge && (
                          <span className={`ml-2 inline-block px-1.5 py-0.5 text-xs rounded-full bg-${item.badge.color} text-white`}>
                            {item.badge.text}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <Button
                      href={item.href}
                      as={NextLink}
                      isIconOnly={collapsed && !isMobile}
                      
                      startContent={
                         !collapsed && !isMobile && <div className={clsx(
                          "flex items-center justify-center",
                          pathname === item.href && "text-primary"
                        )}>
                          {item.icon}
                        </div>
                      }
                      endContent={
                        (!collapsed || isMobile) && item.badge && (
                          <span className={`ml-2 inline-block px-1.5 py-0.5 text-xs rounded-full bg-${item.badge.color} text-white`}>
                            {item.badge.text}
                          </span>
                      
                        )
                      }
                      variant={pathname === item.href ? "flat" : "light"}
                      color={pathname === item.href ? "primary" : "default"}
                      radius="lg"
                      className={clsx(
                        " w-full text-sm flex items-center",
                        collapsed && !isMobile ? "px-0 justify-center" : "px-3 justify-start",
                        pathname === item.href ? "font-medium" : "",
                        pathname === item.href && "bg-primary/10"
                      )}
                      onClick={handleNavItemClick}
                    >
                      {(!collapsed || isMobile) && (
                        <span>{item.label}</span>
                      )}

                      {collapsed && !isMobile && <div className={clsx(
                          "flex items-center justify-center  px-4",
                          pathname === item.href && "text-primary"
                        )}>
                          {item.icon}
                        </div>}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User section with modern design */}
        <div className="mt-auto pt-4">
          <Divider className="mb-4 px-4" />
          
          <div className={clsx(
            "p-2 ",
            collapsed && !isMobile ? "items-center justify-center" : "items-start"
          )}>
     
            
            {/* User menu items */}
            <div className="space-y-1">
              {userMenuItems.map((item) => (
                <div 
                  key={item.href}
                  onMouseEnter={() => collapsed && !isMobile && setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative"
                >
                  {/* Tooltip for collapsed mode */}
                  {(collapsed && !isMobile && hoveredItem === item.href) && (
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 bg-content2 text-foreground px-3 py-2 rounded-md shadow-lg text-xs whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                  
                  <Button
                    href={item.href}
                    isIconOnly={collapsed && !isMobile}
                    as={NextLink}
                    startContent={item.icon}
                    variant="light"
                    color="default"
                    radius="lg"
                    className={clsx(
                      " w-full text-xs ", 
                      collapsed && !isMobile ? "px-1 justify-center" : "px-4 justify-start"
                    )}
                    onClick={handleNavItemClick}
                  >
                    {(!collapsed || isMobile) && (
                      <span>{item.label}</span>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};