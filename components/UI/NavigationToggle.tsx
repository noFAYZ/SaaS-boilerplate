'use client';

import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { 
  HugeiconsSidebarLeft01,
  HugeiconsSidebarRight01 
} from "@/components/icons/icons";
import { useNavigation } from "@/contexts/NavigationContext";
import { addToast } from "@heroui/react";
import { usePathname } from "next/navigation";

interface NavigationToggleProps {
  variant?: "button" | "switch";
  className?: string;
}

export const NavigationToggle = ({ 
  variant = "button", 
  className 
}: NavigationToggleProps) => {
  const { navigationMode, toggleNavigationMode, disabledSidebarPaths } = useNavigation();
  const pathname = usePathname();
  
  // Check if current path should have sidebar disabled
  const isSidebarDisabled = disabledSidebarPaths.includes(pathname);
  
  const handleToggle = () => {
    toggleNavigationMode();
    addToast({
      title: `Switched to ${navigationMode === 'sidebar' ? 'navbar' : 'sidebar'} navigation`,
      variant: "flat"
    });
  };
  
  if (isSidebarDisabled) {
    return null;
  }
  
  if (variant === "switch") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <HugeiconsSidebarLeft01 className="w-4 h-4 text-default-500" />
        <Switch 
          isSelected={navigationMode === 'navbar'}
          onValueChange={handleToggle}
          size="sm"
          color="primary"
          aria-label="Toggle navigation mode"
        />
        <HugeiconsSidebarRight01 className="w-4 h-4 text-default-500" />
      </div>
    );
  }
  
  return (
    <Button
      isIconOnly
      variant="light"
      radius="md"
      size="sm"
      className={`text-default-500 p-0 ${className}`}
      onClick={handleToggle}
      aria-label="Toggle navigation mode"
    >
      {navigationMode === 'sidebar' ? (
        <HugeiconsSidebarLeft01 className="w-5 h-5" />
      ) : (
        <HugeiconsSidebarRight01 className="w-5 h-5" />
      )}
    </Button>
  );
};

export default NavigationToggle;