import { COMPANY, COLOPHON } from "@/lib/content";

/**
 * ACT VI — COLOPHON
 *
 * Set like the back page of an exhibition catalogue: the mark at full size,
 * one address, and the small print in mono. No form, no newsletter, no
 * call-to-action stack — a holding group is contacted, not converted.
 */
export default function Colophon() {
  return (
    <footer className="relative overflow-hidden bg-ink-950 px-[var(--gutter)] pt-[clamp(6rem,16vh,12rem)] pb-[clamp(2.5rem,6vh,4rem)] grain">
      <div className="mx-auto max-w-[80rem]">
        <p className="t-meta">{COLOPHON.invitation}</p>

        <a
          href={`mailto:${COMPANY.email}`}
          className="t-display-sm mt-6 inline-block text-bone-100 underline decoration-[var(--color-gold-500)] decoration-1 underline-offset-[0.28em] transition-colors duration-500 hover:text-gold-300"
        >
          {COMPANY.email}
        </a>

        {/* The mark, at the scale it deserves. */}
        <div className="mt-[clamp(5rem,14vh,10rem)] border-t rule pt-[clamp(2rem,5vh,3.5rem)]">
          <h2
            className="t-monument text-bone-100"
            style={{ fontSize: "clamp(1.6rem, 8.5vw, 9rem)", letterSpacing: "0.04em" }}
          >
            {COMPANY.name}
          </h2>
        </div>

        <div className="mt-[clamp(3rem,8vh,5rem)] grid grid-cols-12 gap-x-6 gap-y-8 border-t rule pt-8">
          <dl className="col-span-12 grid grid-cols-2 gap-y-3 sm:col-span-7 sm:grid-cols-3">
            <div>
              <dt className="t-meta">Entity</dt>
              <dd className="t-meta mt-1 normal-case tracking-[0.1em] text-bone-300">
                {COMPANY.legalName}
              </dd>
            </div>
            <div>
              <dt className="t-meta">Company no.</dt>
              <dd className="t-meta mt-1 text-bone-300">{COMPANY.companyNumber}</dd>
            </div>
            <div>
              <dt className="t-meta">Registered</dt>
              <dd className="t-meta mt-1 normal-case tracking-[0.1em] text-bone-300">
                {COMPANY.registeredOffice}
              </dd>
            </div>
          </dl>
          <p className="t-meta col-span-12 max-w-md normal-case leading-relaxed tracking-[0.08em] sm:col-span-5">
            {COLOPHON.note}
          </p>
        </div>
      </div>
    </footer>
  );
}
