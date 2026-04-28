'use client';

import { useEffect, useRef } from 'react';

const PARTNERS = [
  { name: 'Stellar', icon: '✦' },
  { name: 'Soroban', icon: '◆' },
  { name: 'QStash', icon: '▲' },
  { name: 'Freighter', icon: '◉' },
  { name: 'Horizon API', icon: '◈' },
  { name: 'Rust SDK', icon: '⬡' },
];

export default function TrustStrip() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    async function animate() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        stripRef.current?.querySelectorAll('.partner-item') ?? [],
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power1.out',
          scrollTrigger: { trigger: stripRef.current, start: 'top 90%' },
        }
      );
    }
    animate();
  }, []);

  return (
    <section className="border-y border-[#E2E8F0] bg-white py-8">
      <div className="max-w-content mx-auto px-6">
        <div
          ref={stripRef}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          <span className="text-[11px] text-[#94a3b8] uppercase tracking-widest mr-4 hidden md:block">
            Built on
          </span>
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="partner-item flex items-center gap-2 text-[#475569] opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-base">{p.icon}</span>
              <span className="text-sm font-medium">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
