'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function HeroSection() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let gsap: typeof import('gsap').gsap;

    async function animate() {
      const mod = await import('gsap');
      gsap = mod.gsap;

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(badgeRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(headlineRef.current, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
        .fromTo(subRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo(imageRef.current, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.9 }, '-=0.7');
    }

    animate();
  }, []);

  return (
    <section className="relative min-h-[calc(100svh-68px)] flex items-center overflow-hidden bg-[#FAFBFC]">
      {/* Subtle texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, rgba(79,70,229,0.04) 0%, transparent 60%),
                           radial-gradient(circle at 20% 80%, rgba(180,83,9,0.03) 0%, transparent 50%)`,
        }}
      />

      <div className="relative max-w-content mx-auto px-6 w-full py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — content */}
          <div>
            {/* Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E2E8F0] bg-white text-xs text-[#475569] mb-8"
            >
              <span className="status-live" />
              Live on Stellar Testnet · 0x402 Active
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="font-editorial text-[58px] md:text-[72px] leading-[1.08] font-bold text-[#0A0E27] mb-6"
            >
              The Agent
              <br />
              <em className="text-[#4F46E5] not-italic">Marketplace</em>
              <br />
              for Stellar
            </h1>

            {/* Sub */}
            <p
              ref={subRef}
              className="text-[#475569] text-lg leading-relaxed max-w-md mb-10"
            >
              Build, deploy and monetize AI agents on Stellar. Every API call
              billed automatically via the{' '}
              <span className="text-[#B45309] font-medium">0x402 protocol</span>
              , every event streaming through QStash pub-sub.
            </p>

            {/* CTAs */}
            <div ref={ctaRef} className="flex flex-wrap gap-3">
              <Link
                href="/build"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#4F46E5] text-white text-sm font-semibold rounded-xl hover:bg-[#4338CA] transition-colors"
              >
                Start Building
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href="/agents"
                className="inline-flex items-center px-6 py-3.5 bg-white border border-[#E2E8F0] text-[#0A0E27] text-sm font-medium rounded-xl hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors"
              >
                Browse Marketplace
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center px-6 py-3.5 text-[#475569] text-sm hover:text-[#0A0E27] transition-colors"
              >
                Read Docs →
              </Link>
            </div>
          </div>

          {/* Right — visual */}
          <div ref={imageRef} className="relative">
            {/* Main card */}
            <div className="relative bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_40px_-12px_rgba(10,14,39,0.12)] overflow-hidden">
              {/* Header bar */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E2E8F0]">
                <span className="w-3 h-3 rounded-full bg-[#F5F6F8] border border-[#E2E8F0]" />
                <span className="w-3 h-3 rounded-full bg-[#F5F6F8] border border-[#E2E8F0]" />
                <span className="w-3 h-3 rounded-full bg-[#F5F6F8] border border-[#E2E8F0]" />
                <span className="ml-3 text-xs text-[#475569] font-mono">mev_bot / main.rs</span>
                <span className="ml-auto text-xs text-[#22c55e] flex items-center gap-1">
                  <span className="status-live" />
                  running
                </span>
              </div>

              {/* Code block */}
              <div className="p-6 font-mono text-[13px] leading-7 bg-[#FAFBFC]">
                <div><span className="text-[#475569]">{'// '}</span><span className="text-[#94a3b8]">Load wallet keypair from env</span></div>
                <div><span className="text-[#4F46E5]">let</span> <span className="text-[#0A0E27]">keypair</span> <span className="text-[#475569]">=</span> <span className="text-[#B45309]">Keypair::from_secret</span><span className="text-[#475569]">{'(&cfg.secret)?;'}</span></div>
                <div className="mt-2"><span className="text-[#475569]">{'// '}</span><span className="text-[#94a3b8]">0x402 auto-billing client</span></div>
                <div><span className="text-[#4F46E5]">let</span> <span className="text-[#0A0E27]">pay</span> <span className="text-[#475569]">=</span> <span className="text-[#B45309]">PaymentClient::new</span><span className="text-[#475569]">{'(keypair, &url)?;'}</span></div>
                <div className="mt-2"><span className="text-[#475569]">{'// '}</span><span className="text-[#94a3b8]">Run MEV strategy loop</span></div>
                <div><span className="text-[#B45309]">strategy::scan_loop</span><span className="text-[#475569]">{'(&cfg, &pay).'}</span><span className="text-[#4F46E5]">await</span></div>
              </div>

              {/* Live stats strip */}
              <div className="flex items-center gap-6 px-6 py-4 bg-white border-t border-[#E2E8F0]">
                <div className="text-center">
                  <div className="font-editorial text-2xl font-bold text-[#0A0E27]">1,247</div>
                  <div className="text-[10px] text-[#475569] uppercase tracking-wider mt-0.5">Agents</div>
                </div>
                <div className="w-px h-8 bg-[#E2E8F0]" />
                <div className="text-center">
                  <div className="font-editorial text-2xl font-bold text-[#0A0E27]">89k+</div>
                  <div className="text-[10px] text-[#475569] uppercase tracking-wider mt-0.5">Requests</div>
                </div>
                <div className="w-px h-8 bg-[#E2E8F0]" />
                <div className="text-center">
                  <div className="font-editorial text-2xl font-bold text-[#0A0E27]">12k</div>
                  <div className="text-[10px] text-[#475569] uppercase tracking-wider mt-0.5">XLM Earned</div>
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl border border-[#E2E8F0] shadow-[0_4px_16px_-4px_rgba(10,14,39,0.1)] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EEF0F5] flex items-center justify-center text-lg">⚡</div>
              <div>
                <div className="text-xs font-semibold text-[#0A0E27]">MEV Bot</div>
                <div className="text-[11px] text-[#22c55e]">+341 XLM today</div>
              </div>
            </div>

            {/* Floating accent card 2 */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl border border-[#E2E8F0] shadow-[0_4px_16px_-4px_rgba(10,14,39,0.1)] p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[rgba(79,70,229,0.08)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#4F46E5">
                  <circle cx="8" cy="8" r="3"/>
                  <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0A0E27]">0x402 Active</div>
                <div className="text-[11px] text-[#475569]">Auto-billing on</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] text-[#475569] tracking-widest uppercase">scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#475569] to-transparent" />
      </div>
    </section>
  );
}
