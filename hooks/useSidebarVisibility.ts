'use client';

import { useNavigation } from "@/contexts/NavigationContext";
import { usePathname } from "next/navigation";

/**
 * Custom hook to determine if the sidebar is currently visible on the page
 * @returns Boolean indicating if sidebar is visible
 */
export const useSidebarVisibility = (): boolean => {
  const { navigationMode, disabledSidebarPaths } = useNavigation();
  const pathname = usePathname();
  
  // Sidebar is not visible if:
  // 1. Current path is in the disabledSidebarPaths list OR
  // 2. Navigation mode is set to 'navbar'
  const isSidebarDisabled = disabledSidebarPaths.includes(pathname);
  const isSidebarVisible = !isSidebarDisabled && navigationMode === 'sidebar';
  
  return isSidebarVisible;
};

export default useSidebarVisibility;