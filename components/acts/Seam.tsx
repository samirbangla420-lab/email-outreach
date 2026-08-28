"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SEAM } from "@/lib/content";
import { useMotionProfile } from "@/hooks/useReducedMotion";

/**
 * ACT IV — THE SEAM
 *
 * The thematic centre, and the one place the whole idea is stated literally:
 * an inherited half above, an engineered half below, and a hairline of gold
 * where they meet that opens across the viewport as you scroll.
 *
 * This is the only section that uses --signal. Three appearances on the entire
 * page is what keeps it reading as a deliberate note rather than a brand colour.
 */
export default function Seam() {
  const ref = useRef<HTMLElement | null>(null);
  const { reduced, ready } = useMotionProfile();

  useEffect(() => {
    if (!ready || reduced) return;
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 55%", scrub: 1 },
      });

      // The seam draws open from the centre.
      tl.fromTo(".seam-rule", { scaleX: 0 }, { scaleX: 1, ease: "power2.inOut", duration: 1 }, 0)
        // The two halves separate around it.
        .fromTo(".seam-above", { y: 26 }, { y: -14, ease: "none", duration: 1 }, 0)
        .fromTo(".seam-below", { y: -26 }, { y: 14, ease: "none", duration: 1 }, 0)
        .fromTo(
          ".seam-line .line-inner",
          { yPercent: 110 },
          { yPercent: 0, ease: "expo.out", stagger: 0.08, duration: 0.5 },
          0.25
        );
    }, el);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-ink-950 px-[var(--gutter)] py-[clamp(7rem,20vh,15rem)] grain"
    >
      <div className="mx-auto max-w-[80rem]">
        <p className="t-meta mb-[clamp(3rem,8vh,6rem)]">{SEAM.label}</p>

        <div className="relative">
          {/* Inherited */}
          <div className="seam-above flex items-end justify-between pb-6">
            <span className="t-monument text-[clamp(1.75rem,7vw,5rem)] text-bone-100">
              {SEAM.above}
            </span>
            <span className="t-meta hidden sm:block">Above the line</span>
          </div>

          {/* The seam itself */}
          <div
            className="seam-rule h-px w-full origin-center"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-gold-500) 18%, var(--color-gold-300) 50%, var(--color-signal) 82%, transparent)",
            }}
            aria-hidden="true"
          />

          {/* Engineered */}
          <div className="seam-below flex items-start justify-between pt-6">
            <span
              className="t-monument text-[clamp(1.75rem,7vw,5rem)]"
              style={{ color: "var(--color-signal)" }}
            >
              {SEAM.below}
            </span>
            <span className="t-meta hidden sm:block">Below the line</span>
          </div>
        </div>

        <p className="seam-line t-display-sm mt-[clamp(4rem,12vh,9rem)] max-w-[52rem] text-bone-100">
          {SEAM.line.split(". ").map((s, i, arr) => (
            <span key={i} className="line-mask">
              <span className="line-inner">{s}{i < arr.length - 1 ? "." : ""}</span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
