'use client';

import { useEffect } from 'react';

/**
 * Initialise Lenis smooth scrolling and wire it up with GSAP ScrollTrigger.
 * Only runs on the client. Reduced-motion users get native scroll.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let lenis: import('lenis').default | null = null;
    let gsapTickerCb: ((time: number) => void) | null = null;

    async function init() {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      // Sync Lenis with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      gsapTickerCb = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(gsapTickerCb);
      gsap.ticker.lagSmoothing(0);
    }

    init();

    return () => {
      lenis?.destroy();
      if (gsapTickerCb) {
        import('gsap').then(({ gsap }) => {
          if (gsapTickerCb) gsap.ticker.remove(gsapTickerCb);
        });
      }
    };
  }, []);
}
