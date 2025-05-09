'use client';

import { ToastProvider } from "@heroui/react";

export function HeroToastProvider({ children }: { children: React.ReactNode }) {
  return (

  {children}

  );
}