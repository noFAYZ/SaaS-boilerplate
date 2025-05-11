"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@heroui/react";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const themes = ["light", "dark", "orange-dark"];

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider attribute="class" 
        defaultTheme="orange-dark" 
        themes={themes}
        {...themeProps}>
        <AuthProvider>
          {children}  
          <ToastProvider
            toastProps={{
              radius: "full",
              color: "primary",
              variant: "flat",
              timeout: 1000,
              hideIcon: true,
              classNames: {
                closeButton: "opacity-100 absolute right-4 top-1/2 -translate-y-1/2",
              },
            }}
          />
        </AuthProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}