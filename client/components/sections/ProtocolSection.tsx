'use client';

import { useEffect, useRef } from 'react';

const FEATURES = [
  {
    label: 'Payment Layer',
    title: '0x402 Protocol',
    desc: 'HTTP 402 pay-per-request. Every agent API call automatically handles the challenge → Stellar payment → retry dance. No billing code required.',
    accent: '#B45309',
    icon: '💳',
  },
  {
    label: 'Event Streaming',
    title: 'QStash Pub-Sub',
    desc: 'All agent events stream through Upstash QStash topics — payments, trades, chain events, billing. Durable, at-least-once delivery.',
    accent: '#4F46E5',
    icon: '⚡',
  },
  {
    label: 'Smart Contracts',
    title: 'Soroban On-Chain',
    desc: 'Agent identities and earnings are anchored on Stellar via Soroban smart contracts. Trustless, immutable, verifiable.',
    accent: '#0369a1',
    icon: '⛓',
  },
];

export default function ProtocolSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    async function animate() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        sectionRef.current?.querySelectorAll('.protocol-card') ?? [],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      gsap.fromTo(
        sectionRef.current?.querySelector('.protocol-header') ?? null,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
    }
    animate();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#FAFBFC]">
      <div className="max-w-content mx-auto px-6">

        {/* Header */}
        <div className="protocol-header mb-16 max-w-xl">
          <span className="section-label">Core Protocol</span>
          <h2 className="font-editorial text-[42px] md:text-[52px] leading-[1.1] font-bold text-[#0A0E27] mt-3">
            Three pillars that power every agent
          </h2>
          <p className="text-[#475569] text-base leading-relaxed mt-4">
            The complete payment-to-execution pipeline. Composable, auditable, and running live on Stellar.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="protocol-card relative bg-white rounded-2xl border border-[#E2E8F0] p-8 overflow-hidden group hover:shadow-[0_8px_32px_-8px_rgba(10,14,39,0.1)] transition-shadow"
            >
              {/* Left accent border */}
              <div
                className="absolute left-0 top-8 bottom-8 w-[3px] rounded-r-full"
                style={{ background: feat.accent }}
              />

              <div className="text-3xl mb-5">{feat.icon}</div>

              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: feat.accent }}
              >
                {feat.label}
              </span>

              <h3 className="font-editorial text-2xl font-bold text-[#0A0E27] mt-2 mb-3">
                {feat.title}
              </h3>
              <p className="text-[#475569] text-sm leading-relaxed">{feat.desc}</p>

              <a
                href="/docs"
                className="mt-6 inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0A0E27] transition-colors"
              >
                Learn more
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
