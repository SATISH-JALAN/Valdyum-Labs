'use client';

import { useState, useRef, useEffect } from 'react';

const FAQS = [
  {
    q: 'What is the 0x402 protocol?',
    a: 'The 0x402 protocol uses the HTTP 402 "Payment Required" status code to create a pay-per-request billing layer. When a client calls an agent API and lacks payment, the server returns a 402 with a Stellar payment challenge. The client automatically pays via XLM and retries — all handled by the SDK.',
  },
  {
    q: 'Do I need Solidity or EVM experience?',
    a: 'No. Valdyum agents are written in Rust using our production-grade SDK. Smart contracts on Soroban use Rust as well. If you know Rust, you can build on Valdyum. We provide six production-ready templates to get started in minutes.',
  },
  {
    q: 'How does QStash pub-sub work with agents?',
    a: 'Every agent event — payments, trades, chain events, billing — is published to Upstash QStash topics. QStash provides durable, at-least-once delivery with retry logic. Agents subscribe to relevant topics and react to events asynchronously.',
  },
  {
    q: 'What wallets are supported?',
    a: 'Valdyum integrates with Freighter, the leading Stellar browser wallet. You can connect your Freighter wallet to sign transactions, deploy agents, and receive XLM earnings directly to your Stellar account.',
  },
  {
    q: 'Is there a fee to deploy an agent?',
    a: 'Deploying an agent requires a small Stellar transaction fee (a few stroop of XLM). There are no platform fees from Valdyum. You keep 100% of the XLM your agents earn via the 0x402 protocol.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    async function animate() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(
        sectionRef.current?.querySelectorAll('.faq-item') ?? [],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
    }
    animate();
  }, []);

  function toggle(idx: number) {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  }

  return (
    <section ref={sectionRef} className="py-24 bg-[#FAFBFC]">
      <div className="max-w-content mx-auto px-6">

        {/* Header */}
        <div className="max-w-lg mb-14">
          <span className="section-label">Questions</span>
          <h2 className="font-editorial text-[42px] md:text-[52px] leading-[1.1] font-bold text-[#0A0E27] mt-3">
            Frequently asked
          </h2>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-[#E2E8F0] border-t border-[#E2E8F0]">
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between py-6 text-left gap-6 group"
                aria-expanded={openIdx === i}
              >
                <span className="text-[#0A0E27] font-medium text-base group-hover:text-[#4F46E5] transition-colors">
                  {faq.q}
                </span>
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#475569] transition-all"
                  style={{
                    transform: openIdx === i ? 'rotate(45deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
              </button>
              <div
                ref={(el) => { answerRefs.current[i] = el; }}
                style={{
                  maxHeight: openIdx === i ? '400px' : '0',
                  opacity: openIdx === i ? 1 : 0,
                  transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
                  overflow: 'hidden',
                }}
              >
                <p className="pb-6 text-[#475569] text-base leading-relaxed max-w-2xl">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
