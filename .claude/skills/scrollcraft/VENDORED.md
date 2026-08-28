# Vendored: scrollcraft

Source: https://github.com/nateherkai/scroll-craft
Path in source: `plugins/nateherk-design/skills/scrollcraft`
Vendored: 2026-08-28

Copied verbatim. Nothing in this directory has been modified, including the
engine, which the skill is explicit about: theme it with tokens, never edit it.

This project does not use `engine/scrollcraft.js` or `engine/scrollcraft.css`.
The site is Next.js and React with GSAP, so the skill's *method* was applied
(grammar, feeling curve, engineered peak, signature move, device variety, the
hard rules) while its runtime was not. The verification harness in
`scripts/shoot.mjs` does run against the app, via `--url`, after the page was
annotated with the `data-sc-act` / `data-sc-cue` / `data-sc-copy` attributes it
reads and an `html.sc-ready` flag for it to wait on.

The licence above is the upstream project's and applies to this directory.

To refresh: re-clone upstream and copy the skill directory over this one. Do not
hand-edit files here; local changes will be lost and are not tracked as ours.
