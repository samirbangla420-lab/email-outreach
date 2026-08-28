/**
 * Builds the hero frame sequences that FrameCanvas scrubs through.
 *
 * Three modes, in priority order, chosen automatically:
 *
 *   VIDEO — public/media/source.mp4 exists: ffmpeg extracts frames from it.
 *   PLATE — public/media/hero-plate.png (or .jpg) exists: a slow cinematic push
 *           and drift is rendered FROM THE STILL. One painting becomes a real
 *           scroll-driven camera move, which is most of the cinematic feeling
 *           at none of the cost or risk of generated video — and it stays
 *           frame-exact and reversible like any other sequence.
 *   SYNTH — neither: abstract placeholder frames, so the scroll engine can be
 *           built and verified before any art exists.
 *
 * So going live is one command, whichever asset you end up with:
 *   cp painting.png public/media/hero-plate.png && npm run frames
 *   cp film.mp4     public/media/source.mp4     && npm run frames
 */
import { existsSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MEDIA = path.join(ROOT, "public/media");

/**
 * Any video dropped in public/media counts, whatever it is called. Requiring an
 * exact filename means an upload that lands as
 * "hf_20260828_023920_1379faab….mp4" silently builds a site with no hero, and
 * the person who uploaded it has no way to tell.
 */
const SOURCE = (() => {
  if (!existsSync(MEDIA)) return null;
  const vid = readdirSync(MEDIA)
    .filter((f) => /\.(mp4|mov|webm|m4v)$/i.test(f))
    .sort();
  return vid.length ? path.join(MEDIA, vid[0]) : null;
})();
const OUT = path.join(ROOT, "public/media/frames");

/** First existing still, in preference order. */
const PLATE = ["hero-plate.png", "hero-plate.jpg", "hero-plate.jpeg", "hero-plate.webp"]
  .map((f) => path.join(MEDIA, f))
  .find((f) => existsSync(f));

/** Must stay in sync with FRAME_COUNTS in lib/frames.ts. */
const PROFILES = {
  desktop: { count: 150, width: 1440, height: 810, quality: 72 },
  mobile: { count: 60, width: 720, height: 1280, quality: 68 },
};

const pad = (n) => String(n).padStart(4, "0");

function reset(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

/* ------------------------------------------------------------------ */
/* SYNTH                                                               */
/* ------------------------------------------------------------------ */

/**
 * One frame of the placeholder film as an SVG.
 * `t` runs 0 -> 1 across the sequence.
 */
function synthFrame(t, w, h) {
  const ease = t * t * (3 - 2 * t); // smoothstep: mimics a camera easing in

  // The horizon between "ancient above" and "engineered below" rises as we push in.
  const horizon = h * (0.72 - ease * 0.22);
  // Warm core light drifts across and swells.
  const cx = w * (0.5 + Math.sin(ease * Math.PI) * 0.11);
  const cy = horizon - h * 0.1;
  const coreR = w * (0.18 + ease * 0.3);
  const coreO = 0.16 + ease * 0.24;
  // Scale: the whole plate pushes forward.
  const scale = 1 + ease * 0.16;

  // Strata above the horizon (classical registers).
  let strata = "";
  for (let i = 0; i < 7; i++) {
    const y = horizon - (i + 1) * (horizon / 8) - ease * 14 * (i + 1);
    const o = 0.05 + i * 0.012;
    strata += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="1.4" fill="#CCA42B" opacity="${o.toFixed(3)}"/>`;
  }

  // Lattice below the horizon (the modern machinery).
  let lattice = "";
  const cols = 14;
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * w;
    // Verticals converge toward the vanishing point as we push in.
    const x2 = cx + (x - cx) * (1 - ease * 0.34);
    lattice += `<line x1="${x.toFixed(1)}" y1="${h}" x2="${x2.toFixed(1)}" y2="${horizon.toFixed(1)}" stroke="#3C6058" stroke-width="1" opacity="${(0.22 + ease * 0.16).toFixed(3)}"/>`;
  }
  for (let i = 1; i < 7; i++) {
    const y = horizon + ((h - horizon) * i) / 7;
    lattice += `<line x1="0" y1="${y.toFixed(1)}" x2="${w}" y2="${y.toFixed(1)}" stroke="#3C6058" stroke-width="0.8" opacity="${(0.1 + ease * 0.08).toFixed(3)}"/>`;
  }

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="core" cx="${(cx / w).toFixed(4)}" cy="${(cy / h).toFixed(4)}" r="${(coreR / w).toFixed(4)}">
      <stop offset="0%" stop-color="#E8CD72" stop-opacity="${coreO.toFixed(3)}"/>
      <stop offset="55%" stop-color="#CCA42B" stop-opacity="${(coreO * 0.32).toFixed(3)}"/>
      <stop offset="100%" stop-color="#07090F" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070910"/>
      <stop offset="${((horizon / h) * 100).toFixed(1)}%" stop-color="#132330"/>
      <stop offset="100%" stop-color="#0B0E16"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#ground)"/>
  <g transform="translate(${(w / 2).toFixed(1)} ${(h / 2).toFixed(1)}) scale(${scale.toFixed(4)}) translate(${(-w / 2).toFixed(1)} ${(-h / 2).toFixed(1)})">
    ${strata}
    ${lattice}
    <rect x="0" y="${horizon.toFixed(1)}" width="${w}" height="1.6" fill="#CCA42B" opacity="${(0.4 + ease * 0.35).toFixed(3)}"/>
  </g>
  <rect width="${w}" height="${h}" fill="url(#core)"/>
  <rect width="${w}" height="${h}" fill="#07090F" opacity="${(0.3 - ease * 0.16).toFixed(3)}"/>
</svg>`);
}

async function synth(profileName, p) {
  const dir = path.join(OUT, profileName);
  reset(dir);
  for (let i = 0; i < p.count; i++) {
    const t = p.count === 1 ? 0 : i / (p.count - 1);
    await sharp(synthFrame(t, p.width, p.height))
      .webp({ quality: p.quality })
      .toFile(path.join(dir, `${pad(i)}.webp`));
  }
  console.log(`  SYNTH ${profileName}: ${p.count} frames @ ${p.width}x${p.height}`);
}

/* ------------------------------------------------------------------ */
/* PLATE — a camera move rendered from one still                       */
/* ------------------------------------------------------------------ */

/**
 * Renders a slow push-in with a gentle lateral drift by cropping a shrinking
 * window out of the source image and resizing each crop to the output size.
 *
 * The move is deliberately small — a 14% push over the whole sequence. A still
 * pushed harder than that starts to reveal that it is a still: edges soften and
 * the lack of parallax becomes obvious. Under-moving reads as a locked-off
 * cinema camera, which is what we want.
 */
async function plate(profileName, p) {
  const dir = path.join(OUT, profileName);
  reset(dir);

  const meta = await sharp(PLATE).metadata();
  const SW = meta.width;
  const SH = meta.height;
  const outAspect = p.width / p.height;

  // Largest window of the output's aspect ratio that fits in the source.
  let baseW = SW;
  let baseH = Math.round(SW / outAspect);
  if (baseH > SH) {
    baseH = SH;
    baseW = Math.round(SH * outAspect);
  }

  const PUSH = 0.14; // total zoom over the sequence
  const DRIFT = 0.05; // lateral travel, as a fraction of the slack available

  for (let i = 0; i < p.count; i++) {
    const t = p.count === 1 ? 0 : i / (p.count - 1);
    const ease = t * t * (3 - 2 * t); // smoothstep, so the move settles at both ends

    const scale = 1 - PUSH * ease;
    const w = Math.max(2, Math.round(baseW * scale));
    const h = Math.max(2, Math.round(baseH * scale));

    // Centre the window, then drift it. Clamp so we never crop outside the image.
    const slackX = SW - w;
    const slackY = SH - h;
    const left = Math.round(Math.min(slackX, Math.max(0, slackX / 2 + slackX * DRIFT * (ease - 0.5) * 2)));
    const top = Math.round(Math.min(slackY, Math.max(0, slackY / 2 - slackY * DRIFT * (ease - 0.5))));

    await sharp(PLATE)
      .extract({ left, top, width: w, height: h })
      .resize(p.width, p.height, { fit: "fill", kernel: "lanczos3" })
      .webp({ quality: p.quality })
      .toFile(path.join(dir, `${pad(i)}.webp`));
  }
  console.log(`  PLATE ${profileName}: ${p.count} frames @ ${p.width}x${p.height} (from ${SW}x${SH})`);
}

/* ------------------------------------------------------------------ */
/* VIDEO                                                               */
/* ------------------------------------------------------------------ */

async function extract(profileName, p, ffmpegPath) {
  const dir = path.join(OUT, profileName);
  reset(dir);
  const tmp = path.join(ROOT, "scripts/.work", `frames-${profileName}`);
  reset(tmp);

  // Decode every frame straight to the output size as JPEG. Probing duration
  // first is tempting but `ffmpeg -i` reports to stderr and exits non-zero, so
  // it throws rather than returning a number; decoding everything and then
  // sampling evenly is both simpler and exact, and JPEG at the target size
  // keeps the intermediate small enough for the session disk allowance.
  execFileSync(
    ffmpegPath,
    [
      "-y", "-loglevel", "error", "-i", SOURCE,
      "-vf", `scale=${p.width}:${p.height}:force_original_aspect_ratio=increase,crop=${p.width}:${p.height}`,
      "-q:v", "3",
      path.join(tmp, "%05d.jpg"),
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  const decoded = readdirSync(tmp).sort();
  if (!decoded.length) throw new Error(`ffmpeg produced no frames from ${SOURCE}`);

  // Map the p.count output slots evenly across whatever was decoded, so the
  // sequence always spans the full clip regardless of its framerate or length.
  for (let i = 0; i < p.count; i++) {
    const src = decoded[Math.min(decoded.length - 1, Math.round((i / (p.count - 1)) * (decoded.length - 1)))];
    await sharp(path.join(tmp, src))
      .webp({ quality: p.quality })
      .toFile(path.join(dir, `${pad(i)}.webp`));
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`  VIDEO ${profileName}: ${p.count} frames @ ${p.width}x${p.height} (sampled from ${decoded.length} decoded)`);
}

/* ------------------------------------------------------------------ */

async function main() {
  mkdirSync(OUT, { recursive: true });
  const hasSource = Boolean(SOURCE);

  let ffmpegPath = null;
  if (hasSource) {
    ffmpegPath = (await import("ffmpeg-static")).default;
  }

  const mode = hasSource ? "VIDEO" : PLATE ? "PLATE" : "SYNTH";
  console.log(
    mode === "VIDEO"
      ? `Building frames from ${path.relative(ROOT, SOURCE)}`
      : mode === "PLATE"
        ? `Rendering a camera move from ${path.relative(ROOT, PLATE)}`
        : "No video or hero-plate in public/media — synthesizing placeholder frames"
  );

  for (const [name, p] of Object.entries(PROFILES)) {
    if (mode === "VIDEO") await extract(name, p, ffmpegPath);
    else if (mode === "PLATE") await plate(name, p);
    else await synth(name, p);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
