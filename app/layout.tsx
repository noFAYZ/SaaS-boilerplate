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
               
                  {/* Content Container with responsive padding */}
                  <div className="w-full min-h-[calc(100vh-5rem)]">
                   
                      {children}
                 
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