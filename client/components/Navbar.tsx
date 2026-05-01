'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sliding indicator
  // Recalculate indicator position
  const updateIndicator = () => {
    const targetIndex = hoveredIndex !== null ? hoveredIndex : navLinks.findIndex(l => l.href === pathname);
    const el = linkRefs.current[targetIndex];
    const container = navContainerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    } else {
      setIndicatorStyle(null);
    }
  };

  // Run on hover change, pathname change, and scroll state change
  useEffect(() => {
    updateIndicator();
  }, [hoveredIndex, pathname, isScrolled]);

  // Recalculate on resize and after initial mount paint
  useEffect(() => {
    const timer = setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Outer wrapper — always full width, handles top padding animation */}
      <div
        className="w-full flex justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          padding: isScrolled ? '14px 20px 0' : '0',
        }}
      >
        {/* Inner bar — morphs from flat full-width to floating card */}
        <div
          className="pointer-events-auto w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            maxWidth: isScrolled ? '1100px' : '100%',
            padding: isScrolled ? '12px 28px' : '18px 40px',
            borderRadius: isScrolled ? '16px' : '0px',
            background: isScrolled ? 'rgba(255, 255, 255, 0.88)' : 'transparent',
            backdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
            WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(180%)' : 'none',
            border: isScrolled ? '1px solid rgba(0, 0, 0, 0.07)' : '1px solid transparent',
            boxShadow: isScrolled
              ? '0 8px 32px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)'
              : 'none',
          }}
        >
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-black/[0.03] group-hover:bg-black/[0.07] transition-all duration-300">
                <Image
                  src={BRAND_LOGO_SRC}
                  alt="Valdyum logo"
                  fill
                  sizes="36px"
                  className="object-contain p-1.5 invert mix-blend-multiply"
                  priority
                />
              </span>
              <div className="hidden sm:flex flex-col">
                <span className="text-[15px] font-sans font-semibold tracking-tight text-[#111111] leading-tight">
                  Valdyum
                </span>
                <span className="text-[9px] font-mono tracking-[0.15em] text-black/30 uppercase leading-tight">
                  Protocol
                </span>
              </div>
            </Link>

            {/* Center Nav Links */}
            <div
              ref={navContainerRef}
              className="hidden lg:flex items-center relative"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Sliding underline indicator */}
              <div
                className="absolute bottom-0 h-[2px] rounded-full transition-all duration-300 ease-out"
                style={{
                  left: indicatorStyle ? indicatorStyle.left + indicatorStyle.width * 0.15 : 0,
                  width: indicatorStyle ? indicatorStyle.width * 0.7 : 0,
                  background: indicatorStyle ? '#799ee0' : 'transparent',
                  opacity: indicatorStyle ? 1 : 0,
                }}
              />

              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(el) => { linkRefs.current[i] = el; }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  className={`relative z-10 px-5 py-2 text-[14px] font-sans transition-colors duration-300 whitespace-nowrap ${
                    pathname === link.href
                      ? 'text-[#111111] font-medium'
                      : 'text-black/35 hover:text-[#111111]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/docs"
                className="hidden md:block px-4 py-2 text-[14px] font-sans text-black/35 hover:text-[#111111] transition-colors duration-300 whitespace-nowrap"
              >
                View docs
              </Link>
              <Link href="/build">
                <HoverBorderGradient
                  as="span"
                  containerClassName="cursor-pointer"
                  className="bg-[#111111] text-white whitespace-nowrap"
                >
                  Enter Forge
                </HoverBorderGradient>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
