"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { THESIS } from "@/lib/content";
import { useMotionProfile } from "@/hooks/useReducedMotion";

/**
 * ACT II — THE THESIS
 *
 * The statement resolves word by word, tied to scroll position rather than
 * fired on enter. The reader is pulling the sentence into focus themselves,
 * which slows them down to roughly reading speed — the pacing device that
 * makes a long editorial page feel composed instead of skimmed.
 */
export default function Thesis() {
  const ref = useRef<HTMLElement | null>(null);
  const { reduced, ready } = useMotionProfile();

  useEffect(() => {
    if (!ready || reduced) return;
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);
    const words = el.querySelectorAll<HTMLElement>(".th-word");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: {
            trigger: el,
            start: "top 72%",
            end: "bottom 62%",
            scrub: 1,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section
      ref={ref}
      data-sc-act="thesis"
      className="relative bg-ink-950 px-[var(--gutter)] py-[clamp(7rem,18vh,14rem)]"
    >
      <div className="mx-auto max-w-[72rem]">
        <p className="t-display-sm text-bone-100" data-sc-copy="">
          {THESIS.statement.split(" ").map((w, i) => (
            <span key={i} className="th-word inline-block">
              {w}
              {" "}
            </span>
          ))}
        </p>
        <p className="t-meta mt-[clamp(2.5rem,6vh,4.5rem)] max-w-md normal-case tracking-[0.14em]">
          {THESIS.footnote}
        </p>
      </div>
    </section>
  );
}
