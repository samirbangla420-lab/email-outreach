"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRINCIPLES } from "@/lib/content";
import { useMotionProfile } from "@/hooks/useReducedMotion";

/**
 * ACT V — PRINCIPLES
 *
 * The Swiss-precision counterweight to all the fresco: a numbered index, rules
 * that draw left to right, tabular figures. After four acts of atmosphere this
 * is where the group says plainly how it operates — and the change of register
 * is what stops the page reading as pure mood.
 */
export default function Principles() {
  const ref = useRef<HTMLElement | null>(null);
  const { reduced, ready } = useMotionProfile();

  useEffect(() => {
    if (!ready || reduced) return;
    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".principle-row").forEach((row) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: "top 86%", once: true },
        });
        tl.fromTo(
          row.querySelector(".principle-rule"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "expo.out" },
          0
        ).fromTo(
          row.querySelectorAll(".line-inner"),
          { yPercent: 110 },
          { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.05 },
          0.08
        );
      });
    }, el);

    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <section
      ref={ref}
      className="relative bg-ink-900 px-[var(--gutter)] py-[clamp(6rem,16vh,12rem)]"
    >
      <div className="mx-auto max-w-[80rem]">
        <p className="t-meta mb-[clamp(3rem,8vh,5rem)]">{PRINCIPLES.eyebrow}</p>

        <ol className="flex flex-col">
          {PRINCIPLES.items.map((item) => (
            <li key={item.n} className="principle-row relative pt-7 pb-8">
              <span
                className="principle-rule absolute left-0 top-0 h-px w-full origin-left"
                style={{ background: "var(--rule)" }}
                aria-hidden="true"
              />
              <div className="grid grid-cols-12 gap-x-6 gap-y-3">
                <span className="t-meta col-span-12 text-gold-500 sm:col-span-2">{item.n}</span>
                <h3 className="col-span-12 sm:col-span-5">
                  <span className="line-mask">
                    <span className="line-inner t-display-sm block text-[clamp(1.25rem,2.2vw,1.9rem)] text-bone-100">
                      {item.title}
                    </span>
                  </span>
                </h3>
                <p className="t-body col-span-12 sm:col-span-5">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
