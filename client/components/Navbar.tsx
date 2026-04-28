'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WalletConnect from './WalletConnect';

const BRAND_LOGO_SRC = '/brand/Screenshot 2026-04-22 220049.png';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { href: '/devs', label: 'Devs' },
  { href: '/faucet', label: 'Faucet' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(250,251,252,0.90)] backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-content mx-auto px-6 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded">
            <Image
              src={BRAND_LOGO_SRC}
              alt="Valdyum logo"
              fill
              sizes="36px"
              className="object-contain"
              priority
            />
          </span>
          <span className="font-editorial text-xl font-semibold text-[#0A0E27] tracking-tight">
            Valdyum
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 text-sm rounded-md transition-colors ${
                pathname === link.href
                  ? 'text-[#4F46E5] bg-[rgba(79,70,229,0.06)] font-medium'
                  : 'text-[#475569] hover:text-[#0A0E27] hover:bg-[#F5F6F8]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right CTA */}
        <WalletConnect />
      </div>
    </nav>
  );
}
