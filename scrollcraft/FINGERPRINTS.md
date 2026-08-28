# Fingerprints

Every site you build with **scrollcraft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|

*(empty: your first build has nothing to clear, so build whatever the interview
points at. From the second onwards, this table is the constraint.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

Nothing is taken yet.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scrollcraft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.

---

## alchemy-waves — Alchemy & Waves Group Ltd

First row in this registry, so the 4-of-6 gate had nothing to clear against.
Recorded in full so the next build has something to differ from.

| Dimension | This build |
|---|---|
| **Grammar** | Filmic one-shot |
| **Nav treatment** | No bar. A pinned mono readout in the hero footer (`SEQ 01 · 00:14 / 00:30`) driven by the same progress value as the frames, and nothing else anywhere on the page |
| **Hero device** | `scrub` — full-bleed canvas frame sequence, 150 frames, bidirectional |
| **Act-sequence shape** | scrub → kinetic → pin → pointer-peak → flow → resolve. Five acts, 13.4 viewport-heights |
| **Close pattern** | Colophon plate. The mark at full width, one mailto set as running text, company registration in mono. No CTA island |
| **Signature move** | "The seam takes a side" — pointer x drives a single `--bias`, and the ground, both monumental words, the rule's gradient and the light inside the seam all re-weight from it |

### Why filmic one-shot, and why the other seven lost

The grammar was interrogated rather than defaulted to, which the skill is right
to insist on.

- **Chaptered editorial** — bans the full-bleed scrub hero outright. The client
  supplied one continuous 10s film and asked explicitly for a scroll-scrubbed
  cinematic hero. The grammar's central ban is the client's central request.
- **Continuous world** — closest rival, and rejected on asset truth: one 10s
  clip is not a world to fly through, and pretending otherwise means either
  faking parallax or generating a great deal more footage.
- **Typographic poster** — the copy is aphoristic and would suit it, but it
  wastes the one real asset. A poster grammar with a film in it is a filmic page
  with less confidence.
- **Gallery / catalog** — needs many artefacts. There are two.
- **Split stage** — tempting, since the painting is literally split. But it would
  make the split permanent chrome, which kills the peak: the seam only lands
  because it is the one act where the division becomes operable.
- **Live surface** — the group sells judgement, not a tool. Nothing to operate.
- **Rhythmic cutlist** — cuts fight the single unbroken take, and the client
  asked for flow, not cuts: "no abrupt section jumps".

### Verified

`shoot.mjs`: 13.4vh, five acts, all cues clear 4.5:1 contrast at their worst
frame over media. Own harness: frame index spans 0–149 and decreases on reverse,
beats hold exclusive windows, one pillar legible at a time, no overflow to
320px, readable under reduced motion. Signature move asserted directly —
`--bias` tracks the pointer, the spark slides, and the two words trade weight.

Not verified: a real phone. Headless Chrome cannot reproduce iOS video decode,
autoplay policy or touch scrolling.
