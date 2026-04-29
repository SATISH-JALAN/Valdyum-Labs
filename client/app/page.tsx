'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import LiveFeed from '@/components/LiveFeed';
import ProtocolFlow from '@/components/ProtocolFlow';
import HeroSection from '@/components/sections/HeroSection';

// ── Data ──────────────────────────────────────────────────────────────────────

const AGENT_TEMPLATES = [
  {
    icon:  '⚡',
    title: 'MEV Bot',
    desc:  'Front-running & sandwich detection on Stellar DEX order books with sub-500ms latency.',
    tag:   'HIGH FREQ',
    color: 'from-[#00FFE5]/10 to-transparent',
    border:'border-[rgba(0,255,229,0.15)]',
    href:  '/build?template=mev_bot',
  },
  {
    icon:  '🔺',
    title: 'Arbitrage Tracker',
    desc:  'Triangular & cross-path arbitrage across Stellar DEX with automated execution.',
    tag:   'ARBITRAGE',
    color: 'from-[#7b61ff]/10 to-transparent',
    border:'border-[rgba(123,97,255,0.15)]',
    href:  '/build?template=arb_tracker',
  },
  {
    icon:  '👁',
    title: 'Mempool Monitor',
    desc:  'Real-time Stellar transaction stream analysis via Horizon SSE with configurable alerts.',
    tag:   'MONITORING',
    color: 'from-[#f59e0b]/10 to-transparent',
    border:'border-[rgba(245,158,11,0.15)]',
    href:  '/build?template=mempool_monitor',
  },
  {
    icon:  '📈',
    title: 'Trading Bot',
    desc:  'Buy / sell / short strategies with grid & DCA modes, stop-loss, and take-profit.',
    tag:   'TRADING',
    color: 'from-[#4ade80]/10 to-transparent',
    border:'border-[rgba(74,222,128,0.15)]',
    href:  '/build?template=trading_bot',
  },
  {
    icon:  '🔀',
    title: 'Relayer',
    desc:  'Fee-bump transaction relay with 0x402 micropayment charging. Gasless UX for end users.',
    tag:   'RELAY',
    color: 'from-[#f87171]/10 to-transparent',
    border:'border-[rgba(248,113,113,0.15)]',
    href:  '/build?template=relayer',
  },
  {
    icon:  '💧',
    title: 'Liquidity Tracker',
    desc:  'Order-book depth analysis with real-time slippage simulation across configurable pairs.',
    tag:   'DEFI',
    color: 'from-[#38bdf8]/10 to-transparent',
    border:'border-[rgba(56,189,248,0.15)]',
    href:  '/build?template=liquidity_tracker',
  },
];

const PROTOCOL_FEATURES = [
  {
    icon:  '💳',
    title: '0x402 Protocol',
    desc:  'HTTP 402 pay-per-request. Every agent API call automatically handles the challenge → Stellar payment → retry dance.',
    color: 'text-[#f59e0b]',
  },
  {
    icon:  '🔀',
    title: 'QStash Pub-Sub',
    desc:  'All agent events stream through 8 Upstash QStash topics — payments, trades, chain events, billing.',
    color: 'text-[#4ade80]',
  },
  {
    icon:  '⛓️',
    title: 'Soroban On-Chain',
    desc:  'Agent identities and earnings are anchored on Stellar via Soroban smart contracts.',
    color: 'text-[#7b61ff]',
  },
  {
    icon:  '🦀',
    title: 'Rust SDK',
    desc:  'Six production-grade agent templates in Rust — gas-optimised, async, fully typed.',
    color: 'text-[#00FFE5]',
  },
];

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity:    1,
    y:          0,
    transition: { delay: i * 0.09, duration: 0.55, ease: 'easeOut' as const },
  }),
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#111111] overflow-x-hidden">
      <HeroSection />

      {/* ── CORE ARCHITECTURE (PRISM-STYLE) ────────────────────────────── */}
      <section className="w-full bg-[#fafafa] min-h-screen flex flex-col justify-center border-t border-black/5 relative z-10">
        <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 py-12">
          
          {/* Top Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="h-[1px] w-8 bg-black/30" />
                <span className="font-sans text-sm font-medium text-black/50">
                  Core Architecture
                </span>
              </div>
              
              <h2 className="font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-[#111111] leading-[0.95]">
                0x402 × QStash<br/>
                <span className="text-black/30">× Stellar.</span>
              </h2>
            </div>

            <div className="lg:max-w-md pb-2">
              <p className="text-lg font-medium text-black/50 leading-relaxed">
                The complete payment-to-execution pipeline powering every agent interaction. 
                Gasless UX, fully verified, all on-chain.
              </p>
            </div>
          </div>

          {/* The Huge Card Section */}
          <div className="relative border border-black/10 flex flex-col lg:flex-row overflow-hidden bg-white rounded-3xl">
            
            {/* Left Text Content */}
            <div className="p-8 md:p-12 flex flex-col lg:w-[50%] relative z-10 bg-white/80 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
              <div className="font-mono text-[11px] text-black/30 mb-6 tracking-[0.2em]">01</div>
              
              <h3 className="font-sans text-3xl md:text-4xl font-medium mb-4 tracking-tight text-[#111111]">
                Execution Pipeline
              </h3>
              
              <p className="font-sans text-base text-black/60 mb-8 max-w-md leading-relaxed">
                Five core components orchestrate the lifecycle of an agent. From the initial 
                HTTP 402 challenge, to Stellar payment verification, to QStash event broadcasting.
              </p>

              {/* The 5 Steps */}
              <div className="flex flex-col gap-3 mb-10">
                {[
                  { title: 'Agent SDK', desc: 'Rust / 0x402 client' },
                  { title: '0x402 Protocol', desc: 'HTTP 402 → Stellar TX' },
                  { title: 'Platform API', desc: 'Next.js · Soroban verify' },
                  { title: 'QStash Pub-Sub', desc: 'Upstash · 8 topics' },
                  { title: 'Dashboard', desc: 'Real-time · Ably' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    <span className="font-sans font-semibold text-[#111111] text-sm md:text-[15px]">{step.title}</span>
                    <span className="font-sans text-sm text-black/40">—</span>
                    <span className="font-sans text-sm md:text-[15px] text-black/50">{step.desc}</span>
                  </div>
                ))}
              </div>
              
              {/* Bottom Stat */}
              <div className="mt-auto">
                <div className="text-4xl md:text-5xl font-sans font-medium mb-2 text-[#111111]">
                  5
                </div>
                <div className="font-mono text-[10px] text-black/40 uppercase tracking-[0.2em]">
                  core pipeline stages
                </div>
              </div>
            </div>

            {/* Right Image Container */}
            <div 
              className="absolute top-0 right-0 bottom-0 w-full lg:w-[65%] pointer-events-none"
              style={{ 
                maskImage: 'linear-gradient(to right, transparent 0%, black 35%)', 
                WebkitMaskImage: '-webkit-linear-gradient(left, transparent 0%, black 35%)' 
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" 
                alt="Architecture Concept"
                className="w-full h-full object-cover object-left opacity-90 mix-blend-multiply"
              />
            </div>
            
          </div>
        </div>
      </section>

      {/* ── AGENT TEMPLATES ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="font-mono text-[11px] text-[#7b61ff] tracking-[0.25em] uppercase">
            Agent SDK Templates
          </span>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-white mt-3">
            Production-Grade Rust Agents
          </h2>
          <p className="text-white/40 font-mono text-sm mt-4 max-w-xl mx-auto">
            Battle-hardened templates with 0x402 billing, QStash events, gas optimisation,
            and Stellar wallet signing baked in.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENT_TEMPLATES.map((tmpl, i) => (
            <motion.div
              key={tmpl.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link href={tmpl.href} className="block h-full group">
                <div
                  className={`h-full p-6 rounded-2xl border ${tmpl.border} bg-gradient-to-br ${tmpl.color} hover:brightness-110 transition-all duration-300 relative overflow-hidden`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{tmpl.icon}</span>
                    <span className="font-mono text-[9px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded tracking-widest">
                      {tmpl.tag}
                    </span>
                  </div>

                  <h3 className="font-syne text-lg font-bold text-white mb-2">{tmpl.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{tmpl.desc}</p>

                  <div className="mt-5 flex items-center gap-1.5 font-mono text-xs text-[#00FFE5] group-hover:gap-3 transition-all">
                    Use template <span>→</span>
                  </div>

                  {/* Hover shimmer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-white/[0.03] to-transparent" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LIVE FEED + CODE PREVIEW ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Live feed — 2 cols */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="font-mono text-[11px] text-[#4ade80] tracking-[0.2em] uppercase">
                Live Network
              </span>
              <h3 className="font-syne text-2xl font-bold text-white mt-1">
                Real-Time Activity
              </h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <LiveFeed />
            </motion.div>
          </div>

          {/* Code preview — 3 cols */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <span className="font-mono text-[11px] text-[#7b61ff] tracking-[0.2em] uppercase">
                SDK Preview
              </span>
              <h3 className="font-syne text-2xl font-bold text-white mt-1">
                Three Lines to Go Live
              </h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-white/[0.07] bg-[rgba(5,5,8,0.9)] backdrop-blur overflow-hidden font-mono text-sm"
            >
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f87171] opacity-70" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] opacity-70" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] opacity-70" />
                <span className="ml-3 text-[11px] text-white/20">mev_bot / src / main.rs</span>
              </div>

              <pre className="p-5 overflow-x-auto text-[13px] leading-7">
<code><span className="text-[#7b61ff]">use</span> <span className="text-white/80">common::</span><span className="text-[#00FFE5]">{"{"}</span><span className="text-white">HorizonClient, Keypair, PaymentClient, KafkaPublisher</span><span className="text-[#00FFE5]">{"}"}</span><span className="text-white/40">;</span>{"\n"}
<span className="text-white/40">{"// "}</span><span className="text-white/30">Load wallet from secret key (Strkey S...)</span>{"\n"}
<span className="text-[#7b61ff]">let</span> <span className="text-white">keypair</span> <span className="text-white/40">=</span> <span className="text-[#4ade80]">Keypair::from_secret</span><span className="text-[#00FFE5]">(</span><span className="text-white/50">&cfg.agent_secret</span><span className="text-[#00FFE5]">)</span><span className="text-white/40">?;</span>{"\n\n"}
<span className="text-white/40">{"// "}</span><span className="text-white/30">0x402 client — auto-handles HTTP 402 ↔ Stellar payment</span>{"\n"}
<span className="text-[#7b61ff]">let</span> <span className="text-white">pay</span> <span className="text-white/40">=</span> <span className="text-[#4ade80]">PaymentClient::new</span><span className="text-[#00FFE5]">(</span><span className="text-white/80">keypair.clone(), &horizon_url, &passphrase</span><span className="text-[#00FFE5]">)</span><span className="text-white/40">?;</span>{"\n\n"}
<span className="text-white/40">{"// "}</span><span className="text-white/30">Kafka publisher — fire-and-forget trade events</span>{"\n"}
<span className="text-[#7b61ff]">let</span> <span className="text-white">kafka</span> <span className="text-white/40">=</span> <span className="text-[#4ade80]">KafkaPublisher::from_env</span><span className="text-[#00FFE5]">()</span><span className="text-white/40">;</span>{"\n\n"}
<span className="text-white/40">{"// "}</span><span className="text-white/30">Run — scans order books, executes MEV, publishes events</span>{"\n"}
<span className="text-[#4ade80]">strategy::scan_loop</span><span className="text-[#00FFE5]">(&cfg, &horizon, &keypair, &pay, &kafka)</span><span className="text-white/40">.</span><span className="text-[#7b61ff]">await</span></code>
              </pre>

              <div className="px-5 pb-4 flex items-center gap-3">
                <Link href="/docs/sdk" className="font-mono text-[11px] text-[#00FFE5] hover:underline">
                  Full SDK docs →
                </Link>
                <span className="text-white/10">·</span>
                <Link href="/build" className="font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors">
                  Use template →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-white/[0.08] overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,255,229,0.05)] via-[rgba(123,97,255,0.05)] to-[rgba(0,0,0,0.8)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-[#00FFE5]/40 to-transparent" />

          <div className="relative px-8 py-14 text-center">
            <span className="font-mono text-[11px] text-[#00FFE5] tracking-[0.25em] uppercase">
              Ship Today
            </span>
            <h2 className="font-syne text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4">
              From idea to on-chain revenue<br className="hidden md:block" /> in minutes.
            </h2>
            <p className="text-white/40 font-mono text-sm mb-10 max-w-lg mx-auto">
              Connect your Freighter wallet, pick a Rust template, configure strategy params,
              deploy on Soroban — and start earning XLM per request automatically via 0x402.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/build"
                className="group relative px-10 py-4 font-mono text-sm font-bold rounded-xl overflow-hidden text-black"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#00FFE5] to-[#00ccb8]" />
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative">Start Building →</span>
              </Link>
              <Link
                href="/agents"
                className="px-10 py-4 font-mono text-sm font-medium border border-white/10 text-white/50 rounded-xl hover:text-white hover:border-white/20 transition-all"
              >
                Browse Agents
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
