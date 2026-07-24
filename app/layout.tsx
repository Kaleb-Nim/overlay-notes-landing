import type { Metadata } from 'next';
import { Shantell_Sans, Public_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

const shantellSans = Shantell_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-shantell',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-public',
  display: 'swap',
});

const TITLE = 'Draw & Annotate Notes on Any Webpage — Overlay Notes';
const DESCRIPTION =
  'Overlay Notes is a free Chrome extension that lets you draw, annotate, and handwrite notes on any webpage. Notes pin to content and save per page, 100% local.';
const OG_DESCRIPTION =
  "A free Chrome extension that puts an Excalidraw-style sketch canvas on any website. Handwrite notes over what you're reading — they scroll with the page and save locally.";
const OG_IMAGE_ALT =
  'Handwritten marker notes and arrows drawn over a webpage — Overlay Notes, a free Chrome extension';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: TITLE,
    description: OG_DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: OG_IMAGE_ALT }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: OG_DESCRIPTION,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: OG_IMAGE_ALT }],
  },
};

const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Overlay Notes',
  applicationCategory: 'BrowserApplication',
  operatingSystem: 'Chrome',
  description: DESCRIPTION,
  url: siteConfig.baseUrl,
  image: `${siteConfig.baseUrl}/og-image.png`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${shantellSans.variable} ${publicSans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationJsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
