import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { TopNav } from '@/components/navigation/TopNav';
import { IntelligenceField } from '@/components/three/IntelligenceField';
import { organizationJsonLd, rootMetadata, websiteJsonLd } from '@/lib/seo';
import '@/styles/global.scss';

/**
 * Fonts are self-hosted by `next/font`: the files are downloaded at build time
 * and served from our own origin. That removes the third-party request to Google
 * entirely — better for privacy, and it means the exported site has no external
 * font dependency at run time.
 *
 * `display: swap` with a preloaded subset keeps text visible immediately; the
 * fallback stack is metric-adjusted by next/font to limit the layout shift when
 * the real face arrives.
 */
const display = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  // Only the weights actually used: 400 body, 500 display, 600 the wordmark.
  weight: ['400', '500', '600'],
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
});

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom is never disabled. Capping at 5 rather than 1 keeps pinch-zoom
  // available, which is a hard accessibility requirement.
  maximumScale: 5,
  themeColor: '#050607',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <head>
        {/*
          Content Security Policy as a meta tag.
          Static hosting cannot set response headers, so this is the available
          mechanism. `unsafe-inline` for styles is required by Next's inlined
          critical CSS; `unsafe-eval` is not granted. `connect-src 'self'` is
          widened only if you configure NEXT_PUBLIC_CONTACT_ENDPOINT — see
          docs/DEPLOYMENT.md.
        */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={[
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "form-action 'self'",
            "base-uri 'self'",
            "frame-ancestors 'self'",
            'upgrade-insecure-requests',
          ].join('; ')}
        />
        <script
          type="application/ld+json"
          // Structured data. Both graphs are static, generated from the company
          // data file, and contain only verifiable facts.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]),
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        {/* The persistent WebGL layer. Mounted once at the root so the structure
            continues across route changes rather than restarting. */}
        <IntelligenceField />

        <div className="content-layer">
          <TopNav />
          <main id="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
