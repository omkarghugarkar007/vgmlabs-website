import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

/**
 * robots.txt, generated into `out/robots.txt` at build time.
 *
 * Everything is crawlable — it is a public marketing site with nothing to hide from
 * an index. No AI-crawler blocks: the company builds with these models, and blocking
 * the crawlers while doing so would be incoherent.
 */
/**
 * Required under `output: 'export'`: metadata routes must be pinned to static so
 * Next generates the file at build time rather than expecting a server to produce it
 * per request.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Next's metadata text routes; no value in an index.
        disallow: ['/_next/'],
      },
    ],
    sitemap: absoluteUrl('sitemap.xml').replace(/\/$/, ''),
    host: absoluteUrl('/').replace(/\/$/, ''),
  };
}
