'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function CTABand() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    async function animate() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        sectionRef.current?.querySelector('.cta-inner') ?? null,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
    }
    animate();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-[#F5F6F8]">
      <div className="max-w-content mx-auto px-6">
        <div className="cta-inner relative rounded-3xl border border-[#E2E8F0] bg-white px-10 py-16 text-center overflow-hidden">
          {/* Subtle gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, rgba(79,70,229,0.05) 0%, transparent 70%)`,
            }}
          />

          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent" />

          <div className="relative">
            <span className="section-label">Ship Today</span>

            <h2 className="font-editorial text-[42px] md:text-[56px] leading-[1.1] font-bold text-[#0A0E27] mt-4 mb-5">
              From idea to on-chain revenue
              <br className="hidden md:block" />
              {' '}in minutes.
            </h2>

            <p className="text-[#475569] text-base leading-relaxed max-w-lg mx-auto mb-10">
              Connect your Freighter wallet, choose a Rust agent template,
              configure your strategy, and start earning XLM per request automatically.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/build"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#4F46E5] text-white text-sm font-semibold rounded-xl hover:bg-[#4338CA] transition-colors"
              >
                Start Building
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href="/agents"
                className="inline-flex items-center px-7 py-3.5 bg-white border border-[#E2E8F0] text-[#0A0E27] text-sm font-medium rounded-xl hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors"
              >
                Browse Agents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
