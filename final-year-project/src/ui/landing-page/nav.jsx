"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// List of Nav links and their hrefs
const menuItems = [
  { name: "Home", href: "#HeroSection" },
  { name: "Features", href: "#Features" },
  { name: "Categories", href: "#Categories" },
  { name: "Pricing", href: "#Pricing" },
  { name: "Contact Us", href: "#ContactUs" },

];

export const HeroHeader = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Scroll Detection for if user scrolls more than 50px down
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState ? "active" : ""}
        className="fixed z-20 w-full px-2"
      >
        <div
          // Effects when scrolling
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/80 max-w-4xl rounded-2xl border backdrop-blur-md lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* Logo & Mobile Hamburger  */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="#HeroSection" className="flex items-center gap-2">
                <Image
                  src="/assets/landing/logo-certify.svg"
                  alt="Certify Logo"
                  width={150}
                  height={40}
                  priority
                />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                {menuState ? (
                  <X size={24} className="transition-all duration-200" />
                ) : (
                  <Menu size={24} className="transition-all duration-200" />
                )}
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-primary duration-150"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Drawer + Buttons */}
            <div
              className={cn(
                "bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent",
                menuState ? "block" : "lg:flex"
              )}
            >
              {/* Mobile Menu Items */}
              {menuState && (
                <div className="lg:hidden">
                  <ul className="space-y-6 text-base pt-2">
                    {menuItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuState(false)}
                          className="block text-muted-foreground hover:text-primary duration-150"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Auth Buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link href="/authentication/login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link href="/authentication/signup">Sign Up</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                >
                  <Link href="/authentication/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
