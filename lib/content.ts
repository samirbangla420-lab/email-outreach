/**
 * Every word on the site lives here.
 *
 * The pillars are abstract by design — Alchemy & Waves presents a philosophy
 * and a method, not a portfolio of named ventures. That puts the entire weight
 * of the site on the writing, which is why it is centralised: rewrite here and
 * nothing in the components needs to change.
 *
 * Voice: aphoristic. Short, declarative, weighty. Long silences between lines.
 */

export const COMPANY = {
  name: "Alchemy & Waves",
  legalName: "Alchemy & Waves Group Ltd",
  mark: "A&W",
  // TODO(client): replace placeholders before launch.
  email: "hello@alchemyandwaves.com",
  companyNumber: "00000000",
  registeredOffice: "London, United Kingdom",
  founded: "MMXXV",
} as const;

/**
 * Hero beats. Each is locked to a quarter of the pinned film's scroll range,
 * so a beat is never on screen at the same time as its successor.
 *
 * `mobile: false` drops a beat on touch — three beats across a 300vh pin reads
 * at the right pace; four feels rushed.
 */
export const FILM_BEATS = [
  {
    id: "beat-1",
    lines: ["Every age believed", "it had invented the future."],
    mobile: true,
  },
  {
    id: "beat-2",
    lines: ["It had only", "remembered it better."],
    mobile: false,
  },
  {
    id: "beat-3",
    lines: ["Alchemy & Waves", "builds at the seam,"],
    mobile: true,
  },
  {
    id: "beat-4",
    lines: ["where old knowledge", "meets new machinery."],
    mobile: true,
  },
] as const;

export const THESIS = {
  eyebrow: "The Group",
  // Rendered word-by-word on a scroll-linked opacity ramp.
  statement:
    "We are a holding group. We take what is already known, and we give it new machinery. Nothing here is invented from nothing. It is inherited, understood, and rebuilt for the century it now has to survive.",
  footnote: "Established as a private group. Held for the long horizon.",
} as const;

export const PILLARS = [
  {
    numeral: "I",
    name: "Provenance",
    // Provenance is the art world's term for an artwork's chain of ownership,
    // and the natural word for a holding group's origination of capital.
    lede: "What we inherit, and where it came from.",
    body: "Every asset arrives with a history. We buy, build and back only what we can trace: the origin of the capital, the origin of the idea, the origin of the advantage. An unexamined inheritance is a liability wearing the costume of an asset.",
    meta: ["Origination", "Diligence", "Long-horizon capital"],
  },
  {
    numeral: "II",
    name: "Transmutation",
    lede: "What we do to it.",
    body: "The alchemists were wrong about the method and right about the ambition. Base material becomes valuable through process, not through wishing. We operate what we own: systems, discipline, and the patience to let a thing become what it was capable of being.",
    meta: ["Operating", "Systems", "Compounding"],
  },
  {
    numeral: "III",
    name: "Current",
    lede: "How it travels.",
    body: "Value that cannot move is value that decays. The third discipline is distribution. Networks, channels and momentum carry a built thing to the people it was built for. A wave is only water until it reaches a shore.",
    meta: ["Distribution", "Networks", "Reach"],
  },
] as const;

export const SEAM = {
  label: "The Seam",
  line: "The oldest ideas and the newest machines were never opposites. They are the same instinct, separated only by the tools available at the time.",
  above: "Inherited",
  below: "Engineered",
} as const;

export const PRINCIPLES = {
  eyebrow: "How we operate",
  items: [
    {
      n: "01",
      title: "Own the horizon, not the quarter",
      body: "We hold. Structures built to be sold in three years are built badly on purpose.",
    },
    {
      n: "02",
      title: "Understand before you improve",
      body: "No change is made to a business we cannot yet explain in full to a stranger.",
    },
    {
      n: "03",
      title: "Machinery over heroics",
      body: "A result that depends on one exceptional person is not a result. It is a risk with good news attached.",
    },
    {
      n: "04",
      title: "Concentrate",
      body: "Few positions, deeply held. Diversification is what you do instead of judgement.",
    },
    {
      n: "05",
      title: "Distribution is not an afterthought",
      body: "It is designed at the beginning, alongside the thing itself, or it is bolted on forever.",
    },
    {
      n: "06",
      title: "Leave the ledger clean",
      body: "Plain accounts, plain language, plain dealing. The record outlives the transaction.",
    },
  ],
} as const;

export const COLOPHON = {
  invitation: "For partnership, origination and correspondence.",
  note: "Alchemy & Waves Group Ltd is a private holding company. This page is a statement of intent, not an offer of securities or investment advice.",
} as const;
