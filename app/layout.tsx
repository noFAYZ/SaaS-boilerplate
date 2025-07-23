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

// Premium font configuration
const lexend = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  style: ['normal'],
  subsets: ['latin'],
  variable: '--font-lexend',
});

// Enhanced metadata for premium SaaS
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
  // Premium organization data
  const organizationData = {
    name: "MoneyMappr Pro",
    plan: 'enterprise' as const,
    status: 'active' as const,
    usage: {
      current: 127834,
      limit: 500000,
    },
    tier: 'premium' as const,
  };

  return (
    <html 
      suppressHydrationWarning 
      lang="en" 
      className={clsx(lexend.variable, lexend.className)}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f97316" />
        <meta name="color-scheme" content="dark light" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/lexend.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Enhanced security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      
      <body 
        className={clsx(
          "min-h-screen font-sans antialiased overflow-x-hidden",
          " text-foreground",
          "selection:bg-warning/20 selection:text-warning-foreground"
        )}
      >
  

        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <NavigationProvider>
            <WalletProvider>
              {/* Premium Enterprise Layout Container */}
              <div className="relative flex min-h-screen">
 

        {/* Minimal glass morphism overlay */}
        <div className="fixed inset-0 -z-10 backdrop-blur-[0.3px] bg-background/[0.01]" />
                {/* Enhanced Sidebar with premium styling */}
                <Sidebar 
                  organizationData={organizationData}
                  notificationCount={7}
                  showQuickSearch={true}
                  enableKeyboardShortcuts={true}
                  className="bg-background/80 backdrop-blur-xl border-r border-default-200/50"
                />
                
                {/* Main Content Wrapper with enhanced styling */}
                <div className="flex-1 flex flex-col min-w-0 w-full relative">
                  
                  {/* Premium Navbar with glass effect */}
                  <Navbar className="bg-background/80 backdrop-blur-xl border-b border-default-200/50 shadow-sm" />
                  
                  {/* Main Content Area with premium styling */}
                  <main className="flex-1 w-full overflow-x-auto relative">
                    
                    {/* Content Container with enhanced responsive design */}
                    <div className="relative w-full min-h-[calc(100vh-8rem)] max-w-[2000px] mx-auto">
                      <div className="p-4 sm:p-6 lg:p-8 xl:p-10">
                        
                        {/* Premium content wrapper with enhanced animations */}
                        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-700 ease-out">
                          {/* Content backdrop for better readability */}
                          <div className="relative">
                            {/* Subtle content background */}
                            <div className="absolute inset-0 bg-background/40 backdrop-blur-sm rounded-3xl -z-10 opacity-60" />
                            
                            {children}
                          </div>
                        </div>
                      </div>
                    </div>
                  </main>
                  
              
                </div>
              </div>
              

  
     
            
            </WalletProvider>
          </NavigationProvider>
        </Providers>
      </body>
    </html>
  );
}