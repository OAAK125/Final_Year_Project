import Image from 'next/image'
import Link from 'next/link'

const links = [
  { title: 'Home', href: '#HeroSection' },
  { title: 'Features', href: '#Features' },
  { title: 'Categories', href: '#Categories' },
  { title: 'Contact Us', href: '#ContactUs' },
]

export default function FooterSection() {
  return (
    <footer className="bg-zinc-50 py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Logo */}
        <Link href="/" aria-label="Go home" className="mx-auto block w-fit">
          <Image
            src="/assets/logos/logo-certify.svg"
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
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              {link.title}
            </Link>
          ))}
        </div>

        {/* Social Icons */}
        <div className="mb-8 flex flex-wrap justify-center gap-6 text-gray-600 dark:text-gray-400">
          {[
            ['X/Twitter', '#'],
            ['LinkedIn', '#'],
            ['Facebook', '#'],
            ['Threads', '#'],
            ['Instagram', '#'],
            ['TikTok', '#'],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              {/* You can keep your inline SVGs here as in your original code */}
              {/* Example: Twitter icon */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                {/* Use appropriate <path> based on icon */}
                <path d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <span className="block text-center text-sm text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} CertifyPrep, All rights reserved
        </span>
      </div>
    </footer>
  )
}
