"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PILLARS } from "@/lib/content";
import { useMotionProfile } from "@/hooks/useReducedMotion";
import RevealText, { Line } from "@/components/motion/RevealText";

/**
 * ACT III — THE THREE PILLARS
 *
 * Desktop: a pinned stack. An enormous Roman numeral holds the left column and
 * counts I → II → III while the content swaps beside it, so the section reads
 * as one continuous idea with three movements rather than three cards.
 *
 * Touch: a plain vertical stack with per-card reveals. Pinning a horizontal or
 * swapping panel on touch fights the browser's own scroll and always loses;
 * the honest vertical version is better on a phone, not a compromise.
 */
export default function Pillars() {
  const ref = useRef<HTMLElement | null>(null);
  const { reduced, coarse, ready } = useMotionProfile();

  useEffect(() => {
    if (!ready || reduced || coarse) return;
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".pillar-panel");
      const numerals = gsap.utils.toArray<HTMLElement>(".pillar-numeral");

      // As in Act I: one timeline owns the pin AND the swaps. Separate
      // ScrollTriggers keyed to this section would freeze the instant it pins,
      // leaving all three panels stacked on top of one another.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          // 100vh of scroll per pillar left long stretches where a single
          // crossfade was the only thing happening, which reads as dead scroll.
          // 72vh keeps each swap continuously in motion.
          end: `+=${panels.length * 72}%`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
        },
      });

      panels.forEach((panel, i) => {
        const first = i === 0;
        gsap.set(panel, { opacity: first ? 1 : 0, y: first ? 0 : 48 });
        gsap.set(numerals[i], { opacity: first ? 1 : 0, y: first ? 0 : 40 });
      });

      // One time unit per transition, so the numeral and its panel always move
      // together — the numeral is the section's index, not decoration.
      panels.forEach((panel, i) => {
        if (i === 0) return;
        const at = i - 1;
        tl.to(panels[i - 1], { opacity: 0, y: -48, duration: 0.45, ease: "power2.inOut" }, at + 0.15)
          .to(numerals[i - 1], { opacity: 0, y: -40, duration: 0.45, ease: "power2.inOut" }, at + 0.15)
          .to(panel, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, at + 0.5)
          .to(numerals[i], { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, at + 0.5);
      });

      // A short hold so the last pillar lands rather than snapping away. A full
      // unit here left a third of the pin with nothing happening, which the
      // verification pass correctly read as dead scroll.
      tl.to({}, { duration: 0.15 }, panels.length - 1);
    }, el);

    return () => ctx.revert();
  }, [ready, reduced, coarse]);

  /* ---- Touch / reduced motion: honest vertical stack ---- */
  if (ready && (coarse || reduced)) {
    return (
      <section data-sc-act="pillars" className="relative bg-ink-900 px-[var(--gutter)] py-[clamp(5rem,12vh,9rem)]">
        <div className="flex flex-col gap-[clamp(4rem,10vh,7rem)]">
          {PILLARS.map((p) => (
            <article key={p.numeral} className="border-t rule pt-8">
              <span className="t-monument block text-gold-500 text-[clamp(2.5rem,12vw,4rem)] leading-none">
                {p.numeral}
              </span>
              <RevealText as="h2" className="t-display-sm mt-6 text-bone-100">
                <Line>{p.name}</Line>
              </RevealText>
              <p className="t-body mt-3 text-bone-300 italic">{p.lede}</p>
              <p className="t-body mt-5">{p.body}</p>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                {p.meta.map((m) => (
                  <li key={m} className="t-meta">{m}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    );
  }

  /* ---- Desktop: pinned numeral stack ---- */
  return (
    <section
      ref={ref}
      data-sc-act="pillars"
      className="relative h-[100svh] overflow-hidden bg-ink-900 px-[var(--gutter)]"
    >
      <div className="mx-auto flex h-full max-w-[80rem] items-center">
        <div className="grid w-full grid-cols-12 gap-8">
          {/* Numeral column */}
          <div className="col-span-4 relative h-[16rem]">
            {PILLARS.map((p) => (
              <span
                key={p.numeral}
                className="pillar-numeral t-monument absolute inset-0 flex items-center text-gold-500"
                style={{ fontSize: "clamp(6rem, 14vw, 13rem)", lineHeight: 1 }}
                aria-hidden="true"
              >
                {p.numeral}
              </span>
            ))}
          </div>

          {/* Content column */}
          <div className="col-span-8 relative min-h-[22rem]">
            {PILLARS.map((p, i) => (
              <article
                key={p.numeral}
                className={`pillar-panel ${i === 0 ? "relative" : "absolute inset-x-0 top-0"}`}
                data-pillar={p.name}
              >
                <p className="t-meta">
                  Discipline {p.numeral}
                </p>
                <h2 className="t-display-sm mt-5 text-bone-100">{p.name}</h2>
                <p className="t-body mt-4 max-w-xl text-bone-300 italic">{p.lede}</p>
                <p className="t-body mt-6 max-w-xl">{p.body}</p>
                <ul className="mt-9 flex flex-wrap gap-x-8 gap-y-2 border-t rule pt-5">
                  {p.meta.map((m) => (
                    <li key={m} className="t-meta">{m}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
