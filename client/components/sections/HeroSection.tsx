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
    <section className="relative min-h-[100svh] bg-black font-sans text-white">
      {/* Full-screen video background (using existing sources but with a light overlay) */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-video-poster.jpg"
      >
        <source src="/background/Backgroundvideo.mp4" type="video/mp4" />
      </video>

      {/* Smooth white fade at the bottom to merge seamlessly with the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f2fbff] to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-center px-6 pt-24 pb-28 lg:px-12">
        
        {/* Main Center Content -> Right Aligned Content */}
        <div className="w-full flex-grow flex flex-col items-end justify-center text-right">
          {/* Subtle architectural rule / Subtitle */}
          <div className="mb-6 flex items-center justify-end gap-4">
            <span className="h-[1px] w-8 bg-white/30" />
            <span className="font-sans text-sm font-medium text-white/70 tracking-wide uppercase">
              Stellar-native agent infrastructure
            </span>
          </div>

          <h1 className="mb-10 font-sans text-5xl md:text-7xl lg:text-[5.5rem] font-medium leading-[1.05] tracking-[-0.03em] text-white">
            AI agents,<br />
              made to{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWordIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block pb-[0.25em] pr-2 bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8] bg-clip-text text-transparent whitespace-nowrap"
              >
                {dynamicWords[currentWordIndex]}
              </motion.span>
            </AnimatePresence>
          </h1>

          <div className="flex flex-wrap items-center justify-end gap-5 mt-4">
            <Link
              href="/build"
              className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition-all hover:bg-white/90"
            >
              Enter Forge
            </Link>
            <Link
              href="/agents"
              className="rounded-full border border-white/20 bg-black/20 backdrop-blur px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              Browse Legion
            </Link>
          </div>
        </div>

        {/* Bottom Stats Anchor (Matched to PRISM style, Right Aligned) */}
        <div className="flex flex-col md:flex-row justify-end gap-12 md:gap-24 pt-8 mt-auto w-full">
          {/* Stat 1 */}
          <div className="text-right">
            <div className="font-sans text-3xl md:text-4xl font-medium tracking-tight text-white">
              III
            </div>
            <div className="mt-2 font-sans text-xs font-medium text-white/60">
              Core / Alpha / Prime legions
            </div>
          </div>
          
          {/* Stat 2 */}
          <div className="text-right">
            <div className="font-sans text-3xl md:text-4xl font-medium tracking-tight text-white">
              $50k+
            </div>
            <div className="mt-2 font-sans text-xs font-medium text-white/60">
              Treasury flow
            </div>
          </div>

          {/* Stat 3 */}
          <div className="text-right">
            <div className="font-sans text-3xl md:text-4xl font-medium tracking-tight text-white">
              0x402
            </div>
            <div className="mt-2 font-sans text-xs font-medium text-white/60">
              Live revenue protocol
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
