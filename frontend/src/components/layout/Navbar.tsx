"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming utils.ts is in src/lib
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"; // Assuming navigation-menu is in src/components/ui
import { ConnectButton } from "@rainbow-me/rainbowkit";

const APP_NAME = "NexusVoice";

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/governance", label: "Governance" },
  { href: "/markets", label: "Markets" }, // Added markets page
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Left Side: App Name */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Optional: Add an icon/logo here later */}
            <span className="hidden font-bold sm:inline-block">{APP_NAME}</span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex flex-1 items-center justify-center">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side: Connect Button */}
        <div className="flex items-center justify-end space-x-2">
          <ConnectButton />
        </div>

        {/* TODO: Add mobile navigation (drawer or dropdown) */}
      </div>
    </header>
  );
}
