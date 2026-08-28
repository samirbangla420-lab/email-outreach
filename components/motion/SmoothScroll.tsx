"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionProfile } from "@/hooks/useReducedMotion";

/**
 * Bridges Lenis and GSAP so exactly one clock drives everything.
 *
 * Two deliberate decisions:
 *
 * 1. Lenis is DISABLED on touch. Native momentum scrolling on iOS and Android
 *    is better than any JS lerp — it is hardware-accelerated and it matches
 *    what the user's thumb expects. Forcing a lerp on top of it produces the
 *    slightly-detached feeling that makes sites feel cheap on a phone.
 *
 * 2. Lenis is DISABLED under prefers-reduced-motion, because hijacking scroll
 *    is itself a motion effect.
 *
 * In both cases ScrollTrigger falls back to native scroll and every scrubbed
 * animation still works — just without the smoothing.
 */
export default function SmoothScroll() {
  const { reduced, coarse, ready } = useMotionProfile();

  useEffect(() => {
    if (!ready) return;

    gsap.registerPlugin(ScrollTrigger);

    if (reduced || coarse) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // GSAP's lag smoothing fights Lenis's own interpolation; one smoother only.
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reduced, coarse, ready]);

  return null;
}
