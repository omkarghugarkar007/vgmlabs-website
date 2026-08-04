import type { MetadataRoute } from 'next';
import { company, shortDescription } from '@/data/company';

/**
 * Web app manifest.
 *
 * `/manifest.webmanifest` used to 404, so an iOS home-screen save or a pinned tab
 * fell back to a screenshot and a truncated hostname.
 *
 * A route rather than a file in `public/`, so `basePath` and `assetPrefix` are
 * applied by Next to the icon paths — a hardcoded `/icon-192.png` would break the
 * moment the site were served from a repository subpath again.
 *
 * Deliberately not a PWA: no service worker, no offline caching, no install
 * prompt. `display: browser` says so explicitly. This is a static marketing site,
 * and claiming app-like behaviour it does not have would be the same kind of
 * overstatement the copy rules forbid.
 */
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.legalName,
    short_name: company.brand,
    description: shortDescription,
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#050607',
    theme_color: '#050607',
    lang: 'en-IN',
    dir: 'ltr',
    categories: ['business', 'developer', 'technology'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
