'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BRAND_LOGO_SRC = '/brand/Screenshot 2026-04-22 220049.png';

const navLinks = [
  { href: '/', label: 'The Forum' },
  { href: '/agents', label: 'The Legion' },
  { href: '/devs', label: 'The Forge' },
  { href: '/faucet', label: 'The Treasury' },
  { href: '/about', label: 'Architecture' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[rgba(255,255,255,0.85)] backdrop-blur-xl border-b border-black/5 py-4' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-12">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-black/5 group-hover:bg-black/10 transition-colors">
            <Image
              src={BRAND_LOGO_SRC}
              alt="Valdyum logo"
              fill
              sizes="36px"
              className="object-contain p-1 invert mix-blend-multiply" 
              priority
            />
          </span>
          <span className="hidden text-lg font-sans font-medium tracking-tight text-[#111111] sm:block">Valdyum</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13px] font-sans transition-colors ${
                pathname === link.href ? 'text-[#111111] font-medium' : 'text-black/50 hover:text-[#111111]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <Link href="/docs" className="hidden text-[13px] font-sans text-black/50 transition-colors hover:text-[#111111] md:block">
            View docs
          </Link>
          <Link
            href="/build"
            className="rounded-full bg-[#111111] px-6 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-black hover:scale-105"
          >
            Enter Forge
          </Link>
        </div>
      </div>
    </nav>
  );
}
