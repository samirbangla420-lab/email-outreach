"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SEAM } from "@/lib/content";
import { useMotionProfile } from "@/hooks/useReducedMotion";

/**
 * ACT V — THE SEAM. The engineered peak of the page.
 *
 * Everything before this act moves only when the wheel moves. This is the one
 * place the page moves because the *visitor* moved, and it is the whole reason
 * the two acts in front of it are deliberately quiet: complicity needs
 * stillness to be a change from.
 *
 * THE SIGNATURE MOVE — "the seam takes a side".
 *
 * The pointer's horizontal position drives a single value, `bias`, running -1
 * at the far left to +1 at the far right. That one value moves everything at
 * once: the plate warms toward amber and drifts toward the ancient world on the
 * left, cools toward ultramarine and the built world on the right, the two
 * words trade weight, and the seam's own light slides to sit under the cursor.
 *
 * It is bespoke to this page, not a retuned kit effect, and it is the company's
 * thesis made operable: the visitor cannot look at this page without taking a
 * position between inherited knowledge and new machinery.
 *
 * Touch has no hover, so there the bias is driven by scroll progress through
 * the act instead: the same journey, played rather than steered. Both routes
 * write the same CSS custom property, so there is one visual system, not two.
 */
export default function Seam() {
  const ref = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const { reduced, coarse, ready } = useMotionProfile();

  useEffect(() => {
    if (!ready) return;
    const el = ref.current;
    const stage = stageRef.current;
    if (!el || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    // Reduced motion: park at dead centre. Both worlds legible, nothing moving.
    if (reduced) {
      stage.style.setProperty("--bias", "0");
      gsap.set([".seam-rule"], { scaleX: 1 });
      gsap.set(".seam-line .line-inner", { yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Entrance. The seam draws open, the halves part around it.
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 60%", scrub: 1 },
        })
        .fromTo(".seam-rule", { scaleX: 0 }, { scaleX: 1, ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(".seam-above", { y: 26 }, { y: -14, ease: "none", duration: 1 }, 0)
        .fromTo(".seam-below", { y: -26 }, { y: 14, ease: "none", duration: 1 }, 0)
        .fromTo(
          ".seam-line .line-inner",
          { yPercent: 110 },
          { yPercent: 0, ease: "expo.out", stagger: 0.08, duration: 0.5 },
          0.25
        );
    }, el);

    /* ---- the signature move ---- */

    // Written to a CSS variable and read by every biased property, so the
    // pointer path and the touch path drive one system rather than two.
    const state = { bias: 0 };
    const apply = () => stage.style.setProperty("--bias", state.bias.toFixed(4));
    apply();

    let cleanup: () => void;

    if (coarse) {
      // No pointer on touch: the act plays its own arc as you scroll it,
      // travelling the full width of the idea once.
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          // 0..1 -> -1..1, so the middle of the act is the balance point.
          state.bias = self.progress * 2 - 1;
          apply();
        },
      });
      cleanup = () => st.kill();
    } else {
      // Lerped, not bound directly: a raw pointer value snaps and reads cheap.
      // The easing is what makes the page feel like it is deciding.
      const quick = gsap.quickTo(state, "bias", {
        duration: 0.7,
        ease: "power3.out",
        onUpdate: apply,
      });
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        quick(gsap.utils.clamp(-1, 1, ((e.clientX - r.left) / r.width) * 2 - 1));
      };
      // Returning to centre on leave means the act resets for the next visitor
      // to the section rather than staying stuck at whichever edge they exited.
      const onLeave = () => quick(0);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanup = () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    }

    return () => {
      ctx.revert();
      cleanup();
    };
  }, [ready, reduced, coarse]);

  return (
    <section
      ref={ref}
      /* The peak holds the largest span on the page by a visible margin. */
      data-sc-act="seam"
      data-sc-verify-state="peak"
      className="relative overflow-hidden bg-ink-950 px-[var(--gutter)] py-[clamp(9rem,30vh,22rem)] grain"
    >
      {/* Every biased property reads --bias from this element. */}
      <div ref={stageRef} className="seam-stage relative mx-auto max-w-[80rem]">
        {/* The ground itself takes a side. */}
        <div className="seam-wash" aria-hidden="true" />

        <div className="relative">
          <div className="seam-above flex items-end justify-between pb-6">
            <span className="seam-word seam-word-a t-monument text-[clamp(1.75rem,7vw,5rem)]">
              {SEAM.above}
            </span>
            <span className="t-meta hidden sm:block">Above the line</span>
          </div>

          <div className="seam-rule-wrap relative">
            <div className="seam-rule h-px w-full origin-center" aria-hidden="true" />
            {/* The light in the seam slides to sit under the cursor. */}
            <div className="seam-spark" aria-hidden="true" />
          </div>

          <div className="seam-below flex items-start justify-between pt-6">
            <span className="seam-word seam-word-b t-monument text-[clamp(1.75rem,7vw,5rem)]">
              {SEAM.below}
            </span>
            <span className="t-meta hidden sm:block">Below the line</span>
          </div>
        </div>

        <p className="seam-line t-display-sm mt-[clamp(4rem,12vh,9rem)] max-w-[52rem] text-bone-100" data-sc-copy="">
          {SEAM.line.split(". ").map((s, i, arr) => (
            <span key={i} className="line-mask">
              <span className="line-inner">
                {s}
                {i < arr.length - 1 ? "." : ""}
              </span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
