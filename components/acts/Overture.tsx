"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { COMPANY } from "@/lib/content";
import { useMotionProfile } from "@/hooks/useReducedMotion";

/**
 * ACT 0 — OVERTURE
 *
 * Hard-capped at 1.6s and dismissible on any input. A preloader that holds the
 * page hostage is the single most common way a "premium" site becomes an
 * annoying one, so this never blocks: the page beneath is already interactive,
 * and the curtain is purely a lift.
 */
export default function Overture() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);
  const { reduced, ready } = useMotionProfile();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (reduced) {
      setDone(true);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    document.body.style.overflow = "hidden";

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setDone(true);
      },
    });

    tl.to(root.querySelectorAll(".ov-line"), {
      yPercent: 0,
      duration: 0.9,
      ease: "expo.out",
      stagger: 0.06,
    })
      .to(
        counter,
        {
          v: 100,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
            }
          },
        },
        0
      )
      .to(root, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, 1.2);

    // Any input dismisses immediately.
    const skip = () => tl.progress(1);
    window.addEventListener("wheel", skip, { once: true, passive: true });
    window.addEventListener("touchstart", skip, { once: true, passive: true });
    window.addEventListener("keydown", skip, { once: true });

    return () => {
      document.body.style.overflow = "";
      tl.kill();
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [ready, reduced]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-950 grain"
    >
      <div className="overflow-hidden">
        <span className="ov-line t-monument block translate-y-full text-[clamp(1.1rem,3vw,2rem)] text-bone-100">
          {COMPANY.name}
        </span>
      </div>
      <div className="mt-6 overflow-hidden">
        <span className="ov-line t-meta block translate-y-full">
          <span ref={countRef}>000</span> / {COMPANY.founded}
        </span>
      </div>
    </div>
  );
}
