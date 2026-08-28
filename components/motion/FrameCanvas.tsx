"use client";

import { useEffect, useRef } from "react";
import { FRAME_PROFILES, type FrameProfile } from "@/lib/frames";

type Props = {
  profile: FrameProfile;
  frames: (ImageBitmap | HTMLImageElement | null)[];
  /** 0..1, written every tick by the scroll timeline. A ref, never state. */
  progressRef: React.RefObject<number>;
  className?: string;
};

/**
 * Draws the hero frame sequence to a canvas, cover-fitted, on rAF.
 *
 * Why a canvas sequence instead of scrubbing a <video> element:
 * Safari — iOS Safari especially — throttles and coalesces `currentTime` seeks,
 * so a scroll-scrubbed video stutters badly on exactly the devices most people
 * will use. Decoding a frame sequence to a canvas is frame-exact, identical in
 * every browser, and trivially reversible, so scrolling up genuinely runs the
 * film backwards.
 *
 * Nothing here touches React state — state per frame would re-render at 60fps.
 * Progress arrives through a ref and the draw loop reads it.
 */
export default function FrameCanvas({ profile, frames, progressRef, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawn = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { count } = FRAME_PROFILES[profile];
    let raf = 0;

    const resize = () => {
      // Cap DPR at 2: beyond that the cost is real and the gain is not.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      lastDrawn.current = -1; // force a redraw at the new size
    };

    /** Nearest loaded frame, so a not-yet-fetched index still draws something. */
    const resolve = (want: number) => {
      if (frames[want]) return frames[want];
      for (let r = 1; r < count; r++) {
        if (frames[want - r]) return frames[want - r];
        if (frames[want + r]) return frames[want + r];
      }
      return null;
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);

      const p = Math.min(1, Math.max(0, progressRef.current ?? 0));
      const index = Math.min(count - 1, Math.round(p * (count - 1)));
      if (index === lastDrawn.current) return;

      const bmp = resolve(index);
      if (!bmp) return;
      lastDrawn.current = index;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = "width" in bmp ? bmp.width : 0;
      const ih = "height" in bmp ? bmp.height : 0;
      if (!iw || !ih) return;

      // cover fit
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(bmp as CanvasImageSource, (cw - dw) / 2, (ch - dh) / 2, dw, dh);

      // Exposed for the Playwright verification pass to assert against.
      canvas.dataset.frame = String(index);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [frames, profile, progressRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
