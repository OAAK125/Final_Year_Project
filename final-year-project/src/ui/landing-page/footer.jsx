import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const links = [
  { title: "Home", href: "#HeroSection" },
  { title: "Features", href: "#Features" },
  { title: "Categories", href: "#Categories" },
  { title: "Contact Us", href: "#ContactUs" },
];

export default function FooterSection() {
  return (
    <footer className="bg-zinc-50 py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Logo */}
        <Link
          href="#HomeSection"
          aria-label="Go home"
          className="mx-auto block w-fit"
        >
          <Image
            src="/assets/landing/logo-certify.svg"
            alt="Logo"
            width={140}
            height={40}
            priority
          />
        </Link>

        {/* Navigation Links */}
        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          {links.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="hover:text-primary dark:hover:text-white transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <span className="block text-center text-sm text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} CertifyPrep, All rights reserved
        </span>

        {/* Dashboard Shortcut Button */}
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
