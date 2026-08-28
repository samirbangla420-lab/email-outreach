/**
 * Frame sequence geometry. Kept in one place because three things must agree:
 * the build script that writes the files, the preloader that fetches them, and
 * the canvas that draws them. A mismatch here is a silently broken hero.
 */
export const FRAME_PROFILES = {
  desktop: { count: 150, width: 1440, height: 810 },
  mobile: { count: 60, width: 720, height: 1280 },
} as const;

export type FrameProfile = keyof typeof FRAME_PROFILES;

export const framePath = (profile: FrameProfile, i: number) =>
  `/media/frames/${profile}/${String(i).padStart(4, "0")}.webp`;
