
import "@/styles/globals.css";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Atkinson_Hyperlegible,Lexend } from 'next/font/google'
 
const geist = Atkinson_Hyperlegible({
  weight: '400',
  subsets: ['latin'],
})
const inclusive = Lexend({
  weight: '400',

  subsets: ['latin'],
})



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html suppressHydrationWarning lang="en" className={inclusive.className}>
      <head />
      <body
        className={clsx(
          " antialiased ",
          
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
         <div className="flex h-screen ">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col  w-full ">
        <Navbar />
        <main className="container mx-auto max-w-7xl px-6 flex-grow pt-8">
          {children}
        </main>
        <footer className="w-full flex items-center justify-center py-3">
          <p className="text-default-600 text-[11px]">© 2025 ACME, Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
        </Providers>
      </body>
    </html>
  );
}
