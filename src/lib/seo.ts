import type { Metadata } from 'next';
import { company, positioningStatement, shortDescription } from '@/data/company';

/**
 * Metadata helpers.
 *
 * One place builds titles, canonicals, Open Graph and Twitter cards so no page
 * can quietly ship without them. Descriptions are written per page and describe
 * that page — the brief's instruction not to keyword-stuff is easiest to honour by
 * writing sentences rather than assembling keyword lists.
 */

export const SITE_NAME = company.brand;
export const TITLE_SUFFIX = `${company.brand}`;

/**
 * The site's language, in the two forms that need it.
 *
 * `<html lang>` was `en` while Open Graph declared `en_IN`, which is a mixed
 * signal about the target market. Resolved in favour of `en-IN`: the company is
 * India-registered, and en-IN conventionally uses the British spellings the copy
 * already follows, so the tag, the card and the prose now all agree.
 *
 * Both constants are exported so `<html lang>`, the manifest and the JSON-LD
 * cannot drift apart again.
 */
export const HTML_LANG = 'en-IN';
export const OG_LOCALE = 'en_IN';

/** Absolute URL for a route path. Trailing slashes match `trailingSlash: true`. */
export function absoluteUrl(path = '/'): string {
  const normalised = path === '/' ? '/' : `/${path.replace(/^\/|\/$/g, '')}/`;
  return `${company.siteUrl}${normalised}`;
}

/**
 * Absolute URL for a static file. No trailing slash — a file is not a directory,
 * and appending one on static hosting resolves to nothing.
 */
export function absoluteAsset(file: string): string {
  return `${company.siteUrl}/${file.replace(/^\//, '')}`;
}

/**
 * The social card.
 *
 * `scripts/finalize-export.mjs` copies the generated `opengraph-image` route output
 * to `out/og.png` after the build, because the route's own output has no file
 * extension and its trailing-slash URL does not resolve on static hosting. This
 * points at the finalized asset.
 */
const OG_IMAGE = 'og.png';

interface PageMetaInput {
  /** Page title without the brand suffix. */
  title: string;
  description: string;
  /** Route path, e.g. '/capabilities'. */
  path: string;
  /** Override the shared OG image alt text. */
  imageAlt?: string;
}

export function pageMetadata({ title, description, path, imageAlt }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = path === '/' ? title : `${title} — ${TITLE_SUFFIX}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      locale: OG_LOCALE,
      images: [
        {
          url: absoluteAsset(OG_IMAGE),
          width: 1200,
          height: 630,
          alt: imageAlt ?? `${company.brand} — ${company.descriptor}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [absoluteAsset(OG_IMAGE)],
    },
  };
}

/** Root metadata. Page-level exports merge over this. */
export const rootMetadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.brand} — Agentic, Edge and Neuro-Symbolic AI Systems`,
    template: `%s`,
  },
  description: shortDescription,
  applicationName: company.brand,
  authors: [{ name: company.legalName }],
  creator: company.legalName,
  publisher: company.legalName,
  category: 'technology',

  /**
   * Icons and manifest.
   *
   * Only `/icon.svg` was declared (picked up automatically from `src/app/`), so
   * `/favicon.ico`, `/apple-touch-icon.png` and `/manifest.webmanifest` all
   * returned 404 — bookmarks, pinned tabs, iOS home-screen saves and any crawler
   * that does not rasterise SVG showed a blank or default mark.
   *
   * The SVG stays first in the list because it is the sharpest at every density;
   * the ICO is the fallback for consumers that ignore SVG. Generate the raster
   * files with `npm run icons` after editing `src/app/icon.svg`.
   */
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',

  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  other: {
    // Not a substitute for a real header, but on static hosting where response
    // headers cannot be set, this is the available mechanism.
    'format-detection': 'telephone=no',
  },
};

/* -------------------------------------------------------------------------- */
/* Structured data                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Organization and WebSite JSON-LD.
 *
 * Only verifiable facts: legal name, brand, registered locality, the CIN, the
 * public email and what the company does. No employee counts, founding claims
 * beyond the incorporation year, ratings, awards or sameAs profiles that do not
 * exist.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${company.siteUrl}/#organization`,
    name: company.legalName,
    alternateName: company.brand,
    url: company.siteUrl,
    email: company.email,
    description: positioningStatement,
    foundingDate: String(company.foundedYear),
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.city,
      addressRegion: company.region,
      addressCountry: company.countryCode,
    },
    identifier: {
      '@type': 'PropertyValue',
      name: 'Corporate Identity Number (CIN)',
      value: company.cin,
    },
    knowsAbout: [
      'Applied artificial intelligence',
      'Agentic AI systems',
      'Multi-agent orchestration',
      'Edge AI and on-device inference',
      'Neuro-symbolic AI',
      'Retrieval-augmented generation',
      'Model optimisation and quantisation',
      'AI evaluation and observability',
      'MLOps and LLMOps',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'business enquiries',
      email: company.email,
      availableLanguage: ['en'],
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${company.siteUrl}/#website`,
    url: company.siteUrl,
    name: company.brand,
    description: shortDescription,
    publisher: { '@id': `${company.siteUrl}/#organization` },
    inLanguage: HTML_LANG,
  };
}

/** Breadcrumbs for interior pages. */
export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
