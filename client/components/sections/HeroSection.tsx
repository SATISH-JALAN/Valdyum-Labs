'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const dynamicWords = ['conquer', 'yield', 'scale', 'trade'];

export default function HeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2500); // Change word every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100svh] bg-[#f2fbff] font-sans text-[#111111]">
      {/* Full-screen video background (using existing sources but with a light overlay) */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-video-poster.jpg"
      >
        <source src="/hero-loop.mp4" type="video/mp4" />
      </video>

      {/* Light/marble overlay gradients to ensure high contrast for text */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#f2fbff] via-[rgba(230,238,255,0.85)] to-[rgba(230,238,255,0.2)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,175,55,0.03),transparent_40%)]" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 pt-24 pb-28 lg:px-12">
        
        {/* Main Center Content */}
        <div className="w-full flex-grow flex flex-col items-center justify-center text-center">
          {/* Subtle architectural rule / Subtitle */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-[1px] w-8 bg-black/30" />
            <span className="font-sans text-sm font-medium text-black/60">
              Stellar-native agent infrastructure
            </span>
            <span className="h-[1px] w-8 bg-black/30" />
          </div>

          {/* Headline */}
          <h1 className="mb-10 font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-medium leading-[1.05] tracking-[-0.03em] text-[#111111]">
            AI agents,<br />
              made to{' '}
            <span className="relative inline-block min-w-[200px] md:min-w-[280px] text-left">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 inline-block bg-gradient-to-r from-[#111111] via-[#333333] to-[#666666] bg-clip-text text-transparent whitespace-nowrap"
                >
                  {dynamicWords[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
              {/* Invisible placeholder to maintain height and baseline */}
              <span className="invisible block">conquer</span>
            </span>
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-5 mt-4">
            <Link
              href="/build"
              className="rounded-full bg-[#111111] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-black"
            >
              Enter Forge
            </Link>
            <Link
              href="/agents"
              className="rounded-full border border-black/10 bg-white/50 backdrop-blur px-8 py-3.5 text-sm font-medium text-[#111111] transition-all hover:bg-white"
            >
              Browse Legion
            </Link>
          </div>
        </div>

        {/* Bottom Stats Anchor (Matched to PRISM style) */}
        <div className="flex flex-col md:flex-row justify-center gap-12 md:gap-24 border-t border-black/5 pt-8 mt-auto w-full">
          {/* Stat 1 */}
          <div className="text-center">
            <div className="font-sans text-3xl md:text-4xl font-medium tracking-tight text-[#111111]">
              III
            </div>
            <div className="mt-2 font-sans text-xs font-medium text-black/50">
              Core / Alpha / Prime legions
            </div>
          </div>
          
          {/* Stat 2 */}
          <div className="text-center">
            <div className="font-sans text-3xl md:text-4xl font-medium tracking-tight text-[#111111]">
              $50k+
            </div>
            <div className="mt-2 font-sans text-xs font-medium text-black/50">
              Treasury flow
            </div>
          </div>

          {/* Stat 3 */}
          <div className="text-center">
            <div className="font-sans text-3xl md:text-4xl font-medium tracking-tight text-[#111111]">
              0x402
            </div>
            <div className="mt-2 font-sans text-xs font-medium text-black/50">
              Live revenue protocol
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
