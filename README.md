# Alchemy & Waves Group Ltd

A scroll-driven editorial homepage for a private holding group.

**Direction — "The Seam":** ancient knowledge above, modern machinery below,
and the interest lives on the line where they meet. Michelangelo-fresco art
direction, ink/gold/bone palette, aphoristic copy, Swiss-precision typography
as the counterweight.

## Running

```bash
npm install
npm run frames   # build the hero frame sequences (see below)
npm run dev      # http://localhost:3000
```

## The hero film

Act I is a pinned section whose scroll progress drives the frame index, the
timecode readout and the editorial beats from **one** value, so the film and
the typography read as a single timeline rather than two animation systems.

It scrubs a **canvas frame sequence**, not a `<video>` element. Scrubbing a
video via `currentTime` stutters badly in Safari — iOS especially — because
seeks are throttled and coalesced. Decoding frames to a canvas is frame-exact,
identical across browsers and trivially reversible, so scrolling up genuinely
runs the film backwards.

`npm run frames` has two modes and picks automatically:

| Condition | Behaviour |
| --- | --- |
| `public/media/source.mp4` exists | ffmpeg extracts real frames from it |
| It does not | Placeholder frames are synthesized locally |

**To drop in the real footage:**

```bash
cp your-film.mp4 public/media/source.mp4
npm run frames
```

Nothing else changes. Frame counts and sizes live in `lib/frames.ts`, which is
the single source of truth shared by the build script, the preloader and the
canvas.

## Editing the copy

Every string on the site is in **`lib/content.ts`**. Rewrite there; no
component needs to be touched.

Placeholders currently awaiting real values: `COMPANY.email`,
`COMPANY.companyNumber`, `COMPANY.registeredOffice`.

## Verification

```bash
npm run verify   # requires the dev server to be running
```

Drives a real browser at 1440×900, 390×844 and 320px and asserts the things a
build cannot: that the frame index advances on scroll down and *decreases* on
scroll up, that each editorial beat is legible only in its own window, that
never more than one pillar shows at a time, that nothing overflows
horizontally, and that the page is fully readable under
`prefers-reduced-motion`. Screenshots land in `verification/`.

## Desktop vs mobile

Adapted, not scaled. Mobile uses 60 frames at 720×1280 instead of 150 at
1440×810, a 300vh hero pin instead of 500vh, three beats instead of four, a
vertical pillar stack instead of the pinned numeral swap, and **native
scrolling** — Lenis is disabled on touch, because hardware momentum beats a JS
lerp on a phone every time.

## Motion rules

One easing family (`expo.out` in, `power2.inOut` for scrubs) — no bounce, no
elastic. No opacity-only fades: text enters through masked line reveals.
Nothing runs on a timer; every animation is scroll-linked or a one-shot
`onEnter`. `prefers-reduced-motion` disables Lenis and resolves every animation
to its end state.
