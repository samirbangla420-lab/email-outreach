# Hero media

The hero sequence is built from **one source asset** that lives in this folder.
`scripts/build-frames.mjs` reads it and writes the frame sets the page scrubs
through. Those frames are generated, so they are gitignored — this file is not.

## Drop your asset here

Whichever you have, name it exactly:

| File | What happens |
| --- | --- |
| `source.mp4` | Frames are extracted from the video. Takes priority if both exist. |
| `hero-plate.png` (or `.jpg` / `.webp`) | A slow push-in and drift is rendered **from the still**, giving a real scroll-driven camera move from a single image. |
| *neither* | Abstract placeholder frames are synthesized, so the site still runs. |

Then:

```bash
npm run frames   # or just `npm run dev` / `npm run build`, which call it
```

Nothing else needs changing. `lib/frames.ts` holds the frame counts and sizes
if you ever want to tune them — it is the single source of truth shared by the
build script, the preloader and the canvas.

## Uploading from the GitHub web UI

On the repo page: **Add file → Upload files**, then drag the image in while
viewing this folder. Commit to the working branch, not `main`.

## A note on size

A 2K still is ~3–6 MB and is fine to commit. A long 4K video is not — if the
master is very large, commit a compressed 1080p version for the build and keep
the master elsewhere. The frame builder never needs more than 1440px wide.
