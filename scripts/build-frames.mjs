/**
 * Builds the hero frame sequences that FrameCanvas scrubs through.
 *
 * Two modes, chosen automatically:
 *
 *   REAL   — if public/media/source.mp4 exists, ffmpeg extracts frames from it.
 *   SYNTH  — otherwise, frames are synthesized locally so the scroll engine can
 *            be built and verified before the footage lands. The synthetic
 *            sequence is deliberately legible: a slow push through stratified
 *            ink and gold, ancient above and engineered below.
 *
 * Swapping placeholder for real footage is therefore one command:
 *   cp <film>.mp4 public/media/source.mp4 && npm run frames
 */
import { existsSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "public/media/source.mp4");
const OUT = path.join(ROOT, "public/media/frames");

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
    strata += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="1.4" fill="#C9A227" opacity="${o.toFixed(3)}"/>`;
  }

  // Lattice below the horizon (the modern machinery).
  let lattice = "";
  const cols = 14;
  for (let i = 0; i <= cols; i++) {
    const x = (i / cols) * w;
    // Verticals converge toward the vanishing point as we push in.
    const x2 = cx + (x - cx) * (1 - ease * 0.34);
    lattice += `<line x1="${x.toFixed(1)}" y1="${h}" x2="${x2.toFixed(1)}" y2="${horizon.toFixed(1)}" stroke="#3E5C55" stroke-width="1" opacity="${(0.22 + ease * 0.16).toFixed(3)}"/>`;
  }
  for (let i = 1; i < 7; i++) {
    const y = horizon + ((h - horizon) * i) / 7;
    lattice += `<line x1="0" y1="${y.toFixed(1)}" x2="${w}" y2="${y.toFixed(1)}" stroke="#3E5C55" stroke-width="0.8" opacity="${(0.1 + ease * 0.08).toFixed(3)}"/>`;
  }

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="core" cx="${(cx / w).toFixed(4)}" cy="${(cy / h).toFixed(4)}" r="${(coreR / w).toFixed(4)}">
      <stop offset="0%" stop-color="#E4C767" stop-opacity="${coreO.toFixed(3)}"/>
      <stop offset="55%" stop-color="#C9A227" stop-opacity="${(coreO * 0.32).toFixed(3)}"/>
      <stop offset="100%" stop-color="#08070A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0E0D11"/>
      <stop offset="${((horizon / h) * 100).toFixed(1)}%" stop-color="#16151A"/>
      <stop offset="100%" stop-color="#08070A"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#ground)"/>
  <g transform="translate(${(w / 2).toFixed(1)} ${(h / 2).toFixed(1)}) scale(${scale.toFixed(4)}) translate(${(-w / 2).toFixed(1)} ${(-h / 2).toFixed(1)})">
    ${strata}
    ${lattice}
    <rect x="0" y="${horizon.toFixed(1)}" width="${w}" height="1.6" fill="#C9A227" opacity="${(0.4 + ease * 0.35).toFixed(3)}"/>
  </g>
  <rect width="${w}" height="${h}" fill="url(#core)"/>
  <rect width="${w}" height="${h}" fill="#08070A" opacity="${(0.3 - ease * 0.16).toFixed(3)}"/>
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
/* REAL                                                                */
/* ------------------------------------------------------------------ */

async function extract(profileName, p, ffmpegPath) {
  const dir = path.join(OUT, profileName);
  reset(dir);
  const tmp = path.join(ROOT, "scripts/.work", `frames-${profileName}`);
  reset(tmp);

  // Probe duration so we can request exactly `count` evenly spaced frames.
  const dur = Number(
    execFileSync(ffmpegPath, ["-i", SOURCE, "-hide_banner"], {
      stdio: ["ignore", "pipe", "pipe"],
    }).toString() || 0
  );

  // fps filter with an explicit output frame count is the reliable way to get
  // a fixed-length sequence regardless of source framerate.
  execFileSync(
    ffmpegPath,
    [
      "-y", "-i", SOURCE,
      "-vf", `scale=${p.width}:${p.height}:force_original_aspect_ratio=increase,crop=${p.width}:${p.height}`,
      "-frames:v", String(p.count),
      "-vsync", "0",
      path.join(tmp, "%04d.png"),
    ],
    { stdio: "ignore" }
  );

  const files = readdirSync(tmp).sort();
  for (let i = 0; i < Math.min(files.length, p.count); i++) {
    await sharp(path.join(tmp, files[i]))
      .webp({ quality: p.quality })
      .toFile(path.join(dir, `${pad(i)}.webp`));
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`  REAL  ${profileName}: ${Math.min(files.length, p.count)} frames @ ${p.width}x${p.height} (source ${dur || "?"}s)`);
}

/* ------------------------------------------------------------------ */

async function main() {
  mkdirSync(OUT, { recursive: true });
  const hasSource = existsSync(SOURCE);

  let ffmpegPath = null;
  if (hasSource) {
    ffmpegPath = (await import("ffmpeg-static")).default;
  }

  console.log(hasSource ? "Building frames from public/media/source.mp4" : "No source.mp4 — synthesizing placeholder frames");

  for (const [name, p] of Object.entries(PROFILES)) {
    if (hasSource) await extract(name, p, ffmpegPath);
    else await synth(name, p);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
