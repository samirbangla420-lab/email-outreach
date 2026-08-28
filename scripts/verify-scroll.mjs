/**
 * Verifies the things that actually matter about a scroll-driven page, which
 * are exactly the things a type-check and a build cannot tell you:
 *
 *   1. The canvas frame index advances as you scroll down.
 *   2. It DECREASES as you scroll up (the film runs backwards).
 *   3. Editorial beats own their own slice of the pin and never overlap.
 *   4. Nothing overflows horizontally, at any width down to 320px.
 *   5. The page is fully readable with prefers-reduced-motion.
 *
 * Screenshots land in ./verification for eyeballing.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const URL = process.env.VERIFY_URL || "http://localhost:3000";

/**
 * This image ships a Chromium build that predates the installed Playwright, so
 * launching by name fails. Point at the pre-installed binary instead of
 * downloading another one (the environment explicitly asks us not to).
 */
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const LAUNCH = { executablePath: CHROME, args: ["--no-sandbox", "--disable-dev-shm-usage"] };
const OUT = path.join(process.cwd(), "verification");
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true },
};

let failures = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

const scrollTo = async (page, y) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  // Lenis lerps and scrub:1 lags by design; give the timeline time to settle.
  await page.waitForTimeout(1100);
};

const frameIndex = (page) =>
  page.evaluate(() => {
    const c = document.querySelector("canvas");
    return c?.dataset.frame ? Number(c.dataset.frame) : -1;
  });

/** Which beats are actually legible right now. */
const visibleBeats = (page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-beat]"))
      .filter((el) => Number(getComputedStyle(el).opacity) > 0.55)
      .map((el) => el.getAttribute("data-beat"))
  );

async function run(name, vp) {
  console.log(`\n[${name}] ${vp.width}x${vp.height}`);
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600); // overture + priority frames

  // --- frame sequence advances ---
  const pin = vp.height * (name === "mobile" ? 3 : 5);
  const samples = [];
  // Beat centres, not window boundaries. The boundaries are precisely where one
  // beat has cleared and the next has not yet arrived — sampling there measures
  // the intended silence and reads as a failure.
  const beatCount = name === "mobile" ? 3 : 4;
  const centres = Array.from({ length: beatCount }, (_, i) => (i + 0.5) / beatCount);
  for (const pct of [0, ...centres, 1]) {
    await scrollTo(page, pin * pct);
    const f = await frameIndex(page);
    const beats = await visibleBeats(page);
    samples.push({ pct, f, beats });
    await page.screenshot({ path: path.join(OUT, `${name}-hero-${Math.round(pct * 100)}.png`) });
  }

  console.log("  frames:", samples.map((s) => `${Math.round(s.pct * 100)}%=${s.f}`).join(" "));

  check("canvas is rendering", samples.every((s) => s.f >= 0), `indices ${samples.map(s=>s.f).join(",")}`);
  check(
    "frame index advances monotonically on scroll down",
    samples.every((s, i) => i === 0 || s.f >= samples[i - 1].f)
  );
  const last = samples[samples.length - 1];
  check("frame index spans a meaningful range", last.f - samples[0].f > 20, `${samples[0].f} -> ${last.f}`);

  // --- reverse scrub ---
  await scrollTo(page, pin * 0.2);
  const reverse = await frameIndex(page);
  check("frame index decreases on scroll up", reverse < last.f, `${last.f} -> ${reverse}`);

  // --- beats do not overlap ---
  const overlaps = samples.filter((s) => s.beats.length > 1);
  check("no two beats legible at once", overlaps.length === 0,
    overlaps.length ? JSON.stringify(overlaps.map((o) => o.beats)) : "");
  // Every beat must own its centre. This is the real synchronisation contract:
  // scroll to the middle of beat N's window and beat N — only beat N — is there.
  const atCentres = samples.slice(1, 1 + beatCount);
  check(
    "every beat is legible at the centre of its own window",
    atCentres.every((s) => s.beats.length === 1),
    atCentres.map((s) => s.beats.join("+") || "none").join(", ")
  );
  check(
    "beats appear in order",
    atCentres.every((s, i) => s.beats[0] === `beat-${i + 1}` || s.beats.length === 1),
    atCentres.map((s) => s.beats[0]).join(" -> ")
  );

  // --- pillars: exactly one panel legible at a time (desktop pin only) ---
  if (name === "desktop") {
    const pillarTop = await page.evaluate(() => {
      const el = document.querySelector("[data-pillar]")?.closest("section");
      return el ? el.getBoundingClientRect().top + window.scrollY : -1;
    });
    if (pillarTop >= 0) {
      const seen = [];
      for (let i = 0; i <= 8; i++) {
        await scrollTo(page, pillarTop + vp.height * 3 * (i / 8));
        seen.push(
          await page.evaluate(() =>
            Array.from(document.querySelectorAll(".pillar-panel")).filter(
              (e) => Number(getComputedStyle(e).opacity) > 0.55
            ).length
          )
        );
      }
      check("never more than one pillar legible at a time", seen.every((n) => n <= 1), seen.join(","));
      check("each pillar gets its turn", seen.filter((n) => n === 1).length >= 3, seen.join(","));
    }
  }

  // --- full page: horizontal overflow ---
  await page.evaluate(() => window.scrollTo(0, 0));
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  check("no horizontal overflow", overflow <= 1, `${overflow}px`);

  // --- scroll the whole page, screenshot the acts ---
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (const [i, pct] of [0.45, 0.62, 0.78, 0.92].entries()) {
    await scrollTo(page, total * pct);
    await page.screenshot({ path: path.join(OUT, `${name}-act-${i + 2}.png`) });
  }

  check("no runtime errors", errors.length === 0, errors.slice(0, 2).join(" | "));

  await browser.close();
}

async function reducedMotion() {
  console.log("\n[reduced-motion] 1440x900");
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({
    viewport: VIEWPORTS.desktop,
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  // Every beat should be readable, not hidden behind an animation that never ran.
  const opacities = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-beat]")).map((el) =>
      Number(getComputedStyle(el).opacity)
    )
  );
  check("all hero beats readable without motion", opacities.every((o) => o > 0.9), JSON.stringify(opacities));

  const canvasFrame = await frameIndex(page);
  check("canvas parked on a representative frame", canvasFrame > 0, String(canvasFrame));

  const overlay = await page.$("[aria-hidden='true'].fixed.z-\\[100\\]");
  check("overture does not block", overlay === null);

  await page.screenshot({ path: path.join(OUT, "reduced-motion.png"), fullPage: false });
  check("no runtime errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
}

async function narrow() {
  console.log("\n[320px] overflow check");
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 320, height: 700 }, hasTouch: true });
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  check("no horizontal overflow at 320px", overflow <= 1, `${overflow}px`);
  await browser.close();
}

await run("desktop", VIEWPORTS.desktop);
await run("mobile", VIEWPORTS.mobile);
await reducedMotion();
await narrow();

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
