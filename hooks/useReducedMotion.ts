"use client";

import { useEffect, useState } from "react";

/**
 * Two capability signals the whole site branches on.
 *
 * `coarse` is deliberately pointer-based rather than width-based: a touch
 * laptop should get the touch treatment, and a narrow desktop window should
 * not. Width alone gets both wrong.
 */
export function useMotionProfile() {
  const [profile, setProfile] = useState({ reduced: false, coarse: false, ready: false });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse), (max-width: 768px)");

    const sync = () =>
      setProfile({ reduced: reduce.matches, coarse: coarse.matches, ready: true });

    sync();
    reduce.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
    };
  }, []);

  return profile;
}
