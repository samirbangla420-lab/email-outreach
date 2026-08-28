import type { Metadata, Viewport } from "next";
import { Cinzel, Bodoni_Moda, IBM_Plex_Mono, Inter } from "next/font/google";
import { COMPANY } from "@/lib/content";
import SmoothScroll from "@/components/motion/SmoothScroll";
import "./globals.css";

/* Four families, strictly bounded roles. Self-hosted by next/font — no external
   request at runtime, no flash of unstyled text, no layout shift. */

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${COMPANY.legalName} — Built at the seam`,
  description:
    "A private holding group. We take what is already known and give it new machinery. Provenance, transmutation, current.",
  openGraph: {
    title: `${COMPANY.legalName}`,
    description: "Built at the seam, where old knowledge meets new machinery.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08070A",
  colorScheme: "dark",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY.legalName,
  alternateName: COMPANY.name,
  email: COMPANY.email,
  address: { "@type": "PostalAddress", addressLocality: COMPANY.registeredOffice },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${bodoni.variable} ${plexMono.variable} ${inter.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
