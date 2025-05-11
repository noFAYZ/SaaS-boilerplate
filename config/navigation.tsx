import { ReactNode } from "react";
import { 
  RadixIconsDashboard, 
  SolarPieChartBold, 
  SolarWalletOutline, 
  HugeiconsAnalyticsUp,
  HugeiconsSettings05,
  TablerHelpSquareRounded,
  CuidaLogoutOutline
} from "@/components/icons/icons";
import { HelpCircleIcon, ShoppingCartIcon } from "lucide-react";

// Define types for navigation items
export interface NavigationItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: {
    text: string;
    color: string;
  } | null;
}

export interface NavigationCategory {
  title: string;
  items: NavigationItem[];
}

// Main navigation items
export const navigationItems: NavigationCategory[] = [
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
/*   {
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
  }, */
];

// User menu items (can be used in both sidebar and navbar)
export const userMenuItems: NavigationItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: <HugeiconsSettings05 className="w-5 h-5" />,
    badge: null,
  },
  {
    label: "Help & Support",
    href: "/help",
    icon: <TablerHelpSquareRounded className="w-5 h-5" />,
    badge: null,
  },
  {
    label: "Logout",
    href: "/logout",
    icon: <CuidaLogoutOutline className="w-5 h-5 text-destructive" />,
    badge: null,
  },
];