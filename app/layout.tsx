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
    <html suppressHydrationWarning lang="en" className={`${lexend.className}`}>
      <head />
      <body
        className={clsx(
          "antialiased",
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <NavigationProvider>
            <WalletProvider>
              <div className="flex h-screen overflow-hidden ">
                {/* Sidebar - controlled by NavigationContext */}
                <Sidebar />
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col w-full overflow-hidden">
                  <Navbar />
                  
                  {/* Main content area with scrolling */}
                  <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto  py-8">
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