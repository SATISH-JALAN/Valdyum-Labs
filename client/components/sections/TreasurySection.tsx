'use client';

import { useEffect, useRef } from 'react';

const METRICS = [
  {
    label: 'Legions Active',
    value: 1247,
    suffix: '',
    desc: 'Agents deployed on testnet',
    accent: '#4F46E5',
  },
  {
    label: 'Forum Activity',
    value: 89432,
    suffix: '',
    desc: 'Total protocol requests served',
    accent: '#B45309',
  },
  {
    label: 'Treasury Growth',
    value: 12450,
    suffix: '',
    desc: 'XLM earned by agent builders',
    accent: '#0369a1',
  },
  {
    label: 'Forge Ops',
    value: 342,
    suffix: '',
    desc: 'Active builders on the network',
    accent: '#7c3aed',
  },
];

export default function TreasurySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function animate() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Header reveal
      gsap.fromTo(
        sectionRef.current?.querySelector('.treasury-header') ?? null,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );

      // Cards reveal
      gsap.fromTo(
        sectionRef.current?.querySelectorAll('.metric-card') ?? [],
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      );

      // Counter animations
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        METRICS.forEach((metric, i) => {
          const el = counterRefs.current[i];
          if (!el) return;

          const obj = { val: 0 };
          gsap.to(obj, {
            val: metric.value,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
            onUpdate() {
              el.textContent = Math.ceil(obj.val).toLocaleString();
            },
          });
        });
      }
    }

    animate();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#F5F6F8]">
      <div className="max-w-content mx-auto px-6">

        {/* Header */}
        <div className="treasury-header flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-lg">
            <span className="section-label">Treasury</span>
            <h2 className="font-editorial text-[42px] md:text-[52px] leading-[1.1] font-bold text-[#0A0E27] mt-3">
              Protocol by the numbers
            </h2>
          </div>
          <p className="text-[#475569] text-sm max-w-xs leading-relaxed">
            Real metrics from the Valdyum network, updated in real-time from the Stellar ledger.
          </p>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {METRICS.map((metric, i) => (
            <div
              key={metric.label}
              className="metric-card bg-white rounded-2xl border border-[#E2E8F0] p-7 flex flex-col gap-3"
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: metric.accent }}
              >
                {metric.label}
              </span>
              <div className="font-editorial text-[48px] leading-none font-bold text-[#0A0E27] tabular-nums">
                <span
                  ref={(el) => { counterRefs.current[i] = el; }}
                >
                  {metric.value.toLocaleString()}
                </span>
                {metric.suffix}
              </div>
              <p className="text-[#475569] text-sm leading-snug">{metric.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
