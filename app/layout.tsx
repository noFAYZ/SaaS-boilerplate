import "@/styles/globals.css";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Atkinson_Hyperlegible, Jost,Space_Grotesk } from 'next/font/google'
 

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
    <html suppressHydrationWarning lang="en" className={`${lexend.className} }`}>
      <head />
      <body
        className={clsx(
          "antialiased ",
        
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="flex h-screen overflow-hidden bg-gradient-to-b from-background to-background/90">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col w-full overflow-hidden">
              <Navbar />
              
              {/* Main content area with scrolling */}
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto max-w-7xl px-6 py-8">
                  {children}
                </div>
              </main>
              
       
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}