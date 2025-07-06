import "@/styles/globals.css";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { Atkinson_Hyperlegible, Jost, Space_Grotesk } from 'next/font/google'
import { motion } from "framer-motion";
 
const lexend = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en" className={lexend.className}>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body className={clsx("min-h-screen  font-sans antialiased overflow-x-hidden ")}>
      
      <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        <NavigationProvider>
          <WalletProvider>
            {/* Main Layout Container */}
            <div className="relative flex min-h-screen">
              {/* Sidebar - positioned and controlled by its own logic */}
              <Sidebar  />
              
              {/* Main Content Wrapper */}
              <div className="flex-1 flex flex-col min-w-0 w-full">
                {/* Navbar - sticky positioned */}
         
                  <Navbar />
            
                
                {/* Main Content Area */}
                <main className="flex-1 w-full  overflow-x-auto">
                   {/* Background Grid Pattern */}
                  <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `
                        linear-gradient(rgba(156, 163, 175, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }} />
                      {/* Enhanced background effects */}
                      <div className="absolute inset-0">
                            {/* Animated gradient overlay */}
                            <div
                            
                              className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"
                            />
                            
                            {/* Noise texture overlay for premium feel */}
                            <div 
                              className="absolute inset-0 opacity-30"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                backgroundSize: '256px 256px',
                              }}
                            />
                            
                            {/* Radial gradient for focus effect */}
                            <div
                            
                              className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20"
                            />
                          </div>
                  {/* Content Container with responsive padding */}
                  <div className="w-full min-h-[calc(100vh-4rem)]">
                    <div className=" mx-auto ">
                      {children}
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