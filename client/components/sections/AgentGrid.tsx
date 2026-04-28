'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

const AGENTS = [
  {
    icon: '⚡',
    title: 'MEV Bot',
    desc: 'Front-running & sandwich detection on Stellar DEX order books with sub-500ms latency.',
    tag: 'HIGH FREQ',
    accent: '#B45309',
    href: '/build?template=mev_bot',
  },
  {
    icon: '🔺',
    title: 'Arbitrage Tracker',
    desc: 'Triangular & cross-path arbitrage across Stellar DEX with automated execution.',
    tag: 'ARBITRAGE',
    accent: '#4F46E5',
    href: '/build?template=arb_tracker',
  },
  {
    icon: '👁',
    title: 'Mempool Monitor',
    desc: 'Real-time Stellar transaction stream analysis via Horizon SSE with configurable alerts.',
    tag: 'MONITORING',
    accent: '#0369a1',
    href: '/build?template=mempool_monitor',
  },
  {
    icon: '📈',
    title: 'Trading Bot',
    desc: 'Buy / sell / short strategies with grid & DCA modes, stop-loss, and take-profit.',
    tag: 'TRADING',
    accent: '#16a34a',
    href: '/build?template=trading_bot',
  },
  {
    icon: '🔀',
    title: 'Relayer',
    desc: 'Fee-bump transaction relay with 0x402 micropayment charging. Gasless UX for end users.',
    tag: 'RELAY',
    accent: '#dc2626',
    href: '/build?template=relayer',
  },
  {
    icon: '💧',
    title: 'Liquidity Tracker',
    desc: 'Order-book depth analysis with real-time slippage simulation across configurable pairs.',
    tag: 'DEFI',
    accent: '#0891b2',
    href: '/build?template=liquidity_tracker',
  },
];

export default function AgentGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    async function animate() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        sectionRef.current?.querySelector('.agent-grid-header') ?? null,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        sectionRef.current?.querySelectorAll('.agent-card') ?? [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.09,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
        }
      );
    }
    animate();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#FAFBFC]">
      <div className="max-w-content mx-auto px-6">

        {/* Header */}
        <div className="agent-grid-header flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="section-label">Agent SDK Templates</span>
            <h2 className="font-editorial text-[42px] md:text-[52px] leading-[1.1] font-bold text-[#0A0E27] mt-3">
              Production-grade Rust agents
            </h2>
          </div>
          <p className="text-[#475569] text-sm max-w-xs leading-relaxed">
            Battle-hardened templates with 0x402 billing, QStash events, and Stellar wallet signing baked in.
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENTS.map((agent) => (
            <Link key={agent.title} href={agent.href} className="block">
              <div className="agent-card group bg-white rounded-2xl border border-[#E2E8F0] p-7 h-full relative overflow-hidden hover:border-transparent">
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                  style={{ background: agent.accent }}
                />

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <span className="text-3xl">{agent.icon}</span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                    style={{
                      color: agent.accent,
                      borderColor: agent.accent + '30',
                      background: agent.accent + '0a',
                    }}
                  >
                    {agent.tag}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl font-bold text-[#0A0E27] mb-2">
                  {agent.title}
                </h3>
                <p className="text-[#475569] text-sm leading-relaxed">{agent.desc}</p>

                <div
                  className="mt-6 flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all"
                  style={{ color: agent.accent }}
                >
                  Use template
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
