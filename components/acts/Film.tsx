"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FrameCanvas from "@/components/motion/FrameCanvas";
import { useFrameSequence } from "@/hooks/useFrameSequence";
import { useMotionProfile } from "@/hooks/useReducedMotion";
import { FRAME_PROFILES, type FrameProfile } from "@/lib/frames";
import { COMPANY, FILM_BEATS } from "@/lib/content";

/** Total runtime the timecode readout reports, in seconds. */
const RUNTIME = 30;

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * ACT I — THE FILM
 *
 * A pinned section whose scroll progress drives three things off ONE value:
 * the frame index, the timecode readout, and which editorial beat is on screen.
 * That shared source is the whole point — video and typography read as a single
 * coordinated timeline rather than two animation systems running side by side.
 *
 * Beats are windowed so each owns its own slice of the scroll range and fully
 * clears before its successor arrives. No two beats are ever legible at once.
 */
export default function Film() {
  const { reduced, coarse, ready } = useMotionProfile();
  const sectionRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const timecodeRef = useRef<HTMLSpanElement | null>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);

  const profile: FrameProfile | null = ready ? (coarse ? "mobile" : "desktop") : null;
  const { frames, ready: framesReady, progress: loadProgress } = useFrameSequence(profile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (framesReady) setLoaded(true);
  }, [framesReady]);

  /** Three beats on touch, four on desktop — see FILM_BEATS.mobile. */
  const beats = useMemo(
    () => (coarse ? FILM_BEATS.filter((b) => b.mobile) : FILM_BEATS),
    [coarse]
  );

  useEffect(() => {
    if (!ready) return;
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);

    // Reduced motion: park on a representative frame, show every beat as static
    // stacked text. The story is still fully readable with zero movement.
    if (reduced) {
      progressRef.current = 0.5;
      beatRefs.current.forEach((el) => {
        if (el) gsap.set(el, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", y: 0 });
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Touch users scroll less patiently: 300vh of pin instead of 500vh.
      const pinLength = coarse ? 3 : 5;

      // ONE timeline owns the pin, the scrub, the frame progress and every
      // beat. Beats cannot be separate ScrollTriggers on this section: once it
      // pins, its top stops moving relative to the viewport, so any trigger
      // keyed to it would sit frozen at progress 0 forever. Positioning the
      // beats inside the pinned timeline is what makes the film and the
      // typography a single coordinated timeline rather than two systems.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${pinLength * 100}%`,
          pin: true,
          pinSpacing: true,
          // scrub:1 gives a one-second catch-up. This single parameter is most
          // of what makes the sequence feel like it flows rather than snaps.
          scrub: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            if (timecodeRef.current) {
              timecodeRef.current.textContent = mmss(self.progress * RUNTIME);
            }
          },
        },
      });

      // One time unit per beat. Within its unit a beat reveals over the first
      // third, holds through the middle, and clears before the next arrives —
      // so the space between beats is silence, never overlap.
      beats.forEach((_, i) => {
        const el = beatRefs.current[i];
        if (!el) return;
        const lines = el.querySelectorAll<HTMLElement>(".line-inner");

        gsap.set(el, { opacity: 0 });
        gsap.set(lines, { yPercent: 110 });

        tl.to(el, { opacity: 1, duration: 0.04, ease: "none" }, i)
          .to(lines, { yPercent: 0, duration: 0.34, ease: "expo.out", stagger: 0.05 }, i)
          .to(
            lines,
            { yPercent: -110, duration: 0.24, ease: "power2.inOut", stagger: 0.04 },
            i + 0.70
          )
          .to(el, { opacity: 0, duration: 0.04, ease: "none" }, i + 0.93);
      });

      // Guarantee the timeline spans every beat's full unit.
      tl.to({}, { duration: 0.001 }, beats.length);
    }, section);

    return () => ctx.revert();
  }, [ready, reduced, coarse, beats]);

  const frameCount = profile ? FRAME_PROFILES[profile].count : 0;

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] w-full overflow-hidden bg-ink-950 grain vignette"
      aria-label="Alchemy and Waves — opening sequence"
    >
      <FrameCanvas
        profile={profile ?? "desktop"}
        frames={frames}
        progressRef={progressRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Beats. Real text in the DOM at all times — crawlers and no-JS readers
          get the full sequence; only the motion is client-side. */}
      <div className="pointer-events-none absolute inset-0 z-[4] flex items-center">
        <div className="w-full px-[var(--gutter)]">
          <div className="relative mx-auto max-w-[68rem]">
            {beats.map((beat, i) => (
              <div
                key={beat.id}
                ref={(el) => {
                  beatRefs.current[i] = el;
                }}
                data-beat={beat.id}
                className={i === 0 ? "relative" : "absolute inset-x-0 top-0"}
              >
                <h1 className="t-display text-bone-100">
                  {beat.lines.map((line, j) => (
                    <span key={j} className="line-mask">
                      <span className="line-inner">{line}</span>
                    </span>
                  ))}
                </h1>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The engineered layer: a readout driven by the same progress value as
          the frames. Cheap to build, and it does more than anything else to
          make the hero read as a machine rather than a decoration. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex items-end justify-between px-[var(--gutter)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <span className="t-monument text-[0.7rem] tracking-[0.3em] text-bone-300 sm:text-xs">
          {COMPANY.name}
        </span>
        <span className="t-meta flex items-center gap-2 sm:gap-3">
          <span>SEQ 01</span>
          <span aria-hidden className="text-bone-500/50">·</span>
          <span ref={timecodeRef} className="text-gold-500">00:00</span>
          <span aria-hidden className="text-bone-500/50">/</span>
          <span>{mmss(RUNTIME)}</span>
        </span>
      </div>

      {/* Loading state, honest about what it is doing. */}
      {!loaded && (
        <div className="absolute inset-0 z-[6] flex items-end justify-start px-[var(--gutter)] pb-24">
          <span className="t-meta">
            Loading sequence · {Math.round(loadProgress * frameCount)} frames
          </span>
        </div>
      )}
    </section>
  );
}
