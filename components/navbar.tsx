"use client"
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import { AuthButtons } from "@/components/Auth/AuthButtons";
import { Bell } from "lucide-react";
import { CurrencySelector } from "./UI/CurrencySelector";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
 // State
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("100");
  const [variant, setVariant] = useState("flat");
  const [size, setSize] = useState("sm");
  const [showRates, setShowRates] = useState(true);
    const { user, signOut, isLoading } = useAuth();
 
  
    if (isLoading) {
      return null;
    }
  
  // Mock exchange rate for demo
  const exchangeRate = 0.93;
  const convertedAmount = (parseFloat(amount || "0") * exchangeRate).toFixed(2);
  
  // Currency handlers
  const handleFromCurrencyChange = (currency: any) => {
    setFromCurrency(currency.code);
  };
  
  const handleToCurrencyChange = (currency: any) => {
    setToCurrency(currency.code);
  };


  const searchInput = (
    <Input
      aria-label="Search"
      
      className="hidden lg:inline-flex w-full max-w-[400px] rounded-full"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar maxWidth="xl" position="static">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
     {/*    <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href} className="text-xs">
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul> */}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
     
     {/*  <Button
            isExternal
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-100"
            href={siteConfig.links.sponsor}
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
          >
            Sponsor
          </Button> */}

            <CurrencySelector 
              value={fromCurrency}
                    onChange={handleFromCurrencyChange}
                    variant={variant as any}
                    size={size as any}
                
              className=" max-w-xs "
            />

          <ThemeSwitch />
        <NavbarItem className="hidden md:flex bg-default-100 px-1 py-1  rounded-3xl gap-2 items-center align-middle">
          {user &&(  <>      <Button
          isIconOnly
          radius="full"
          variant="flat"
          size="md"
   
          >
<Bell className="text-default-500 w-4 h-4" />
          </Button>

<span className="text-sm font-normal text-default-600">Hi, Faizan</span></>)}
    

          <AuthButtons />
        </NavbarItem>
        
        <NavbarItem className="hidden md:flex">
          
        </NavbarItem>
      </NavbarContent>
 
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`} className="text-xs">
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <div className="mt-4 pt-4 border-t border-default-200">
            <AuthButtons isMobile />
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};