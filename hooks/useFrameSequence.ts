"use client";

import { useEffect, useRef, useState } from "react";
import { FRAME_PROFILES, framePath, type FrameProfile } from "@/lib/frames";

const PRIORITY_COUNT = 12; // frames that must exist before we call the hero ready
const STRIDE = 8; // coarse pass interval, so the whole arc is watchable early

type Sequence = {
  frames: (ImageBitmap | HTMLImageElement | null)[];
  ready: boolean;
  progress: number;
};

async function load(src: string): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap decodes off the main thread — the difference between a
  // hero that stutters while loading and one that doesn't.
  if (typeof createImageBitmap === "function") {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`frame ${src}: ${res.status}`);
    return createImageBitmap(await res.blob());
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Progressive frame loader.
 *
 * Order matters: the first PRIORITY_COUNT frames block "ready" so the hero
 * paints almost immediately, then every 8th frame fills in so scrubbing far
 * ahead already shows roughly the right image, then the gaps close. The user
 * never watches a blank canvas and never scrubs into a hole.
 */
export function useFrameSequence(profile: FrameProfile | null) {
  const [state, setState] = useState<Sequence>({ frames: [], ready: false, progress: 0 });
  const cancelled = useRef(false);

  useEffect(() => {
    if (!profile) return;
    cancelled.current = false;

    const { count } = FRAME_PROFILES[profile];
    const frames: (ImageBitmap | HTMLImageElement | null)[] = new Array(count).fill(null);
    let done = 0;

    const order: number[] = [];
    for (let i = 0; i < Math.min(PRIORITY_COUNT, count); i++) order.push(i);
    for (let i = 0; i < count; i += STRIDE) if (!order.includes(i)) order.push(i);
    for (let i = 0; i < count; i++) if (!order.includes(i)) order.push(i);

    let readyAnnounced = false;

    (async () => {
      // Priority frames in parallel; the long tail sequentially so we never
      // saturate the connection and delay the frames actually on screen.
      await Promise.all(
        order.slice(0, PRIORITY_COUNT).map(async (i) => {
          try {
            frames[i] = await load(framePath(profile, i));
            done++;
          } catch {
            /* a missing frame must not break the hero */
          }
        })
      );
      if (cancelled.current) return;
      readyAnnounced = true;
      setState({ frames: [...frames], ready: true, progress: done / count });

      for (const i of order.slice(PRIORITY_COUNT)) {
        if (cancelled.current) return;
        try {
          frames[i] = await load(framePath(profile, i));
          done++;
        } catch {
          /* ignore */
        }
        if (done % 10 === 0) setState({ frames: [...frames], ready: true, progress: done / count });
      }
      if (!cancelled.current) setState({ frames: [...frames], ready: true, progress: 1 });
    })();

    return () => {
      cancelled.current = true;
      if (readyAnnounced) {
        for (const f of frames) if (f && "close" in f) (f as ImageBitmap).close();
      }
    };
  }, [profile]);

  return state;
}
