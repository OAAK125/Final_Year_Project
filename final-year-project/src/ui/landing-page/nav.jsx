"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';


const menuItems = [
    { name: 'Home', href: '#HeroSection' },
    { name: 'Features', href: '#Features' },
    { name: 'Categories', href: '#Categories' },
    { name: 'Contact Us', href: '#ContactUs' },
];

export const HeroHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed z-20 w-full border-b bg-background/80 backdrop-blur-md">
            <nav className="mx-auto max-w-6xl px-6">
                <div className="flex items-center justify-between py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/assets/logos/logo-certify.svg" alt="Logo" width={150} height={150} />
                    </Link>

                    {/* Desktop Menu & Buttons */}
                    <div className="hidden lg:flex items-center gap-x-8">
                        <ul className="flex gap-x-8 text-sm">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-muted-foreground hover:text-accent-foreground duration-150">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-x-3">
                             <Button asChild variant="outline" size="sm">
                                <Link href="/authentication/login">Login</Link>
                             </Button>
                             <Button asChild size="sm">
                                <Link href="/authentication/signup">Sign Up</Link>
                             </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
                            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>

                {/* --- Mobile Menu Drawer (conditionally rendered) --- */}
                {isMenuOpen && (
                    <div className="lg:hidden pb-4">
                        <ul className="flex flex-col space-y-4 pt-2">
                           {menuItems.map((item) => (
                                <li key={item.name}>
                                    <Link href={item.href} className="block text-muted-foreground hover:text-accent-foreground duration-150">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex flex-col space-y-3 border-t pt-4">
                             <Button asChild variant="outline">
                                <Link href="/authentication/login">Login</Link>
                             </Button>
                             <Button asChild>
                                <Link href="/authentication/signup">Sign Up</Link>
                             </Button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};