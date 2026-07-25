import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

/**
 * Sitemap.
 *
 * Generated at build time into `out/sitemap.xml`, which works on static hosting.
 *
 * `lastModified` is intentionally the build date rather than a hand-maintained date
 * per route: a stale hard-coded date is worse than no signal, and every route here
 * is rebuilt together.
 *
 * When adding a page, add it here too — nothing enforces the pairing automatically.
 */
/**
 * Required under `output: 'export'`: metadata routes must be pinned to static so
 * Next generates the file at build time rather than expecting a server to produce it
 * per request.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: { path: string; priority: number; changeFrequency: 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'monthly' },
    { path: '/capabilities', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/approach', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/research', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/company', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  ];

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
