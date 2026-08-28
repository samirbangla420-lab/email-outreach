"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionProfile } from "@/hooks/useReducedMotion";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds, for staggering sibling blocks. */
  delay?: number;
  as?: "div" | "h1" | "h2" | "h3" | "p";
};

/**
 * The site's single text entrance mechanic: a masked line reveal.
 *
 * Each line sits in an overflow-hidden wrapper and slides up from beneath its
 * own mask. No opacity-only fades appear anywhere on this site — a fade is the
 * default every generic landing page reaches for, and it reads as absence of
 * decision. A masked reveal reads as typesetting.
 *
 * Lines are split manually rather than with SplitText so the markup stays
 * semantic and server-rendered: the text is in the DOM for crawlers and for
 * no-JS readers, and we only wrap it on the client.
 */
export default function RevealText({ children, className, delay = 0, as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const { reduced, ready } = useMotionProfile();

  useEffect(() => {
    if (!ready || reduced) return;
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);
    const inners = el.querySelectorAll<HTMLElement>(".line-inner");
    if (!inners.length) return;

    const ctx = gsap.context(() => {
      gsap.set(inners, { yPercent: 108 });
      gsap.to(inners, {
        yPercent: 0,
        duration: 1.15,
        delay,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced, ready, delay]);

  const Tag = as;
  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  );
}

/** One masked line. Compose these inside RevealText. */
export function Line({ children }: { children: React.ReactNode }) {
  return (
    <span className="line-mask">
      <span className="line-inner">{children}</span>
    </span>
  );
}
