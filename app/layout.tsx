import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata } from "next";

import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { Space_Grotesk } from 'next/font/google';

// Enterprise-grade font configuration
const lexend = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-lexend',
});

// Metadata for enterprise SaaS
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'portfolio management',
    'crypto analytics',
    'DeFi tracking',
    'wallet management',
    'blockchain analytics',
    'enterprise crypto',
  ],
  authors: [
    {
      name: "MoneyMappr",
      url: "https://moneymappr.com",
    },
  ],
  creator: "MoneyMappr",
  openGraph: {
    type: "website",
    locale: "en_US",

    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
   
    creator: "@moneymappr",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Mock organization data - in production, this would come from your auth/org context
  const organizationData = {
    name: "MoneyMappr Pro",
    plan: 'professional' as const,
    status: 'active' as const,
    usage: {
      current: 85432,
      limit: 100000,
    },
  };

  return (
    <html 
      suppressHydrationWarning 
      lang="en" 
      className={clsx(lexend.variable, lexend.className)}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark light" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/lexend.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
       
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body 
        className={clsx(
          "min-h-screen font-sans antialiased overflow-x-hidden",
          "bg-background text-foreground",
          "selection:bg-primary-500/20 selection:text-primary-foreground"
        )}
      >      <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-500 opacity-20 blur-[100px]" />
      <div className="absolute right-0 top-1/4 -z-10 h-[310px] w-[310px] rounded-full bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-1/4 left-0 -z-10 h-[310px] w-[310px] rounded-full bg-orange-500 opacity-20 blur-[100px]" />
    </div>
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <NavigationProvider>
            <WalletProvider>
              {/* Enterprise Layout Container */}
              <div className="relative flex min-h-screen ">
        
                {/* Sidebar - Enterprise navigation with organization context */}
                <Sidebar 
                  organizationData={organizationData}
                  notificationCount={3}
                  showQuickSearch={true}
                  enableKeyboardShortcuts={true}
                />
                
                {/* Main Content Wrapper */}
                <div className="flex-1 flex flex-col min-w-0 w-full relative">
                  {/* Enhanced Navbar with enterprise features */}
                  <Navbar 
                   
                   
        
                  />
                  
                  {/* Main Content Area with enhanced styling */}
                  <main className="flex-1 w-full overflow-x-auto relative">
          
                    
                    {/* Content Container with responsive padding and max width */}
                    <div className="relative w-full min-h-[calc(100vh-8rem)] max-w-[2000px] mx-auto">
                      <div className="p-4 sm:p-6 lg:p-8">
                        {/* Content wrapper with fade-in animation */}
                        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                          {children}
                        </div>
                      </div>
                    </div>
                  </main>
                  
                  {/* Enterprise Footer with status indicators */}
                  <footer className="border-t border-divider bg-background/80 backdrop-blur-md">
                    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Left side - Status and info */}
                        <div className="flex items-center gap-4 text-xs text-default-500">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            
                          </div>
                          <div className="hidden sm:block w-px h-3 bg-divider" />
                          <span className="hidden sm:inline">
                            API Status: {organizationData.usage.current.toLocaleString()} / {organizationData.usage.limit.toLocaleString()} requests
                          </span>
                          <div className="hidden sm:block w-px h-3 bg-divider" />
                          <span className="hidden sm:inline">
                            Last updated: {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {/* Right side - Links and actions */}
                        <div className="flex items-center gap-4 text-xs">
                          <a 
                            href="/status" 
                            className="text-default-500 hover:text-foreground transition-colors"
                          >
                            System Status
                          </a>
                          <div className="w-px h-3 bg-divider" />
                          <a 
                            href="/docs" 
                            className="text-default-500 hover:text-foreground transition-colors"
                          >
                            API Documentation
                          </a>
                          <div className="w-px h-3 bg-divider" />
                          <a 
                            href="/support" 
                            className="text-default-500 hover:text-foreground transition-colors"
                          >
                            Support
                          </a>
                          <div className="w-px h-3 bg-divider" />
                          <span className="text-default-400">
                            v2.1.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </footer>
                </div>
              </div>
              
              {/* Global Loading Overlay */}
              <div id="global-loading" className="hidden fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-default-500">Loading...</p>
                  </div>
                </div>
              </div>
              
              {/* Enterprise PWA Prompt */}
              <div id="pwa-prompt" className="hidden fixed bottom-4 right-4 z-50 bg-background border border-divider rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">Install MoneyMappr</h4>
                    <p className="text-xs text-default-500 mb-3">Get instant access and enhanced performance</p>
                    <div className="flex gap-2">
                      <button className="text-xs px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
                        Install
                      </button>
                      <button className="text-xs px-3 py-1 text-default-500 hover:text-foreground transition-colors">
                        Later
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </WalletProvider>
          </NavigationProvider>
        </Providers>
        
      
      </body>
    </html>
  );
}