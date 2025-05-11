'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSidebarVisibility } from '@/hooks/useSidebarVisibility';
import clsx from 'clsx';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  paddingY?: boolean;
  fullWidth?: boolean;
  centerContent?: boolean;
}

/**
 * A responsive layout component that adjusts based on sidebar visibility
 */
export const ResponsiveLayout = ({
  children,
  className = '',
  paddingY = true,
  fullWidth = false,
  centerContent = false,
}: ResponsiveLayoutProps) => {
  const isSidebarVisible = useSidebarVisibility();
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration by only adjusting layout after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div
      className={clsx(
        'transition-all duration-300 ease-in-out',
        {
          'max-w-5xl': !fullWidth && !isSidebarVisible, // Narrower when sidebar not shown
          'max-w-7xl': !fullWidth && isSidebarVisible,  // Wider when sidebar shown
          'w-full': fullWidth,
          'mx-auto': !fullWidth || centerContent,
          'py-8 md:py-10': paddingY,
          'opacity-0': !mounted,
          'opacity-100': mounted,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveLayout;