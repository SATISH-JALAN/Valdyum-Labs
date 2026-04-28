'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const LIVE_EVENTS = [
  { type: 'payment', label: 'MEV Bot paid 0.42 XLM via 0x402', time: 'just now', color: '#B45309' },
  { type: 'trade',   label: 'Arb Tracker executed XLM/USDC swap', time: '2s ago', color: '#4F46E5' },
  { type: 'deploy',  label: 'New agent deployed: LiquidityBot_v2', time: '8s ago', color: '#16a34a' },
  { type: 'payment', label: 'Relayer forwarded 0x402 challenge', time: '14s ago', color: '#B45309' },
  { type: 'event',   label: 'QStash published 18 trade events', time: '22s ago', color: '#0369a1' },
  { type: 'trade',   label: 'MEV Bot scanned 1,240 order books', time: '35s ago', color: '#4F46E5' },
];

const EVENT_ICONS: Record<string, string> = {
  payment: '💳',
  trade:   '⚡',
  deploy:  '🚀',
  event:   '📡',
};

export default function LiveForge() {
  const sectionRef = useRef<HTMLElement>(null);
  const [events, setEvents] = useState(LIVE_EVENTS);

  // Simulate live updates
  useEffect(() => {
    const phrases = [
      { type: 'payment', label: 'Mempool Monitor charged 0.12 XLM', color: '#B45309' },
      { type: 'trade',   label: 'Trading Bot executed DCA buy order', color: '#4F46E5' },
      { type: 'event',   label: 'QStash delivered 42 payment events', color: '#0369a1' },
    ];
    let idx = 0;
    const timer = setInterval(() => {
      const next = phrases[idx % phrases.length];
      idx++;
      setEvents((prev) => [
        { ...next, time: 'just now' },
        ...prev.slice(0, 5).map((e) => ({
          ...e,
          time: e.time === 'just now' ? '2s ago' : e.time,
        })),
      ]);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    async function animate() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        sectionRef.current?.querySelector('.forge-header') ?? null,
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
        sectionRef.current?.querySelectorAll('.forge-col') ?? [],
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );
    }
    animate();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#F5F6F8]">
      <div className="max-w-content mx-auto px-6">

        {/* Header */}
        <div className="forge-header mb-14">
          <span className="section-label">Live Forge</span>
          <h2 className="font-editorial text-[42px] md:text-[52px] leading-[1.1] font-bold text-[#0A0E27] mt-3">
            Real-time network activity
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Live feed col */}
          <div className="forge-col lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-sm text-[#0A0E27]">Network Feed</h3>
              <span className="flex items-center gap-1.5 text-xs text-[#22c55e]">
                <span className="status-live" />
                live
              </span>
            </div>
            <div className="divide-y divide-[#F5F6F8]">
              {events.slice(0, 6).map((evt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-6 py-4 first:animate-pulse"
                  style={i === 0 ? { animationDuration: '2s', animationIterationCount: '1' } : {}}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: evt.color + '10' }}
                  >
                    {EVENT_ICONS[evt.type] ?? '●'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0A0E27] leading-snug">{evt.label}</p>
                    <span className="text-[11px] text-[#94a3b8] mt-0.5 block">{evt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code preview col */}
          <div className="forge-col lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#E2E8F0]">
              <span className="w-3 h-3 rounded-full bg-[#F5F6F8] border border-[#E2E8F0]" />
              <span className="w-3 h-3 rounded-full bg-[#F5F6F8] border border-[#E2E8F0]" />
              <span className="w-3 h-3 rounded-full bg-[#F5F6F8] border border-[#E2E8F0]" />
              <span className="ml-2 text-xs text-[#475569] font-mono">mev_bot / src / main.rs</span>
            </div>
            <pre className="p-6 overflow-x-auto text-[13px] leading-7 font-mono bg-[#FAFBFC] flex-1">
<code><span className="text-[#475569]">use </span><span className="text-[#0A0E27]">common::</span><span className="text-[#4F46E5]">{"{"}</span><span className="text-[#0A0E27]">HorizonClient, Keypair, PaymentClient</span><span className="text-[#4F46E5]">{"}"}</span><span className="text-[#94a3b8]">;</span>{"\n"}
<span className="text-[#94a3b8]">{"// "}</span><span className="text-[#94a3b8]">Load wallet from secret key</span>{"\n"}
<span className="text-[#475569]">let </span><span className="text-[#0A0E27]">keypair</span> <span className="text-[#94a3b8]">=</span> <span className="text-[#B45309]">Keypair::from_secret</span><span className="text-[#4F46E5]">(</span><span className="text-[#94a3b8]">&cfg.secret</span><span className="text-[#4F46E5]">)</span><span className="text-[#94a3b8]">?;</span>{"\n\n"}
<span className="text-[#94a3b8]">{"// "}</span><span className="text-[#94a3b8]">0x402 auto-billing ↔ Stellar payment</span>{"\n"}
<span className="text-[#475569]">let </span><span className="text-[#0A0E27]">pay</span> <span className="text-[#94a3b8]">=</span> <span className="text-[#B45309]">PaymentClient::new</span><span className="text-[#4F46E5]">(</span><span className="text-[#94a3b8]">keypair.clone(), &url</span><span className="text-[#4F46E5]">)</span><span className="text-[#94a3b8]">?;</span>{"\n\n"}
<span className="text-[#94a3b8]">{"// "}</span><span className="text-[#94a3b8]">Scan DEX order books & execute MEV</span>{"\n"}
<span className="text-[#B45309]">strategy::scan_loop</span><span className="text-[#4F46E5]">(&cfg, &pay)</span><span className="text-[#94a3b8]">.</span><span className="text-[#475569]">await</span></code>
            </pre>
            <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center gap-4">
              <Link
                href="/docs/sdk"
                className="text-[11px] text-[#4F46E5] font-medium link-indigo"
              >
                Full SDK docs →
              </Link>
              <span className="text-[#E2E8F0]">·</span>
              <Link
                href="/build"
                className="text-[11px] text-[#475569] hover:text-[#0A0E27] transition-colors"
              >
                Use template →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
